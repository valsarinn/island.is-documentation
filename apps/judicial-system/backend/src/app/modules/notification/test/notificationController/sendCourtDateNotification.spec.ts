import { uuid } from 'uuidv4'

import { NotificationType, User } from '@island.is/judicial-system/types'
import { MessageService, MessageType } from '@island.is/judicial-system/message'

import { Case } from '../../../case'
import { SendNotificationResponse } from '../../models/sendNotification.response'
import { createTestingNotificationModule } from '../createTestingNotificationModule'

interface Then {
  result: SendNotificationResponse
  error: Error
}

type GivenWhenThen = (caseId: string) => Promise<Then>

describe('NotificationController - Send court date notification', () => {
  const userId = uuid()
  const user = { id: userId } as User

  let mockMessageService: MessageService
  let givenWhenThen: GivenWhenThen

  beforeEach(async () => {
    const {
      messageService,
      notificationController,
    } = await createTestingNotificationModule()

    mockMessageService = messageService

    const mockSendMessagesToQueue = messageService.sendMessagesToQueue as jest.Mock
    mockSendMessagesToQueue.mockResolvedValue(undefined)

    givenWhenThen = async (caseId) => {
      const then = {} as Then

      await notificationController
        .sendCaseNotification(caseId, user, { id: caseId } as Case, {
          type: NotificationType.COURT_DATE,
        })
        .then((result) => (then.result = result))
        .catch((error) => (then.error = error))

      return then
    }
  })

  describe('message queued', () => {
    const caseId = uuid()
    let then: Then

    beforeEach(async () => {
      then = await givenWhenThen(caseId)
    })

    it('should send message to queue', () => {
      expect(mockMessageService.sendMessagesToQueue).toHaveBeenCalledWith([
        {
          type: MessageType.SEND_COURT_DATE_NOTIFICATION,
          userId,
          caseId,
        },
      ])
      expect(then.result).toEqual({ notificationSent: true })
    })
  })
})
