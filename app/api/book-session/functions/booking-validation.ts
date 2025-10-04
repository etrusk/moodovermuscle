import { bookingSchema } from '@/lib/schemas'
import { NextResponse } from 'next/server'
import { z } from 'zod'

type ValidatedData = z.infer<typeof bookingSchema>

interface ValidationResult {
  success: boolean
  data: ValidatedData | null
  error: NextResponse | null
}

export async function validateBookingRequest(
  request: Request
): Promise<ValidationResult> {
  let formData
  try {
    formData = await request.json()
  } catch {
    return {
      success: false,
      error: NextResponse.json(
        { message: 'Invalid form data.' },
        { status: 400 }
      ),
      data: null,
    }
  }

  // Convert time format before validation
  if (formData.time && typeof formData.time === 'string') {
    formData.time = convertTo24HourFormat(formData.time)
  }

  const validatedData = bookingSchema.safeParse(formData)

  if (!validatedData.success) {
    return {
      success: false,
      error: NextResponse.json(
        {
          message: 'Invalid form data.',
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
      data: null,
    }
  }

  return {
    success: true,
    data: validatedData.data,
    error: null,
  }
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