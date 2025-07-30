import { Page, expect } from '@playwright/test'

export async function selectDate(page: Page) {
  // Open the calendar
  await page.getByTestId('date-picker-trigger').click()
  await expect(page.getByTestId('date-picker-content')).toBeVisible()
  
  // Wait for calendar to be fully loaded
  await page.waitForTimeout(500)
  
  // Look for date buttons specifically - they should have day numbers
  // Try different selectors for date buttons in the calendar
  const dateSelectors = [
    '[data-testid="date-picker-content"] [role="gridcell"] button:not([disabled])',
    '[data-testid="date-picker-content"] .rdp-day:not([disabled])',
    '[data-testid="date-picker-content"] button[name^="day-"]',
    '[data-testid="date-picker-content"] button:has-text(/^[0-9]+$/):not([disabled])'
  ]
  
  let dateSelected = false
  
  for (const selector of dateSelectors) {
    const dateButtons = page.locator(selector)
    const count = await dateButtons.count()
    
    if (count > 0) {
      // Click the first available date
      await dateButtons.first().click()
      dateSelected = true
      break
    }
  }
  
  // If no specific date button found, try a more general approach
  if (!dateSelected) {
    // Look for any clickable element that looks like a date (contains only numbers)
    const fallbackSelector = '[data-testid="date-picker-content"] button'
    const allButtons = page.locator(fallbackSelector)
    const buttonCount = await allButtons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i)
      const text = await button.textContent()
      const isDisabled = await button.isDisabled()
      
      // Check if it's a date button (contains only numbers and is not disabled)
      if (text && /^\d+$/.test(text.trim()) && !isDisabled) {
        await button.click()
        dateSelected = true
        break
      }
    }
  }
  
  if (!dateSelected) {
    throw new Error('Could not find any selectable date in the calendar')
  }
  
  // Wait for the popover to close automatically
  await expect(page.getByTestId('date-picker-content')).not.toBeVisible({ timeout: 3000 })
  
  // Verify that a date was actually selected by checking the trigger button text
  const triggerText = await page.getByTestId('date-picker-trigger').textContent()
  if (triggerText && triggerText.includes('Pick a date')) {
    throw new Error('Date selection failed - trigger still shows placeholder text')
  }
}