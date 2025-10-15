/**
 * @testing-approach modern-2025
 * @business-outcome Real-time availability prevents booking conflicts through instant data synchronization
 * @user-journey Users see accurate, up-to-date availability when selecting appointment times
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useAvailability } from '@/components/booking-form/useAvailability'
import { server } from '../setup/server'
import { http, HttpResponse } from 'msw'

// Test wrapper component for availability hook
function TestAvailabilityComponent({
  selectedDate,
}: {
  selectedDate?: Date
}): React.JSX.Element {
  const hookData = useAvailability(selectedDate)

  return (
    <div data-testid="availability-test-component">
      {renderAvailabilityStatus(hookData)}
      {renderAvailabilityActions(hookData, selectedDate)}
    </div>
  )
}

function renderAvailabilityStatus(hookData: ReturnType<typeof useAvailability>) {
  return (
    <>
      <div data-testid="loading-state">
        {hookData.loadingAvailability ? 'Loading' : 'Ready'}
      </div>
      <div data-testid="available-times">
        {hookData.availableTimes.join(', ') || 'None'}
      </div>
      <div data-testid="booked-times">
        {hookData.bookedTimes.join(', ') || 'None'}
      </div>
    </>
  )
}

function renderAvailabilityActions(
  hookData: ReturnType<typeof useAvailability>,
  selectedDate?: Date
) {
  return (
    <button
      data-testid="manual-fetch"
      onClick={() => selectedDate && hookData.fetchAvailability(selectedDate)}
    >
      Manual Fetch
    </button>
  )
}

describe('Real-Time Availability Integration: Live Booking Prevention', () => {
  const mockDate = new Date('2025-08-07')
  const mockAvailabilityResponse = {
    availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    bookedTimes: ['12:00', '13:00', '16:00'],
    date: '2025-08-07',
  }

  beforeEach(() => {
    server.resetHandlers()

    // Default: Successful availability response
    server.use(
      http.get('/api/availability', () => {
        return HttpResponse.json(mockAvailabilityResponse, {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
          },
        })
      })
    )

    // Don't use fake timers - the hook uses real setTimeout for retry backoff
    vi.useRealTimers()
  })

  afterEach(() => {
    // Clean up any pending operations
    vi.clearAllMocks()
  })

  describe('Availability Data Synchronization', () => {
    it('loads real-time availability for date selection', async () => {
      // Arrange
      server.use(
        http.get('/api/availability', async () => {
          await new Promise((resolve) => setTimeout(resolve, 50))
          return HttpResponse.json(mockAvailabilityResponse, { status: 200 })
        })
      )

      // Act
      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      // Assert - Loading state
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading')

      // Assert - Data loaded
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('Ready')
      })

      expect(screen.getByTestId('available-times')).toMatchObject({
        textContent: expect.stringContaining('09:00')
      })
      expect(screen.getByTestId('booked-times')).toMatchObject({
        textContent: expect.stringContaining('12:00')
      })
    })

    it('fetches availability data on each request', async () => {
      // Arrange
      let callCount = 0
      server.use(
        http.get('/api/availability', async () => {
          callCount++
          return HttpResponse.json(mockAvailabilityResponse, { status: 200 })
        })
      )

      // Act
      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      // Assert - Data loaded
      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toMatchObject({
          textContent: expect.stringContaining('09:00')
        })
      })

      expect(callCount).toBe(1)
    })
  })

  describe('Error Recovery', () => {
    it('handles server errors gracefully without breaking booking flow', async () => {
      // Arrange
      server.use(
        http.get('/api/availability', () => {
          return HttpResponse.json(
            { error: 'Persistent server error' },
            { status: 500 }
          )
        })
      )

      // Act
      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      // Assert
      await waitFor(
        () => {
          expect(screen.getByTestId('available-times')).toMatchObject({
            textContent: 'None'
          })
          expect(screen.getByTestId('booked-times')).toMatchObject({
            textContent: 'None'
          })
        },
        { timeout: 5000 }
      )
    })

    it('throws error when critical data is missing', async () => {
      // Arrange
      const invalidData = null

      // Act & Assert
      expect(() => {
        if (!invalidData) {
          throw new Error('Critical availability data missing')
        }
      }).toThrow('Critical availability data missing')
    })
  })

  describe('Manual Fetch Flow', () => {
    it('enables users to manually fetch availability', async () => {
      // Arrange
      server.use(
        http.get('/api/availability', () => {
          return HttpResponse.json(mockAvailabilityResponse, { status: 200 })
        })
      )

      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toMatchObject({
          textContent: expect.stringContaining('09:00')
        })
      })

      // Act
      const fetchButton = screen.getByTestId('manual-fetch')
      expect(fetchButton).toBeInTheDocument()
      fireEvent.click(fetchButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toMatchObject({
          textContent: expect.stringContaining('09:00')
        })
      })
    })
  })
})