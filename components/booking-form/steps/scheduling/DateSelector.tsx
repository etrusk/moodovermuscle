'use client'

import React from 'react'
import { UseFormReturn, ControllerRenderProps } from 'react-hook-form'
import { BookingFormData } from '../../bookingFormLogic'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { format } from 'date-fns'

interface DateSelectorProps {
  form: UseFormReturn<BookingFormData>
  isLoading: boolean
  calendarLoading: boolean
  setCalendarLoading: (loading: boolean) => void
  isCalendarOpen: boolean
  setCalendarOpen: (open: boolean) => void
  fetchDateAvailability: (date: Date) => void
}

export function DateSelector(props: DateSelectorProps): React.JSX.Element {
  return (
    <FormField
      control={props.form.control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Preferred Date *</FormLabel>
          <FormControl>
            <InlineCalendar
              field={field}
              isLoading={props.isLoading}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Native date input — deliberate; do NOT replace with a react-day-picker / Radix Popover calendar.
// A calendar nested inside the booking Dialog trips a React 19 + @radix-ui/react-focus-scope
// infinite setState loop. react-day-picker is still installed and used elsewhere
// (components/ui/calendar.tsx), so the trap is reachable if you "upgrade" this back. (Saga in git.)
function InlineCalendar({
  field,
  isLoading,
}: {
  field: ControllerRenderProps<BookingFormData, 'date'>
  isLoading: boolean
}): React.JSX.Element {
  const minDate = getMinDate()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const dateValue = e.target.value
    if (dateValue) {
      const selectedDate = new Date(dateValue + 'T00:00:00')
      field.onChange(selectedDate)
    } else {
      field.onChange(undefined)
    }
  }

  return (
    <div
      className="date-selector-inline w-full flex flex-col gap-2"
      data-testid="date-picker-inline"
    >
      <input
        type="date"
        id="booking-date"
        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
        onChange={handleDateChange}
        min={minDate}
        aria-label="Select date"
        disabled={isLoading}
        className="w-full max-w-[350px] px-3 py-2 text-base border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      />
    </div>
  )
}

// Get minimum date (today)
function getMinDate(): string {
  const today = new Date()
  return format(today, 'yyyy-MM-dd')
}
