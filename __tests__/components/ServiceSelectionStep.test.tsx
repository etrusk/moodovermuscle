/**
 * @testing-approach modern-2025
 * @why-this-approach Tests loading state via data-testid for implementation-specific CSS classes
 * @last-refactored 2025-10-10
 */
import { vi, describe, it, expect } from 'vitest'

import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import { BookingFormProvider } from '@/components/booking-form/BookingFormProvider'
import { ServiceSelectionStep } from '@/components/booking-form/steps/ServiceSelectionStep'

describe('ServiceSelectionStep Loading State', () => {
  it('renders options enabled by default', () => {
    // Arrange
    const onClose = vi.fn()
    
    // Act
    render(
      <BookingFormProvider onClose={onClose}>
        <ServiceSelectionStep />
      </BookingFormProvider>
    )
    const firstOption = screen.getByTestId(
      'service-option-1-on-1-Personal-Training'
    )
    
    // Assert
    expect(onClose).toHaveBeenCalledTimes(0)
    expect(firstOption).not.toHaveClass('opacity-50')
    expect(firstOption).not.toHaveClass('pointer-events-none')
    expect(firstOption).toMatchObject({
      className: expect.any(String)
    })
  })

  it('applies loading styles when isLoading prop is true', () => {
    // Arrange
    const onClose = vi.fn()
    
    // Act
    render(
      <BookingFormProvider onClose={onClose}>
        <ServiceSelectionStep isLoading={true} />
      </BookingFormProvider>
    )
    const firstOption = screen.getByTestId(
      'service-option-1-on-1-Personal-Training'
    )
    
    // Assert
    expect(firstOption).toHaveClass('opacity-50')
    expect(firstOption).toHaveClass('pointer-events-none')
  })

  it('throws error when rendered outside BookingFormProvider', () => {
    // Arrange & Act & Assert
    expect(() => render(<ServiceSelectionStep />)).toThrow()
  })
})
