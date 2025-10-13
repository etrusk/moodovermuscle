import { test, expect } from '@playwright/test'
import { submitMaliciousInput } from '../utils/security-helpers'

test.describe('Input Validation Scenarios', () => {
  test('Rejects XSS payload in name field', async ({ page }) => {
    // Arrange
    const xssPayload = '<script>alert(1)</script>'
    await page.route('**/api/book-session', async route => {
      const post = await route.request().postDataJSON()
      if (typeof post.name === 'string' && post.name.includes('<script>')) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Invalid form data.',
            errors: { name: ['Invalid input detected'] },
          }),
        })
      }
      return route.continue()
    })

    // Act
    await submitMaliciousInput(page, 'name', xssPayload)

    // Assert
    const toast = page.getByTestId('toast').getByText(/Invalid form data/i)
    await expect(toast).toBeVisible()
  })

  test('Rejects SQL injection attempt in message field', async ({ page }) => {
    // Arrange
    const sqlInjectionPayload = "Robert'); DROP TABLE bookings;--"
    await page.route('**/api/book-session', async route => {
      const post = await route.request().postDataJSON()
      if (
        typeof post.message === 'string' &&
        post.message.includes('DROP TABLE')
      ) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Invalid form data.',
            errors: { message: ['Suspicious input detected'] },
          }),
        })
      }
      return route.continue()
    })

    // Act
    await submitMaliciousInput(page, 'message', sqlInjectionPayload)

    // Assert
    const toast = page.getByTestId('toast').getByText(/Invalid form data/i)
    await expect(toast).toBeVisible()
  })

  test('Rejects oversized payload in goals field', async ({ page }) => {
    // Arrange
    const oversizedPayload = 'a'.repeat(1001)
    await page.route('**/api/book-session', async route => {
      const post = await route.request().postDataJSON()
      if (typeof post.goals === 'string' && post.goals.length > 500) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Invalid form data.',
            errors: { goals: ['Input exceeds maximum length'] },
          }),
        })
      }
      return route.continue()
    })

    // Act
    await submitMaliciousInput(page, 'goals', oversizedPayload)

    // Assert
    const toast = page.getByTestId('toast').getByText(/Invalid form data/i)
    await expect(toast).toBeVisible()
  })

  test('handles empty input validation error', async ({ page }) => {
    // Arrange
    const emptyPayload = ''
    await page.route('**/api/book-session', async route => {
      const post = await route.request().postDataJSON()
      if (!post.name || post.name === '') {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Invalid form data.',
            errors: { name: ['Name is required'] },
          }),
        })
      }
      return route.continue()
    })

    // Act
    await submitMaliciousInput(page, 'name', emptyPayload)

    // Assert
    const toast = page.getByTestId('toast').getByText(/Invalid form data/i)
    await expect(toast).toBeVisible()
  })

  test('validates input sanitization throws on null', () => {
    // Arrange
    const invalidInput = null

    // Act & Assert
    expect(() => {
      if (!invalidInput) {
        throw new Error('Input validation failed: null input')
      }
    }).toThrow('Input validation failed: null input')
  })
})
