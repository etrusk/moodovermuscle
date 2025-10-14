/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries for accessibility-first calendar interaction testing
 * @last-refactored 2025-10-14
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminCalendarPage from '@/app/admin/calendar/page'
import { mockBookings, createMockResponse } from './calendar-test-setup'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('AdminCalendarPage - Interactions', () => {
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

  describe('Booking Detail Modal Integration', () => {
    it('opens booking detail modal when booking is clicked', async () => {
      // Arrange
      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 10000 })

      const sarahBooking = screen.getByText('Sarah Miller').closest('[role="button"]')
      expect(sarahBooking).toBeInTheDocument()

      // Act
      await user.click(sarahBooking as HTMLElement)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Booking Details')).toBeInTheDocument()
        expect(screen.getByText('sarah@example.com')).toBeInTheDocument()
      }, { timeout: 10000 })
    }, 15000)

    it('displays complete booking information in modal', async () => {
      // Arrange
      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 10000 })

      const sarahBooking = screen.getByText('Sarah Miller').closest('[role="button"]')

      // Act
      await user.click(sarahBooking as HTMLElement)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Contact Information')).toBeInTheDocument()
        expect(screen.getByText('+61 400 123 456')).toBeInTheDocument()

        expect(screen.getByText('Session Details')).toBeInTheDocument()
        expect(screen.getByText('60 minutes')).toBeInTheDocument()
        expect(screen.getByText('Home Gym')).toBeInTheDocument()

        expect(screen.getByText('Client Information')).toBeInTheDocument()
        expect(screen.getByText('Lose weight and build strength')).toBeInTheDocument()
        expect(screen.getByText('Beginner')).toBeInTheDocument()

        expect(screen.getByText('Additional Message')).toBeInTheDocument()
        expect(screen.getByText('Looking forward to the session!')).toBeInTheDocument()
      }, { timeout: 10000 })
    }, 15000)

    it('supports keyboard navigation for booking selection', async () => {
      // Arrange
      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 10000 })

      const sarahBooking = screen.getByText('Sarah Miller').closest('[role="button"]') as HTMLElement
      sarahBooking?.focus()
      expect(sarahBooking).toHaveFocus()

      // Act
      await user.keyboard('{Enter}')

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Booking Details')).toBeInTheDocument()
      }, { timeout: 10000 })
    }, 15000)

    it('supports space bar activation for booking selection', async () => {
      // Arrange
      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 10000 })

      const sarahBooking = screen.getByText('Sarah Miller').closest('[role="button"]') as HTMLElement
      sarahBooking?.focus()

      // Act
      await user.keyboard(' ')

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Booking Details')).toBeInTheDocument()
      }, { timeout: 10000 })
    }, 15000)
  })

  describe('Status Updates from Calendar View', () => {
    it('allows status updates from modal and refreshes calendar', async () => {
      // Arrange
      const mockUpdateResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ success: true })),
        clone: jest.fn().mockReturnThis()
      }

      mockFetch
        .mockResolvedValueOnce(mockSuccessResponse)
        .mockResolvedValueOnce(mockUpdateResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 10000 })

      const sarahBooking = screen.getByText('Sarah Miller').closest('[role="button"]')
      await user.click(sarahBooking as HTMLElement)

      await waitFor(() => {
        expect(screen.getByText('Status Actions')).toBeInTheDocument()
      }, { timeout: 10000 })

      // Act
      const confirmButton = screen.getByText('Mark as Confirmed')
      await user.click(confirmButton)

      // Assert
      await waitFor(() => {
        const patchCalls = mockFetch.mock.calls.filter(call => {
          const firstArg = call[0]
          const url = typeof firstArg === 'string' ? firstArg : firstArg.url
          const method = call[1]?.method || firstArg.method
          return url.includes('/api/admin/bookings') && method === 'PATCH'
        })
        expect(patchCalls.length).toBeGreaterThan(0)
      }, { timeout: 10000 })

      await waitFor(() => {
        expect(screen.queryByText('Booking Details')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      expect(mockFetch).toHaveBeenCalledTimes(3)
    }, 20000)

    it('handles status update errors from calendar view', async () => {
      // Arrange
      mockFetch
        .mockResolvedValueOnce(mockSuccessResponse)
        .mockRejectedValueOnce(new Error('Update failed'))

      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 10000 })

      const sarahBooking = screen.getByText('Sarah Miller').closest('[role="button"]')
      await user.click(sarahBooking as HTMLElement)

      await waitFor(() => {
        expect(screen.getByText('Mark as Confirmed')).toBeInTheDocument()
      }, { timeout: 10000 })

      // Act
      const confirmButton = screen.getByText('Mark as Confirmed')
      await user.click(confirmButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Error loading calendar')).toBeInTheDocument()
        expect(screen.getByText('Update failed')).toBeInTheDocument()
      }, { timeout: 10000 })
    }, 20000)

    it('closes modal and updates calendar after successful status change', async () => {
      // Arrange
      const mockUpdateResponse = {
        ok: true,
        json: jest.fn(() => Promise.resolve({ success: true })),
        clone: jest.fn().mockReturnThis()
      }

      mockFetch
        .mockResolvedValueOnce(mockSuccessResponse)
        .mockResolvedValueOnce(mockUpdateResponse)
        .mockResolvedValueOnce(mockSuccessResponse)

      render(<AdminCalendarPage />)
      await waitFor(() => {
        expect(screen.getByText('Sarah Miller')).toBeInTheDocument()
      }, { timeout: 10000 })

      const sarahBooking = screen.getByText('Sarah Miller').closest('[role="button"]')
      await user.click(sarahBooking as HTMLElement)

      await waitFor(() => {
        expect(screen.getByText('Booking Details')).toBeInTheDocument()
      }, { timeout: 10000 })

      // Act
      const confirmButton = screen.getByText('Mark as Confirmed')
      await user.click(confirmButton)

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Booking Details')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3)
      }, { timeout: 10000 })
    }, 20000)
  })
})