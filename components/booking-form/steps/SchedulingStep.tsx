'use client'

import React, { useState } from 'react'
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

const timeSlots = [
  '6:00 AM',
  '6:30 AM',
  '7:00 AM',
  '7:30 AM',
  '8:00 AM',
  '8:30 AM',
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
]

interface SchedulingStepProps {}

export function SchedulingStep(_: SchedulingStepProps) {
  const { isSubmitting } = useBookingForm()
  const [isCalendarOpen, setCalendarOpen] = useState(false)

  return (
    <div
      className="space-y-6 animate-fade-in-up"
      data-testid="booking-form-step-3"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Preferred Date *</FormLabel>
              <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      disabled={isSubmitting}
                      aria-busy={isSubmitting}
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
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Time *</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={isSubmitting}
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
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Anything else you&apos;d like me to know? (Optional)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any questions, concerns, or things you're excited about? I'd love to hear from you! 💕"
                {...field}
                disabled={isSubmitting}
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
