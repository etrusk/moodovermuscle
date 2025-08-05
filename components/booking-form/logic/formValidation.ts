'use client'

import { BookingFormData } from '../bookingFormLogic'

export const FIELDS_BY_STEP: Record<number, (keyof BookingFormData)[]> = {
  1: ['name', 'email', 'phone', 'goals'],
  2: ['service'],
  3: ['date', 'time'],
}

export function getFieldsForStep(step: number): (keyof BookingFormData)[] | null {
  return FIELDS_BY_STEP[step] || null
}

export function createValidationUpdates(
  fields: (keyof BookingFormData)[],
  errors: Record<string, unknown>
): Record<string, boolean> {
  const validationUpdates: Record<string, boolean> = {}
  fields.forEach(field => {
    validationUpdates[field] = !errors[field]
  })
  return validationUpdates
}