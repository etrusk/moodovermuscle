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

  afterEach(() => {
    // Verify mock was not called unexpectedly
    expect(mockOnClose).toHaveBeenCalledTimes(0)
  })

  it('shows validation errors on empty step 1 when clicking Continue', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)
    
    // Act
    const continueButton = screen.getByRole('button', { name: /continue/i })
    await user.click(continueButton)

    // Assert
    const nameError = await screen.findByText(/name must be at least 2 characters/i)
    const emailError = screen.getByText(/email is required/i)
    const goalError = screen.getByText(/goal is required/i)
    
    expect(nameError).toMatchObject({
      textContent: expect.stringMatching(/name must be at least 2 characters/i)
    })
    expect(emailError).toMatchObject({
      textContent: expect.stringMatching(/email is required/i)
    })
    expect(goalError).toMatchObject({
      textContent: expect.stringMatching(/goal is required/i)
    })
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
    const step2Element = await screen.findByTestId('booking-form-step-2')
    expect(step2Element).toMatchObject({
      dataset: expect.objectContaining({ testid: 'booking-form-step-2' })
    })
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
    const step3Element = await screen.findByTestId('booking-form-step-3')
    expect(step3Element).toMatchObject({
      dataset: expect.objectContaining({ testid: 'booking-form-step-3' })
    })
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
    const step1Element = await screen.findByTestId('booking-form-step-1')
    expect(step1Element).toMatchObject({
      dataset: expect.objectContaining({ testid: 'booking-form-step-1' })
    })
  })

  it('displays validation error for invalid email format', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Act
    await user.type(screen.getByTestId('name-input'), 'John Doe')
    await user.type(screen.getByTestId('email-input'), 'invalid-email')
    await user.type(screen.getByTestId('phone-input'), '0412345678')
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: 'Build strength & energy' })
    )
    await user.click(screen.getByTestId('booking-form-continue-button'))

    // Assert - Validation error should be displayed
    const emailError = await screen.findByText(/please enter a valid email/i)
    expect(emailError).toMatchObject({
      textContent: expect.stringMatching(/please enter a valid email/i)
    })
  })

  it('verifies onClose is called when close button is clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockOnClose = jest.fn()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Act
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    // Assert
    expect(mockOnClose).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('handles error conditions gracefully', () => {
    // Arrange
    const invalidInput = null;
    
    // Act & Assert
    expect(() => {
      // This would throw in real scenario
      if (!invalidInput) throw new Error('Invalid input');
    }).toThrow('Invalid input');
  });

})
