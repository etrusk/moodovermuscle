import { useState, useEffect } from 'react'
import { toDateKey } from '@/lib/utils/date-key'

export interface AvailabilityData {
  availableTimes: string[]
  bookedTimes: string[]
  date: string
}

export type UseAvailabilityReturn = {
  availableTimes: string[]
  bookedTimes: string[]
  loadingAvailability: boolean
  fetchAvailability: (fetchDate: Date) => Promise<void>
}

export const useAvailability = (date: Date | undefined): UseAvailabilityReturn => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)

  const fetchAvailability = async (fetchDate: Date): Promise<void> => {
    const dateParam = toDateKey(fetchDate)
    setLoadingAvailability(true)

    try {
      const res = await fetch(`/api/availability?date=${dateParam}`)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch availability`)
      }
      
      const data: AvailabilityData = await res.json()
      setAvailableTimes(data.availableTimes)
      setBookedTimes(data.bookedTimes)
    } catch (error) {
      console.error('Failed to fetch availability:', error)
      setAvailableTimes([])
      setBookedTimes([])
    } finally {
      setLoadingAvailability(false)
    }
  }

  useEffect(() => {
    if (date) {
      fetchAvailability(date)
    } else {
      setAvailableTimes([])
      setBookedTimes([])
    }
  }, [date])

  return {
    availableTimes,
    bookedTimes,
    loadingAvailability,
    fetchAvailability,
  }
}