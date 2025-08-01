'use client'

import React, { createContext, useContext } from 'react'
import { Form } from '@/components/ui/form'
import { useBookingFormLogic } from './bookingFormLogic'

export type BookingFormContextValue = ReturnType<typeof useBookingFormLogic>

const BookingFormContext = createContext<BookingFormContextValue>({} as BookingFormContextValue)

export function useBookingForm() {
  return useContext(BookingFormContext)
}

interface BookingFormProviderProps {
  onClose: () => void
  children: React.ReactNode
}

export function BookingFormProvider({ onClose, children }: BookingFormProviderProps) {
  const logic = useBookingFormLogic(onClose)
  return (
    <BookingFormContext.Provider value={logic}>
      <Form {...logic.form}>{children}</Form>
    </BookingFormContext.Provider>
  )
}
