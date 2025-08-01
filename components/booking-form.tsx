'use client'

import React from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { BookingFormProvider } from './booking-form/BookingFormProvider'
import { BookingWizard } from './booking-form/BookingWizard'

interface BookingFormProps {
  isOpen: boolean
  onClose: () => void
}

export function BookingForm({ isOpen, onClose }: BookingFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 border-0 shadow-2xl rounded-3xl overflow-hidden"
        data-testid="booking-form-dialog"
      >
        <BookingFormProvider onClose={onClose}>
          <BookingWizard onClose={onClose} />
        </BookingFormProvider>
      </DialogContent>
    </Dialog>
  )
}
