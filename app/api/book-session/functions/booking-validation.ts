import { bookingSchema } from '@/lib/schemas'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { convertTo24HourFormat } from '@/lib/utils/time-conversion'

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