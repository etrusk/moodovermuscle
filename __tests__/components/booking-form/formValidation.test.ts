import { describe, it, expect } from 'vitest'

import {
  FIELDS_BY_STEP,
  getFieldsForStep,
  createValidationUpdates,
} from '@/components/booking-form/logic/formValidation'

describe('formValidation', () => {
  describe('getFieldsForStep', () => {
    it('returns the field list for each known step', () => {
      expect(getFieldsForStep(1)).toEqual(['name', 'email', 'phone', 'goals'])
      expect(getFieldsForStep(2)).toEqual(['service'])
      expect(getFieldsForStep(3)).toEqual(['date', 'time'])
    })

    it('returns null for an unknown step', () => {
      expect(getFieldsForStep(0)).toBeNull()
      expect(getFieldsForStep(4)).toBeNull()
    })

    it('exposes the same source mapping via FIELDS_BY_STEP', () => {
      expect(FIELDS_BY_STEP[1]).toContain('email')
    })
  })

  describe('createValidationUpdates', () => {
    it('marks a field valid when it has no error and invalid when it does', () => {
      const updates = createValidationUpdates(
        ['name', 'email'],
        { email: { message: 'required' } }
      )

      expect(updates).toEqual({ name: true, email: false })
    })

    it('returns an empty map for no fields', () => {
      expect(createValidationUpdates([], {})).toEqual({})
    })
  })
})
