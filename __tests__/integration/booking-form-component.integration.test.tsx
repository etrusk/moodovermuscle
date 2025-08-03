import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '@/components/booking-form'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'

// MSW will handle API mocking. No need for manual fetch mocks.
jest.setTimeout(30000);

describe('Booking Form Component Integration Tests', () => {
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

  const fillBookingForm = async (overrides = {}) => {
    const defaultData = {
      name: 'Integration Test User',
      email: 'integration-test@example.com',
      phone: '0412345678',
      service: '1-on-1 Personal Training',
      goals: 'Build strength & energy',
      message: 'Looking forward to the session!',
      ...overrides,
    }

    // Step 1: Fill personal details
    await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
    await user.type(screen.getByLabelText(/name/i), defaultData.name)
    await user.type(screen.getByLabelText(/email/i), defaultData.email)
    await user.type(screen.getByLabelText(/phone/i), defaultData.phone)

    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: defaultData.goals })
    )

    // Continue to step 2
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await screen.findByText(/what would you like to try/i)

    // Step 2: Select service
    await user.click(screen.getByText(defaultData.service))

    // Continue to step 3
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await screen.findByText(/preferred date/i)

    // Step 3: Select date, time and fill message
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

    await user.click(enabledDateCell);

    await waitFor(() => {
      expect(screen.getByTestId('time-select')).not.toBeDisabled()
    })
    await user.selectOptions(screen.getByTestId('time-select'), '10:00 AM')

    await user.type(screen.getByLabelText(/message/i), defaultData.message)

    return defaultData
  }

  it('should submit form and show success message', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await fillBookingForm()
    await user.click(
      screen.getByRole('button', { name: /book my free session/i })
    )

    expect(await screen.findByText(/booking confirmed/i, {}, { timeout: 5000 })).toBeInTheDocument()
  })

  it('should handle API validation errors', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await fillBookingForm({ email: 'validation@example.com' })
    await user.click(
      screen.getByRole('button', { name: /book my free session/i })
    )

    expect(await screen.findByText(/Invalid data/i, {}, { timeout: 5000 })).toBeInTheDocument()
  })

  it('should handle network errors gracefully', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await fillBookingForm({ email: 'network@example.com' })
    await user.click(
      screen.getByRole('button', { name: /book my free session/i })
    )

    expect(await screen.findByText(/network error/i, {}, { timeout: 5000 })).toBeInTheDocument()
  })

  it('should show loading state during step transition and submission', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)

    // Step 1 -> Step 2 transition
    await user.type(screen.getByLabelText(/name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/phone/i), '0123456789')
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(
      await screen.findByRole('option', { name: 'Build strength & energy' })
    )

    const continueButton = screen.getByRole('button', { name: /continue/i })
    user.click(continueButton)

    await waitFor(
      () => expect(screen.getByText(/validating/i)).toBeInTheDocument(),
      { timeout: 2000 }
    )

    await screen.findByText(/what would you like to try/i)

    // Step 2 -> Step 3 transition
    await user.click(screen.getByText('1-on-1 Personal Training'))
    user.click(continueButton)

    await waitFor(
      () => expect(screen.getByText(/validating/i)).toBeInTheDocument(),
      { timeout: 2000 }
    )

    await screen.findByText(/preferred date/i)

    // Final submission
    await user.click(screen.getByTestId('date-picker-trigger'))
    const dateToSelect = new Date()
    dateToSelect.setDate(dateToSelect.getDate() + 5)
    const day = dateToSelect.getDate().toString()
    const dateCells = await screen.findAllByText(day)
    const enabledDateCell = dateCells.find(
      cell => cell.closest('button') && !cell.closest('button')?.disabled
    )
    if (!enabledDateCell)
      throw new Error('Could not find an enabled date cell.')
    await user.click(enabledDateCell)

    await user.selectOptions(screen.getByTestId('time-select'), '10:00 AM')

    const submitButton = screen.getByRole('button', {
      name: /book my free session/i,
    })
    user.click(submitButton)

    await waitFor(
      () => expect(screen.getByText(/booking\.\.\./i)).toBeInTheDocument(),
      { timeout: 2000 }
    )
    expect(await screen.findByText(/booking confirmed/i)).toBeInTheDocument()
  })
})
