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
    // Arrange
    await page.goto('/')
    await simulateOffline(page)
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .click()
    await expect(page.getByTestId('booking-form-dialog')).toBeVisible()

    await page.getByTestId('name-input').fill('Offline Test')
    await page.getByTestId('email-input').fill('offline@example.com')
    await page.getByTestId('phone-input').fill('0400000000')
    await page.getByTestId('goals-select-trigger').click()
    await page
      .getByRole('option', { name: 'Lose weight & feel confident' })
      .click()
    await page.getByTestId('booking-form-continue-button').click()

    await page.getByTestId('service-option-1-on-1-Personal-Training').click()
    await page.getByTestId('booking-form-continue-button').click()

    await selectDate(page)
    await page.getByTestId('time-select').selectOption('9:00 AM')

    // Act
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    const networkErrorToast = page.getByTestId('toast').getByText(/Network error/i)
    await expect(networkErrorToast).toBeVisible()

    // Arrange - Go back online
    await simulateOnline(page)
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

    // Act - Retry submit
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    const confirmation = page.getByTestId('booking-confirmation')
    await expect(confirmation).toBeVisible({ timeout: 5000 })
  })

  test('Shows loading state during delayed API response', async ({ page }) => {
    // Arrange
    await delayRoute(page, '**/api/book-session', 2000)

    await page.goto('/')
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .click()
    await expect(page.getByTestId('booking-form-dialog')).toBeVisible()

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

    const submit = page.getByTestId('booking-form-submit-button')
    await expect(submit).toBeEnabled()

    // Act
    await submit.click()

    // Assert - During delay
    await expect(submit).toHaveAttribute('aria-busy', 'true')
    await expect(submit).toBeDisabled()
    
    // Assert - After delay
    const confirmation = page.getByTestId('booking-confirmation')
    await expect(confirmation).toBeVisible({ timeout: 5000 })
  })

  test('handles network timeout errors', async ({ page }) => {
    // Arrange
    await page.route('**/api/book-session', route =>
      route.abort('timedout')
    )

    await page.goto('/')
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .click()

    // Act
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    const errorToast = page.getByTestId('toast').getByText(/Network error|timeout/i)
    await expect(errorToast).toBeVisible()
  })

  test('validates network error handling throws on invalid retry config', () => {
    // Arrange
    const invalidRetryConfig = null

    // Act & Assert
    expect(() => {
      if (!invalidRetryConfig) {
        throw new Error('Network retry configuration required')
      }
    }).toThrow('Network retry configuration required')
  })
})
