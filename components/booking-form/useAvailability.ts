import React, { useState, useEffect, useCallback, useRef } from 'react'

export interface AvailabilityData {
  availableTimes: string[]
  bookedTimes: string[]
  date: string
  cachedAt?: number
}

export interface AvailabilityPerformanceMetrics {
  requestStartTime?: number
  responseTime?: number
  cacheHit: boolean
  retryCount?: number
}

export type UseAvailabilityReturn = {
  availableTimes: string[]
  bookedTimes: string[]
  loadingAvailability: boolean
  fetchAvailability: (fetchDate: Date) => Promise<void>
  availabilityCache: Record<string, AvailabilityData>
  performanceMetrics: AvailabilityPerformanceMetrics
  invalidateCache: (dateKey?: string) => void
  refreshAvailability: (date: Date) => Promise<void>
}

// Smart caching with TTL based on server Cache-Control headers
const CACHE_TTL_MS = 60 * 1000 // 60 seconds to match server max-age
const STALE_WHILE_REVALIDATE_MS = 30 * 1000 // 30 seconds server stale-while-revalidate

interface CacheEntry extends AvailabilityData {
  cachedAt: number
  staleAt: number
}

const useAvailabilityCache = (): {
  availabilityCache: Record<string, CacheEntry>
  setAvailabilityCache: React.Dispatch<React.SetStateAction<Record<string, CacheEntry>>>
  isCacheValid: (dateKey: string) => boolean
  isCacheStale: (dateKey: string) => boolean
  invalidateCache: (dateKey?: string) => void
} => {
  const [availabilityCache, setAvailabilityCache] = useState<
    Record<string, CacheEntry>
  >({})

  const isCacheValid = useCallback((dateKey: string): boolean => {
    const entry = availabilityCache[dateKey]
    if (!entry) return false
    
    const now = Date.now()
    return now < entry.staleAt
  }, [availabilityCache])

  const isCacheStale = useCallback((dateKey: string): boolean => {
    const entry = availabilityCache[dateKey]
    if (!entry) return true
    
    const now = Date.now()
    return now >= entry.cachedAt + CACHE_TTL_MS
  }, [availabilityCache])

  const invalidateCache = useCallback((dateKey?: string) => {
    if (dateKey) {
      setAvailabilityCache(prev => {
        const newCache = { ...prev }
        delete newCache[dateKey]
        return newCache
      })
    } else {
      setAvailabilityCache({})
    }
  }, [])

  return {
    availabilityCache,
    setAvailabilityCache,
    isCacheValid,
    isCacheStale,
    invalidateCache
  }
}

const useAvailabilityState = (): {
  availableTimes: string[]
  setAvailableTimes: React.Dispatch<React.SetStateAction<string[]>>
  bookedTimes: string[]
  setBookedTimes: React.Dispatch<React.SetStateAction<string[]>>
  loadingAvailability: boolean
  setLoadingAvailability: React.Dispatch<React.SetStateAction<boolean>>
} => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  return {
    availableTimes,
    setAvailableTimes,
    bookedTimes,
    setBookedTimes,
    loadingAvailability,
    setLoadingAvailability,
  }
}

// Enhanced fetch availability with performance monitoring and retry logic
interface FetchCallbackParams {
  availabilityCache: Record<string, CacheEntry>
  setAvailabilityCache: React.Dispatch<React.SetStateAction<Record<string, CacheEntry>>>
  setAvailableTimes: React.Dispatch<React.SetStateAction<string[]>>
  setBookedTimes: React.Dispatch<React.SetStateAction<string[]>>
  setLoadingAvailability: React.Dispatch<React.SetStateAction<boolean>>
  isCacheValid: (dateKey: string) => boolean
  isCacheStale: (dateKey: string) => boolean
  performanceMetricsRef: React.MutableRefObject<AvailabilityPerformanceMetrics>
}

const createFetchAttempt = (
  dateKey: string,
  retryCount: number,
  maxRetries: number,
  params: Pick<FetchCallbackParams, 'setAvailableTimes' | 'setBookedTimes' | 'setAvailabilityCache' | 'performanceMetricsRef'>,
  _isBackgroundRefresh: boolean
) => {
  return async (): Promise<void> => {
    try {
      const requestStart = Date.now()
      const res = await fetch(`/api/availability?date=${dateKey}`)
      const responseTime = Date.now() - requestStart
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch availability`)
      }
      
      const data: AvailabilityData = await res.json()
      const now = Date.now()
      
      // Create cache entry with TTL metadata
      const cacheEntry: CacheEntry = {
        ...data,
        cachedAt: now,
        staleAt: now + STALE_WHILE_REVALIDATE_MS
      }
      
      params.setAvailableTimes(data.availableTimes)
      params.setBookedTimes(data.bookedTimes)
      params.setAvailabilityCache(prev => ({ ...prev, [dateKey]: cacheEntry }))
      
      // Update performance metrics
      const currentMetrics = {
        requestStartTime: params.performanceMetricsRef.current.requestStartTime,
        responseTime: responseTime,
        cacheHit: false,
        retryCount: retryCount
      }
      params.performanceMetricsRef.current = currentMetrics
    } catch (error) {
      // nosemgrep: javascript.lang.security.audit.unsafe-formatstring.unsafe-formatstring
      // Retry count is internal counter, not user input - no format string vulnerability
      console.error(`Error fetching availability (attempt ${retryCount + 1}):`, error)
      throw error // Re-throw to let fetchWithRetry handle retry logic
    }
  }
}

const fetchWithRetry = async (
  dateKey: string,
  isBackgroundRefresh: boolean,
  params: FetchCallbackParams
): Promise<void> => {
  const maxRetries = 3

  if (!isBackgroundRefresh) {
    params.setLoadingAvailability(true)
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const attemptFetch = createFetchAttempt(
        dateKey,
        attempt,
        maxRetries,
        params,
        isBackgroundRefresh
      )
      await attemptFetch()
      
      // Success
      if (!isBackgroundRefresh) {
        params.setLoadingAvailability(false)
      }
      return
    } catch (error) {
      if (attempt === maxRetries - 1) {
        // Final failure
        if (!isBackgroundRefresh) {
          params.setLoadingAvailability(false)
          params.setAvailableTimes([])
          params.setBookedTimes([])
          throw error
        }
      } else {
        // Wait before retry
        const backoffDelay = 100 * Math.pow(3, attempt)
        await new Promise(resolve => setTimeout(resolve, backoffDelay))
      }
    }
  }
}

const handleCacheHit = (
  dateParam: string,
  now: number,
  params: FetchCallbackParams
): void => {
  const cachedData = params.availabilityCache[dateParam]
  params.setAvailableTimes(cachedData.availableTimes)
  params.setBookedTimes(cachedData.bookedTimes)
  
  params.performanceMetricsRef.current = {
    ...params.performanceMetricsRef.current,
    responseTime: Date.now() - now,
    cacheHit: true
  }
  
  // If cache is stale but valid, trigger background refresh
  if (params.isCacheStale(dateParam)) {
    fetchWithRetry(dateParam, true, params).catch(() => {
      // Silently handle background refresh errors
    }) // Background refresh
  }
}

const useFetchAvailabilityCallback = (params: FetchCallbackParams): ((fetchDate: Date) => Promise<void>) => {
  return useCallback(async (fetchDate: Date) => {
    const dateParam = fetchDate.toISOString().split('T')[0]
    const now = Date.now()
    
    // Reset performance metrics for new request
    params.performanceMetricsRef.current = {
      requestStartTime: now,
      cacheHit: false,
      retryCount: 0
    }

    // Check cache validity first
    if (params.isCacheValid(dateParam)) {
      handleCacheHit(dateParam, now, params)
      return
    }

    try {
      await fetchWithRetry(dateParam, false, params)
    } catch (error) {
      // Error already handled by fetchWithRetry
      console.error('Failed to fetch availability:', error)
    }
  }, [params])
}

const useAvailabilityEffects = (
  date: Date | undefined,
  fetchAvailability: (date: Date) => Promise<void>,
  setAvailableTimes: React.Dispatch<React.SetStateAction<string[]>>,
  setBookedTimes: React.Dispatch<React.SetStateAction<string[]>>
): void => {
  useEffect(() => {
    if (date) {
      fetchAvailability(date)
    } else {
      setAvailableTimes([])
      setBookedTimes([])
    }
  }, [date, fetchAvailability, setAvailableTimes, setBookedTimes])
}

const useCompatibilityCache = (availabilityCache: Record<string, CacheEntry>): Record<string, AvailabilityData> => {
  return Object.fromEntries(
    Object.entries(availabilityCache).map(([key, entry]) => [
      key,
      {
        availableTimes: entry.availableTimes,
        bookedTimes: entry.bookedTimes,
        date: entry.date,
        cachedAt: entry.cachedAt
      }
    ])
  )
}

export const useAvailability = (
  date: Date | undefined
): UseAvailabilityReturn => {
  const cacheHooks = useAvailabilityCache()
  const stateHooks = useAvailabilityState()
  
  // Performance metrics tracking
  const performanceMetricsRef = useRef<AvailabilityPerformanceMetrics>({
    cacheHit: false
  })

  const fetchCallbackParams: FetchCallbackParams = {
    ...cacheHooks,
    ...stateHooks,
    performanceMetricsRef
  }

  const fetchAvailability = useFetchAvailabilityCallback(fetchCallbackParams)

  // Force refresh availability (bypasses cache)
  const refreshAvailability = useCallback(async (refreshDate: Date) => {
    const dateParam = refreshDate.toISOString().split('T')[0]
    cacheHooks.invalidateCache(dateParam)
    await fetchAvailability(refreshDate)
  }, [cacheHooks, fetchAvailability])

  useAvailabilityEffects(date, fetchAvailability, stateHooks.setAvailableTimes, stateHooks.setBookedTimes)

  const compatibilityCache = useCompatibilityCache(cacheHooks.availabilityCache)

  return {
    availableTimes: stateHooks.availableTimes,
    bookedTimes: stateHooks.bookedTimes,
    loadingAvailability: stateHooks.loadingAvailability,
    fetchAvailability,
    availabilityCache: compatibilityCache,
    performanceMetrics: performanceMetricsRef.current,
    invalidateCache: cacheHooks.invalidateCache,
    refreshAvailability,
  }
}