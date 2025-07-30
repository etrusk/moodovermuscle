import { test, expect, APIRequestContext } from '@playwright/test'

test.describe('3-step Booking Wizard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Happy path: complete booking and show confirmation', async ({ page }) => {
    // Stub /api/book-session to mock email send
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, messageId: 'test-msg-123' }),
      }),
    )

    // Step 1: personal info
    await page.getByPlaceholder('Your beautiful name').fill('Jane Doe')
    await page.getByPlaceholder('your.email@example.com').fill('jane@example.com')
    await page.getByPlaceholder('Your phone number').fill('0400000000')
    await page.selectOption('select', 'weight-loss')
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 2: session type
    await page.getByText('1-on-1 Personal Training').click()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 3: date picker
    await page.click('text=Pick a date')
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
    await page.getByRole('button', { name: tomorrow.getDate().toString() }).click()

    // Submit
    const submit = page.getByRole('button', { name: 'Book session' })
    await expect(submit).toBeEnabled()
    await submit.click()

    // Confirmation toast appears
    await expect(page.getByText(/booking confirmed/i)).toBeVisible()
  })

  test('Form validation: missing required fields and invalid email', async ({ page }) => {
    // Leave all fields empty
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText(/name is required/i)).toBeVisible()
    await expect(page.getByText(/email is required/i)).toBeVisible()
    // Fill invalid email
    await page.getByPlaceholder('Your beautiful name').fill('Test')
    await page.getByPlaceholder('your.email@example.com').fill('not-an-email')
    await page.getByPlaceholder('Your phone number').fill('0412345678')
    await page.selectOption('select', 'weight-loss')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('Handles server error: shows error toast and preserves form data', async ({ page }) => {
    // Stub 500 error
    await page.route('**/api/book-session', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
    )
    // Fill step 1
    await page.getByPlaceholder('Your beautiful name').fill('John Smith')
    await page.getByPlaceholder('your.email@example.com').fill('john@example.com')
    await page.getByPlaceholder('Your phone number').fill('0499999999')
    await page.selectOption('select', 'weight-loss')
    await page.getByRole('button', { name: 'Continue' }).click()
    // Step 2
    await page.getByText('Group Training').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    // Step 3 date
    await page.click('text=Pick a date')
    const day = new Date(); day.setDate(day.getDate() + 2)
    await page.getByRole('button', { name: day.getDate().toString() }).click()
    await page.getByRole('button', { name: 'Book session' }).click()
    // Error toast
    await expect(page.getByText(/error sending confirmation/i)).toBeVisible()
    // Data persists: navigate back to step1 and verify values
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.getByPlaceholder('Your beautiful name')).toHaveValue('John Smith')
    await expect(page.getByPlaceholder('your.email@example.com')).toHaveValue('john@example.com')
    // Now stub success and retry
    await page.route('**/api/book-session', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, messageId: 'retry-msg' }),
      }),
    )
    await page.getByRole('button', { name: 'Continue' }).click() // to step2
    await page.getByRole('button', { name: 'Continue' }).click() // to step3
    await page.getByRole('button', { name: 'Book session' }).click()
    await expect(page.getByText(/booking confirmed/i)).toBeVisible()
  })

  test('Accessibility: loading and disabled states use aria-busy and disabled attrs', async ({ page }) => {
    // Stub delayed response
    await page.route('**/api/book-session', async route => {
      await new Promise(res => setTimeout(res, 1000))
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })
    // Fill minimal valid data and submit through wizard
    await page.getByPlaceholder('Your beautiful name').fill('A11y Test')
    await page.getByPlaceholder('your.email@example.com').fill('a11y@example.com')
    await page.getByPlaceholder('Your phone number').fill('0400123456')
    await page.selectOption('select', 'weight-loss')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByText('1-on-1 Personal Training').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.click('text=Pick a date')
    const nd = new Date(); nd.setDate(nd.getDate() + 3)
    await page.getByRole('button', { name: nd.getDate().toString() }).click()
    const btn = page.getByRole('button', { name: 'Book session' })
    // Before click: not busy
    await expect(btn).not.toHaveAttribute('aria-busy', 'true')
    await btn.click()
    // During request: button disabled & busy
    await expect(btn).toHaveAttribute('disabled', '')
    await expect(btn).toHaveAttribute('aria-busy', 'true')
    // After completion
    await expect(page.getByText(/booking confirmed/i)).toBeVisible()
  })
})