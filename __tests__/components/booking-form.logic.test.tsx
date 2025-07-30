import React from 'react'
import { render, screen } from '@/__tests__/setup/test-utils'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '@/components/booking-form'

describe('BookingForm navigation and validation logic', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('shows validation errors on empty step 1 when clicking Continue', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)
    await user.click(screen.getByTestId('booking-form-continue-button'))

    expect(await screen.findByText('Name must be at least 2 characters.')).toBeInTheDocument()
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Please enter a valid phone number.')).toBeInTheDocument()
    expect(screen.getByText('Please select a goal.')).toBeInTheDocument()
  })

  it('advances to step 2 after filling valid step 1 fields', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.selectOptions(screen.getByTestId('goals-select'), 'strength')

    await user.click(screen.getByTestId('booking-form-continue-button'))

    expect(await screen.findByTestId('booking-form-step-2')).toBeInTheDocument()
  })

  it('goes back to step 1 when clicking Back on step 2', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Fill step1 to advance
    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.selectOptions(screen.getByTestId('goals-select'), 'strength')
    await user.click(screen.getByTestId('booking-form-continue-button'))

    // Now on step2
    await user.click(screen.getByTestId('booking-form-back-button'))
    expect(await screen.findByTestId('booking-form-step-1')).toBeInTheDocument()
  })
})