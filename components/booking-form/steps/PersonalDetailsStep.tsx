'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useBookingForm } from '../BookingFormProvider'
import { BookingFormData } from '../bookingFormLogic'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Heart } from 'lucide-react'

interface PersonalDetailsStepProps {
  isLoading?: boolean
}

const NameInput = ({ loading, form }: { loading: boolean, form: UseFormReturn<BookingFormData> }): React.ReactElement => (
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel className="flex items-center gap-2">
          <Heart className="h-4 w-4 stroke-1 text-rose-500" />
          Name
        </FormLabel>
        <FormControl>
          <Input
            placeholder="Your name"
            {...field}
            disabled={loading}
            data-testid="name-input"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

const EmailInput = ({ loading, form }: { loading: boolean, form: UseFormReturn<BookingFormData> }): React.ReactElement => (
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email Address *</FormLabel>
        <FormControl>
          <Input
            type="email"
            placeholder="your.email@example.com"
            {...field}
            disabled={loading}
            data-testid="email-input"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

const PhoneInput = ({ loading, form }: { loading: boolean, form: UseFormReturn<BookingFormData> }): React.ReactElement => (
  <FormField
    control={form.control}
    name="phone"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Phone Number *</FormLabel>
        <FormControl>
          <Input
            type="tel"
            placeholder="Your phone number"
            {...field}
            disabled={loading}
            data-testid="phone-input"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

const GoalsSelect = ({ loading, form }: { loading: boolean, form: UseFormReturn<BookingFormData> }): React.ReactElement => (
  <FormField
    control={form.control}
    name="goals"
    render={({ field }) => (
      <FormItem>
        <FormLabel>What&apos;s your main fitness goal? *</FormLabel>
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value}
          disabled={loading}
          name="goals"
        >
          <FormControl>
            <SelectTrigger
              className="min-h-[3.5rem] h-auto"
              data-testid="goals-select-trigger"
            >
              <SelectValue placeholder="Choose your goal..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="Weight Loss" role="option">
              Lose weight & feel confident
            </SelectItem>
            <SelectItem value="Build strength & energy" role="option">
              Build strength & energy
            </SelectItem>
            <SelectItem value="Postnatal" role="option">
              Postnatal recovery
            </SelectItem>
            <SelectItem value="Community" role="option">
              Connection & community
            </SelectItem>
            <SelectItem value="Mental Health" role="option">
              Improve mental wellbeing
            </SelectItem>
            <SelectItem value="Other" role="option">
              Something else
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
)

export function PersonalDetailsStep({
  isLoading = false,
}: PersonalDetailsStepProps): React.ReactElement {
  const { isSubmitting, form } = useBookingForm()
  const loading = isLoading || isSubmitting

  return (
    <div
      className="space-y-6 animate-fade-in-up"
      data-testid="booking-form-step-1"
    >
      <div className="grid gap-6">
        <NameInput loading={loading} form={form} />
        <div className="grid gap-6 md:grid-cols-2">
          <EmailInput loading={loading} form={form} />
          <PhoneInput loading={loading} form={form} />
        </div>
        <GoalsSelect loading={loading} form={form} />
      </div>
    </div>
  )
}
