import { vi, describe, it, expect } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'

import {
  createFormDataUpdater,
  createFormResetter,
  getFormState,
} from '@/components/booking-form/logic/formStateManagement'
import type { BookingFormData } from '@/components/booking-form/bookingFormLogic'

function makeForm(overrides: Partial<UseFormReturn<BookingFormData>> = {}) {
  return {
    setValue: vi.fn(),
    reset: vi.fn(),
    getValues: vi.fn(),
    formState: { errors: {} },
    ...overrides,
  } as unknown as UseFormReturn<BookingFormData>
}

describe('formStateManagement', () => {
  describe('createFormDataUpdater', () => {
    it('sets each provided field with validation enabled', () => {
      const form = makeForm()
      const update = createFormDataUpdater(form)

      update({ name: 'Ada', email: 'ada@example.com' })

      expect(form.setValue).toHaveBeenCalledWith('name', 'Ada', { shouldValidate: true })
      expect(form.setValue).toHaveBeenCalledWith('email', 'ada@example.com', {
        shouldValidate: true,
      })
      expect(form.setValue).toHaveBeenCalledTimes(2)
    })

    it('does nothing when given an empty patch', () => {
      const form = makeForm()
      createFormDataUpdater(form)({})
      expect(form.setValue).not.toHaveBeenCalled()
    })
  })

  describe('createFormResetter', () => {
    it('resets the form', () => {
      const form = makeForm()
      createFormResetter(form)()
      expect(form.reset).toHaveBeenCalledTimes(1)
    })
  })

  describe('getFormState', () => {
    it('exposes current validation errors and form values', () => {
      const errors = { name: { message: 'required' } }
      const values = { name: 'Ada', email: 'ada@example.com', date: undefined }
      const form = makeForm({
        formState: { errors } as UseFormReturn<BookingFormData>['formState'],
        getValues: vi.fn().mockReturnValue(values),
      })

      const state = getFormState(form)

      expect(state.validationErrors).toBe(errors)
      expect(state.formData).toBe(values)
    })
  })
})
