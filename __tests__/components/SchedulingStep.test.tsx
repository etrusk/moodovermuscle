import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import { BookingFormProvider } from '@/components/booking-form/BookingFormProvider'
import { SchedulingStep } from '@/components/booking-form/steps/SchedulingStep'

describe('SchedulingStep Loading State', () => {
  it('renders enabled controls by default', () => {
    render(
      <BookingFormProvider onClose={() => {}}>
        <SchedulingStep />
      </BookingFormProvider>
    )
    expect(screen.getByTestId('date-picker-trigger')).toBeEnabled()
    expect(screen.getByTestId('time-select')).toBeEnabled()
    expect(screen.getByTestId('message-textarea')).toBeEnabled()
  })

  it('disables controls when isLoading prop is true', () => {
    render(
      <BookingFormProvider onClose={() => {}}>
        <SchedulingStep isLoading={true} />
      </BookingFormProvider>
    )
    expect(screen.getByTestId('date-picker-trigger')).toBeDisabled()
    expect(screen.getByTestId('time-select')).toBeDisabled()
    expect(screen.getByTestId('message-textarea')).toBeDisabled()
  })
})
