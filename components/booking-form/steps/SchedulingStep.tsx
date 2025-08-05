'use client'

import React, { useState, useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useBookingForm } from '../BookingFormProvider'
import { useAvailability } from '../useAvailability'
import { BookingFormData } from '../bookingFormLogic'
import { DateSelector } from './scheduling/DateSelector'
import { TimeSelector } from './scheduling/TimeSelector'
import { MessageInput } from './scheduling/MessageInput'
import { useSlotLocking } from './scheduling/useSlotLocking'

interface SchedulingStepProps {
  isLoading?: boolean
}

export function SchedulingStep({ isLoading = false }: SchedulingStepProps): React.ReactElement {
  const schedulingData = useSchedulingData()
  const fetchDateAvailability = useFetchDateAvailability(schedulingData.fetchAvailability)

  return (
    <div
      className="space-y-6 animate-fade-in-up"
      data-testid="booking-form-step-3"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <DateSelector
          form={schedulingData.form}
          isLoading={isLoading}
          calendarLoading={schedulingData.calendarLoading}
          setCalendarLoading={schedulingData.setCalendarLoading}
          isCalendarOpen={schedulingData.isCalendarOpen}
          setCalendarOpen={schedulingData.setCalendarOpen}
          fetchDateAvailability={fetchDateAvailability}
          availabilityCache={schedulingData.availabilityCache}
        />
        <TimeSelector
          form={schedulingData.form}
          isLoading={isLoading}
          loadingAvailability={schedulingData.loadingAvailability}
          date={schedulingData.date}
          availableTimes={schedulingData.availableTimes}
          bookedTimes={schedulingData.bookedTimes}
          lockConflict={schedulingData.lockConflict}
          lockWarning={schedulingData.lockWarning}
        />
      </div>
      <MessageInput form={schedulingData.form} isLoading={isLoading} />
    </div>
  )
}

// Extract scheduling data logic to reduce main function size
function useSchedulingData(): {
  form: UseFormReturn<BookingFormData>
  calendarLoading: boolean
  setCalendarLoading: (loading: boolean) => void
  isCalendarOpen: boolean
  setCalendarOpen: (open: boolean) => void
  date: Date | undefined
  selectedTime: string | undefined
  availableTimes: string[]
  bookedTimes: string[]
  loadingAvailability: boolean
  fetchAvailability: (date: Date) => void
  availabilityCache: Record<string, { availableTimes: string[]; bookedTimes: string[] }>
  lockConflict: boolean
  lockWarning: string | null
} {
  const { form, calendarLoading, setCalendarLoading } = useBookingForm()
  const [isCalendarOpen, setCalendarOpen] = useState(false)
  const date = form.watch('date')
  const selectedTime = form.watch('time')

  const {
    availableTimes,
    bookedTimes,
    loadingAvailability,
    fetchAvailability,
    availabilityCache,
  } = useAvailability(date)

  const { lockConflict, lockWarning } = useSlotLocking(
    date,
    selectedTime ?? '',
    form
  )

  return {
    form,
    calendarLoading,
    setCalendarLoading,
    isCalendarOpen,
    setCalendarOpen,
    date,
    selectedTime,
    availableTimes,
    bookedTimes,
    loadingAvailability,
    fetchAvailability,
    availabilityCache,
    lockConflict,
    lockWarning,
  }
}

// Extract fetch callback to reduce complexity
function useFetchDateAvailability(fetchAvailability: (date: Date) => void): (date: Date) => Promise<void> {
  return useCallback(
    async (date: Date) => {
      fetchAvailability(date)
    },
    [fetchAvailability]
  )
}
