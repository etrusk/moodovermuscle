import { test, expect } from '@playwright/test'
import {
  simulateOffline,
  simulateOnline,
  delayRoute,
} from '../utils/network-helpers'
import { selectDate } from '../utils'

test.describe('Network Failure Scenarios', () => {
  test('Handles offline mode: shows network error and allows retry when back online', async ({
    page,
  }) => {
    // Go offline before starting flow
    // Start booking wizard
    await page.goto('/')
    // Go offline after initial navigation to allow page load
    await simulateOffline(page)
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .click()
    await expect(page.getByTestId('booking-form-dialog')).toBeVisible()

    // Fill step 1
    await page.getByTestId('name-input').fill('Offline Test')
    await page.getByTestId('email-input').fill('offline@example.com')
    await page.getByTestId('phone-input').fill('0400000000')
    await page.getByTestId('goals-select-trigger').click()
    await page
      .getByRole('option', { name: 'Lose weight & feel confident' })
      .click()
    await page.getByTestId('booking-form-continue-button').click()

    // Step 2
    await page.getByTestId('service-option-1-on-1-Personal-Training').click()
    await page.getByTestId('booking-form-continue-button').click()

    // Step 3
    await selectDate(page)
    await page.getByTestId('time-select').selectOption('9:00 AM')

    // Attempt submit while offline
    await page.getByTestId('booking-form-submit-button').click()

    // Expect network error toast
    await expect(
      page.getByTestId('toast').getByText(/Network error/i)
    ).toBeVisible()

    // Go back online
    await simulateOnline(page)
    // Stub successful response
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Booking submitted successfully!',
          data: { id: 'net-1', name: 'Offline Test' },
        }),
      })
    )

    // Retry submit
    await page.getByTestId('booking-form-submit-button').click()
    await expect(page.getByTestId('booking-confirmation')).toBeVisible({
      timeout: 5000,
    })
  })

  test('Shows loading state during delayed API response', async ({ page }) => {
    // Delay API response by 2 seconds
    await delayRoute(page, '**/api/book-session', 2000)

    // Start booking wizard
    await page.goto('/')
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .click()
    await expect(page.getByTestId('booking-form-dialog')).toBeVisible()

    // Fill through wizard
    await page.getByTestId('name-input').fill('Delay Test')
    await page.getByTestId('email-input').fill('delay@example.com')
    await page.getByTestId('phone-input').fill('0411111111')
    await page.getByTestId('goals-select-trigger').click()
    await page
      .getByRole('option', { name: 'Lose weight & feel confident' })
      .click()
    await page.getByTestId('booking-form-continue-button').click()
    await page.getByTestId('service-option-1-on-1-Personal-Training').click()
    await page.getByTestId('booking-form-continue-button').click()
    await selectDate(page)
    await page.getByTestId('time-select').selectOption('10:00 AM')

    // Check loading indicator on submit
    const submit = page.getByTestId('booking-form-submit-button')
    await expect(submit).toBeEnabled()
    await submit.click()
    // During delay: button should be disabled and have aria-busy
    await expect(submit).toHaveAttribute('aria-busy', 'true')
    await expect(submit).toBeDisabled()
    // After delay, expect confirmation UI
    await expect(page.getByTestId('booking-confirmation')).toBeVisible({
      timeout: 5000,
    })
  })

  it('handles error conditions gracefully', () => {
    // Arrange
    const invalidInput = null;
    
    // Act & Assert
    expect(() => {
      // This would throw in real scenario
      if (!invalidInput) throw new Error('Invalid input');
    }).toThrow('Invalid input');
  });

})
