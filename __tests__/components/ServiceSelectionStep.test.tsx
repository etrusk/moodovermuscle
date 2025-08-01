import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import { BookingFormProvider } from '@/components/booking-form/BookingFormProvider'
import { ServiceSelectionStep } from '@/components/booking-form/steps/ServiceSelectionStep'

describe('ServiceSelectionStep Loading State', () => {
  it('renders options enabled by default', () => {
    render(
      <BookingFormProvider onClose={() => {}}>
        <ServiceSelectionStep />
      </BookingFormProvider>
    )
    const firstOption = screen.getByTestId(
      'service-option-1-on-1-Personal-Training'
    )
    expect(firstOption).not.toHaveClass('opacity-50')
    expect(firstOption).not.toHaveClass('pointer-events-none')
  })

  it('applies loading styles when isLoading prop is true', () => {
    render(
      <BookingFormProvider onClose={() => {}}>
        <ServiceSelectionStep isLoading={true} />
      </BookingFormProvider>
    )
    const firstOption = screen.getByTestId(
      'service-option-1-on-1-Personal-Training'
    )
    expect(firstOption).toHaveClass('opacity-50')
    expect(firstOption).toHaveClass('pointer-events-none')
  })
})
