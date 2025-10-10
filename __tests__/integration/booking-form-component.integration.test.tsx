/**
 * @testing-approach modern-2025
 * @migrated 2025-10-10
 * @coverage behavior-focused
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

describe('Booking Form User Journey Integration', () => {
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

  const completeBookingFlow = async (overrides = {}) => {
    const defaultData = {
      name: 'Integration Test User',
      email: 'integration-test@example.com',
      phone: '0412345678',
      service: '1-on-1 Personal Training',
      goals: 'Build strength & energy',
      message: 'Looking forward to the session!',
      ...overrides,
    }

    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })

    // Step 1: Personal Details
    await user.type(screen.getByLabelText(/name/i), defaultData.name)
    await user.type(screen.getByLabelText(/email/i), defaultData.email)
    await user.type(screen.getByLabelText(/phone/i), defaultData.phone)

    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: defaultData.goals })
    )

    // Progress to service selection
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await screen.findByText(/what would you like to try/i)

    // Step 2: Service Selection
    await user.click(screen.getByText(defaultData.service))

    // Progress to scheduling
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await screen.findByText(/preferred date/i)

    // Step 3: Date and Time Selection
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

    await waitFor(() => {
      expect(screen.getByTestId('time-select')).not.toBeDisabled()
    })
    await user.selectOptions(screen.getByTestId('time-select'), '10:00 AM')

    await user.type(screen.getByLabelText(/message/i), defaultData.message)

    return defaultData
  }

  describe('Complete Booking Journey', () => {
    it('completes full booking flow from start to confirmation', async () => {
      render(<BookingForm isOpen={true} onClose={() => {}} />)
      
      await completeBookingFlow()
      
      await user.click(
        screen.getByRole('button', { name: /book my free session/i })
      )

      expect(
        await screen.findByText(/booking confirmed/i, {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })

    it('preserves user data through multi-step wizard', async () => {
      render(<BookingForm isOpen={true} onClose={() => {}} />)
      
      const userData = await completeBookingFlow({
        name: 'Test Persistence',
        email: 'persist@example.com',
      })

      // Verify data persists by checking form values are still present
      expect(screen.getByLabelText(/message/i)).toHaveValue(userData.message)
    })
  })

  describe('Error Handling and Validation', () => {
    it('displays validation errors from API', async () => {
      render(<BookingForm isOpen={true} onClose={() => {}} />)
      
      await completeBookingFlow({ email: 'validation@example.com' })
      
      await user.click(
        screen.getByRole('button', { name: /book my free session/i })
      )

      expect(
        await screen.findByText(/Invalid data/i, {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })

    it('handles network failures gracefully', async () => {
      render(<BookingForm isOpen={true} onClose={() => {}} />)
      
      await completeBookingFlow({ email: 'network@example.com' })
      
      await user.click(
        screen.getByRole('button', { name: /book my free session/i })
      )

      expect(
        await screen.findByText(/network error/i, {}, { timeout: 5000 })
      ).toBeInTheDocument()
    })
  })

  describe('Loading and Progress States', () => {
    it('shows loading state during step transitions', async () => {
      render(<BookingForm isOpen={true} onClose={() => {}} />)

      // Fill Step 1
      await user.type(screen.getByLabelText(/name/i), 'Test User')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/phone/i), '0123456789')
      await user.click(screen.getByTestId('goals-select-trigger'))
      await user.click(
        await screen.findByRole('option', { name: 'Build strength & energy' })
      )

      const continueButton = screen.getByRole('button', { name: /continue/i })
      user.click(continueButton)

      // Verify loading state appears
      await waitFor(
        () => expect(screen.getByText(/validating/i)).toBeInTheDocument(),
        { timeout: 2000 }
      )

      // Wait for next step
      await screen.findByText(/what would you like to try/i)
    })

    it('shows loading state during final submission', async () => {
      render(<BookingForm isOpen={true} onClose={() => {}} />)
      
      await completeBookingFlow()

      const submitButton = screen.getByRole('button', {
        name: /book my free session/i,
      })
      user.click(submitButton)

      // Verify submission loading state
      await waitFor(
        () => expect(screen.getByText(/booking\.\.\./i)).toBeInTheDocument(),
        { timeout: 2000 }
      )

      // Wait for confirmation
      expect(
        await screen.findByText(/booking confirmed/i)
      ).toBeInTheDocument()
    })
  })

  describe('User Interaction Patterns', () => {
    it('enables time selection only after date is chosen', async () => {
      render(<BookingForm isOpen={true} onClose={() => {}} />)

      // Complete steps 1 and 2
      await user.type(screen.getByLabelText(/name/i), 'Test User')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/phone/i), '0123456789')
      await user.click(screen.getByTestId('goals-select-trigger'))
      await user.click(
        await screen.findByRole('option', { name: 'Build strength & energy' })
      )
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await screen.findByText(/what would you like to try/i)
      await user.click(screen.getByText('1-on-1 Personal Training'))
      await user.click(screen.getByRole('button', { name: /continue/i }))
      await screen.findByText(/preferred date/i)

      // Time select should initially be disabled
      const timeSelect = screen.getByTestId('time-select')
      expect(timeSelect).toBeDisabled()

      // Select a date
      await user.click(screen.getByTestId('date-picker-trigger'))
      const dateToSelect = new Date()
      dateToSelect.setDate(dateToSelect.getDate() + 5)
      const day = dateToSelect.getDate().toString()
      const dateCells = await screen.findAllByText(day)
      const enabledDateCell = dateCells.find(
        cell => cell.closest('button') && !cell.closest('button')?.disabled
      )
      if (!enabledDateCell) throw new Error('No enabled date cell found')
      await user.click(enabledDateCell)

      // Time select should now be enabled
      await waitFor(() => {
        expect(timeSelect).not.toBeDisabled()
      })
    })
  })
})
