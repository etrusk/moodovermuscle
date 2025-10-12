/**
 * @testing-approach modern-2025
 * @why-this-approach Tests provider state management via data-testid for implementation details
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import {
  BookingFormProvider,
  useBookingForm,
} from '@/components/booking-form/BookingFormProvider'

describe('BookingFormProvider Loading States', () => {
  const Consumer = () => {
    const { loadingStates } = useBookingForm()
    return (
      <div>
        <span data-testid="stepTransition">
          {String(loadingStates.stepTransition)}
        </span>
        <span data-testid="formSubmission">
          {String(loadingStates.formSubmission)}
        </span>
        <span data-testid="calendarLoading">
          {String(loadingStates.calendarLoading)}
        </span>
        <span data-testid="fieldValidation">
          {JSON.stringify(loadingStates.fieldValidation)}
        </span>
      </div>
    )
  }

  it('provides default loading states as false/empty', () => {
    // Arrange & Act
    render(
      <BookingFormProvider onClose={() => {}}>
        <Consumer />
      </BookingFormProvider>
    )
    
    // Assert
    expect(screen.getByTestId('stepTransition')).toHaveTextContent('false')
    expect(screen.getByTestId('formSubmission')).toHaveTextContent('false')
    expect(screen.getByTestId('calendarLoading')).toHaveTextContent('false')
    expect(screen.getByTestId('fieldValidation')).toHaveTextContent('{}')
  })

  it('throws error when useBookingForm is used outside provider', () => {
    // Arrange
    const InvalidConsumer = () => {
      try {
        useBookingForm()
        return <div>Should not render</div>
      } catch (error) {
        return <div>Error caught</div>
      }
    }

    // Act & Assert
    expect(() => render(<InvalidConsumer />)).toThrow()
  })
})
