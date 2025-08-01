import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import { BookingFormProvider } from '@/components/booking-form/BookingFormProvider'
import { PersonalDetailsStep } from '@/components/booking-form/steps/PersonalDetailsStep'

describe('PersonalDetailsStep Loading State', () => {
  it('renders enabled inputs by default', () => {
    render(
      <BookingFormProvider onClose={() => {}}>
        <PersonalDetailsStep />
      </BookingFormProvider>
    )
    expect(screen.getByTestId('name-input')).toBeEnabled()
    expect(screen.getByTestId('email-input')).toBeEnabled()
    expect(screen.getByTestId('phone-input')).toBeEnabled()
    expect(screen.getByTestId('goals-select-trigger')).toBeEnabled()
  })

  it('disables inputs when isLoading prop is true', () => {
    render(
      <BookingFormProvider onClose={() => {}}>
        <PersonalDetailsStep isLoading={true} />
      </BookingFormProvider>
    )
    expect(screen.getByTestId('name-input')).toBeDisabled()
    expect(screen.getByTestId('email-input')).toBeDisabled()
    expect(screen.getByTestId('phone-input')).toBeDisabled()
    expect(screen.getByTestId('goals-select-trigger')).toBeDisabled()
  })
})
