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
    await page.getByPlaceholder('Your beautiful name').fill('Test User')
    await page
      .getByPlaceholder('your.email@example.com')
      .fill('test@example.com')
    await page.getByPlaceholder('Your phone number').fill('0412345678')
    await page.selectOption('select', 'weight-loss')

    // Click Continue to go to step 2
    await page.getByRole('button', { name: 'Continue' }).click()

    // Select a service in step 2
    await page.getByText('1-on-1 Personal Training').click()

    // Click Continue to go to step 3 (calendar step)
    await page.getByRole('button', { name: 'Continue' }).click()

    // Wait for the calendar step to render
    await expect(page.getByText('Preferred Date *')).toBeVisible()

    // Open the calendar
    await page.click('text=Pick a date')

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
    await page.getByRole('button', { name: /previous month/i }).click()
    const pastDateButton = page.getByRole('button', { name: '15' }) // Arbitrary past date
    await expect(pastDateButton).toBeDisabled()

    // Verify that tomorrow's date is enabled and selectable
    // This will click the forward button on the calendar to go back to the current month
    await page.getByRole('button', { name: /next month/i }).click()
    const tomorrowButton = page.getByRole('button', {
      name: tomorrowDate.getDate().toString(),
    })
    await expect(tomorrowButton).toBeEnabled()
    await tomorrowButton.click()
  })
})
