import { NextResponse } from 'next/server'
import { validateAvailabilityRequest } from './functions/availability-validation'
import {
  getAvailableTimesForDate,
  checkSingleSlotAvailability,
  AvailabilityConflictError,
} from './functions/availability-checking'
import {
  createSingleSlotResponse,
  createFullDayResponse,
  createErrorResponse,
} from './functions/availability-response'

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)

  // Apply Function Decomposition Pattern - delegate validation to dedicated function
  const validationResult = await validateAvailabilityRequest(searchParams)
  if (!validationResult.success || !validationResult.data) {
    return (
      validationResult.error ??
      NextResponse.json(
        { message: 'Invalid request parameters' },
        { status: 400 }
      )
    )
  }

  const { date: dateString, time } = validationResult.data
  const parsedDate = new Date(dateString)

  try {
    // Handle single slot availability check (real-time validation)
    if (time) {
      const slotCheck = await checkSingleSlotAvailability(parsedDate, time)
      return createSingleSlotResponse(slotCheck, dateString, time)
    }

    // Handle full day availability (existing functionality enhanced with transaction safety)
    const availabilityData = await getAvailableTimesForDate(parsedDate)
    return createFullDayResponse(availabilityData)
  } catch (error) {
    console.error('Error processing availability request:', error)

    const isAvailabilityConflict = error instanceof AvailabilityConflictError
    return createErrorResponse(error as Error, isAvailabilityConflict)
  }
}
