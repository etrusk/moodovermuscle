import { useState, useEffect, useCallback } from 'react'

export interface AvailabilityData {
  availableTimes: string[]
  bookedTimes: string[]
}

export const useAvailability = (date: Date | undefined) => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availabilityCache, setAvailabilityCache] = useState<
    Record<string, AvailabilityData>
  >({})

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
  }, [availabilityCache])

  useEffect(() => {
    if (date) {
      fetchAvailability(date)
    } else {
      setAvailableTimes([])
      setBookedTimes([])
    }
  }, [date, fetchAvailability])

  return {
    availableTimes,
    bookedTimes,
    loadingAvailability,
    fetchAvailability,
    availabilityCache,
  }
}