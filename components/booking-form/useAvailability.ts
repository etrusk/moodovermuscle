import { useState, useEffect } from 'react'

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
    const dateParam = fetchDate.toISOString().split('T')[0]
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