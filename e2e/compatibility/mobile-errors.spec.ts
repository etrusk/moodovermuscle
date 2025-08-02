import { test, expect, devices } from '@playwright/test'
import { selectDate } from '../utils'

// Emulate a mobile device
test.use({ ...devices['iPhone 12'] })

test.describe('Mobile-Specific Error Scenarios', () => {
  test('Touch interface error handling on slow response', async ({ page }) => {
    // Delay API response by 3s to simulate poor mobile network
    await page.route('**/api/book-session', async route => {
      await new Promise(res => setTimeout(res, 3000))
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server Error on Mobile' }),
      })
    })

    // Start booking wizard
    await page.goto('/')
    // Tap the button
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .tap()
    await expect(page.getByTestId('booking-form-dialog')).toBeVisible()

    // Fill minimal required step 1 fields with touch
    await page.getByTestId('name-input').tap()
    await page.getByTestId('name-input').fill('Mobile Test')
    await page.getByTestId('email-input').fill('mobile@example.com')
    await page.getByTestId('phone-input').fill('0400000000')
    await page.getByTestId('goals-select-trigger').click()
    await page
      .getByRole('option', { name: 'Lose weight & feel confident' })
      .click()
    await page.getByTestId('booking-form-continue-button').tap()

    // Step 2
    await page.getByTestId('service-option-1-on-1-Personal-Training').tap()
    await page.getByTestId('booking-form-continue-button').tap()

    // Step 3 date picker via tap
    await selectDate(page)
    await page.getByTestId('time-select').tap()
    await page.getByTestId('time-select').selectOption('9:00 AM')

    // Submit and expect error toast
    await page.getByTestId('booking-form-submit-button').tap()
    await expect(
      page.getByTestId('toast').getByText(/Server Error on Mobile/i)
    ).toBeVisible()
  })
})
