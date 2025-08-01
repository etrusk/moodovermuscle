'use client'

import React, { useState, useEffect } from 'react'
import { useBookingForm } from '../BookingFormProvider'
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

export function SchedulingStep({ isLoading = false }: SchedulingStepProps) {
  const { form } = useBookingForm()
  const [isCalendarOpen, setCalendarOpen] = useState(false)
  const [calendarLoading, setCalendarLoading] = useState(false)

  const handleCalendarToggle = (open: boolean) => {
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
  }, [isCalendarOpen])

  return (
    <div
      className="space-y-6 animate-fade-in-up"
      data-testid="booking-form-step-3"
    >
      <div className="grid gap-6 md:grid-cols-2">
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
                    onSelect={date => {
                      field.onChange(date)
                      setCalendarOpen(false)
                    }}
                    disabled={date => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      tomorrow.setHours(0, 0, 0, 0)
                      return date < tomorrow
                    }}
                    initialFocus
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Time *</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={isLoading}
                  className="w-full p-4 border-2 border-stone-200 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white"
                  data-testid="time-select"
                >
                  <option value="">Select time...</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
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
    </div>
  )
}
