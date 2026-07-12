import { NextResponse } from 'next/server'
import { z } from 'zod'

const availabilityRequestSchema = z.object({
  date: z
    .string({ error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Date must be in YYYY-MM-DD format',
    }),
  time: z.string().nullable().optional(), // Optional for single slot validation
})

export type AvailabilityRequestData = z.infer<typeof availabilityRequestSchema>

interface ValidationResult {
  success: boolean
  data: AvailabilityRequestData | null
  error: NextResponse | null
}

export async function validateAvailabilityRequest(
  searchParams: URLSearchParams
): Promise<ValidationResult> {
  const requestData = {
    date: searchParams.get('date'),
    time: searchParams.get('time'),
  }

  const validatedData = availabilityRequestSchema.safeParse(requestData)

  if (!validatedData.success) {
    return {
      success: false,
      error: NextResponse.json(
        {
          message: 'Invalid request parameters',
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      ),
      data: null,
    }
  }

  // Additional date validation
  const parsedDate = new Date(validatedData.data.date)
  if (isNaN(parsedDate.getTime())) {
    return {
      success: false,
      error: NextResponse.json(
        { message: 'Invalid date format' },
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
