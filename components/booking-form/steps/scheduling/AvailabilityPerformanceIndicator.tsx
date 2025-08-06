'use client'

import React from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface AvailabilityPerformanceIndicatorProps {
  performanceMetrics: {
    responseTime?: number
    cacheHit: boolean
    retryCount?: number
  }
  isVisible?: boolean
}

export function AvailabilityPerformanceIndicator({
  performanceMetrics,
  isVisible = true
}: AvailabilityPerformanceIndicatorProps): React.JSX.Element | null {
  const { responseTime, cacheHit, retryCount = 0 } = performanceMetrics

  if (!isVisible || responseTime === undefined) {
    return null
  }

  const performance = getPerformanceStatus(responseTime, cacheHit, retryCount)
  const Icon = performance.icon

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${performance.color} ${performance.bgColor} ${performance.borderColor} border`}
      data-testid="availability-performance-indicator"
      title={`Response time: ${responseTime}ms${cacheHit ? ' (cached)' : ''}${retryCount > 0 ? ` (${retryCount} retries)` : ''}`}
    >
      <Icon className="h-3 w-3" />
      <span>{performance.message}</span>
      {process.env.NODE_ENV === 'development' && (
        <span className="opacity-75">({performance.description})</span>
      )}
    </div>
  )
}

// Performance status configurations
const PERFORMANCE_CONFIGS = {
  instant: {
    status: 'instant' as const,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    message: 'Instant response',
    description: 'Cached data'
  },
  fast: {
    status: 'fast' as const,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    description: 'Fast response'
  },
  good: {
    status: 'good' as const,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Clock,
    description: 'Good response'
  },
  slow: {
    status: 'slow' as const,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertCircle,
    description: 'Slow response'
  }
}

// Extract performance status logic to separate function
function getPerformanceStatus(responseTime: number, cacheHit: boolean, retryCount: number): {
  status: 'instant' | 'fast' | 'good' | 'slow'
  color: string
  bgColor: string
  borderColor: string
  icon: React.ComponentType<{ className?: string }>
  message: string
  description: string
} {
  if (cacheHit && responseTime < 50) {
    return PERFORMANCE_CONFIGS.instant
  }
  
  if (responseTime < 200) {
    return { ...PERFORMANCE_CONFIGS.fast, message: `${responseTime}ms` }
  }
  
  if (responseTime < 500) {
    return { ...PERFORMANCE_CONFIGS.good, message: `${responseTime}ms` }
  }
  
  return {
    ...PERFORMANCE_CONFIGS.slow,
    message: `${responseTime}ms`,
    description: retryCount > 0 ? `Slow (${retryCount} retries)` : 'Slow response'
  }
}

// Hook for managing performance indicator visibility with auto-hide
export function usePerformanceIndicatorVisibility(
  performanceMetrics: { responseTime?: number; cacheHit: boolean },
  autoHideDelay = 3000
): boolean {
  const [isVisible, setIsVisible] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (performanceMetrics.responseTime !== undefined) {
      setIsVisible(true)
      
      // Clear existing timeout
      const currentTimeout = timeoutRef.current
      if (currentTimeout) {
        clearTimeout(currentTimeout)
      }
      
      // Auto-hide after delay, but keep cache hits visible longer for user education
      const hideDelay = performanceMetrics.cacheHit ? autoHideDelay * 1.5 : autoHideDelay
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false)
      }, hideDelay)
    }

    return () => {
      const currentTimeout = timeoutRef.current
      if (currentTimeout) {
        clearTimeout(currentTimeout)
      }
    }
  }, [performanceMetrics, autoHideDelay])

  return isVisible
}