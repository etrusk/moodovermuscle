import React from 'react'
import { render, screen, fireEvent, waitFor } from '../setup/test-utils'
import { BookingForm } from '@/components/booking-form'

describe('BookingForm Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  test('renders when isOpen is true', () => {
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByText(/book your free session/i)).toBeInTheDocument()
    expect(screen.getByText(/100% free session/i)).toBeInTheDocument()
  })

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <BookingForm isOpen={false} onClose={mockOnClose} />
    )

    expect(container.firstChild).toBeNull()
  })

  test('closes when clicking outside the modal', () => {
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    const backdrop = screen.getByRole('dialog').parentElement
    fireEvent.click(backdrop!)

    expect(mockOnClose).toHaveBeenCalled()
  })

  test('closes when clicking the close button', () => {
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  test('displays step 1 initially', () => {
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByText(/let's get to know you/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/what should we call you/i)
    ).toBeInTheDocument()
  })

  test('navigates through steps', async () => {
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Fill step 1 fields
    fireEvent.change(screen.getByLabelText(/what should we call you/i), {
      target: { value: 'Sarah Wilson' },
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'sarah@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '0412345678' },
    })

    const goalsSelect = screen.getByRole('combobox')
    fireEvent.change(goalsSelect, { target: { value: 'weight-loss' } })

    // Click continue
    const continueButton = screen.getByRole('button', { name: /continue/i })
    fireEvent.click(continueButton)

    // Should now be on step 2
    await waitFor(() => {
      expect(screen.getByText(/choose your free session/i)).toBeInTheDocument()
    })
  })

  test('selects a service in step 2', async () => {
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Navigate to step 2
    const continueButton = screen.getByRole('button', { name: /continue/i })

    // Fill required fields for step 1
    fireEvent.change(screen.getByLabelText(/what should we call you/i), {
      target: { value: 'Sarah Wilson' },
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'sarah@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '0412345678' },
    })

    const goalsSelect = screen.getByRole('combobox')
    fireEvent.change(goalsSelect, { target: { value: 'weight-loss' } })

    fireEvent.click(continueButton)

    // Select a service
    const serviceOption = screen.getByText(/1-on-1 personal training/i)
    fireEvent.click(serviceOption)

    expect(serviceOption).toBeInTheDocument()
  })

  test('goes back to previous step', async () => {
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Navigate to step 2 first
    const continueButton = screen.getByRole('button', { name: /continue/i })

    fireEvent.change(screen.getByLabelText(/what should we call you/i), {
      target: { value: 'Sarah Wilson' },
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'sarah@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '0412345678' },
    })

    const goalsSelect = screen.getByRole('combobox')
    fireEvent.change(goalsSelect, { target: { value: 'weight-loss' } })

    fireEvent.click(continueButton)

    // Go back to step 1
    const backButton = screen.getByRole('button', { name: /back/i })
    fireEvent.click(backButton)

    await waitFor(() => {
      expect(screen.getByText(/let's get to know you/i)).toBeInTheDocument()
    })
  })

  test('submits form successfully', async () => {
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Navigate through all steps
    const continueButton = screen.getByRole('button', { name: /continue/i })

    // Step 1
    fireEvent.change(screen.getByLabelText(/what should we call you/i), {
      target: { value: 'Sarah Wilson' },
    })
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'sarah@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '0412345678' },
    })

    const goalsSelect = screen.getByRole('combobox')
    fireEvent.change(goalsSelect, { target: { value: 'weight-loss' } })

    fireEvent.click(continueButton)

    // Step 2
    const serviceOption = screen.getByText(/1-on-1 personal training/i)
    fireEvent.click(serviceOption)

    fireEvent.click(continueButton)

    // Step 3
    const dateInput = screen.getByLabelText(/preferred date/i)
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } })

    const timeSelect = screen.getByLabelText(/preferred time/i)
    fireEvent.change(timeSelect, { target: { value: '09:00 AM' } })

    // Submit
    const submitButton = screen.getByRole('button', {
      name: /book my free session/i,
    })
    fireEvent.click(submitButton)

    // Form should close after submission
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  test('displays progress bar correctly', () => {
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    const progressBar = screen.getByText(/step 1 of 3/i)
    expect(progressBar).toBeInTheDocument()

    const progressPercentage = screen.getByText(/33% complete/i)
    expect(progressPercentage).toBeInTheDocument()
  })
})
