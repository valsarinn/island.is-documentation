import { Auth, AuthMiddleware, User } from '@island.is/auth-nest-tools'
import { XRoadConfig } from '@island.is/nest/config'
import type { ConfigType } from '@island.is/nest/config'
import { Injectable, Inject } from '@nestjs/common'
import {
  IdentityDocumentApi,
  IdentityDocumentResponse,
  PreregistrationApi,
} from '../../gen/fetch'
import {
  Gender,
  IdentityDocument,
  IdentityDocumentChild,
  Passport,
  PreregisterResponse,
  PreregistrationInput,
} from './passportsApi.types'
import PDFDocument from 'pdfkit'
import getStream from 'get-stream'
import type { Logger } from '@island.is/logging'
import { LOGGER_PROVIDER } from '@island.is/logging'
import { ApolloError } from 'apollo-server-express'
import isBefore from 'date-fns/isBefore'
import differenceInMonths from 'date-fns/differenceInMonths'
import { ExpiryStatus } from './passportsApi.types'
import { format as formatNationalId } from 'kennitala'

const LOG_CATEGORY = 'passport-service'

@Injectable()
export class PassportsService {
  constructor(
    @Inject(LOGGER_PROVIDER)
    private logger: Logger,
    @Inject(XRoadConfig.KEY)
    private xroadConfig: ConfigType<typeof XRoadConfig>,
    private identityDocumentApi: IdentityDocumentApi,
    private preregistrationApi: PreregistrationApi,
  ) {}

  handleError(error: any, detail?: string): ApolloError | null {
    this.logger.error(detail || 'Domain passport error', {
      error: JSON.stringify(error),
      category: LOG_CATEGORY,
    })
    throw new ApolloError('Failed to resolve request', error.status)
  }

  private getPassportsWithAuth(auth: Auth) {
    return this.identityDocumentApi.withMiddleware(new AuthMiddleware(auth))
  }

  private resolvePassports(passportData: IdentityDocumentResponse[]) {
    const passportArray = passportData.map((item) => {
      const { productionRequestID, ...passport } = item

      /**
       * Expiration status: string
       *    if invalid and expirationDate has passed: EXPIRED (ÚTRUNNIÐ)
       *    if invalid and expirationDate has NOT passed: LOST (GLATAÐ)
       *    else undefined
       */
      const invalidPassport = passport.status?.toLowerCase() === 'invalid'
      let expiryStatus: ExpiryStatus | undefined = undefined
      if (invalidPassport && passport.expirationDate) {
        const expirationDatePassed = isBefore(
          new Date(passport.expirationDate),
          new Date(),
        )

        const expired = invalidPassport && expirationDatePassed
        expiryStatus = expired ? 'EXPIRED' : 'LOST'
      }

      /**
       * Expires within notice time: boolean
       * Does the passport expire within 6 months or less from today
       */
      let expiresWithinNoticeTime = undefined
      if (passport.expirationDate) {
        expiresWithinNoticeTime =
          differenceInMonths(new Date(passport.expirationDate), new Date()) < 6
      }

      /**
       * Passportnumber as displayed on icelandic passports.
       * With subtype in front.
       */
      const numberWithType =
        passport.subType && passport.number
          ? `${passport.subType}${passport.number}`
          : undefined

      return {
        ...passport,
        numberWithType,
        sex: passport.sex as Gender,
        expiryStatus,
        expiresWithinNoticeTime,
      }
    })

    if (Array.isArray(passportArray) && passportArray.length === 0) {
      this.logger.debug(`${LOG_CATEGORY}: No active passport`)
    }

    return passportArray
  }

  async getIdentityDocument(
    auth: User,
  ): Promise<IdentityDocument[] | undefined> {
    try {
      const passportResponse = await this.getPassportsWithAuth(
        auth,
      ).identityDocumentGetIdentityDocument({
        xRoadClient: this.xroadConfig.xRoadClient,
      })
      const identityDocumentResponse = this.resolvePassports(passportResponse)

      return identityDocumentResponse
    } catch (e) {
      this.handleError(e)
    }
  }

  async getIdentityDocumentChildren(
    auth: User,
  ): Promise<IdentityDocumentChild[] | undefined> {
    try {
      const passportResponse = await this.getPassportsWithAuth(
        auth,
      ).identityDocumentGetChildrenIdentityDocument({
        xRoadClient: this.xroadConfig.xRoadClient,
      })

      const childrenArray = passportResponse.map((child) => {
        return {
          childNationalId: child.childrenSSN,
          childName: child.childrenName,
          secondParent: child.secondParent,
          secondParentName: child.secondParentName,
          passports: child.identityDocumentResponses
            ? this.resolvePassports(child.identityDocumentResponses)
            : undefined,
        }
      })

      return childrenArray
    } catch (e) {
      this.handleError(e)
    }
  }

  async preregisterIdentityDocument(
    user: User,
    input: PreregistrationInput,
  ): Promise<PreregisterResponse> {
    try {
      const res = await this.preregistrationApi
        .withMiddleware(new AuthMiddleware(user))
        .preregistrationPreregistration({
          xRoadClient: this.xroadConfig.xRoadClient,
          preregistration: input,
        })
      return { success: !!res }
    } catch (e) {
      this.handleError(e)
      return { success: false }
    }
  }

  async preregisterChildIdentityDocument(
    user: User,
    input: PreregistrationInput,
  ): Promise<PreregisterResponse> {
    try {
      const { appliedForPersonId, approvalA, approvalB } = input
      const pdfBuffer = await this.createDocumentBuffer({
        appliedForPersonId,
        approvalA,
        approvalB,
      })
      const pdfDoc = Buffer.from(pdfBuffer).toString('base64')
      const res = await this.preregistrationApi
        .withMiddleware(new AuthMiddleware(user))
        .preregistrationPreregistration({
          xRoadClient: this.xroadConfig.xRoadClient,
          preregistration: {
            ...input,
            documents: [
              {
                name: 'samþykki',
                documentType: 'PDF',
                contentType: 'CUSTODIAN_APPROVAL',
                dataSpecification: 'CUST_APPROV_IS',
                content: pdfDoc,
              },
            ],
          },
        })
      return { success: !!res }
    } catch (e) {
      this.handleError(e)
      return { success: false }
    }
  }

  async getCurrentPassport(user: User): Promise<Passport> {
    const userPassports = await this.getIdentityDocument(user)
    const childPassports = await this.getIdentityDocumentChildren(user)

    return {
      userPassport: userPassports ? userPassports[0] : undefined,
      childPassports: childPassports,
    }
  }

  async createDocumentBuffer({
    appliedForPersonId,
    approvalA,
    approvalB,
  }: Pick<
    PreregistrationInput,
    'appliedForPersonId' | 'approvalA' | 'approvalB'
  >) {
    // build pdf
    const doc = new PDFDocument()
    const locale = 'is-IS'
    const big = 16
    const regular = 8
    const fontRegular = 'Helvetica'
    const fontBold = 'Helvetica-Bold'

    doc
      .fontSize(big)
      .text('Umsókn um vegabréf með samþykki forsjáraðila fyrir hönd: ')
      .text(appliedForPersonId ? formatNationalId(appliedForPersonId) : '')
      .moveDown()

      .fontSize(regular)
      .font(fontBold)
      .text(
        'Samþykki forráðamanna liggur fyrir og er staðfest gegnum island.is.',
      )
      .moveDown()

      .font(fontBold)
      .text('Forsjáraðila A: ')
      .font(fontRegular)
      .text(`Nafn: ${approvalA?.name}`)
      .text(
        `Kenntiala: ${approvalA ? formatNationalId(approvalA?.personId) : ''}`,
      )
      .text(`Dagsetning: ${approvalA?.approved}`)
      .moveDown()

      .font(fontBold)
      .text('Forsjáraðila B: ')
      .font(fontRegular)
      .text(`Nafn: ${approvalB?.name}`)
      .text(
        `Kenntiala: ${approvalB ? formatNationalId(approvalB?.personId) : ''}`,
      )
      .text(`Dagsetning: ${approvalB?.approved}`)
      .moveDown()

      .font(fontRegular)
      .text('Með kveðju frá island.is')

      .moveDown()
      .text(
        'Þetta skjal var framkallað sjálfvirkt þann: ' +
          new Date().toLocaleDateString(locale),
      )
    doc.end()
    return await getStream.buffer(doc)
  }
}
