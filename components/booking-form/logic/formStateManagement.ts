'use client'

import { BookingFormData } from '../bookingFormLogic'
import { UseFormReturn } from 'react-hook-form'

export function createFormDataUpdater(form: UseFormReturn<BookingFormData>) {
  return (data: Partial<BookingFormData>): void => {
    Object.entries(data).forEach(([key, value]) =>
      form.setValue(
        key as keyof BookingFormData,
        value as BookingFormData[keyof BookingFormData],
        { shouldValidate: true }
      )
    )
  }
}

export function createFormResetter(form: UseFormReturn<BookingFormData>) {
  return (): void => {
    form.reset()
  }
}

export interface FormStateGetters {
  validationErrors: Record<string, unknown>
  formData: BookingFormData
}

export function getFormState(form: UseFormReturn<BookingFormData>): FormStateGetters {
  return {
    validationErrors: form.formState.errors,
    formData: form.getValues(),
  }
}