import { vi, describe, it, expect, afterEach } from 'vitest'
import { render, screen, act } from '@/__tests__/setup/test-utils'
import { renderHook } from '@testing-library/react'

import {
  AvailabilityPerformanceIndicator,
  usePerformanceIndicatorVisibility,
} from '@/components/booking-form/steps/scheduling/AvailabilityPerformanceIndicator'

const testId = 'availability-performance-indicator'

describe('AvailabilityPerformanceIndicator', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
  })

  it('renders nothing when not visible', () => {
    render(
      <AvailabilityPerformanceIndicator
        performanceMetrics={{ responseTime: 100, cacheHit: false }}
        isVisible={false}
      />
    )
    expect(screen.queryByTestId(testId)).toBeNull()
  })

  it('renders nothing when the response time is unknown', () => {
    render(
      <AvailabilityPerformanceIndicator performanceMetrics={{ cacheHit: true }} />
    )
    expect(screen.queryByTestId(testId)).toBeNull()
  })

  it('shows an instant-response badge for fast cache hits', () => {
    render(
      <AvailabilityPerformanceIndicator
        performanceMetrics={{ responseTime: 20, cacheHit: true }}
      />
    )
    expect(screen.getByText('Instant response')).toBeInTheDocument()
    expect(screen.getByTestId(testId).getAttribute('title')).toBe(
      'Response time: 20ms (cached)'
    )
  })

  it.each([
    [100, '100ms'],
    [300, '300ms'],
    [800, '800ms'],
  ])('shows the measured latency (%ims) for non-instant responses', (rt, label) => {
    render(
      <AvailabilityPerformanceIndicator
        performanceMetrics={{ responseTime: rt, cacheHit: false }}
      />
    )
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('notes retry count in the title for slow responses', () => {
    render(
      <AvailabilityPerformanceIndicator
        performanceMetrics={{ responseTime: 900, cacheHit: false, retryCount: 2 }}
      />
    )
    expect(screen.getByTestId(testId).getAttribute('title')).toBe(
      'Response time: 900ms (2 retries)'
    )
  })

  it('renders the development-only description when NODE_ENV is development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    render(
      <AvailabilityPerformanceIndicator
        performanceMetrics={{ responseTime: 900, cacheHit: false, retryCount: 3 }}
      />
    )
    expect(screen.getByText('(Slow (3 retries))')).toBeInTheDocument()
  })
})

describe('usePerformanceIndicatorVisibility', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('stays hidden until a response time is recorded', () => {
    const { result } = renderHook(() =>
      usePerformanceIndicatorVisibility({ cacheHit: false })
    )
    expect(result.current).toBe(false)
  })

  it('becomes visible then auto-hides after the delay', async () => {
    vi.useFakeTimers()
    // Stable metrics reference: the effect keys off object identity.
    const metrics = { responseTime: 120, cacheHit: false }
    const { result } = renderHook(() => usePerformanceIndicatorVisibility(metrics, 3000))
    expect(result.current).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(result.current).toBe(false)
  })

  it('keeps cache hits visible 1.5x longer', async () => {
    vi.useFakeTimers()
    const metrics = { responseTime: 20, cacheHit: true }
    const { result } = renderHook(() => usePerformanceIndicatorVisibility(metrics, 2000))
    expect(result.current).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(result.current).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(result.current).toBe(false)
  })
})
