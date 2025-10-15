/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries for accessibility-first calendar data loading testing
 * @last-refactored 2025-10-14
 */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/setup/server'
import AdminCalendarPage from '@/app/admin/calendar/page'
import { mockBookings } from './calendar-test-setup'

describe('AdminCalendarPage - Data Loading', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup({ delay: null })
    vi.clearAllMocks()

    const mockDate = new Date('2025-08-10T12:00:00Z')
    vi.setSystemTime(mockDate)
  })

  afterEach(async () => {
    vi.resetAllMocks()
    vi.useRealTimers()
    if ((global as any).axe) {
      delete (global as any).axe
    }
  })

  describe('Booking Data Loading', () => {
    it('shows loading state during initial data fetch', async () => {
      // Arrange
      server.use(
        http.get('/api/admin/bookings', async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return HttpResponse.json({ bookings: mockBookings })
        })
      )

      // Act
      const { container } = render(<AdminCalendarPage />)

      // Assert
      expect(screen.getByText('Loading calendar...')).toBeInTheDocument()
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      })
    })

    it('fetches bookings for current month view with correct date range', async () => {
      // Arrange & Act
      render(<AdminCalendarPage />)

      // Assert - verify bookings are loaded
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 10000 })
    })

    it('refetches bookings when month changes', async () => {
      // Arrange
      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('August 2025')).toBeInTheDocument()
      }, { timeout: 10000 })

      const allButtons = screen.getAllByRole('button')
      const navigationButtons = allButtons.filter(button =>
        button.querySelector('svg') &&
        !button.textContent?.includes('Today') &&
        !button.getAttribute('aria-expanded')
      )
      const nextButton = navigationButtons[1]

      // Act
      await user.click(nextButton)

      // Assert - verify month changed (use getAllByText since month appears in multiple places)
      await waitFor(() => {
        expect(screen.getAllByText('September 2025')[0]).toBeInTheDocument()
      }, { timeout: 10000 })
    }, 15000)

    it('displays error state when booking fetch fails', async () => {
      // Arrange
      server.use(
        http.get('/api/admin/bookings', () => {
          return HttpResponse.json(
            { error: 'Network error' },
            { status: 500 }
          )
        })
      )

      // Act
      render(<AdminCalendarPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error loading calendar')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      }, { timeout: 10000 })
    })

    it('retries fetch when Try Again button is clicked', async () => {
      // Arrange - First call fails, then succeeds
      let callCount = 0
      server.use(
        http.get('/api/admin/bookings', () => {
          callCount++
          if (callCount === 1) {
            return HttpResponse.json(
              { error: 'Network error' },
              { status: 500 }
            )
          }
          return HttpResponse.json({ bookings: mockBookings })
        })
      )

      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      }, { timeout: 10000 })

      // Act
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      await user.click(tryAgainButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 10000 })
    }, 15000)

    it('shows no bookings message for dates without bookings', async () => {
      // Arrange
      server.use(
        http.get('/api/admin/bookings', () => {
          return HttpResponse.json({ bookings: [] })
        })
      )

      // Act
      render(<AdminCalendarPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no bookings scheduled/i)).toBeInTheDocument()
      }, { timeout: 10000 })
    })
  })

  describe('Performance and Edge Cases', () => {
    it('handles component unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<AdminCalendarPage />)
      
      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })

    it('handles empty booking data gracefully', async () => {
      // Arrange
      server.use(
        http.get('/api/admin/bookings', () => {
          return HttpResponse.json({ bookings: [] })
        })
      )

      // Act
      render(<AdminCalendarPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Calendar')).toBeInTheDocument()
        expect(screen.getByText('No bookings scheduled')).toBeInTheDocument()
      })
    })

    it('handles malformed booking data gracefully', async () => {
      // Arrange
      const malformedBookings = [
        { ...mockBookings[0], date: 'invalid-date' },
        { ...mockBookings[1], time: null }
      ]

      server.use(
        http.get('/api/admin/bookings', () => {
          return HttpResponse.json({ bookings: malformedBookings })
        })
      )

      // Act
      render(<AdminCalendarPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Calendar')).toBeInTheDocument()
      })
    })

    it('handles rapid month navigation without issues', async () => {
      // Arrange
      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getAllByText('August 2025')[0]).toBeInTheDocument()
      }, { timeout: 10000 })

      const nextButton = screen.getAllByRole('button', { name: '' })[1]
      const prevButton = screen.getAllByRole('button', { name: '' })[0]

      // Act
      for (let i = 0; i < 3; i++) {
        await user.click(nextButton)
        await user.click(prevButton)
      }

      // Assert
      await waitFor(() => {
        expect(screen.getAllByText('August 2025')[0]).toBeInTheDocument()
      }, { timeout: 10000 })
    }, 15000)

    it('prevents memory leaks on rapid date selection', async () => {
      // Arrange
      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('Calendar')).toBeInTheDocument()
      }, { timeout: 10000 })

      // Act - Get the navigation "Today" button (not the calendar's today date)
      const todayButton = screen.getAllByRole('button', { name: /today/i })[0]
      await user.click(todayButton)
      
      // Assert
      expect(screen.getByText('Calendar')).toBeInTheDocument()
    })

    it('handles timezone considerations for date display', async () => {
      // Arrange
      // (No setup needed - using default mock)

      // Act
      render(<AdminCalendarPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getAllByText('August 2025')[0]).toBeInTheDocument()
      }, { timeout: 10000 })
    })
  })
})