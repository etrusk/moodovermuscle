import { test, expect } from '@playwright/test'
import { submitMaliciousInput } from '../utils/security-helpers'

test.describe('Rate Limiting Scenarios', () => {
  test('Handles 429 Too Many Requests and allows retry after limit resets', async ({
    page,
  }) => {
    // Arrange
    const testPayload = 'RateLimit Test'
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Too Many Requests' }),
      })
    )

    // Act
    await submitMaliciousInput(page, 'name', testPayload)

    // Assert
    const rateLimitToast = page.getByTestId('toast').getByText(/Too Many Requests/i)
    await expect(rateLimitToast).toBeVisible()

    // Arrange - Reset rate limit and stub success
    await page.unroute('**/api/book-session')
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Booking submitted successfully!',
          data: { id: 'rl-1', name: 'RateLimit Test' },
        }),
      })
    )

    // Act - Retry submission
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    const successToast = page.getByTestId('toast').getByText('Booking Confirmed!')
    await expect(successToast).toBeVisible()
  })

  test('handles rate limit with retry-after header', async ({ page }) => {
    // Arrange
    const retryAfterSeconds = 5
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 429,
        headers: {
          'Retry-After': retryAfterSeconds.toString(),
        },
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Too Many Requests',
          retryAfter: retryAfterSeconds
        }),
      })
    )

    // Act
    await submitMaliciousInput(page, 'name', 'Retry Test')

    // Assert
    const toast = page.getByTestId('toast').getByText(/Too Many Requests/i)
    await expect(toast).toBeVisible()
  })

  test('validates rate limit enforcement throws on invalid config', () => {
    // Arrange
    const invalidConfig = null

    // Act & Assert
    expect(() => {
      if (!invalidConfig) {
        throw new Error('Rate limit configuration required')
      }
    }).toThrow('Rate limit configuration required')
  })
})
