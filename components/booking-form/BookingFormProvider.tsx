'use client'

import React, { createContext, useContext } from 'react'
import { Form } from '@/components/ui/form'
import { useBookingFormLogic } from './bookingFormLogic'
import type { LoadingStates } from './bookingFormLogic'

export type BookingFormContextValue = ReturnType<typeof useBookingFormLogic> & {
  loadingStates: LoadingStates
}

const BookingFormContext = createContext<BookingFormContextValue>(
  {} as BookingFormContextValue
)

export function useBookingForm(): BookingFormContextValue {
  return useContext(BookingFormContext)
}

interface BookingFormProviderProps {
  onClose: () => void
  children: React.ReactNode
  initialValues?: Partial<BookingFormContextValue['form']['getValues']>
}

export function BookingFormProvider({
  onClose,
  children,
  initialValues,
}: BookingFormProviderProps): React.ReactElement {
  const logic = useBookingFormLogic(onClose, initialValues)

  const loadingStates: LoadingStates = {
    stepTransition: logic.stepTransition,
    formSubmission: logic.isSubmitting,
    fieldValidation: logic.fieldValidation,
    calendarLoading: logic.calendarLoading,
  }

  const contextValue: BookingFormContextValue = {
    ...logic,
    loadingStates,
  }
  return (
    <BookingFormContext.Provider value={contextValue}>
      <Form {...logic.form}>{children}</Form>
    </BookingFormContext.Provider>
  )
}
