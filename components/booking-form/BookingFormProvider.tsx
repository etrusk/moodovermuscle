'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema } from '@/lib/schemas'
import { Form } from '@/components/ui/form'

interface BookingFormData {
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

interface BookingFormContextValue {
  formData: BookingFormData
  updateFormData: (data: Partial<BookingFormData>) => void
  submitForm: () => Promise<Response>
  resetForm: () => void
  isSubmitting: boolean
  validationErrors: Record<string, unknown>
  validateStep: (step: number) => Promise<boolean>
  onClose: () => void
}

const BookingFormContext = createContext<BookingFormContextValue>({
  formData: {
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
  updateFormData: () => {},
  submitForm: async () => new Response(),
  resetForm: () => {},
  isSubmitting: false,
  validationErrors: {},
  validateStep: async () => true,
  onClose: () => {},
})

export function useBookingForm() {
  return useContext(BookingFormContext)
}

interface BookingFormProviderProps {
  onClose: () => void
  children: React.ReactNode
}

export function BookingFormProvider({
  onClose,
  children,
}: BookingFormProviderProps) {
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

  const validateStep = async (step: number): Promise<boolean> => {
    const fields: Record<number, (keyof BookingFormData)[]> = {
      1: ['name', 'email', 'phone', 'goals'],
      2: ['service'],
      3: ['date', 'time'],
    }

    const fieldsToValidate = fields[step]
    if (!fieldsToValidate) {
      return false
    }

    try {
      const isValid = await form.trigger(fieldsToValidate)
      return isValid
    } catch (error) {
      console.error('Validation error:', error)
      return false
    }
  }

  const submitForm = async (): Promise<Response> => {
    setIsSubmitting(true)
    try {
      // First validate the entire form
      await form.trigger()

      const data = form.getValues()
      const dataWithDateAsString = {
        ...data,
        date: data.date ? data.date.toISOString() : undefined,
      }

      if (dataWithDateAsString.experience === undefined) {
        delete dataWithDateAsString.experience
      }

      if (dataWithDateAsString.goals === 'community') {
        delete dataWithDateAsString.goals
      }

      if (dataWithDateAsString.message === '') {
        delete dataWithDateAsString.message
      }

      if (dataWithDateAsString.phone === '') {
        delete dataWithDateAsString.phone
      }

      if (dataWithDateAsString.service === '') {
        delete dataWithDateAsString.service
      }

      if (dataWithDateAsString.time === '') {
        delete dataWithDateAsString.time
      }

      console.log('Submitting form data:', dataWithDateAsString)

      const response = await fetch('/api/book-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithDateAsString),
      })

      console.log('Fetch response:', response.status, response.ok)
      return response
    } catch (error) {
      console.error('Submit form error:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = (data: Partial<BookingFormData>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.entries(data).forEach(([key, value]) => {
      form.setValue(key as any, value as any, { shouldValidate: true })
    })
  }

  const resetForm = () => {
    form.reset()
  }

  const validationErrors = form.formState.errors
  const formData = form.getValues()

  return (
    <BookingFormContext.Provider
      value={{
        formData,
        updateFormData,
        submitForm,
        resetForm,
        isSubmitting,
        validationErrors,
        validateStep,
        onClose,
      }}
    >
      <Form {...form}>{children}</Form>
    </BookingFormContext.Provider>
  )
}
