/**
 * @testing-approach modern-2025
 * @business-outcome Real-time availability prevents booking conflicts through instant data synchronization
 * @user-journey Users see accurate, up-to-date availability when selecting appointment times
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useAvailability } from '@/components/booking-form/useAvailability'
import { AvailabilityPerformanceIndicator } from '@/components/booking-form/steps/scheduling/AvailabilityPerformanceIndicator'
import { server } from '../setup/server'
import { http, HttpResponse } from 'msw'

// Test wrapper component for availability hook
function TestAvailabilityComponent({
  selectedDate,
  onMetricsChange,
}: {
  selectedDate?: Date
  onMetricsChange?: (metrics: unknown) => void
}): React.JSX.Element {
  const {
    availableTimes,
    bookedTimes,
    loadingAvailability,
    fetchAvailability,
    availabilityCache,
    performanceMetrics,
    invalidateCache,
    refreshAvailability,
  } = useAvailability(selectedDate)

  React.useEffect(() => {
    if (onMetricsChange) {
      onMetricsChange(performanceMetrics)
    }
  }, [performanceMetrics, onMetricsChange])

  return (
    <div data-testid="availability-test-component">
      <div data-testid="loading-state">
        {loadingAvailability ? 'Loading' : 'Ready'}
      </div>

      <div data-testid="available-times">
        {availableTimes.join(', ') || 'None'}
      </div>

      <div data-testid="booked-times">
        {bookedTimes.join(', ') || 'None'}
      </div>

      <div data-testid="cache-count">
        {Object.keys(availabilityCache).length}
      </div>

      <div data-testid="performance-metrics">
        Cache Hit: {performanceMetrics.cacheHit ? 'Yes' : 'No'}
        {performanceMetrics.responseTime !== undefined
          ? ` | Response: ${performanceMetrics.responseTime}ms`
          : ''}
        {(performanceMetrics.retryCount ?? 0) > 0
          ? ` | Retries: ${performanceMetrics.retryCount}`
          : ''}
      </div>

      <button
        data-testid="manual-fetch"
        onClick={() => selectedDate && fetchAvailability(selectedDate)}
      >
        Manual Fetch
      </button>

      <button data-testid="invalidate-cache" onClick={() => invalidateCache()}>
        Clear Cache
      </button>

      <button
        data-testid="refresh-availability"
        onClick={() => selectedDate && refreshAvailability(selectedDate)}
      >
        Force Refresh
      </button>
    </div>
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

    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Availability Data Synchronization', () => {
    it('loads real-time availability for date selection', async () => {
      // Given: User selects a date for booking
      server.use(
        http.get('/api/availability', async () => {
          await new Promise((resolve) => setTimeout(resolve, 50))
          return HttpResponse.json(mockAvailabilityResponse, { status: 200 })
        })
      )

      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      // When: System fetches current availability
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading')

      // Then: User sees accurate available and booked times
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('Ready')
      })

      expect(screen.getByTestId('available-times')).toHaveTextContent(
        '09:00, 10:00, 11:00, 14:00, 15:00'
      )
      expect(screen.getByTestId('booked-times')).toHaveTextContent(
        '12:00, 13:00, 16:00'
      )
    })

    it('prevents redundant API calls through intelligent caching', async () => {
      // Given: Availability data has been loaded once
      server.use(
        http.get('/api/availability', async () => {
          return HttpResponse.json(mockAvailabilityResponse, { status: 200 })
        })
      )

      const { rerender } = render(
        <TestAvailabilityComponent selectedDate={mockDate} />
      )

      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toHaveTextContent(
          '09:00, 10:00, 11:00, 14:00, 15:00'
        )
      })

      // When: User navigates back to same date
      expect(screen.getByTestId('cache-count')).toHaveTextContent('1')

      // Then: Cached data is used for instant display
      rerender(<TestAvailabilityComponent selectedDate={mockDate} />)
      expect(screen.getByTestId('available-times')).toHaveTextContent(
        '09:00, 10:00, 11:00, 14:00, 15:00'
      )
    })

    it('refreshes availability after booking to prevent conflicts', async () => {
      // Given: User has viewed availability
      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      await waitFor(() => {
        expect(screen.getByTestId('cache-count')).toHaveTextContent('1')
      })

      // When: Cache is invalidated after booking
      fireEvent.click(screen.getByTestId('invalidate-cache'))

      // Then: Fresh data will be fetched on next request
      expect(screen.getByTestId('cache-count')).toHaveTextContent('0')
    })
  })

  describe('Performance Optimization', () => {
    it('tracks response time for user experience monitoring', async () => {
      // Given: System monitors availability query performance
      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      // When: Availability is loaded
      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toHaveTextContent(
          '09:00, 10:00, 11:00, 14:00, 15:00'
        )
      })

      // Then: Performance metrics are captured
      const metricsElement = screen.getByTestId('performance-metrics')
      expect(metricsElement.textContent).toContain('Cache Hit:')
      expect(metricsElement.textContent).toMatch(/Response: \d+ms/)
    })
  })

  describe('Error Recovery', () => {
    it('handles server errors gracefully without breaking booking flow', async () => {
      // Given: Availability service experiences errors
      server.use(
        http.get('/api/availability', () => {
          return HttpResponse.json(
            { error: 'Persistent server error' },
            { status: 500 }
          )
        })
      )

      // When: User attempts to view availability
      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      // Then: User sees empty state instead of application crash
      await waitFor(
        () => {
          expect(screen.getByTestId('available-times')).toHaveTextContent(
            'None'
          )
          expect(screen.getByTestId('booked-times')).toHaveTextContent('None')
        },
        { timeout: 5000 }
      )
    })
  })

  describe('Performance Indicator: User Feedback', () => {
    it('shows instant response feedback for cached data', () => {
      // When: Availability is loaded from cache
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{ responseTime: 5, cacheHit: true }}
          isVisible={true}
        />
      )

      // Then: User sees positive instant feedback
      expect(
        screen.getByTestId('availability-performance-indicator')
      ).toHaveTextContent('Instant response')
      expect(
        screen.getByTestId('availability-performance-indicator')
      ).toHaveClass('text-green-600')
    })

    it('shows fast response feedback for quick API calls', () => {
      // When: API responds quickly (under 200ms)
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{ responseTime: 150, cacheHit: false }}
          isVisible={true}
        />
      )

      // Then: User sees response time with positive feedback
      expect(
        screen.getByTestId('availability-performance-indicator')
      ).toHaveTextContent('150ms')
      expect(
        screen.getByTestId('availability-performance-indicator')
      ).toHaveClass('text-green-600')
    })

    it('shows good response feedback for acceptable latency', () => {
      // When: API responds within acceptable range (200-500ms)
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{ responseTime: 350, cacheHit: false }}
          isVisible={true}
        />
      )

      // Then: User sees informational feedback
      expect(
        screen.getByTestId('availability-performance-indicator')
      ).toHaveTextContent('350ms')
      expect(
        screen.getByTestId('availability-performance-indicator')
      ).toHaveClass('text-blue-600')
    })

    it('shows slow response warning with retry information', () => {
      // When: API experiences delays requiring retries
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{
            responseTime: 800,
            cacheHit: false,
            retryCount: 2,
          }}
          isVisible={true}
        />
      )

      // Then: User sees performance warning
      expect(
        screen.getByTestId('availability-performance-indicator')
      ).toHaveTextContent('800ms')
      expect(
        screen.getByTestId('availability-performance-indicator')
      ).toHaveClass('text-amber-600')
    })

    it('hides indicator when not needed', () => {
      // When: Performance indicator is not needed
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{ responseTime: 100, cacheHit: false }}
          isVisible={false}
        />
      )

      // Then: Indicator does not clutter UI
      expect(
        screen.queryByTestId('availability-performance-indicator')
      ).not.toBeInTheDocument()
    })
  })

  describe('Manual Refresh Flow', () => {
    it('enables users to force refresh for latest availability', async () => {
      // Given: User wants to ensure latest availability data
      server.use(
        http.get('/api/availability', () => {
          return HttpResponse.json(mockAvailabilityResponse, { status: 200 })
        })
      )

      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toHaveTextContent(
          '09:00, 10:00, 11:00, 14:00, 15:00'
        )
      })

      // When: User triggers manual refresh
      expect(screen.getByTestId('refresh-availability')).toBeInTheDocument()
      fireEvent.click(screen.getByTestId('refresh-availability'))

      // Then: Fresh availability data is fetched
      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toHaveTextContent(
          '09:00, 10:00, 11:00, 14:00, 15:00'
        )
      })
    })
  })
})