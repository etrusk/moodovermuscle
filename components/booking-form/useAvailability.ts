import { useState, useEffect, useCallback } from 'react'

export interface AvailabilityData {
  availableTimes: string[]
  bookedTimes: string[]
}

export type UseAvailabilityReturn = {
  availableTimes: string[]
  bookedTimes: string[]
  loadingAvailability: boolean
  fetchAvailability: (fetchDate: Date) => Promise<void>
  availabilityCache: Record<string, AvailabilityData>
}

const useAvailabilityCache = () => {
  const [availabilityCache, setAvailabilityCache] = useState<
    Record<string, AvailabilityData>
  >({})

  return { availabilityCache, setAvailabilityCache }
}

const useAvailabilityState = () => {
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

export const useAvailability = (
  date: Date | undefined
): UseAvailabilityReturn => {
  const { availabilityCache, setAvailabilityCache } = useAvailabilityCache()
  const {
    availableTimes,
    setAvailableTimes,
    bookedTimes,
    setBookedTimes,
    loadingAvailability,
    setLoadingAvailability,
  } = useAvailabilityState()

  const fetchAvailability = useCallback(async (fetchDate: Date) => {
    const dateParam = fetchDate.toISOString().split('T')[0]
    if (availabilityCache[dateParam]) {
      const cachedData = availabilityCache[dateParam]
      setAvailableTimes(cachedData.availableTimes)
      setBookedTimes(cachedData.bookedTimes)
      return
    }

    setLoadingAvailability(true)
    try {
      const res = await fetch(`/api/availability?date=${dateParam}`)
      if (!res.ok) {
        throw new Error('Failed to fetch availability')
      }
      const data: AvailabilityData = await res.json()
      setAvailableTimes(data.availableTimes)
      setBookedTimes(data.bookedTimes)
      setAvailabilityCache(prev => ({ ...prev, [dateParam]: data }))
    } catch (error) {
      console.error('Error fetching availability:', error)
      setAvailableTimes([])
      setBookedTimes([])
    } finally {
      setLoadingAvailability(false)
    }
  }, [availabilityCache, setAvailabilityCache, setAvailableTimes, setBookedTimes, setLoadingAvailability])

  useEffect(() => {
    if (date) {
      fetchAvailability(date)
    } else {
      setAvailableTimes([])
      setBookedTimes([])
    }
  }, [date, fetchAvailability, setAvailableTimes, setBookedTimes])

  return {
    availableTimes,
    bookedTimes,
    loadingAvailability,
    fetchAvailability,
    availabilityCache,
  }
}