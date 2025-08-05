'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useBookingForm } from '../BookingFormProvider'
import { useAvailability } from '../useAvailability'
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
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeSlots } from './timeSlots'

interface SchedulingStepProps {
  isLoading?: boolean
}

const useSlotLocking = (date: Date | undefined, selectedTime: string, form: any) => {
  const [lockConflict, setLockConflict] = useState(false)
  const [lockWarning, setLockWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!date || !selectedTime) return
    const interval = window.setInterval(async () => {
      const dateKey = date.toISOString().split('T')[0]
      try {
        const res = await fetch(`/api/availability?date=${dateKey}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        if (!data.availableTimes.includes(selectedTime)) {
          setLockConflict(true)
          setLockWarning(
            'Your selected time slot has just been booked by someone else. Please choose another slot.'
          )
        }
      } catch {
        // ignore errors
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [date, selectedTime])

  useEffect(() => {
    if (selectedTime) {
      setLockConflict(false)
      setLockWarning(null)
    }
  }, [selectedTime])

  useEffect(() => {
    if (date) {
      setLockConflict(false)
      setLockWarning(null)
      form.setValue('time', '')
    }
  }, [date, form])

  return { lockConflict, lockWarning }
}

const DatePicker = ({
  form,
  isLoading,
  calendarLoading,
  setCalendarLoading,
  isCalendarOpen,
  setCalendarOpen,
  fetchDateAvailability,
  availabilityCache,
}: {
  form: any
  isLoading: boolean
  calendarLoading: boolean
  setCalendarLoading: (loading: boolean) => void
  isCalendarOpen: boolean
  setCalendarOpen: (open: boolean) => void
  fetchDateAvailability: (date: Date) => void
  availabilityCache: any
}): React.ReactElement => {
  const handleCalendarToggle = (open: boolean): void => {
    if (open) {
      setCalendarLoading(true)
      setCalendarOpen(true)
    } else {
      setCalendarOpen(false)
    }
  }

  useEffect(() => {
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
                disabled={date => {
                  const tomorrow = new Date()
                  tomorrow.setDate(tomorrow.getDate())
                  tomorrow.setHours(0, 0, 0, 0)
                  if (date < tomorrow) return true
                  const key = date.toISOString().split('T')[0]
                  const cachedData = availabilityCache[key]
                  return cachedData
                    ? cachedData.availableTimes.length === 0
                    : false
                }}
                initialFocus
                className="rounded-md border"
                modifiers={{
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
                }}
                modifiersClassNames={{
                  busy: 'bg-yellow-200/50',
                  packed: 'bg-red-300/80',
                }}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

const TimePicker = ({
  form,
  isLoading,
  loadingAvailability,
  date,
  availableTimes,
  bookedTimes,
  lockConflict,
  lockWarning,
}: {
  form: any
  isLoading: boolean
  loadingAvailability: boolean
  date: Date | undefined
  availableTimes: string[]
  bookedTimes: string[]
  lockConflict: boolean
  lockWarning: string | null
}): React.ReactElement => (
  <FormField
    control={form.control}
    name="time"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Preferred Time *</FormLabel>
        <FormControl>
          <select
            {...field}
            disabled={isLoading || loadingAvailability || !date}
            aria-busy={loadingAvailability}
            className="w-full p-4 border-2 border-stone-200 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white"
            data-testid="time-select"
          >
            <option value="">
              {!date
                ? 'Select a date first'
                : loadingAvailability
                  ? 'Loading slots...'
                  : 'Select time...'}
            </option>
            {!loadingAvailability &&
              date &&
              timeSlots.map(time => (
                <option
                  key={time}
                  value={time}
                  disabled={!availableTimes.includes(time)}
                >
                  {formatTimeForDisplay(time, bookedTimes.includes(time))}
                </option>
              ))}
          </select>
        </FormControl>
        <FormMessage />
        {lockConflict && (
          <div
            className="text-red-600 text-sm mt-2"
            data-testid="slot-lock-warning"
          >
            {lockWarning}
          </div>
        )}
      </FormItem>
    )}
  />
)

const MessageInput = ({ form, isLoading }: { form: any, isLoading: boolean }): React.ReactElement => (
  <FormField
    control={form.control}
    name="message"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Message (Optional)</FormLabel>
        <FormControl>
          <Textarea
            placeholder="Any questions, concerns, or things you're excited about? I'd love to hear from you! 💕"
            {...field}
            disabled={isLoading}
            data-testid="message-textarea"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

export function SchedulingStep({ isLoading = false }: SchedulingStepProps): React.ReactElement {
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
    selectedTime || '',
    form
  )

  const fetchDateAvailability = useCallback(
    async (date: Date) => {
      fetchAvailability(date)
    },
    [fetchAvailability]
  )

  return (
    <div
      className="space-y-6 animate-fade-in-up"
      data-testid="booking-form-step-3"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <DatePicker
          form={form}
          isLoading={isLoading}
          calendarLoading={calendarLoading}
          setCalendarLoading={setCalendarLoading}
          isCalendarOpen={isCalendarOpen}
          setCalendarOpen={setCalendarOpen}
          fetchDateAvailability={fetchDateAvailability}
          availabilityCache={availabilityCache}
        />
        <TimePicker
          form={form}
          isLoading={isLoading}
          loadingAvailability={loadingAvailability}
          date={date}
          availableTimes={availableTimes}
          bookedTimes={bookedTimes}
          lockConflict={lockConflict}
          lockWarning={lockWarning}
        />
      </div>
      <MessageInput form={form} isLoading={isLoading} />
    </div>
  )
}

function formatTimeForDisplay(time: string, isBooked: boolean): string {
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const adjustedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const displayTime = `${adjustedHour}:${minute.toString().padStart(2, '0')} ${period}`
  return isBooked ? `${displayTime} (Booked)` : displayTime
}
