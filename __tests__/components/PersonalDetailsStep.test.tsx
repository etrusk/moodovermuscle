/**
 * @testing-approach modern-2025
 * @why-this-approach Tests input state via data-testid for implementation-specific validation
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import { BookingFormProvider } from '@/components/booking-form/BookingFormProvider'
import { PersonalDetailsStep } from '@/components/booking-form/steps/PersonalDetailsStep'

describe('PersonalDetailsStep Loading State', () => {
  it('renders enabled inputs by default', () => {
    // Arrange
    const mockOnClose = jest.fn()

    // Act
    render(
      <BookingFormProvider onClose={mockOnClose}>
        <PersonalDetailsStep />
      </BookingFormProvider>
    )

    // Assert
    expect(screen.getByTestId('name-input')).toBeEnabled()
    expect(screen.getByTestId('email-input')).toBeEnabled()
    expect(screen.getByTestId('phone-input')).toBeEnabled()
    expect(screen.getByTestId('goals-select-trigger')).toBeEnabled()
  })

  it('disables inputs when isLoading prop is true', () => {
    // Arrange
    const mockOnClose = jest.fn()

    // Act
    render(
      <BookingFormProvider onClose={mockOnClose}>
        <PersonalDetailsStep isLoading={true} />
      </BookingFormProvider>
    )

    // Assert
    expect(screen.getByTestId('name-input')).toBeDisabled()
    expect(screen.getByTestId('email-input')).toBeDisabled()
    expect(screen.getByTestId('phone-input')).toBeDisabled()
    expect(screen.getByTestId('goals-select-trigger')).toBeDisabled()
  })
})
