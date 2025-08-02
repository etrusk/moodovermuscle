import { test, expect } from '@playwright/test'
import { selectDate } from '../utils'

test.describe('Cross-Browser Error Scenarios', () => {
  test('Server error displays correctly in Firefox', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'firefox', 'Test specific to Firefox')

    // Stub 500 error
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      })
    )

    // Start booking flow
    await page.goto('/')
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .click()
    await page.getByTestId('booking-form-dialog').waitFor()

    // Fill minimal fields
    await page.getByTestId('name-input').fill('Firefox Test')
    await page.getByTestId('email-input').fill('ff@example.com')
    await page.getByTestId('phone-input').fill('0400000000')
    await page.getByTestId('goals-select-trigger').click()
    await page
      .getByRole('option', { name: 'Lose weight & feel confident' })
      .click()
    await page.getByTestId('booking-form-continue-button').click()

    await page.getByTestId('service-option-1-on-1-Personal-Training').click()
    await page.getByTestId('booking-form-continue-button').click()

    await selectDate(page)
    await page.getByTestId('time-select').selectOption('12:00 PM')

    // Submit and expect error toast
    await page.getByTestId('booking-form-submit-button').click()
    await expect(
      page.getByTestId('toast').getByText(/Internal Server Error/i)
    ).toBeVisible()
  })
})
