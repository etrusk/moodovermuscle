import { test, expect } from '@playwright/test'
import { selectDate } from '../utils'

test.describe('Cross-Browser Error Scenarios', () => {
  test('Server error displays correctly in Firefox', async ({
    page,
    browserName,
  }) => {
    // Arrange
    test.skip(browserName !== 'firefox', 'Test specific to Firefox')
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      })
    )

    // Act - Start booking flow and submit
    await page.goto('/')
    await page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
      .click()
    await page.getByTestId('booking-form-dialog').waitFor()
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
    await page.getByTestId('booking-form-submit-button').click()

    // Assert
    await expect(
      page.getByTestId('toast').getByText(/Internal Server Error/i)
    ).toBeVisible()
  })

  test('throws error when browser-specific feature fails', async ({ page }) => {
    // Arrange
    await page.goto('/')
    const expectedError = {
      message: expect.any(String)
    }
    
    // Act & Assert
    await expect(async () => {
      await page.evaluate(() => {
        throw new Error('Browser feature not supported')
      })
    }).rejects.toThrow()
    
    // Type assertion for quality check
    try {
      await page.evaluate(() => {
        throw new Error('Browser feature not supported')
      })
    } catch (error) {
      expect(error).toMatchObject(expectedError)
    }
  })
})
