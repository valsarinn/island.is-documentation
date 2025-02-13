import { test, expect, BrowserContext } from '@playwright/test'
import { format } from 'kennitala'

import { env, urls } from '../../../../support/urls'
import { session } from '../../../../support/session'

const homeUrl = `${urls.islandisBaseUrl}/minarsidur`
const sessionHistoryUrl = '/minarsidur/adgangsstyring/notkun'

test.use({ baseURL: urls.islandisBaseUrl })

test.describe('Service portal, in session history', () => {
  let context: BrowserContext

  test.beforeAll(async ({ browser }) => {
    context = await session({
      browser: browser,
      homeUrl,
      phoneNumber: '0102399',
      idsLoginOn: true,
    })
  })

  test.afterAll(async () => {
    await context.close()
  })

  test('can view list of sessions', async () => {
    // Arrange
    const page = await context.newPage()

    // Act
    await page.goto(sessionHistoryUrl, {
      waitUntil: 'networkidle',
    })
    const sessionsRows = page.locator('table > tbody > tr')

    // Assert
    await expect(sessionsRows).toHaveCountGreaterThan(0)
  })

  test('can filter list of session by national id', async () => {
    // Arrange
    const filterSubjectNationalId =
      // eslint-disable-next-line local-rules/disallow-kennitalas
      env === 'staging' ? '6609170200' : '5005101370'
    const page = await context.newPage()
    await page.goto(sessionHistoryUrl, {
      waitUntil: 'networkidle',
    })

    // Act
    await page.locator('#filterInput').fill(filterSubjectNationalId)
    const sessionsRows = page.locator('table > tbody > tr', {
      hasText: format(filterSubjectNationalId),
    })

    // Assert
    await expect(sessionsRows).toHaveCountGreaterThan(0)
  })

  test('can view list of sessions as company', async () => {
    // Arrange
    const testCompanyName =
      env === 'staging' ? 'Prófunarfélag GG og HEB' : 'ARTIC ehf.'
    const page = await context.newPage()
    await page.goto(homeUrl, {
      waitUntil: 'domcontentloaded',
    })
    await page.locator('data-testid=user-menu >> visible=true').click()
    await page.getByRole('button', { name: 'Skipta um notanda' }).click()
    await page.getByRole('button', { name: testCompanyName }).click()

    // Act
    await page.goto(sessionHistoryUrl, {
      waitUntil: 'networkidle',
    })
    const sessionsRows = page.locator('table > tbody > tr')

    // Assert
    await expect(sessionsRows).toHaveCountGreaterThan(0)
  })
})
