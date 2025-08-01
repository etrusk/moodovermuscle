import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '@/components/booking-form'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'
import { server } from '../setup/server'

// MSW will handle API mocking. No need for manual fetch mocks.

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
    await user.type(screen.getByLabelText(/name/i), defaultData.name)
    await user.type(screen.getByLabelText(/email/i), defaultData.email)
    await user.type(screen.getByLabelText(/phone/i), defaultData.phone)
    
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(await screen.findByRole('option', { name: defaultData.goals }))

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
    const enabledDateCell = dateCells.find(cell =>
      cell.closest('button') && !cell.closest('button')?.disabled
    )
    
    if (!enabledDateCell) {
      throw new Error(`Could not find enabled date cell for day ${day}`)
    }
    
    await user.click(enabledDateCell)
    
    await user.selectOptions(screen.getByTestId('time-select'), '10:00 AM')

    await user.type(screen.getByLabelText(/message/i), defaultData.message)

    return defaultData
  }

  it('should submit form and show success message', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await fillBookingForm()
    await user.click(screen.getByRole('button', { name: /book my free session/i }))

    expect(await screen.findByText(/booking confirmed/i)).toBeInTheDocument()
  })

  it('should handle API validation errors', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await fillBookingForm({ email: 'validation@example.com' })
    await user.click(screen.getByRole('button', { name: /book my free session/i }))

    expect(await screen.findByText(/booking failed/i)).toBeInTheDocument()
  })

  it('should handle network errors gracefully', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await fillBookingForm({ email: 'network@example.com' })
    await user.click(screen.getByRole('button', { name: /book my free session/i }))

    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
  })

  it('should disable submit button during submission', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await fillBookingForm()
    const submitButton = screen.getByRole('button', {
      name: /book my free session/i,
    })
    await user.click(submitButton)

    await waitFor(() => expect(submitButton).toBeDisabled())
    expect(await screen.findByText(/booking confirmed/i)).toBeInTheDocument()
  })

  it('should validate required fields on step 1', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /continue/i }))

    const alerts = await screen.findAllByRole('alert')
    expect(alerts.length).toBeGreaterThan(3) // name, email, phone, goals
    expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument()
  })

  it('should handle date and time selection correctly', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)

    // Manual navigation to step 3
    await user.type(screen.getByLabelText(/name/i), 'Date Test User')
    await user.type(screen.getByLabelText(/email/i), 'date-test@example.com')
    await user.type(screen.getByLabelText(/phone/i), '0123456789')
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(await screen.findByRole('option', { name: 'Build strength & energy' }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await screen.findByText(/what would you like to try/i)
    await user.click(screen.getByText('1-on-1 Personal Training'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Now on step 3, interact with the calendar
    await screen.findByText(/preferred date/i)
    const datePickerTrigger = screen.getByTestId('date-picker-trigger')
    await user.click(datePickerTrigger)

    const dateToSelect = new Date()
    dateToSelect.setDate(dateToSelect.getDate() + 5)
    const day = dateToSelect.getDate().toString()
    
    const dateCells = await screen.findAllByText(day)
    const enabledDateCell = dateCells.find(cell =>
      cell.closest('button') && !cell.closest('button')?.disabled
    )
    
    if (!enabledDateCell) {
      throw new Error(`Could not find enabled date cell for day ${day}`)
    }
    
    await user.click(enabledDateCell)

    expect(datePickerTrigger).toHaveTextContent(
      dateToSelect.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    )
  })

  it('should call onClose after successful submission', async () => {
    const handleClose = jest.fn()
    render(<BookingForm isOpen={true} onClose={handleClose} />)

    await fillBookingForm()
    await user.click(screen.getByRole('button', { name: /book my free session/i }))

    expect(
      await screen.findByText(/booking confirmed/i, {}, { timeout: 5000 })
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should handle different service types', async () => {
    const services = ['1-on-1 Personal Training', 'Double Trouble & Tiny Toots']
    const apiSpy = jest.fn()
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('/api/book-session')) {
        request.json().then(body => apiSpy(body))
      }
    })

    for (const service of services) {
      render(<BookingForm isOpen={true} onClose={() => {}} />)
      await fillBookingForm({ service })
      await user.click(
        screen.getByRole('button', { name: /book my free session/i })
      )

      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith(
          expect.objectContaining({ service: service })
        )
      })

      cleanup()
    }
  })

  it('should have accessible controls', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)

    await user.type(screen.getByLabelText(/name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/phone/i), '0123456789')
    await user.click(screen.getByTestId('goals-select-trigger'))
    await user.click(await screen.findByRole('option', { name: 'Build strength & energy' }))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await screen.findByText(/what would you like to try/i)
    expect(screen.getByText('1-on-1 Personal Training')).toBeInTheDocument()

    await user.click(screen.getByText('1-on-1 Personal Training'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await screen.findByText(/preferred date/i)
    const submitButton = screen.getByRole('button', { name: /book my free session/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should maintain form state after a validation error from API', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    const formData = await fillBookingForm({ email: 'validation@example.com' })
    await user.click(
      screen.getByRole('button', { name: /book my free session/i })
    )

    expect(await screen.findByText(/booking failed/i)).toBeInTheDocument()

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
    expect(nameInput.value).toBe(formData.name)
  })
})
