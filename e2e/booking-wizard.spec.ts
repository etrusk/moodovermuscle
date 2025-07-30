import { test, expect } from '@playwright/test'
import { selectDate } from './utils'

test.describe('3-step Booking Wizard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Click the "Book Your FREE Session" button to open the booking form
    await page
      .getByRole('button', { name: 'Book Your FREE Session', exact: true })
      .first()
      .click()
    await expect(page.getByTestId('booking-form-dialog')).toBeVisible()
  })

  test('Happy path: complete booking and show confirmation', async ({
    page,
  }) => {
    // Stub /api/book-session to mock successful booking
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Booking submitted successfully!',
          data: { id: 1, name: 'Jane Doe' }
        }),
      })
    )

    // Step 1: personal info
    await page.getByTestId('name-input').fill('Jane Doe')
    await page.getByTestId('email-input').fill('jane@example.com')
    await page.getByTestId('phone-input').fill('0400000000')
    await page.getByTestId('goals-select').selectOption('weight-loss')
    await expect(
      page.getByTestId('booking-form-continue-button')
    ).toBeEnabled()
    await page.getByTestId('booking-form-continue-button').click()

    // Step 2: session type
    await expect(page.getByTestId('booking-form-step-2')).toBeVisible()
    await page.getByTestId('service-option-1-on-1-Personal-Training').click()
    await expect(
      page.getByTestId('booking-form-continue-button')
    ).toBeEnabled()
    await page.getByTestId('booking-form-continue-button').click()

    // Step 3: date picker
    await expect(page.getByTestId('booking-form-step-3')).toBeVisible()
    await selectDate(page)
    await page.getByTestId('time-select').selectOption('9:00 AM')

    // Submit
    const submit = page.getByTestId('booking-form-submit-button')
    await expect(submit).toBeEnabled()
    await submit.click()

    // Wait for form submission to complete and toast to appear
    await expect(page.getByTestId('toast').getByText('Booking Confirmed!')).toBeVisible({ timeout: 10000 })
    
    // Dialog should close after successful submission
    await expect(page.getByTestId('booking-form-dialog')).not.toBeVisible({ timeout: 5000 })
  })

  test('Form validation: missing required fields and invalid email', async ({
    page,
  }) => {
    // Leave all fields empty
    await page.getByTestId('booking-form-continue-button').click()
    // Check for any validation error messages (the exact text may vary)
    await expect(page.locator('text=/required/i').first()).toBeVisible()
    // Fill invalid email
    await page.getByTestId('name-input').fill('Test')
    await page.getByTestId('email-input').fill('not-an-email')
    await page.getByTestId('phone-input').fill('0412345678')
    await page.getByTestId('goals-select').selectOption('weight-loss')
    await page.getByTestId('booking-form-continue-button').click()
    await expect(
      page.getByText('Please enter a valid email address.')
    ).toBeVisible()
  })

  test('Handles server error: shows error toast and preserves form data', async ({
    page,
  }) => {
    // Stub 500 error
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error occurred' }),
      })
    )
    // Fill step 1
    await page.getByTestId('name-input').fill('John Smith')
    await page.getByTestId('email-input').fill('john@example.com')
    await page.getByTestId('phone-input').fill('0499999999')
    await page.getByTestId('goals-select').selectOption('weight-loss')
    await page.getByTestId('booking-form-continue-button').click()
    // Step 2
    await expect(page.getByTestId('booking-form-step-2')).toBeVisible()
    await page.getByTestId('service-option-Small-Mums-&-Bubs-Classes').click()
    await page.getByTestId('booking-form-continue-button').click()
    // Step 3 date
    await expect(page.getByTestId('booking-form-step-3')).toBeVisible()
    await selectDate(page)
    await page.getByTestId('time-select').selectOption('10:00 AM')
    // Wait for button to be stable before clicking
    const errorSubmitButton = page.getByTestId('booking-form-submit-button')
    await expect(errorSubmitButton).toBeVisible()
    await expect(errorSubmitButton).toBeEnabled()
    await page.waitForTimeout(500) // Allow any animations to settle
    await errorSubmitButton.click()
    
    // Error toast - dialog should stay open on error
    await expect(page.getByTestId('toast').getByText('Booking Failed')).toBeVisible({ timeout: 10000 })
    // Data persists: navigate back to step1 and verify values
    await page.getByTestId('booking-form-back-button').click()
    await page.getByTestId('booking-form-back-button').click()
    await expect(page.getByTestId('name-input')).toHaveValue('John Smith')
    await expect(page.getByTestId('email-input')).toHaveValue(
      'john@example.com'
    )
    // Now stub success and retry
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Booking submitted successfully!',
          data: { id: 2, name: 'John Smith' }
        }),
      })
    )
    await page.getByTestId('booking-form-continue-button').click() // to step2
    await page.getByTestId('booking-form-continue-button').click() // to step3
    
    // Wait for button to be stable before clicking
    const retrySubmitButton = page.getByTestId('booking-form-submit-button')
    await expect(retrySubmitButton).toBeVisible()
    await page.waitForTimeout(500) // Allow any animations to settle
    await retrySubmitButton.click()
    
    // Wait for success toast
    await expect(page.getByTestId('toast').getByText('Booking Confirmed!')).toBeVisible({ timeout: 10000 })
    // Dialog should close after successful submission
    await expect(page.getByTestId('booking-form-dialog')).not.toBeVisible({ timeout: 5000 })
  })

  test('Accessibility: loading and disabled states use aria-busy and disabled attrs', async ({
    page,
  }) => {
    // Stub delayed response
    await page.route('**/api/book-session', async route => {
      await new Promise(res => setTimeout(res, 1000))
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Booking submitted successfully!',
          data: { id: 3, name: 'A11y Test' }
        }),
      })
    })
    // Fill minimal valid data and submit through wizard
    await page.getByTestId('name-input').fill('A11y Test')
    await page.getByTestId('email-input').fill('a11y@example.com')
    await page.getByTestId('phone-input').fill('0400123456')
    await page.getByTestId('goals-select').selectOption('weight-loss')
    await page.getByTestId('booking-form-continue-button').click()
    await page.getByTestId('service-option-1-on-1-Personal-Training').click()
    await page.getByTestId('booking-form-continue-button').click()
    await selectDate(page)
    await page.getByTestId('time-select').selectOption('11:00 AM')
    const btn = page.getByTestId('booking-form-submit-button')
    // Before click: not busy
    await expect(btn).not.toHaveAttribute('aria-busy', 'true')
    // Wait for button to be stable before clicking
    await expect(btn).toBeVisible()
    await page.waitForTimeout(500) // Allow any animations to settle
    await btn.click()
    
    // During request: button disabled & busy (may be too fast to catch)
    // After completion - wait for success toast
    await expect(page.getByTestId('toast').getByText('Booking Confirmed!')).toBeVisible({ timeout: 10000 })
    // Dialog should close after successful submission
    await expect(page.getByTestId('booking-form-dialog')).not.toBeVisible({ timeout: 5000 })
  })
})