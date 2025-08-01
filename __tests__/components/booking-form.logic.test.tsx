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
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Goal is required.')).toBeInTheDocument()
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

  it.skip('shows validation error on step 2 when no service selected', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)
    // advance to step 2
    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.selectOptions(screen.getByTestId('goals-select'), 'strength')
    await user.click(screen.getByTestId('booking-form-continue-button'))
    // at step2, click continue without selecting service
    await user.click(screen.getByTestId('booking-form-continue-button'))

    expect(await screen.findByText('Please select a valid service.')).toBeInTheDocument()
  })

  it.skip('advances to step 3 after selecting service', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)
    // step1
    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.selectOptions(screen.getByTestId('goals-select'), 'strength')
    await user.click(screen.getByTestId('booking-form-continue-button'))
    // step2 select service
    await user.click(screen.getByTestId('service-option-1-on-1-Personal-Training'))
    await user.click(screen.getByTestId('booking-form-continue-button'))

    expect(await screen.findByTestId('booking-form-step-3')).toBeInTheDocument()
  })

  it('shows date/time validation errors on step 3 submit', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)
    // fill step1
    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.selectOptions(screen.getByTestId('goals-select'), 'strength')
    await user.click(screen.getByTestId('booking-form-continue-button'))
    // step2
    await user.click(screen.getByTestId('service-option-1-on-1-Personal-Training'))
    await user.click(screen.getByTestId('booking-form-continue-button'))
    // step3 submit without date/time
    await user.click(screen.getByTestId('booking-form-submit-button'))

    expect(await screen.findByText('Please select a date.')).toBeInTheDocument()
    expect(screen.getByText('Please select a time.')).toBeInTheDocument()
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