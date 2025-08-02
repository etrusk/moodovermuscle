import { Page, Route } from '@playwright/test'

/**
 * Simulate offline mode on the page context.
 */
export async function simulateOffline(page: Page): Promise<void> {
  await page.context().setOffline(true)
}

/**
 * Restore online mode on the page context.
 */
export async function simulateOnline(page: Page): Promise<void> {
  await page.context().setOffline(false)
}

/**
 * Introduce a fixed delay for all requests matching the URL pattern.
 * @param urlPattern Glob or regex string to match request URLs.
 * @param delayMs Number of milliseconds to delay.
 */
export async function delayRoute(
  page: Page,
  urlPattern: string,
  delayMs: number
): Promise<void> {
  await page.route(urlPattern, async (route: Route) => {
    await new Promise(resolve => setTimeout(resolve, delayMs))
    await route.continue()
  })
}

/**
 * Forceful failure of matching requests with given status code.
 * @param urlPattern Glob or regex string to match request URLs.
 * @param status HTTP status code to respond with.
 */
export async function failRoute(
  page: Page,
  urlPattern: string,
  status: number = 500
): Promise<void> {
  await page.route(urlPattern, (route: Route) =>
    route.fulfill({ status, contentType: 'application/json', body: '{}' })
  )
}
