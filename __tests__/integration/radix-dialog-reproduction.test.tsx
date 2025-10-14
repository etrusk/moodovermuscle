/**
 * Minimal reproduction test for Radix UI Dialog issue
 * Purpose: Identify actual root cause of skipped booking form tests
 */

import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '@/components/booking-form'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'

jest.setTimeout(30000)

describe('Radix UI Dialog - Minimal Reproduction', () => {
  const user = userEvent.setup()

  beforeEach(async () => {
    await setupIntegrationTest()
  })

  afterEach(() => {
    cleanup()
  })

  afterAll(async () => {
    await teardownIntegrationTest()
  })

  it('should render dialog without errors', async () => {
    // Arrange
    const onClose = jest.fn()
    
    // Act
    render(<BookingForm isOpen={true} onClose={onClose} />)
    
    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('booking-form-dialog')).toBeInTheDocument()
    })
  })

  it('should handle basic user interaction', async () => {
    // Arrange
    const onClose = jest.fn()
    
    // Act
    render(<BookingForm isOpen={true} onClose={onClose} />)
    
    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })
    
    // Type in name field
    await user.type(screen.getByLabelText(/name/i), 'Test')
    
    // Assert
    expect(screen.getByLabelText(/name/i)).toHaveValue('Test')
  })

  it('should complete multi-step flow with date picker', async () => {
    // Arrange
    const onClose = jest.fn()
    
    // Act
    render(<BookingForm isOpen={true} onClose={onClose} />)
    
    // Fill personal details
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })
    
    await user.type(screen.getByLabelText(/name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/phone/i), '0123456789')
    
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: 'Build strength & energy' })
    )
    
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await screen.findByText(/what would you like to try/i)
    
    // Select service
    await user.click(screen.getByText('1-on-1 Personal Training'))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await screen.findByText(/preferred date/i)
    
    // Select date
    await user.click(screen.getByTestId('date-picker-trigger'))
    const dateToSelect = new Date()
    dateToSelect.setDate(dateToSelect.getDate() + 5)
    const day = dateToSelect.getDate().toString()
    
    const dateCells = await screen.findAllByText(day)
    const enabledDateCell = dateCells.find(
      cell => cell.closest('button') && !cell.closest('button')?.disabled
    )
    
    if (!enabledDateCell) {
      throw new Error(`Could not find enabled date cell for day ${day}`)
    }
    
    await user.click(enabledDateCell)
    
    // Assert - Should reach this point without infinite loop
    await waitFor(() => {
      expect(screen.getByTestId('time-select')).not.toBeDisabled()
    })
  })
})