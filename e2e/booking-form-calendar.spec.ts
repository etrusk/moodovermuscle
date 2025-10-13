import { test, expect } from '@playwright/test'

test.describe('Booking Form Calendar', () => {
  test('should disable past dates and today, allowing only future date selections', async ({
    page,
  }) => {
    // Arrange
    await page.goto('/')
    const today = new Date()
    const todayDate = today.getDate()
    const tomorrowDate = new Date(today)
    tomorrowDate.setDate(today.getDate() + 1)

    // Act - Navigate through booking form to calendar
    const bookSessionButton = page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
    await bookSessionButton.waitFor({ state: 'visible' })
    await bookSessionButton.click()

    await page.getByTestId('name-input').fill('Test User')
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('phone-input').fill('0412345678')
    await page.getByTestId('goals-select-trigger').click()
    await page
      .getByRole('option', { name: 'Lose weight & feel confident' })
      .click()
    await page.getByTestId('booking-form-continue-button').click()
    await page.getByTestId('service-option-1-on-1-Personal-Training').click()
    await page.getByTestId('booking-form-continue-button').click()

    // Assert - Calendar step visible
    await expect(page.getByTestId('booking-form-step-3')).toBeVisible()
    await page.getByTestId('date-picker-trigger').click()
    await expect(page.getByTestId('date-picker-content')).toBeVisible()

    // Assert - Today is disabled
    const todayButton = page
      .getByRole('button', { name: todayDate.toString() })
      .first()
    await expect(todayButton).toBeDisabled()

    // Assert - Past date is disabled
    await page.getByTestId('calendar-prev-button').click()
    const pastDateButton = page.getByRole('button', { name: '15' })
    await expect(pastDateButton).toBeDisabled()

    // Assert - Tomorrow is enabled
    await page.getByTestId('calendar-next-button').click()
    const tomorrowButton = page
      .getByRole('button', {
        name: tomorrowDate.getDate().toString(),
        exact: true,
      })
      .first()
    await expect(tomorrowButton).toBeEnabled()
    await tomorrowButton.click()
  })

  test('throws error when calendar fails to open', async ({ page }) => {
    // Arrange
    await page.goto('/')
    
    // Act & Assert
    await expect(async () => {
      await page.getByTestId('date-picker-trigger').click({ timeout: 1000 })
    }).rejects.toThrow()
  })
})
