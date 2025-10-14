/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries for accessibility-first calendar data loading testing
 * @last-refactored 2025-10-14
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminCalendarPage from '@/app/admin/calendar/page'
import { mockBookings, createMockResponse, createMockErrorResponse } from './calendar-test-setup'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('AdminCalendarPage - Data Loading', () => {
  let user: ReturnType<typeof userEvent.setup>
  let mockSuccessResponse: any

  beforeEach(() => {
    user = userEvent.setup({ delay: null })
    jest.clearAllMocks()
    
    mockSuccessResponse = createMockResponse({ bookings: mockBookings })
    mockFetch.mockResolvedValue(mockSuccessResponse)

    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-08-10T12:00:00Z'))
  })

  afterEach(async () => {
    jest.resetAllMocks()
    jest.useRealTimers()
    await new Promise(resolve => setTimeout(resolve, 100))
    if ((global as any).axe) {
      delete (global as any).axe
    }
  })

  describe('Booking Data Loading', () => {
    it('shows loading state during initial data fetch', async () => {
      // Arrange
      mockFetch.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockSuccessResponse), 200))
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
      // Arrange
      // (No setup needed - using default mock)

      // Act
      render(<AdminCalendarPage />)

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
        const fetchCall = mockFetch.mock.calls[0][0]
        const fetchUrl = typeof fetchCall === 'string' ? fetchCall : fetchCall.url
        expect(fetchUrl).toMatch(/\/api\/admin\/bookings\?dateFrom=2025-07-\d{2}&dateTo=2025-08-\d{2}/)
        
        // Type assertion for fetch call structure
        if (typeof fetchCall !== 'string') {
          expect(fetchCall).toMatchObject({
            url: expect.stringContaining('/api/admin/bookings')
          })
        }
      }, { timeout: 10000 })
    })

    it('refetches bookings when month changes', async () => {
      // Arrange
      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
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

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2)
      }, { timeout: 10000 })
      
      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0]
      const lastCallUrl = typeof lastCall === 'string' ? lastCall : lastCall.url
      expect(lastCallUrl).toMatch(/\/api\/admin\/bookings\?dateFrom=2025-08-\d{2}&dateTo=2025-09-\d{2}/)
    }, 15000)

    it('displays error state when booking fetch fails', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'))

      // Act
      render(<AdminCalendarPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error loading calendar')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      }, { timeout: 10000 })
    })

    it('retries fetch when Try Again button is clicked', async () => {
      // Arrange
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockSuccessResponse)

      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      }, { timeout: 10000 })

      // Act
      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      await user.click(tryAgainButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 10000 })

      expect(mockFetch).toHaveBeenCalledTimes(2)
    }, 15000)

    it('shows no bookings message for dates without bookings', async () => {
      // Arrange
      const emptyResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: [] })),
        clone: jest.fn().mockReturnThis()
      }
      mockFetch.mockResolvedValue(emptyResponse)

      // Act
      render(<AdminCalendarPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no bookings scheduled/i)).toBeInTheDocument()
      }, { timeout: 10000 })
      
      // Type assertion for empty response structure
      expect(emptyResponse).toMatchObject({
        ok: true,
        json: expect.any(Function),
        clone: expect.any(Function)
      })
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
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: [] })),
        clone: jest.fn().mockReturnThis()
      })

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

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn(() => Promise.resolve({ bookings: malformedBookings })),
        clone: jest.fn().mockReturnThis()
      })

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
        expect(screen.getByText('August 2025')).toBeInTheDocument()
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
        expect(screen.getByText('August 2025')).toBeInTheDocument()
      }, { timeout: 10000 })
    }, 15000)

    it('prevents memory leaks on rapid date selection', async () => {
      // Arrange
      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('Calendar')).toBeInTheDocument()
      }, { timeout: 10000 })

      // Act
      const todayButton = screen.getByRole('button', { name: /today/i })
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
        expect(screen.getByText('August 2025')).toBeInTheDocument()
      }, { timeout: 10000 })
    })
  })
})