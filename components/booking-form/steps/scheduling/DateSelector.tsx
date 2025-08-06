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
  const { setCalendarLoading, setCalendarOpen, isCalendarOpen, performanceMetrics } = props
  const handleCalendarToggle = useCalendarToggle(setCalendarLoading, setCalendarOpen)
  
  useCalendarLoadingEffects(isCalendarOpen, performanceMetrics, setCalendarLoading)

  return (
    <FormField
      control={props.form.control}
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <DateSelectorHeader performanceMetrics={performanceMetrics} />
          <Popover
            open={isCalendarOpen}
            onOpenChange={handleCalendarToggle}
          >
            <DatePickerTrigger
              field={field}
              isLoading={props.isLoading}
              calendarLoading={props.calendarLoading}
            />
            <DatePickerContent
              field={field}
              setCalendarOpen={setCalendarOpen}
              fetchDateAvailability={props.fetchDateAvailability}
              availabilityCache={props.availabilityCache}
              performanceMetrics={performanceMetrics}
            />
          </Popover>
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

// Extract loading effects logic
function useCalendarLoadingEffects(
  isCalendarOpen: boolean,
  performanceMetrics: DateSelectorProps['performanceMetrics'],
  setCalendarLoading: (loading: boolean) => void
): void {
  React.useEffect(() => {
    if (isCalendarOpen) {
      setCalendarLoading(false)
    }
  }, [isCalendarOpen, setCalendarLoading])

  // Show performance feedback for cache hits (instant response)
  React.useEffect(() => {
    if (performanceMetrics?.cacheHit && performanceMetrics?.responseTime && performanceMetrics.responseTime < 50) {
      // Very fast cache response - provide instant visual feedback
      setCalendarLoading(false)
    }
  }, [performanceMetrics, setCalendarLoading])
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
  field: ControllerRenderProps<BookingFormData, 'date'>
  isLoading: boolean
  calendarLoading: boolean
}): React.JSX.Element {
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
  performanceMetrics: _performanceMetrics,
}: {
  field: ControllerRenderProps<BookingFormData, 'date'>
  setCalendarOpen: (open: boolean) => void
  fetchDateAvailability: (date: Date) => void
  availabilityCache: Record<string, { availableTimes: string[]; bookedTimes: string[] }>
  performanceMetrics?: { responseTime?: number; cacheHit: boolean }
}): React.JSX.Element {
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
          busy: 'bg-yellow-200/50 border-yellow-300 text-yellow-900',
          packed: 'bg-red-300/80 border-red-400 text-red-900',
          available: 'bg-green-100/60 border-green-300 text-green-900',
          loading: 'bg-gray-200/60 animate-pulse',
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

// Extract calendar modifiers logic
function useCalendarModifiers(availabilityCache: Record<string, { availableTimes: string[]; bookedTimes: string[] }>): {
  busy: (date: Date) => boolean
  packed: (date: Date) => boolean
  available: (date: Date) => boolean
  loading: (date: Date) => boolean
} {
  return {
    // High availability - mostly free slots
    available: (date: Date) => {
      const key = date.toISOString().split('T')[0]
      const dayData = availabilityCache[key]
      if (!dayData) return false
      const totalSlots = timeSlots.length
      const availableThreshold = totalSlots * 0.7 // 70% or more available
      return dayData.availableTimes.length >= availableThreshold
    },
    
    // Medium availability - some slots taken
    busy: (date: Date) => {
      const key = date.toISOString().split('T')[0]
      const dayData = availabilityCache[key]
      if (!dayData) return false
      const totalSlots = timeSlots.length
      const busyThreshold = totalSlots * 0.3 // 30% or more available, but less than 70%
      return (
        dayData.availableTimes.length >= busyThreshold &&
        dayData.availableTimes.length < totalSlots * 0.7
      )
    },
    
    // Low availability - very few slots left
    packed: (date: Date) => {
      const key = date.toISOString().split('T')[0]
      const dayData = availabilityCache[key]
      if (!dayData) return false
      const totalSlots = timeSlots.length
      const packedThreshold = totalSlots * 0.3 // Less than 30% available
      return dayData.availableTimes.length < packedThreshold && dayData.availableTimes.length > 0
    },
    
    // Loading state for dates being fetched
    loading: (date: Date) => {
      const key = date.toISOString().split('T')[0]
      const dayData = availabilityCache[key]
      // Show loading for dates that haven't been cached yet (within reasonable range)
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      return !dayData && date >= today && date <= thirtyDaysFromNow
    },
  }
}