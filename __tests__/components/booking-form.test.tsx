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
    const { container } = render(
      <BookingForm isOpen={true} onClose={mockOnClose} />
    )

    expect(
      screen.getByRole('heading', { name: /book your free session/i })
    ).toBeInTheDocument()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('does not render when isOpen is false', () => {
    render(<BookingForm isOpen={false} onClose={mockOnClose} />)

    expect(
      screen.queryByRole('heading', { name: /book your free session/i })
    ).not.toBeInTheDocument()
  })

  test('calls onClose when form is closed', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Click the close button
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  // Note: MSW test removed - API error handling covered in integration tests
})
