'use client'

import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { BookingFormData } from '../../bookingFormLogic'

interface SlotLockingResult {
  lockConflict: boolean
  lockWarning: string | null
}

export function useSlotLocking(
  date: Date | undefined, 
  selectedTime: string, 
  form: UseFormReturn<BookingFormData>
): SlotLockingResult {
  const [lockConflict, setLockConflict] = useState(false)
  const [lockWarning, setLockWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!date || !selectedTime) return
    const interval = window.setInterval(async () => {
      const dateKey = date.toISOString().split('T')[0]
      try {
        const res = await fetch(`/api/availability?date=${dateKey}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        if (!data.availableTimes.includes(selectedTime)) {
          setLockConflict(true)
          setLockWarning(
            'Your selected time slot has just been booked by someone else. Please choose another slot.'
          )
        }
      } catch {
        // ignore errors
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [date, selectedTime])

  useEffect(() => {
    if (selectedTime) {
      setLockConflict(false)
      setLockWarning(null)
    }
  }, [selectedTime])

  useEffect(() => {
    if (date) {
      setLockConflict(false)
      setLockWarning(null)
      form.setValue('time', '')
    }
  }, [date, form])

  return { lockConflict, lockWarning }
}