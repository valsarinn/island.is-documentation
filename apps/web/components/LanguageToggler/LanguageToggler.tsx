import { useContext, ReactElement, useState, FC } from 'react'
import { useRouter } from 'next/router'
import { useApolloClient } from '@apollo/client/react'
import {
  Button,
  ButtonTypes,
  Hidden,
  DialogPrompt,
  ButtonProps,
} from '@island.is/island-ui/core'
import { useI18n } from '@island.is/web/i18n'
import { Locale } from '@island.is/shared/types'
import { GET_CONTENT_SLUG } from '@island.is/web/screens/queries/Article'
import { GlobalContext } from '@island.is/web/context'
import {
  GetContentSlugQuery,
  GetContentSlugQueryVariables,
  TextFieldLocales,
} from '@island.is/web/graphql/schema'
import { useNamespace } from '@island.is/web/hooks'
import { useLinkResolver, LinkType } from '@island.is/web/hooks/useLinkResolver'
import { LayoutProps } from '@island.is/web/layouts/main'

type LanguageTogglerProps = {
  dialogId?: string
  hideWhenMobile?: boolean
  buttonColorScheme?: ButtonTypes['colorScheme']
  queryParams?: LayoutProps['languageToggleQueryParams']
}

export const LanguageToggler = ({
  hideWhenMobile,
  buttonColorScheme = 'default',
  dialogId = 'confirm-language-switch-dialog' +
    (!hideWhenMobile ? '-mobile' : ''),
  queryParams,
}: LanguageTogglerProps) => {
  const client = useApolloClient()
  const Router = useRouter()
  const [showDialog, setShowDialog] = useState<boolean>(false)
  const { contentfulIds, resolveLinkTypeLocally, globalNamespace } = useContext(
    GlobalContext,
  )
  const { activeLocale, locale, t } = useI18n()
  const gn = useNamespace(globalNamespace)
  const otherLanguage = (activeLocale === 'en' ? 'is' : 'en') as Locale
  const { linkResolver, typeResolver } = useLinkResolver()

  const getOtherLanguagePath = async () => {
    if (showDialog) {
      return null
    }

    const pathWithoutQueryParams = Router.asPath.split('?')[0]

    if (!contentfulIds?.length) {
      const { type } = typeResolver(pathWithoutQueryParams, true)
      const pagePath = linkResolver(type, [], otherLanguage).href

      if (pagePath === '/404') {
        return setShowDialog(true)
      } else {
        return Router.push(pagePath)
      }
    }

    // Create queries that fetch slug information from Contentful
    const queries = contentfulIds
      .filter(Boolean)
      .map((id) => getContentSlug(id))

    const responses = await Promise.all(queries)

    const secondContentSlug = responses[1]?.data?.getContentSlug

    // We need to have a special case for subArticles since they've got a url field instead of a slug field
    if (secondContentSlug?.type === 'subArticle') {
      const urls = secondContentSlug.url[otherLanguage].split('/')

      // Show dialog when either there is no title or there aren't at least 2 urls (for example, a valid url would be on the format: 'parental-leave/payments')
      if (!secondContentSlug?.title?.[otherLanguage] || urls.length < 2) {
        return setShowDialog(true)
      }
      return goToOtherLanguagePage(
        linkResolver('subarticle', urls, otherLanguage).href,
      )
    }

    const slugs = []
    let title: TextFieldLocales = { is: '', en: '' }
    let type: LinkType | '' = ''

    for (const res of responses) {
      const slug = res.data?.getContentSlug?.slug
      if (!slug) {
        break
      }
      slugs.push(slug)
      title = res.data?.getContentSlug?.title
      type = res.data?.getContentSlug?.type as LinkType
    }

    if (resolveLinkTypeLocally) {
      const localType = typeResolver(pathWithoutQueryParams)?.type
      if (localType) {
        type = localType
      }
    }

    // Some content models are set up such that a slug is generated from the title
    // Unfortunately, Contentful generates slug for both locales which frequently
    // results in bogus english content. Therefore we check whether the other language has a title as well.
    if (
      type &&
      slugs.every((s) => s?.[otherLanguage]) &&
      title?.[otherLanguage]
    ) {
      const queryParamsString = new URLSearchParams(
        queryParams?.[otherLanguage],
      ).toString()

      return goToOtherLanguagePage(
        `${
          linkResolver(
            type as LinkType,
            slugs.map((s) => s[otherLanguage]),
            otherLanguage,
          ).href
        }${queryParamsString.length > 0 ? '?' : ''}${queryParamsString}`,
      )
    }

    setShowDialog(true)
  }

  const goToOtherLanguagePage = (path) => {
    locale(t.otherLanguageCode)
    Router.push(path)
  }

  const onClick = async () => {
    await getOtherLanguagePath()
  }

  const getContentSlug = async (contentfulId: string) => {
    return client.query<GetContentSlugQuery, GetContentSlugQueryVariables>({
      query: GET_CONTENT_SLUG,
      variables: {
        input: {
          id: contentfulId as string,
        },
      },
    })
  }

  const buttonElementProps: ButtonElementProps = {
    buttonColorScheme,
    otherLanguage,
    otherLanguageAria: t.otherLanguageAria,
    onClick,
  }

  const Disclosure: ReactElement = (
    <ButtonElement {...buttonElementProps}>{t.otherLanguageName}</ButtonElement>
  )

  const Dialog = (
    <DialogPrompt
      baseId={dialogId}
      initialVisibility={true}
      title={gn('switchToEnglishModalTitle')}
      description={gn('switchToEnglishModalText')}
      ariaLabel="Confirm switching to english"
      disclosureElement={Disclosure}
      onConfirm={() => {
        goToOtherLanguagePage(linkResolver('homepage', [], otherLanguage).href)
      }}
      buttonTextConfirm="Go to home page"
      buttonTextCancel="Keep viewing"
    />
  )

  const Content = showDialog ? Dialog : Disclosure

  return !hideWhenMobile ? Content : <Hidden below="md">{Content}</Hidden>
}

type ButtonElementProps = {
  buttonColorScheme?: ButtonTypes['colorScheme']
  otherLanguage: Locale
  otherLanguageAria: string
  onClick: () => void
}

const ButtonElement: FC<ButtonElementProps & ButtonProps> = ({
  buttonColorScheme = 'default',
  otherLanguage,
  otherLanguageAria,
  onClick,
  children,
  ...props
}) => (
  <Button
    colorScheme={buttonColorScheme}
    variant="utility"
    data-testid="language-toggler"
    onClick={onClick}
    aria-label={otherLanguageAria}
    lang={otherLanguage === 'en' ? 'en' : 'is'}
    {...props}
  >
    {children}
  </Button>
)
