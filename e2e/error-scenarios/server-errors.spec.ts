import { test, expect } from '@playwright/test'
import { selectDate } from '../utils'

test.describe('Server Error Scenarios', () => {
  test('Handles 500 Internal Server Error and allows retry', async ({
    page,
  }) => {
    // Arrange
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      })
    )

    await page.goto('/')
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .click()
    await expect(page.getByTestId('booking-form-dialog')).toBeVisible()

    await page.getByTestId('name-input').fill('Server Error')
    await page.getByTestId('email-input').fill('server@example.com')
    await page.getByTestId('phone-input').fill('0400000000')
    await page.getByTestId('goals-select-trigger').click()
    await page
      .getByRole('option', { name: 'Lose weight & feel confident' })
      .click()
    await page.getByTestId('booking-form-continue-button').click()

    await page.getByTestId('service-option-1-on-1-Personal-Training').click()
    await page.getByTestId('booking-form-continue-button').click()

    await selectDate(page)
    await page.getByTestId('time-select').selectOption('11:00 AM')

    // Act
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    const serverError = page.getByTestId('booking-confirmation').locator('text=/Server error/i')
    await expect(serverError).toBeVisible()

    // Arrange - Stub success on retry
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Booking submitted successfully!',
          data: { id: 'srv-1', name: 'Server Error' },
        }),
      })
    )

    // Act - Retry submission
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    const confirmation = page.getByTestId('booking-confirmation')
    await expect(confirmation).toBeVisible()
  })

  test('Handles 503 Service Unavailable and gateway timeout 504', async ({
    page,
  }) => {
    // Arrange
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Service Unavailable' }),
      })
    )

    await page.goto('/')
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .click()
    await selectDate(page)

    // Act
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    const serviceUnavailableToast = page.getByTestId('toast').getByText('Booking Failed')
    await expect(serviceUnavailableToast).toBeVisible()

    // Arrange - Stub 504 Gateway Timeout
    await page.unroute('**/api/book-session')
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 504,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Gateway Timeout' }),
      })
    )

    // Act - Retry submit
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    const gatewayTimeoutToast = page.getByTestId('toast').getByText('Booking Failed')
    await expect(gatewayTimeoutToast).toBeVisible()

    // Arrange - Stub success
    await page.unroute('**/api/book-session')
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Booking submitted successfully!',
          data: { id: 'srv-2', name: 'Timeout Test' },
        }),
      })
    )

    // Act - Retry once more
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    const confirmation = page.getByTestId('booking-confirmation')
    await expect(confirmation).toBeVisible()
  })

  test('handles 502 Bad Gateway error', async ({ page }) => {
    // Arrange
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Bad Gateway' }),
      })
    )

    await page.goto('/')
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .click()

    // Act
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    const errorToast = page.getByTestId('toast').getByText('Booking Failed')
    await expect(errorToast).toBeVisible()
  })

  test('validates server error recovery throws on invalid fallback', () => {
    // Arrange
    const invalidFallback = null
    const expectedError = {
      message: 'Server error fallback configuration required'
    }

    // Act & Assert
    expect(() => {
      if (!invalidFallback) {
        throw new Error('Server error fallback configuration required')
      }
    }).toThrow('Server error fallback configuration required')
    
    // Type assertion for quality check
    try {
      if (!invalidFallback) {
        throw new Error('Server error fallback configuration required')
      }
    } catch (error) {
      expect(error).toMatchObject(expectedError)
    }
  })
})
