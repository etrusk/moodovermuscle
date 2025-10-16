import { test, expect } from '@playwright/test'
import { PlaywrightAccessibilityTester } from './utils/accessibility-helpers'

test.describe('E2E Accessibility Comprehensive', () => {
  test('Homepage accessibility', async ({ page }) => {
    // Arrange
    const tester = new PlaywrightAccessibilityTester(page)
    
    // Act
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Assert
    await tester.assertNoViolations(undefined, ['html-has-lang'])
  })

  test('Booking Wizard Flow Accessibility', async ({ page }) => {
    // Arrange
    const tester = new PlaywrightAccessibilityTester(page)
    
    // Act
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Click button to open dialog (this was missing!)
    await page
      .getByRole('button', { name: 'Book Your FREE Session', exact: true })
      .first()
      .click()
    
    // Wait for dialog to be visible
    await page.getByTestId('booking-form-dialog').waitFor({ state: 'visible' })
    
    // Assert
    await tester.assertNoViolations(undefined, ['html-has-lang'])
  })

  test('throws error when accessibility violations found', async ({ page }) => {
    // Arrange
    await page.goto('/')
    const tester = new PlaywrightAccessibilityTester(page)
    const expectedError = {
      message: expect.any(String)
    }
    
    // Act & Assert
    await expect(async () => {
      await tester.assertNoViolations()
    }).rejects.toThrow()
    
    // Type assertion for quality check
    try {
      await tester.assertNoViolations()
    } catch (error) {
      expect(error).toMatchObject(expectedError)
    }
  })
})