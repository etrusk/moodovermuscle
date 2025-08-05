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