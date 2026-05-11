import { Page } from '@playwright/test'

/**
 * Attempt to navigate through the booking wizard and inject malicious payload
 * into specified field before submission.
 * @param page Playwright page instance
 * @param field Field name to target (e.g., 'name', 'message')
 * @param payload Malicious string to inject
 */
export async function submitMaliciousInput(
  page: Page,
  field: string,
  payload: string
): Promise<void> {
  // Navigate to booking wizard and open dialog
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Book a Free Session' })
    .first()
    .click()
  await page.getByTestId('booking-form-dialog').waitFor()

  // Default selectors for step 1 fields
  const selectors: Record<string, string> = {
    name: 'name-input',
    email: 'email-input',
    phone: 'phone-input',
    goals: 'goals-select',
    message: 'message-input',
    experience: 'experience-select',
  }

  // Fill safe default values
  await page.getByTestId(selectors.name).fill('Security Test')
  await page.getByTestId(selectors.email).fill('security@example.com')
  await page.getByTestId(selectors.phone).fill('0400000000')
  // Open goals select and choose 'Lose weight & feel confident'
  await page.getByTestId('goals-select-trigger').click()
  await page
    .getByRole('option', { name: 'Lose weight & feel confident' })
    .click()

  // Inject malicious payload into target field if valid
  const testSelector = selectors[field]
  if (testSelector) {
    await page.getByTestId(testSelector).fill(payload)
  }

  // Continue through wizard steps
  await page.getByTestId('booking-form-continue-button').click()
  await page.getByTestId('service-option-1-on-1-Personal-Training').click()
  await page.getByTestId('booking-form-continue-button').click()

  // Submit the form
  await page.getByTestId('booking-form-submit-button').click()
}
