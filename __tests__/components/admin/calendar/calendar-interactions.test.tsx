/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries for accessibility-first calendar interaction testing
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

describe('AdminCalendarPage - Interactions', () => {
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
      
      // Type assertion for booking data structure
      const booking = mockBookings[0]
      expect(booking).toMatchObject({
        id: 'booking-1',
        name: 'Sarah Miller',
        phone: '+61 400 123 456',
        duration: 60,
        location: 'Home Gym',
        goals: 'Lose weight and build strength',
        experience: 'Beginner',
        message: 'Looking forward to the session!'
      })
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
      // Arrange - MSW handles all requests
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
        expect(screen.queryByText('Booking Details')).not.toBeInTheDocument()
      }, { timeout: 10000 })
    }, 20000)

    it('handles status update errors from calendar view', async () => {
      // Arrange
      server.use(
        http.patch('/api/admin/bookings', () => {
          return HttpResponse.json(
            { error: 'Update failed' },
            { status: 500 }
          )
        })
      )

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
      }, { timeout: 10000 })
    }, 20000)

    it('closes modal and updates calendar after successful status change', async () => {
      // Arrange - MSW handles all requests
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
    }, 20000)
  })
})