'use client'

import { BookingFormData } from '../bookingFormLogic'
import { convertTo24HourFormat } from '@/lib/utils/time-conversion'
import { toDateKey } from '@/lib/utils/date-key'

export async function validateAvailability(
  formData: BookingFormData
): Promise<{ error?: string }> {
  if (!formData.date || !formData.time) {
    return {}
  }

  const dateKey = toDateKey(formData.date)
  const availRes = await fetch(`/api/availability?date=${dateKey}`)
  
  if (!availRes.ok) {
    return { error: 'Failed to verify availability. Please try again.' }
  }

  const availData = await availRes.json()
  if (!availData.availableTimes.includes(formData.time)) {
    return {
      error: 'Selected time slot is no longer available. Please choose another slot.',
    }
  }

  return {}
}

export function prepareSubmissionData(formData: BookingFormData): Record<string, unknown> {
  const data: Record<string, unknown> = {
    ...formData,
    date: formData.date ? toDateKey(formData.date) : undefined,
    // Convert to 24-hour format for backend (database now expects HH:MM format)
    time: formData.time ? convertTo24HourFormat(formData.time) : formData.time,
  }

  // Clean up empty fields
  Object.keys(data).forEach(key => {
    if (data[key] === '' || data[key] === undefined) {
      delete data[key]
    }
  })

  return data
}

export async function submitBookingRequest(
  data: Record<string, unknown>
): Promise<{ error?: string; result?: Record<string, unknown> }> {
  const response = await fetch('/api/book-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    return {
      error: result.error || result.message || 'Booking failed. Please try again.',
    }
  }

  return { result }
}