'use client'

import React from 'react'
import { useBookingForm } from '../BookingFormProvider'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Heart } from 'lucide-react'

interface PersonalDetailsStepProps {
  isLoading?: boolean
}

export function PersonalDetailsStep({
  isLoading = false,
}: PersonalDetailsStepProps) {
  const { isSubmitting } = useBookingForm()
  const loading = isLoading || isSubmitting

  return (
    <div
      className="space-y-6 animate-fade-in-up"
      data-testid="booking-form-step-1"
    >
      <div className="grid gap-6">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Heart className="h-4 w-4 stroke-1 text-rose-500" />
                What should we call you? *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Your beautiful name"
                  {...field}
                  disabled={loading}
                  data-testid="name-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
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
          <FormField
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
        </div>
        <FormField
          name="goals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What&apos;s your main fitness goal? *</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={loading}
                  className="w-full p-4 border-2 border-stone-200 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white text-lg"
                  data-testid="goals-select"
                >
                  <option value="">Choose your goal...</option>
                  <option value="weight-loss">
                    Lose weight & feel confident
                  </option>
                  <option value="strength">Build strength & energy</option>
                  <option value="postnatal">Postnatal recovery</option>
                  <option value="community">Find my mum tribe</option>
                  <option value="mental-health">
                    Improve mental wellbeing
                  </option>
                  <option value="other">Something else amazing</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
