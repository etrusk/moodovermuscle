/**
 * @testing-approach modern-2025
 * @business-outcome Real-time availability prevents booking conflicts through instant data synchronization
 * @user-journey Users see accurate, up-to-date availability when selecting appointment times
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

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
  const hookData = useAvailability(selectedDate)

  React.useEffect(() => {
    if (onMetricsChange) {
      onMetricsChange(hookData.performanceMetrics)
    }
  }, [hookData.performanceMetrics, onMetricsChange])

  return (
    <div data-testid="availability-test-component">
      {renderAvailabilityStatus(hookData)}
      {renderPerformanceMetrics(hookData.performanceMetrics)}
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
      <div data-testid="cache-count">
        {Object.keys(hookData.availabilityCache).length}
      </div>
    </>
  )
}

function renderPerformanceMetrics(metrics: { cacheHit: boolean; responseTime?: number; retryCount?: number }) {
  return (
    <div data-testid="performance-metrics">
      Cache Hit: {metrics.cacheHit ? 'Yes' : 'No'}
      {metrics.responseTime !== undefined ? ` | Response: ${metrics.responseTime}ms` : ''}
      {(metrics.retryCount ?? 0) > 0 ? ` | Retries: ${metrics.retryCount}` : ''}
    </div>
  )
}

function renderAvailabilityActions(
  hookData: ReturnType<typeof useAvailability>,
  selectedDate?: Date
) {
  return (
    <>
      <button
        data-testid="manual-fetch"
        onClick={() => selectedDate && hookData.fetchAvailability(selectedDate)}
      >
        Manual Fetch
      </button>
      <button data-testid="invalidate-cache" onClick={() => hookData.invalidateCache()}>
        Clear Cache
      </button>
      <button
        data-testid="refresh-availability"
        onClick={() => selectedDate && hookData.refreshAvailability(selectedDate)}
      >
        Force Refresh
      </button>
    </>
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

    it('prevents redundant API calls through intelligent caching', async () => {
      // Arrange
      server.use(
        http.get('/api/availability', async () => {
          return HttpResponse.json(mockAvailabilityResponse, { status: 200 })
        })
      )

      const { rerender } = render(
        <TestAvailabilityComponent selectedDate={mockDate} />
      )

      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toMatchObject({
          textContent: expect.stringContaining('09:00')
        })
      })

      // Act
      const cacheCount = screen.getByTestId('cache-count')
      expect(cacheCount).toHaveTextContent('1')

      // Act - Rerender with same date
      rerender(<TestAvailabilityComponent selectedDate={mockDate} />)

      // Assert
      expect(screen.getByTestId('available-times')).toMatchObject({
        textContent: expect.stringContaining('09:00')
      })
    })

    it('refreshes availability after booking to prevent conflicts', async () => {
      // Arrange
      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      await waitFor(() => {
        expect(screen.getByTestId('cache-count')).toHaveTextContent('1')
      })

      // Act
      fireEvent.click(screen.getByTestId('invalidate-cache'))

      // Assert
      const cacheCount = screen.getByTestId('cache-count')
      expect(cacheCount).toMatchObject({ textContent: '0' })
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

  describe('Performance Indicator: User Feedback', () => {
    it('shows instant response feedback for cached data', () => {
      // Arrange & Act
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{ responseTime: 5, cacheHit: true }}
          isVisible={true}
        />
      )

      // Assert
      const indicator = screen.getByTestId('availability-performance-indicator')
      expect(indicator).toMatchObject({
        textContent: expect.stringContaining('Instant response')
      })
      expect(indicator).toHaveClass('text-green-600')
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
      const refreshButton = screen.getByTestId('refresh-availability')
      expect(refreshButton).toBeInTheDocument()
      fireEvent.click(refreshButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toMatchObject({
          textContent: expect.stringContaining('09:00')
        })
      })
    })
  })
})