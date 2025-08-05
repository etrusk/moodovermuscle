'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { BookingFormData } from '../../bookingFormLogic'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { timeSlots } from '../timeSlots'

interface TimeSelectorProps {
  form: UseFormReturn<BookingFormData>
  isLoading: boolean
  loadingAvailability: boolean
  date: Date | undefined
  availableTimes: string[]
  bookedTimes: string[]
  lockConflict: boolean
  lockWarning: string | null
}

function formatTimeForDisplay(time: string, isBooked: boolean): string {
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const adjustedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const displayTime = `${adjustedHour}:${minute.toString().padStart(2, '0')} ${period}`
  return isBooked ? `${displayTime} (Booked)` : displayTime
}

export function TimeSelector({
  form,
  isLoading,
  loadingAvailability,
  date,
  availableTimes,
  bookedTimes,
  lockConflict,
  lockWarning,
}: TimeSelectorProps): React.JSX.Element {
  const selectDisabled = isLoading || loadingAvailability || !date
  const placeholderText = getPlaceholderText(date, loadingAvailability)
  
  return (
    <FormField
      control={form.control}
      name="time"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Preferred Time *</FormLabel>
          <FormControl>
            <select
              {...field}
              disabled={selectDisabled}
              aria-busy={loadingAvailability}
              className="w-full p-4 border-2 border-stone-200 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white"
              data-testid="time-select"
            >
              <option value="">{placeholderText}</option>
              <TimeSlotOptions
                loadingAvailability={loadingAvailability}
                date={date}
                availableTimes={availableTimes}
                bookedTimes={bookedTimes}
              />
            </select>
          </FormControl>
          <FormMessage />
          <LockWarning lockConflict={lockConflict} lockWarning={lockWarning} />
        </FormItem>
      )}
    />
  )
}

// Extract placeholder text logic
function getPlaceholderText(date: Date | undefined, loadingAvailability: boolean): string {
  if (!date) return 'Select a date first'
  if (loadingAvailability) return 'Loading slots...'
  return 'Select time...'
}

// Extract time slot options component
function TimeSlotOptions({
  loadingAvailability,
  date,
  availableTimes,
  bookedTimes,
}: {
  loadingAvailability: boolean
  date: Date | undefined
  availableTimes: string[]
  bookedTimes: string[]
}): React.JSX.Element | null {
  if (loadingAvailability || !date) return null
  
  return (
    <>
      {timeSlots.map(time => (
        <option
          key={time}
          value={time}
          disabled={!availableTimes.includes(time)}
        >
          {formatTimeForDisplay(time, bookedTimes.includes(time))}
        </option>
      ))}
    </>
  )
}

// Extract lock warning component
function LockWarning({
  lockConflict,
  lockWarning
}: {
  lockConflict: boolean
  lockWarning: string | null
}): React.JSX.Element | null {
  if (!lockConflict) return null
  
  return (
    <div
      className="text-red-600 text-sm mt-2"
      data-testid="slot-lock-warning"
    >
      {lockWarning}
    </div>
  )
}