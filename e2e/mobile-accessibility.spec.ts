import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Mobile Accessibility Audit', () => {
  test('Homepage accessibility', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 390, height: 844 })
    
    // Act
    await page.goto('/')
    const results = await new AxeBuilder({ page }).analyze()
    
    // Assert
    expect(results.violations).toMatchObject([])
  })

  test('Booking flow accessibility', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    
    // Act
    await page
      .getByRole('button', { name: /Book.*Session/i })
      .first()
      .click()
    const results = await new AxeBuilder({ page }).analyze()
    
    // Assert
    expect(results.violations).toMatchObject([])
  })

  test('throws error when accessibility violations exist', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    
    // Act
    const results = await new AxeBuilder({ page }).analyze()
    
    // Assert - Should have no violations (but if there are, test fails)
    await expect(async () => {
      if (results.violations.length > 0) {
        throw new Error(`Found ${results.violations.length} accessibility violations`)
      }
    }).rejects.toThrow()
  })
})
