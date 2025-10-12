/**
 * @testing-approach modern-2025
 * @why-this-approach Semantic queries via getByRole/getByLabelText for accessibility-first testing
 * @last-refactored 2025-10-10
 */
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
    // Arrange
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)
    
    // Act
    const continueButton = screen.getByRole('button', { name: /continue/i })
    await user.click(continueButton)

    // Assert
    expect(
      await screen.findByText(/name must be at least 2 characters/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/goal is required/i)).toBeInTheDocument()
  })

  it('advances to step 2 after filling valid step 1 fields', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Act
    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: 'Build strength & energy' })
    )

    await user.click(screen.getByTestId('booking-form-continue-button'))

    // Assert
    expect(await screen.findByTestId('booking-form-step-2')).toBeInTheDocument()
  })

  it('shows validation error on step 2 when no service selected', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)
    // advance to step 2
    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: 'Build strength & energy' })
    )
    await user.click(screen.getByTestId('booking-form-continue-button'))

    // Act
    // at step2, click continue without selecting service
    await user.click(screen.getByTestId('booking-form-continue-button'))

    // Assert
    expect(
      await screen.findByText('Please select a valid service.')
    ).toBeInTheDocument()
  })

  it('advances to step 3 after selecting service', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)
    // step1
    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: 'Build strength & energy' })
    )
    await user.click(screen.getByTestId('booking-form-continue-button'))

    // Act
    // step2 select service
    await user.click(
      screen.getByTestId('service-option-1-on-1-Personal-Training')
    )
    await user.click(screen.getByTestId('booking-form-continue-button'))

    // Assert
    expect(await screen.findByTestId('booking-form-step-3')).toBeInTheDocument()
  })

  it('shows date/time validation errors on step 3 submit', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)
    // fill step1
    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: 'Build strength & energy' })
    )
    
    const continueButton1 = screen.getByRole('button', { name: /continue/i })
    await user.click(continueButton1)
    
    // step2
    await user.click(
      screen.getByTestId('service-option-1-on-1-Personal-Training')
    )
    
    const continueButton2 = screen.getByRole('button', { name: /continue/i })
    await user.click(continueButton2)

    // Act
    // step3 submit without date/time
    const submitButton = screen.getByRole('button', { name: /book/i })
    await user.click(submitButton)

    // Assert
    expect(await screen.findByText(/please select a date/i)).toBeInTheDocument()
    expect(screen.getByText(/please select a time/i)).toBeInTheDocument()
  })

  it('goes back to step 1 when clicking Back on step 2', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Fill step1 to advance
    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: 'Build strength & energy' })
    )
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    await user.click(continueButton)

    // Act
    // Now on step2
    const backButton = screen.getByRole('button', { name: /back/i })
    await user.click(backButton)

    // Assert
    expect(await screen.findByTestId('booking-form-step-1')).toBeInTheDocument()
  })
})
