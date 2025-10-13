/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole for accessibility-first testing, removed TEST_STRINGS dependency
 * @last-refactored 2025-10-10
 */
import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { BookingForm } from '@/components/booking-form'
import '@testing-library/jest-dom'

// Mock the toast hook to prevent issues in tests
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Temporarily disabled MSW imports
// import { server } from '@/__tests__/setup/server'
// import { http, HttpResponse } from 'msw'

describe('BookingForm Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  test('renders when isOpen is true and has no accessibility violations', async () => {
    // Arrange
    const { container } = render(
      <BookingForm isOpen={true} onClose={mockOnClose} />
    )

    // Act
    const heading = screen.getByRole('heading', { name: /book your free session/i })
    const results = await axe(container)

    // Assert
    expect(heading).toMatchObject({
      textContent: expect.stringMatching(/book your free session/i)
    })
    expect(results).toMatchObject({
      violations: []
    })
  })

  test('does not render when isOpen is false', () => {
    // Arrange & Act
    render(<BookingForm isOpen={false} onClose={mockOnClose} />)

    // Assert
    const heading = screen.queryByRole('heading', { name: /book your free session/i })
    expect(heading).toBeNull()
  })

  test('calls onClose when form is closed', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Act
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    // Assert
    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('throws error when required fields are submitted empty', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Act
    const continueButton = screen.getByRole('button', { name: /continue/i })
    await user.click(continueButton)

    // Assert
    const nameError = await screen.findByText(/name must be at least 2 characters/i)
    expect(nameError).toMatchObject({
      textContent: expect.stringMatching(/name must be at least 2 characters/i)
    })
  })

  test('handles invalid prop values gracefully', () => {
    // Arrange
    const consoleError = jest.spyOn(console, 'error').mockImplementation()
    
    // Act & Assert
    expect(() => {
      render(<BookingForm isOpen={true} onClose={null as any} />)
    }).not.toThrow()

    consoleError.mockRestore()
  })

  // Note: MSW test removed - API error handling covered in integration tests
})
