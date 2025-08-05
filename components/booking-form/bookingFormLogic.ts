'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema } from '@/lib/schemas'

export interface BookingFormData {
  name: string
  email: string
  phone?: string
  service?: string
  date: Date | undefined
  time?: string
  message?: string
  goals?: string
  experience?: string
}

export interface LoadingStates {
  stepTransition: boolean
  formSubmission: boolean
  fieldValidation: Record<string, boolean>
  calendarLoading: boolean
}

import { UseFormReturn, FieldErrors } from "react-hook-form"

export type UseBookingFormLogicReturn = {
  form: UseFormReturn<BookingFormData>
  formData: BookingFormData
  updateFormData: (data: Partial<BookingFormData>) => void
  submitForm: (formData: BookingFormData) => Promise<{ error: string } | { success: boolean; booking: any }>
  resetForm: () => void
  isSubmitting: boolean
  validationErrors: FieldErrors<BookingFormData>
  validateStep: (step: number) => Promise<boolean>
  stepTransition: boolean
  calendarLoading: boolean
  fieldValidation: Record<string, boolean>
  setCalendarLoading: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
}

const submitForm = async (
  formData: BookingFormData,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>
): Promise<{ error: string } | { success: boolean; booking: any }> => {
  setIsSubmitting(true)
  // Re-check availability before submission
  if (formData.date && formData.time) {
    const dateKey = formData.date.toISOString().split('T')[0]
    const availRes = await fetch(`/api/availability?date=${dateKey}`)
    if (!availRes.ok) {
      return { error: 'Failed to verify availability. Please try again.' }
    }
    const availData = await availRes.json()
    if (!availData.availableTimes.includes(formData.time)) {
      return {
        error:
          'Selected time slot is no longer available. Please choose another slot.',
      }
    }
  }
  try {
    const data: Record<string, unknown> = {
      ...formData,
      date: formData.date ? formData.date.toISOString() : undefined,
    }
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === undefined) {
        delete data[key]
      }
    })
    const response = await fetch('/api/book-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        error:
          result.error ||
          result.message ||
          'Booking failed. Please try again.',
      }
    }

    return result
  } finally {
    setIsSubmitting(false)
  }
}

export function useBookingFormLogic(
  onClose: () => void,
  initialValues?: Partial<BookingFormData>
): UseBookingFormLogicReturn {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: undefined,
      date: undefined,
      time: '',
      message: '',
      goals: '',
      experience: undefined,
      ...initialValues,
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepTransition, setStepTransition] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [fieldValidation, setFieldValidation] = useState<
    Record<string, boolean>
  >({})

  const validateStep = async (step: number): Promise<boolean> => {
    setStepTransition(true)
    const fieldsByStep: Record<number, (keyof BookingFormData)[]> = {
      1: ['name', 'email', 'phone', 'goals'],
      2: ['service'],
      3: ['date', 'time'],
    }
    const fields = fieldsByStep[step]
    if (!fields) {
      setStepTransition(false)
      return false
    }
    try {
      const result = await form.trigger(fields)
      // Update per-field validation states
      const validationUpdates: Record<string, boolean> = {}
      fields.forEach(field => {
        validationUpdates[field] = !form.formState.errors[field]
      })
      setFieldValidation(prev => ({ ...prev, ...validationUpdates }))
      return result
    } catch {
      return false
    } finally {
      setStepTransition(false)
    }
  }

  const updateFormData = (data: Partial<BookingFormData>): void => {
    Object.entries(data).forEach(([key, value]) =>
      form.setValue(
        key as keyof BookingFormData,
        value as BookingFormData[keyof BookingFormData],
        { shouldValidate: true }
      )
    )
  }

  const resetForm = (): void => {
    form.reset()
  }

  const validationErrors = form.formState.errors
  const formData = form.getValues()

  return {
    form,
    formData,
    updateFormData,
    submitForm: (formData: BookingFormData) => submitForm(formData, setIsSubmitting),
    resetForm,
    isSubmitting,
    validationErrors,
    validateStep,
    // Loading states
    stepTransition,
    calendarLoading,
    fieldValidation,
    setCalendarLoading,
    onClose,
  }
}
