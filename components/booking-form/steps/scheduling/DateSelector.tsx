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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeSlots } from '../timeSlots'

interface DateSelectorProps {
  form: UseFormReturn<BookingFormData>
  isLoading: boolean
  calendarLoading: boolean
  setCalendarLoading: (loading: boolean) => void
  isCalendarOpen: boolean
  setCalendarOpen: (open: boolean) => void
  fetchDateAvailability: (date: Date) => void
  availabilityCache: Record<string, { availableTimes: string[]; bookedTimes: string[] }>
}

export function DateSelector({
  form,
  isLoading,
  calendarLoading,
  setCalendarLoading,
  isCalendarOpen,
  setCalendarOpen,
  fetchDateAvailability,
  availabilityCache,
}: DateSelectorProps): React.JSX.Element {
  const handleCalendarToggle = useCalendarToggle(setCalendarLoading, setCalendarOpen)
  
  React.useEffect(() => {
    if (isCalendarOpen) {
      setCalendarLoading(false)
    }
  }, [isCalendarOpen, setCalendarLoading])

  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Preferred Date *</FormLabel>
          <Popover
            open={isCalendarOpen}
            onOpenChange={handleCalendarToggle}
          >
            <DatePickerTrigger
              field={field}
              isLoading={isLoading}
              calendarLoading={calendarLoading}
            />
            <DatePickerContent
              field={field}
              setCalendarOpen={setCalendarOpen}
              fetchDateAvailability={fetchDateAvailability}
              availabilityCache={availabilityCache}
            />
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Extract calendar toggle logic
function useCalendarToggle(
  setCalendarLoading: (loading: boolean) => void,
  setCalendarOpen: (open: boolean) => void
) {
  return (open: boolean): void => {
    if (open) {
      setCalendarLoading(true)
      setCalendarOpen(true)
    } else {
      setCalendarOpen(false)
    }
  }
}

// Extract date picker trigger component
function DatePickerTrigger({
  field,
  isLoading,
  calendarLoading
}: {
  field: any
  isLoading: boolean
  calendarLoading: boolean
}) {
  return (
    <PopoverTrigger asChild>
      <FormControl>
        <Button
          variant="outline"
          disabled={isLoading}
          aria-busy={calendarLoading}
          className={cn(
            'w-full pl-3 text-left font-normal min-h-[3.5rem] h-auto',
            !field.value && 'text-muted-foreground'
          )}
          data-testid="date-picker-trigger"
        >
          {field.value ? (
            field.value.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          ) : (
            <span>Pick a date</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </FormControl>
    </PopoverTrigger>
  )
}

// Extract date picker content component
function DatePickerContent({
  field,
  setCalendarOpen,
  fetchDateAvailability,
  availabilityCache,
}: {
  field: any
  setCalendarOpen: (open: boolean) => void
  fetchDateAvailability: (date: Date) => void
  availabilityCache: Record<string, { availableTimes: string[]; bookedTimes: string[] }>
}) {
  const dateDisabledCheck = useDateDisabledCheck(availabilityCache)
  const calendarModifiers = useCalendarModifiers(availabilityCache)

  return (
    <PopoverContent
      className="w-auto p-0"
      align="start"
      data-testid="date-picker-content"
    >
      <Calendar
        mode="single"
        selected={field.value}
        onSelect={day => {
          if (day) field.onChange(day)
          setCalendarOpen(false)
        }}
        onDayMouseEnter={fetchDateAvailability}
        disabled={dateDisabledCheck}
        initialFocus
        className="rounded-md border"
        modifiers={calendarModifiers}
        modifiersClassNames={{
          busy: 'bg-yellow-200/50',
          packed: 'bg-red-300/80',
        }}
      />
    </PopoverContent>
  )
}

// Extract date disabled check logic
function useDateDisabledCheck(availabilityCache: Record<string, { availableTimes: string[]; bookedTimes: string[] }>) {
  return (date: Date) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate())
    tomorrow.setHours(0, 0, 0, 0)
    if (date < tomorrow) return true
    const key = date.toISOString().split('T')[0]
    const cachedData = availabilityCache[key]
    return cachedData ? cachedData.availableTimes.length === 0 : false
  }
}

// Extract calendar modifiers logic
function useCalendarModifiers(availabilityCache: Record<string, { availableTimes: string[]; bookedTimes: string[] }>) {
  return {
    busy: (date: Date) => {
      const key = date.toISOString().split('T')[0]
      const dayData = availabilityCache[key]
      if (!dayData) return false
      const totalSlots = timeSlots.length
      const busyThreshold = totalSlots * 0.5
      return (
        dayData.availableTimes.length < totalSlots &&
        dayData.availableTimes.length >= busyThreshold
      )
    },
    packed: (date: Date) => {
      const key = date.toISOString().split('T')[0]
      const dayData = availabilityCache[key]
      if (!dayData) return false
      const totalSlots = timeSlots.length
      const packedThreshold = totalSlots * 0.9
      return dayData.bookedTimes.length >= packedThreshold
    },
  }
}