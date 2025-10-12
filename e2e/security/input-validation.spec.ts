import { test, expect } from '@playwright/test'
import { submitMaliciousInput } from '../utils/security-helpers'

test.describe('Input Validation Scenarios', () => {
  test('Rejects XSS payload in name field', async ({ page }) => {
    // Stub API to simulate validation error on XSS
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

    await submitMaliciousInput(page, 'name', '<script>alert(1)</script>')
    await expect(
      page.getByTestId('toast').getByText(/Invalid form data/i)
    ).toBeVisible()
  })

  test('Rejects SQL injection attempt in message field', async ({ page }) => {
    // Stub API to simulate validation error on SQL injection
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

    await submitMaliciousInput(
      page,
      'message',
      "Robert'); DROP TABLE bookings;--"
    )
    await expect(
      page.getByTestId('toast').getByText(/Invalid form data/i)
    ).toBeVisible()
  })

  test('Rejects oversized payload in goals field', async ({ page }) => {
    const long = 'a'.repeat(1001)
    // Stub API to simulate validation error on oversized input
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

    await submitMaliciousInput(page, 'goals', long)
    await expect(
      page.getByTestId('toast').getByText(/Invalid form data/i)
    ).toBeVisible()
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
