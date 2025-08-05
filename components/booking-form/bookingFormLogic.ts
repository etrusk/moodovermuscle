'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema } from '@/lib/schemas'
import {
  getFieldsForStep,
  createValidationUpdates
} from './logic/formValidation'
import {
  validateAvailability,
  prepareSubmissionData,
  submitBookingRequest
} from './logic/formSubmission'
import {
  createFormDataUpdater,
  createFormResetter,
  getFormState
} from './logic/formStateManagement'

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

export interface BookingResult {
  success: boolean
  bookingId?: string
  message?: string
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
  submitForm: (formData: BookingFormData) => Promise<{ error: string } | BookingResult>
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
): Promise<{ error: string } | BookingResult> => {
  setIsSubmitting(true)
  
  try {
    // Re-check availability before submission
    const availabilityCheck = await validateAvailability(formData)
    if (availabilityCheck.error) {
      return { error: availabilityCheck.error }
    }

    // Prepare and submit data
    const data = prepareSubmissionData(formData)
    const submissionResult = await submitBookingRequest(data)
    
    if (submissionResult.error) {
      return { error: submissionResult.error }
    }

    return (submissionResult.result as unknown) as BookingResult || { success: true }
  } finally {
    setIsSubmitting(false)
  }
}

export function useBookingFormLogic(
  onClose: () => void,
  initialValues?: Partial<BookingFormData>
): UseBookingFormLogicReturn {
  const form = useFormWithDefaults(initialValues)
  const loadingStates = useLoadingStates()
  const validateStep = useStepValidation(form, loadingStates.setStepTransition, loadingStates.setFieldValidation)
  
  const updateFormData = createFormDataUpdater(form)
  const resetForm = createFormResetter(form)
  const { validationErrors, formData } = getFormState(form)

  return {
    form,
    formData,
    updateFormData,
    submitForm: (formData: BookingFormData) => submitForm(formData, loadingStates.setIsSubmitting),
    resetForm,
    isSubmitting: loadingStates.isSubmitting,
    validationErrors,
    validateStep,
    // Loading states
    stepTransition: loadingStates.stepTransition,
    calendarLoading: loadingStates.calendarLoading,
    fieldValidation: loadingStates.fieldValidation,
    setCalendarLoading: loadingStates.setCalendarLoading,
    onClose,
  }
}

// Extract form initialization to reduce main function size
function useFormWithDefaults(initialValues?: Partial<BookingFormData>) {
  return useForm<BookingFormData>({
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
}

// Extract loading states management
function useLoadingStates() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stepTransition, setStepTransition] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [fieldValidation, setFieldValidation] = useState<Record<string, boolean>>({})

  return {
    isSubmitting,
    setIsSubmitting,
    stepTransition,
    setStepTransition,
    calendarLoading,
    setCalendarLoading,
    fieldValidation,
    setFieldValidation,
  }
}

// Extract step validation logic
function useStepValidation(
  form: UseFormReturn<BookingFormData>,
  setStepTransition: React.Dispatch<React.SetStateAction<boolean>>,
  setFieldValidation: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
) {
  return async (step: number): Promise<boolean> => {
    setStepTransition(true)
    const fields = getFieldsForStep(step)
    
    if (!fields) {
      setStepTransition(false)
      return false
    }
    
    try {
      const result = await form.trigger(fields)
      const validationUpdates = createValidationUpdates(fields, form.formState.errors)
      setFieldValidation(prev => ({ ...prev, ...validationUpdates }))
      return result
    } catch {
      return false
    } finally {
      setStepTransition(false)
    }
  }
}
