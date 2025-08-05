import React, { useState, useEffect, useCallback } from 'react'

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

const useAvailabilityCache = (): {
  availabilityCache: Record<string, AvailabilityData>
  setAvailabilityCache: React.Dispatch<React.SetStateAction<Record<string, AvailabilityData>>>
} => {
  const [availabilityCache, setAvailabilityCache] = useState<
    Record<string, AvailabilityData>
  >({})

  return { availabilityCache, setAvailabilityCache }
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

// Extract fetch availability logic to reduce main function size
const useFetchAvailabilityCallback = (
  availabilityCache: Record<string, AvailabilityData>,
  setAvailabilityCache: React.Dispatch<React.SetStateAction<Record<string, AvailabilityData>>>,
  setAvailableTimes: React.Dispatch<React.SetStateAction<string[]>>,
  setBookedTimes: React.Dispatch<React.SetStateAction<string[]>>,
  setLoadingAvailability: React.Dispatch<React.SetStateAction<boolean>>
): ((fetchDate: Date) => Promise<void>) => {
  return useCallback(async (fetchDate: Date) => {
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

  const fetchAvailability = useFetchAvailabilityCallback(
    availabilityCache,
    setAvailabilityCache,
    setAvailableTimes,
    setBookedTimes,
    setLoadingAvailability
  )

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