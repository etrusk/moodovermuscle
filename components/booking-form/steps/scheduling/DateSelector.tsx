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
import { timeSlots } from '../timeSlots'
import {
  AvailabilityPerformanceIndicator,
  usePerformanceIndicatorVisibility
} from './AvailabilityPerformanceIndicator'

interface DateSelectorProps {
  form: UseFormReturn<BookingFormData>
  isLoading: boolean
  calendarLoading: boolean
  setCalendarLoading: (loading: boolean) => void
  isCalendarOpen: boolean
  setCalendarOpen: (open: boolean) => void
  fetchDateAvailability: (date: Date) => void
  availabilityCache: Record<string, { availableTimes: string[]; bookedTimes: string[] }>
  performanceMetrics?: { responseTime?: number; cacheHit: boolean }
}

export function DateSelector(props: DateSelectorProps): React.JSX.Element {
  const { setCalendarLoading, performanceMetrics } = props
  
  useCalendarLoadingEffects(performanceMetrics, setCalendarLoading)

  return (
    <FormField
      control={props.form.control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <DateSelectorHeader performanceMetrics={performanceMetrics} />
          <FormControl>
            <InlineCalendar
              field={field}
              availabilityCache={props.availabilityCache}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Extract header component
function DateSelectorHeader({ performanceMetrics }: {
  performanceMetrics?: { responseTime?: number; cacheHit: boolean }
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <FormLabel>Preferred Date *</FormLabel>
      <PerformanceIndicator performanceMetrics={performanceMetrics} />
    </div>
  )
}

// Extract loading effects logic (simplified without calendar open state)
function useCalendarLoadingEffects(
  performanceMetrics: DateSelectorProps['performanceMetrics'],
  setCalendarLoading: (loading: boolean) => void
): void {
  // Show performance feedback for cache hits (instant response)
  React.useEffect(() => {
    if (performanceMetrics?.cacheHit && performanceMetrics?.responseTime && performanceMetrics.responseTime < 50) {
      // Very fast cache response - provide instant visual feedback
      setCalendarLoading(false)
    }
  }, [performanceMetrics, setCalendarLoading])
}

// Native date input component
function InlineCalendar({
  field,
  availabilityCache,
}: {
  field: ControllerRenderProps<BookingFormData, 'date'>
  availabilityCache: Record<string, { availableTimes: string[]; bookedTimes: string[] }>
}): React.JSX.Element {
  const minDate = getMinDate()
  const availabilityIndicator = useDateAvailabilityIndicator(field.value, availabilityCache)

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
        className="w-full max-w-[350px] px-3 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      />
      {availabilityIndicator && (
        <div className={`text-sm px-2 py-1 rounded-md inline-block max-w-[350px] ${availabilityIndicator.className}`}>
          {availabilityIndicator.text}
        </div>
      )}
    </div>
  )
}

// Get minimum date (today)
function getMinDate(): string {
  const today = new Date()
  return format(today, 'yyyy-MM-dd')
}

// Get availability indicator for selected date
function useDateAvailabilityIndicator(
  selectedDate: Date | undefined,
  availabilityCache: Record<string, { availableTimes: string[]; bookedTimes: string[] }>
): { text: string; className: string } | null {
  if (!selectedDate) return null

  const key = selectedDate.toISOString().split('T')[0]
  const dayData = availabilityCache[key]
  
  if (!dayData) return null

  const totalSlots = timeSlots.length
  const availableCount = dayData.availableTimes.length
  
  if (availableCount === 0) {
    return { text: 'No available times', className: 'bg-red-100 text-red-900' }
  } else if (availableCount < totalSlots * 0.3) {
    return { text: `Only ${availableCount} slots available`, className: 'bg-yellow-100 text-yellow-900' }
  } else if (availableCount >= totalSlots * 0.7) {
    return { text: `${availableCount} slots available`, className: 'bg-green-100 text-green-900' }
  } else {
    return { text: `${availableCount} slots available`, className: 'bg-blue-100 text-blue-900' }
  }
}

// Performance indicator component for real-time feedback
function PerformanceIndicator({
  performanceMetrics
}: {
  performanceMetrics?: { responseTime?: number; cacheHit: boolean }
}): React.JSX.Element | null {
  const isVisible = usePerformanceIndicatorVisibility(
    performanceMetrics ?? { responseTime: undefined, cacheHit: false },
    2500 // Show for 2.5 seconds
  )

  if (!performanceMetrics) return null

  return (
    <AvailabilityPerformanceIndicator
      performanceMetrics={performanceMetrics}
      isVisible={isVisible}
    />
  )
}
