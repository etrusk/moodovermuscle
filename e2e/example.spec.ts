import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Check if the page loads successfully
    await expect(page).toHaveTitle(/Mood Over Muscle/)

    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible()

    // Check for hero section
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should navigate to classes page', async ({ page }) => {
    await page.goto('/')

    // Click on classes link
    await page.getByRole('link', { name: /classes/i }).click()

    // Check if we're on the classes page
    await expect(page).toHaveURL(/.*classes/)
    await expect(page.locator('h1')).toContainText(/classes/i)
  })
})

test.describe('Booking Form', () => {
  test('should display booking form', async ({ page }) => {
    await page.goto('/')

    // Check if booking form is present
    const bookingForm = page.locator('[data-testid="booking-form"]')
    await expect(bookingForm).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/')

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /book/i })
    await submitButton.click()

    // Check for validation messages
    await expect(page.locator('text=This field is required')).toBeVisible()
  })
})
