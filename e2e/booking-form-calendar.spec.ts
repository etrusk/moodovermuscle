import { test, expect } from '@playwright/test'

test.describe('Booking Form Calendar', () => {
  test('should disable past dates and today, allowing only future date selections', async ({
    page,
  }) => {
    // Navigate to the booking form page
    await page.goto('/')

    // Click through to the third step of the form where the calendar is
    const bookSessionButton = page
      .getByRole('button', { name: 'Book Your FREE Session' })
      .first()
    await bookSessionButton.waitFor({ state: 'visible' })
    await bookSessionButton.click()

    // Fill out step 1 form fields to enable Continue button
    await page.getByTestId('name-input').fill('Test User')
    await page.getByTestId('email-input').fill('test@example.com')
    await page.getByTestId('phone-input').fill('0412345678')
    await page.getByTestId('goals-select').selectOption('weight-loss')

    // Click Continue to go to step 2
    await page.getByTestId('booking-form-continue-button').click()

    // Select a service in step 2
    await page.getByTestId('service-option-1-on-1-Personal-Training').click()

    // Click Continue to go to step 3 (calendar step)
    await page.getByTestId('booking-form-continue-button').click()

    // Wait for the calendar step to render
    await expect(page.getByTestId('booking-form-step-3')).toBeVisible()

    // Open the calendar
    await page.getByTestId('date-picker-trigger').click()
    await expect(page.getByTestId('date-picker-content')).toBeVisible()

    // Get today's date information
    const today = new Date()
    const todayDate = today.getDate()
    const tomorrowDate = new Date(today)
    tomorrowDate.setDate(today.getDate() + 1)

    // Verify that today's date is disabled
    const todayButton = page
      .getByRole('button', { name: todayDate.toString() })
      .first()
    await expect(todayButton).toBeDisabled()

    // Verify that a past date is disabled
    // This will click the back button on the calendar to go to the previous month
    await page.getByTestId('calendar-prev-button').click()
    const pastDateButton = page.getByRole('button', { name: '15' }) // Arbitrary past date
    await expect(pastDateButton).toBeDisabled()

    // Verify that tomorrow's date is enabled and selectable
    // This will click the forward button on the calendar to go back to the current month
    await page.getByTestId('calendar-next-button').click()
    const tomorrowButton = page.getByRole('button', {
      name: tomorrowDate.getDate().toString(),
    })
    await expect(tomorrowButton).toBeEnabled()
    await tomorrowButton.click()
  })
})
