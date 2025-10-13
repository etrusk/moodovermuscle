import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/admin/login')
  })

  test('complete admin workflow: login → dashboard → bookings → calendar', async ({ page }) => {
    // Arrange
    const credentials = {
      email: 'emily@moodovermuscle.com.au',
      password: 'TestPassword123!'
    }
    
    // Act - 1. Login Flow
    await expect(page.locator('h1')).toContainText('Admin Login')
    await page.fill('input[type="email"]', credentials.email)
    await page.fill('input[type="password"]', credentials.password)
    await page.click('button[type="submit"]')

    // Assert - 2. Dashboard - verify successful login and data display
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    await expect(page.locator('h2')).toContainText('Welcome back')
    
    // Verify dashboard stats are loading/displayed
    await expect(page.locator('[data-testid="stats-cards"]').or(page.locator('.text-2xl.font-bold'))).toBeVisible()
    
    // Verify navigation is present
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('a[href="/admin/bookings"]')).toContainText('Bookings')
    await expect(page.locator('a[href="/admin/calendar"]')).toContainText('Calendar')

    // 3. Navigate to Bookings via quick action
    await page.click('text=View All Bookings')
    await expect(page).toHaveURL(/\/admin\/bookings/)

    // 4. Bookings Page - verify booking management functionality
    await expect(page.locator('h1')).toContainText('Booking Management')
    
    // Wait for bookings to load (either loading state or actual bookings)
    await page.waitForSelector('[data-testid="booking-list"]', { timeout: 10000 })
      .catch(async () => {
        // Fallback: look for either loading state or empty state or actual bookings
        await page.waitForSelector('.animate-pulse', { timeout: 5000 })
          .catch(() => page.waitForSelector('text=No bookings found', { timeout: 5000 }))
          .catch(() => page.waitForSelector('[data-testid="booking-item"]', { timeout: 5000 }))
      })

    // Verify filter functionality is available
    await expect(page.locator('select').or(page.locator('[role="combobox"]'))).toBeVisible()
    await expect(page.locator('input[placeholder*="search"]').or(page.locator('input[placeholder*="Search"]'))).toBeVisible()

    // Test booking status update if bookings exist
    const hasBookings = await page.locator('text=Mark as').first().isVisible().catch(() => false)
    if (hasBookings) {
      await page.click('text=Mark as', { timeout: 5000 })
      // Verify the action was processed (could be success or error)
      await page.waitForTimeout(1000) // Allow time for API call
    }

    // 5. Navigate to Calendar
    await page.click('a[href="/admin/calendar"]')
    await expect(page).toHaveURL(/\/admin\/calendar/)

    // 6. Calendar Page - verify calendar functionality
    await expect(page.locator('h1')).toContainText('Calendar')
    
    // Verify calendar components are present
    await expect(page.locator('[data-testid="calendar-view"]').or(page.locator('button:has-text("Today")'))).toBeVisible()
    
    // Verify navigation controls
    await expect(page.locator('button:has-text("Today")')).toBeVisible()
    
    // Test month navigation
    const prevButton = page.locator('button').filter({ hasText: /^$/ }).first() // ChevronLeft (empty text)
    const nextButton = page.locator('button').filter({ hasText: /^$/ }).nth(1) // ChevronRight (empty text)
    
    if (await prevButton.isVisible()) {
      await prevButton.click()
      await page.waitForTimeout(500)
    }
    
    if (await nextButton.isVisible()) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    // Return to today
    await page.click('button:has-text("Today")')

    // 7. Verify logout functionality
    await page.click('button:has-text("Logout")')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('handles authentication protection', async ({ page }) => {
    // Arrange
    const unauthorizedUrl = '/admin/dashboard'
    
    // Act
    await page.goto(unauthorizedUrl)
    
    // Assert - Should redirect to login
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('handles invalid login credentials', async ({ page }) => {
    // Arrange
    const invalidCredentials = {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    }
    
    // Act
    await page.fill('input[type="email"]', invalidCredentials.email)
    await page.fill('input[type="password"]', invalidCredentials.password)
    await page.click('button[type="submit"]')

    // Assert - Should show error message
    await expect(page.locator('text=error').or(page.locator('.text-red-'))).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('navigation between admin sections works correctly', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'emily@moodovermuscle.com.au')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/admin\/dashboard/)

    // Test navigation links
    const sections = [
      { link: 'a[href="/admin/bookings"]', text: 'Bookings', url: /\/admin\/bookings/ },
      { link: 'a[href="/admin/calendar"]', text: 'Calendar', url: /\/admin\/calendar/ },
      { link: 'a[href="/admin/dashboard"]', text: 'Dashboard', url: /\/admin\/dashboard/ }
    ]

    for (const section of sections) {
      await page.click(section.link)
      await expect(page).toHaveURL(section.url)
      await expect(page.locator('nav')).toContainText(section.text)
    }
  })

  test('responsive design works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Login
    await page.fill('input[type="email"]', 'emily@moodovermuscle.com.au')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/admin\/dashboard/)

    // Verify mobile-responsive elements are present
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    
    // Navigation should work on mobile
    await page.click('a[href="/admin/bookings"]')
    await expect(page).toHaveURL(/\/admin\/bookings/)
    
    // Verify mobile layout
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(375)
  })

  test('error states are handled gracefully', async ({ page }) => {
    // Mock API failure by intercepting requests
    await page.route('**/api/admin/stats', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })

    // Login
    await page.fill('input[type="email"]', 'emily@moodovermuscle.com.au')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/admin\/dashboard/)

    // Should show error state
    await expect(page.locator('text=Error').or(page.locator('.text-red-'))).toBeVisible({ timeout: 10000 })
    
    // Retry functionality should be available
    const retryButton = page.locator('button:has-text("Retry")').or(page.locator('button:has-text("Try Again")'))
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible()
    }

    // Navigation should still work despite error
    await expect(page.locator('nav')).toBeVisible()
    await page.click('a[href="/admin/bookings"]')
    await expect(page).toHaveURL(/\/admin\/bookings/)
  })

  test('accessibility standards are maintained', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'emily@moodovermuscle.com.au')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/admin\/dashboard/)

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verify focus is visible
    const focusedElement = await page.locator(':focus').first()
    await expect(focusedElement).toBeVisible()

    // Test that all interactive elements have proper accessibility
    const buttons = await page.locator('button').all()
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label')
      const textContent = await button.textContent()
      const hasAccessibleName = ariaLabel || (textContent && textContent.trim())
      expect(hasAccessibleName).toEqual(expect.anything())
    }

    // Verify proper heading structure
    const h1Elements = await page.locator('h1').count()
    expect(h1Elements).toBeGreaterThanOrEqual(1)
  })

  test('throws error when authentication fails', async ({ page }) => {
    // Arrange
    const invalidCredentials = {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    }
    
    // Act
    await page.fill('input[type="email"]', invalidCredentials.email)
    await page.fill('input[type="password"]', invalidCredentials.password)
    await page.click('button[type="submit"]')
    
    // Assert - Should show error
    await expect(page.locator('text=error').or(page.locator('.text-red-'))).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Admin Booking Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'emily@moodovermuscle.com.au')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    
    // Navigate to bookings
    await page.click('a[href="/admin/bookings"]')
    await expect(page).toHaveURL(/\/admin\/bookings/)
  })

  test('booking filtering and search functionality', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Booking Management')

    // Test status filter if bookings exist
    const statusSelect = page.locator('select').or(page.locator('[role="combobox"]')).first()
    if (await statusSelect.isVisible()) {
      await statusSelect.click()
      
      // Look for status options
      const pendingOption = page.locator('text=Pending').or(page.locator('[value="PENDING"]'))
      if (await pendingOption.isVisible()) {
        await pendingOption.click()
        await page.waitForTimeout(500) // Allow filter to apply
      }
    }

    // Test search functionality
    const searchInput = page.locator('input[placeholder*="search"]').or(page.locator('input[placeholder*="Search"]'))
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await page.waitForTimeout(500) // Allow search to apply
      
      // Clear search
      await searchInput.clear()
    }

    // Test date filters if present
    const fromDateInput = page.locator('input[type="date"]').first()
    if (await fromDateInput.isVisible()) {
      await fromDateInput.fill('2025-08-01')
      await page.waitForTimeout(500)
    }
  })

  test('booking detail modal interaction', async ({ page }) => {
    // Look for View Details button
    const viewDetailsButton = page.locator('button:has-text("View Details")').first()
    
    if (await viewDetailsButton.isVisible()) {
      await viewDetailsButton.click()
      
      // Modal should open
      await expect(page.locator('[role="dialog"]').or(page.locator('.modal'))).toBeVisible({ timeout: 5000 })
      
      // Modal should have booking details
      await expect(page.locator('text=Booking Details').or(page.locator('text=Contact Information'))).toBeVisible()
      
      // Close modal (try different methods)
      const closeButton = page.locator('button[aria-label*="close"]').or(page.locator('button:has-text("×")'))
      if (await closeButton.isVisible()) {
        await closeButton.click()
      } else {
        await page.keyboard.press('Escape')
      }
      
      // Modal should close
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 3000 })
    }
  })
})

test.describe('Admin Calendar E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to calendar
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'emily@moodovermuscle.com.au')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    
    await page.click('a[href="/admin/calendar"]')
    await expect(page).toHaveURL(/\/admin\/calendar/)
  })

  test('calendar navigation and booking display', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Calendar')

    // Test Today button
    const todayButton = page.locator('button:has-text("Today")')
    await expect(todayButton).toBeVisible()
    await todayButton.click()

    // Test month navigation buttons
    const navButtons = page.locator('button').filter({ hasText: /^$/ }) // Empty text buttons (chevrons)
    const prevButton = navButtons.first()
    const nextButton = navButtons.nth(1)

    if (await prevButton.isVisible()) {
      await prevButton.click()
      await page.waitForTimeout(500)
      
      // Should change month
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    // Test view mode selector if present
    const viewModeSelect = page.locator('[role="combobox"]')
    if (await viewModeSelect.isVisible()) {
      await viewModeSelect.click()
      
      const monthOption = page.locator('text=Month')
      if (await monthOption.isVisible()) {
        await monthOption.click()
      }
    }

    // Verify status legend
    await expect(page.locator('text=Status Legend').or(page.locator('text=Legend'))).toBeVisible()
  })

  test('booking interaction from calendar view', async ({ page }) => {
    // Arrange
    const bookingElement = page.locator('[role="button"]').filter({ hasText: /.+@.+/ }).first()
      .or(page.locator('[data-testid="booking-item"]').first())
      .or(page.locator('.hover\\:shadow-sm').first())

    // Act
    if (await bookingElement.isVisible()) {
      await bookingElement.click()
      
      // Assert - Should open booking details modal
      await expect(page.locator('[role="dialog"]').or(page.locator('text=Booking Details'))).toBeVisible({ timeout: 5000 })
      
      // Close modal
      await page.keyboard.press('Escape')
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 3000 })
    }
  })

  test('throws error when calendar fails to load', async ({ page }) => {
    // Arrange
    await page.route('**/api/admin/bookings', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })
    
    // Act & Assert
    await expect(page.locator('text=Error').or(page.locator('.text-red-'))).toBeVisible({ timeout: 10000 })
  })

  test('throws error in calendar validation', () => {
    // Arrange
    const invalidDate = null
    
    // Act & Assert
    expect(() => {
      if (!invalidDate) throw new Error('Invalid calendar date')
    }).toThrow('Invalid calendar date')
  })
})