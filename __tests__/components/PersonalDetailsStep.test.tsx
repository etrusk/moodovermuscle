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
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

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
    const nameInput = screen.getByTestId('name-input')
    const emailInput = screen.getByTestId('email-input')
    const phoneInput = screen.getByTestId('phone-input')
    const goalsSelect = screen.getByTestId('goals-select-trigger')

    expect(nameInput).toMatchObject({
      disabled: false,
      tagName: 'INPUT'
    })
    expect(emailInput).toMatchObject({
      disabled: false,
      tagName: 'INPUT'
    })
    expect(phoneInput).toMatchObject({
      disabled: false,
      tagName: 'INPUT'
    })
    expect(goalsSelect).toMatchObject({
      disabled: false
    })
    
    expect(mockOnClose).toHaveBeenCalledTimes(0)
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
    const nameInput = screen.getByTestId('name-input')
    const emailInput = screen.getByTestId('email-input')
    const phoneInput = screen.getByTestId('phone-input')
    const goalsSelect = screen.getByTestId('goals-select-trigger')

    expect(nameInput).toMatchObject({
      disabled: true,
      tagName: 'INPUT'
    })
    expect(emailInput).toMatchObject({
      disabled: true,
      tagName: 'INPUT'
    })
    expect(phoneInput).toMatchObject({
      disabled: true,
      tagName: 'INPUT'
    })
    expect(goalsSelect).toMatchObject({
      disabled: true
    })
    
    expect(mockOnClose).toHaveBeenCalledTimes(0)
  })

  it('handles invalid isLoading prop type gracefully', () => {
    // Arrange
    const mockOnClose = jest.fn()

    // Act
    render(
      <BookingFormProvider onClose={mockOnClose}>
        <PersonalDetailsStep isLoading={'invalid' as any} />
      </BookingFormProvider>
    )

    // Assert
    const nameInput = screen.getByTestId('name-input')
    expect(nameInput).toMatchObject({
      disabled: expect.any(Boolean)
    })
    expect(mockOnClose).toHaveBeenCalledTimes(0)
  })

  it('throws error when provider context is missing', () => {
    // Arrange & Act & Assert
    expect(() => {
      render(<PersonalDetailsStep />)
    }).toThrow()
  })

  it('verifies mock is not called during initial render', () => {
    // Arrange & Act
    render(
      <BookingFormProvider onClose={mockOnClose}>
        <PersonalDetailsStep />
      </BookingFormProvider>
    )

    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(0)
    expect(mockOnClose).not.toHaveBeenCalled()
  })

})
