'use client'

import { BookingFormData } from '../bookingFormLogic'

export async function validateAvailability(
  formData: BookingFormData
): Promise<{ error?: string }> {
  if (!formData.date || !formData.time) {
    return {}
  }

  const dateKey = formData.date.toISOString().split('T')[0]
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
    date: formData.date ? formData.date.toISOString() : undefined,
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

// Convert 12-hour format time (e.g., "10:00 AM") to 24-hour format (e.g., "10:00")
function convertTo24HourFormat(time12: string): string {
  // If already in 24-hour format, return as-is
  if (!time12.includes('AM') && !time12.includes('PM')) {
    return time12
  }
  
  const [time, period] = time12.split(' ')
  const [hoursNum, minutes] = time.split(':').map(Number)
  let hours = hoursNum
  
  if (period === 'AM' && hours === 12) {
    hours = 0
  } else if (period === 'PM' && hours !== 12) {
    hours += 12
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
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