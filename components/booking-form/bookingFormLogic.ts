'use client'

import { useState } from 'react'
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

export function useBookingFormLogic(onClose: () => void) {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: '',
      date: undefined,
      time: '',
      message: '',
      goals: '',
      experience: undefined,
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

  const submitForm = async (formData: BookingFormData) => {
    setIsSubmitting(true)
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

  const updateFormData = (data: Partial<BookingFormData>) => {
    Object.entries(data).forEach(([key, value]) =>
      form.setValue(
        key as keyof BookingFormData,
        value as BookingFormData[keyof BookingFormData],
        { shouldValidate: true }
      )
    )
  }

  const resetForm = () => {
    form.reset()
  }

  const validationErrors = form.formState.errors
  const formData = form.getValues()

  return {
    form,
    formData,
    updateFormData,
    submitForm,
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
