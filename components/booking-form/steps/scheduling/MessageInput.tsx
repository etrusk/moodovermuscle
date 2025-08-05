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
import { Textarea } from '@/components/ui/textarea'

interface MessageInputProps {
  form: UseFormReturn<BookingFormData>
  isLoading: boolean
}

export function MessageInput({ form, isLoading }: MessageInputProps): React.JSX.Element {
  return (
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
}