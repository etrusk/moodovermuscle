/**
 * Integration Tests: Real-Time Availability Client-Side
 * 
 * Tests the complete client-side real-time availability integration including:
 * - Smart caching with TTL and stale-while-revalidate
 * - Performance monitoring and metrics tracking
 * - Error handling and retry mechanisms
 * - Loading state optimizations
 * - Calendar component integration
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useAvailability } from '@/components/booking-form/useAvailability'
import { AvailabilityPerformanceIndicator } from '@/components/booking-form/steps/scheduling/AvailabilityPerformanceIndicator'
import { server } from '../setup/server'
import { http, HttpResponse } from 'msw'

// Test wrapper component for useAvailability hook
function TestAvailabilityComponent({
  selectedDate,
  onMetricsChange
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
    refreshAvailability
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
        Cache Hit: {performanceMetrics.cacheHit ? 'Yes' : 'No'}{performanceMetrics.responseTime !== undefined ? ` | Response: ${performanceMetrics.responseTime}ms` : ''}{(performanceMetrics.retryCount ?? 0) > 0 ? ` | Retries: ${performanceMetrics.retryCount}` : ''}
      </div>

      <button 
        data-testid="manual-fetch"
        onClick={() => selectedDate && fetchAvailability(selectedDate)}
      >
        Manual Fetch
      </button>
      
      <button 
        data-testid="invalidate-cache"
        onClick={() => invalidateCache()}
      >
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

// eslint-disable-next-line max-lines-per-function
describe('Real-Time Availability Integration', () => {
  const mockDate = new Date('2025-08-07')
  const mockAvailabilityResponse = {
    availableTimes: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    bookedTimes: ['12:00', '13:00', '16:00'],
    date: '2025-08-07'
  }

  beforeEach(() => {
    // Reset MSW handlers
    server.resetHandlers()
    
    // Setup default successful response
    server.use(
      http.get('/api/availability', () => {
        return HttpResponse.json(mockAvailabilityResponse, {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=30'
          }
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

  describe('Smart Caching Behavior', () => {
    it('should fetch availability data successfully', async () => {
      server.use(
        http.get('/api/availability', async () => {
          await new Promise(resolve => setTimeout(resolve, 50))
          return HttpResponse.json(mockAvailabilityResponse, { status: 200 })
        })
      )

      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      // Wait for loading state
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading')

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('Ready')
      })

      expect(screen.getByTestId('available-times')).toHaveTextContent('09:00, 10:00, 11:00, 14:00, 15:00')
      expect(screen.getByTestId('booked-times')).toHaveTextContent('12:00, 13:00, 16:00')
    })

    it('should cache data for subsequent requests', async () => {
      server.use(
        http.get('/api/availability', async () => {
          return HttpResponse.json(mockAvailabilityResponse, { status: 200 })
        })
      )

      const { rerender } = render(<TestAvailabilityComponent selectedDate={mockDate} />)

      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toHaveTextContent('09:00, 10:00, 11:00, 14:00, 15:00')
      })

      // Cache should have data
      expect(screen.getByTestId('cache-count')).toHaveTextContent('1')
      
      // Re-render should use cached data
      rerender(<TestAvailabilityComponent selectedDate={mockDate} />)
      expect(screen.getByTestId('available-times')).toHaveTextContent('09:00, 10:00, 11:00, 14:00, 15:00')
    })

    it('should invalidate cache when requested', async () => {
      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      await waitFor(() => {
        expect(screen.getByTestId('cache-count')).toHaveTextContent('1')
      })

      // Clear cache
      fireEvent.click(screen.getByTestId('invalidate-cache'))
      expect(screen.getByTestId('cache-count')).toHaveTextContent('0')
    })
  })

  describe('Performance Monitoring', () => {
    it('should display performance metrics', async () => {
      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toHaveTextContent('09:00, 10:00, 11:00, 14:00, 15:00')
      })

      // Should show performance metrics
      const metricsElement = screen.getByTestId('performance-metrics')
      expect(metricsElement.textContent).toContain('Cache Hit:')
      expect(metricsElement.textContent).toMatch(/Response: \d+ms/)
    })
  })

  describe('Error Handling and Retry Logic', () => {
    it('should handle final failure gracefully', async () => {
      server.use(
        http.get('/api/availability', () => {
          return HttpResponse.json({ error: 'Persistent server error' }, { status: 500 })
        })
      )

      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      // Should show empty state with no data
      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toHaveTextContent('None')
        expect(screen.getByTestId('booked-times')).toHaveTextContent('None')
      }, { timeout: 5000 })
    })
  })

  describe('Performance Indicator Component', () => {
    it('should show cache hit state', () => {
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{ responseTime: 5, cacheHit: true }}
          isVisible={true}
        />
      )

      expect(screen.getByTestId('availability-performance-indicator')).toHaveTextContent('Instant response')
      expect(screen.getByTestId('availability-performance-indicator')).toHaveClass('text-green-600')
    })

    it('should show fast response state', () => {
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{ responseTime: 150, cacheHit: false }}
          isVisible={true}
        />
      )

      expect(screen.getByTestId('availability-performance-indicator')).toHaveTextContent('150ms')
      expect(screen.getByTestId('availability-performance-indicator')).toHaveClass('text-green-600')
    })

    it('should show good response state', () => {
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{ responseTime: 350, cacheHit: false }}
          isVisible={true}
        />
      )

      expect(screen.getByTestId('availability-performance-indicator')).toHaveTextContent('350ms')
      expect(screen.getByTestId('availability-performance-indicator')).toHaveClass('text-blue-600')
    })

    it('should show slow response with retries', () => {
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{ responseTime: 800, cacheHit: false, retryCount: 2 }}
          isVisible={true}
        />
      )

      expect(screen.getByTestId('availability-performance-indicator')).toHaveTextContent('800ms')
      expect(screen.getByTestId('availability-performance-indicator')).toHaveClass('text-amber-600')
    })

    it('should not render when not visible', () => {
      render(
        <AvailabilityPerformanceIndicator
          performanceMetrics={{ responseTime: 100, cacheHit: false }}
          isVisible={false}
        />
      )

      expect(screen.queryByTestId('availability-performance-indicator')).not.toBeInTheDocument()
    })
  })

  describe('Force Refresh Functionality', () => {
    it('should provide refresh functionality', async () => {
      server.use(
        http.get('/api/availability', () => {
          return HttpResponse.json(mockAvailabilityResponse, { status: 200 })
        })
      )

      render(<TestAvailabilityComponent selectedDate={mockDate} />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toHaveTextContent('09:00, 10:00, 11:00, 14:00, 15:00')
      })

      // Refresh button should be available
      expect(screen.getByTestId('refresh-availability')).toBeInTheDocument()
      
      // Should be able to click refresh without errors
      fireEvent.click(screen.getByTestId('refresh-availability'))
      
      // Data should still be available after refresh
      await waitFor(() => {
        expect(screen.getByTestId('available-times')).toHaveTextContent('09:00, 10:00, 11:00, 14:00, 15:00')
      })
    })
  })
})