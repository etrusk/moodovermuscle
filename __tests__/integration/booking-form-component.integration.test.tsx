import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '@/components/booking-form'
import {
  setupIntegrationTest,
  teardownIntegrationTest,
} from '../setup/test-helpers'

// Mock the email functions
jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'test-customer-id' }),
  sendAdminNotification: jest
    .fn()
    .mockResolvedValue({ success: true, messageId: 'test-admin-id' }),
}))

// Mock Prisma to avoid database calls in integration tests
jest.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      create: jest.fn().mockResolvedValue({
        id: 'test-booking-id',
        name: 'Integration Test User',
        email: 'integration-test@example.com',
        phone: '0412345678',
        service: '1-on-1 Personal Training',
        date: new Date('2025-08-05T14:00:00.000Z'),
        time: '10:00 AM',
        message: 'Looking forward to the session!',
        goals: 'strength',
        experience: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
  },
}))

// Override the global fetch mock from jest.setup.js with a working implementation
const mockFetch = jest.fn()

// Clear any existing fetch mock and set our own
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 delete (global as any).fetch
global.fetch = mockFetch

describe('Booking Form Component Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(async () => {
    await setupIntegrationTest()
    
    // Ensure our mock is properly set
    mockFetch.mockClear()
    mockFetch.mockReset()
    global.fetch = mockFetch
    
    // Default successful response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        message: 'Booking submitted successfully!',
        data: { id: 'test-booking-id' },
      }),
    })
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
      goals: 'strength',
      message: 'Looking forward to the session!',
      ...overrides,
    }

    // Step 1: Fill personal details
    await user.type(screen.getByTestId('name-input'), defaultData.name)
    await user.type(screen.getByTestId('email-input'), defaultData.email)
    await user.type(screen.getByTestId('phone-input'), defaultData.phone)
    await user.selectOptions(
      screen.getByTestId('goals-select'),
      defaultData.goals
    )

    // Continue to step 2
    await user.click(screen.getByTestId('booking-form-continue-button'))
    await screen.findByTestId('booking-form-step-2')

    // Step 2: Select service
    await user.click(
      screen.getByTestId(
        `service-option-${defaultData.service.replace(/\s+/g, '-')}`
      )
    )

    // Continue to step 3
    await user.click(screen.getByTestId('booking-form-continue-button'))
    await screen.findByTestId('booking-form-step-3')

    // Select time and fill message
    await user.click(screen.getByTestId('date-picker-trigger'))
    const dateToSelect = new Date()
    dateToSelect.setDate(dateToSelect.getDate() + 5)
    const day = dateToSelect.getDate().toString()
    
    // Find the date button by its text content and ensure it's not disabled
    const dateCells = await screen.findAllByText(day)
    const enabledDateCell = dateCells.find(cell =>
      cell.tagName === 'BUTTON' && !cell.hasAttribute('disabled')
    )
    
    if (!enabledDateCell) {
      throw new Error(`Could not find enabled date cell for day ${day}`)
    }
    
    await user.click(enabledDateCell)
    await user.selectOptions(screen.getByTestId('time-select'), '10:00 AM')
    await user.type(screen.getByTestId('message-textarea'), defaultData.message)

    return defaultData
  }

  it('should submit form and call API with correct data', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    const formData = await fillBookingForm()
    await user.click(screen.getByTestId('booking-form-submit-button'))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/book-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining(formData.name),
      })
    })
    expect(await screen.findByText('Booking Confirmed!')).toBeInTheDocument()
  })

  it('should handle API validation errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Invalid form data.',
        errors: { email: ['Invalid email format'] },
      }),
    })

    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await fillBookingForm()
    await user.click(screen.getByTestId('booking-form-submit-button'))

    expect(await screen.findByText('Booking Failed')).toBeInTheDocument()
  })

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await fillBookingForm()
    await user.click(screen.getByTestId('booking-form-submit-button'))

    expect(await screen.findByText('Network Error')).toBeInTheDocument()
  })

  it('should disable submit button during submission', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                status: 201,
                json: async () => ({
                  message: 'Success',
                  data: { id: 'test-id' },
                }),
              }),
            100
          )
        )
    )

    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await fillBookingForm()
    const submitButton = screen.getByTestId('booking-form-submit-button')
    await user.click(submitButton)

    await waitFor(() => expect(submitButton).toBeDisabled())
    expect(await screen.findByText('Booking Confirmed!')).toBeInTheDocument()
    // Removed re-enable assertion as button unmounts after success
  })

  it('should validate required fields before submission', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)
    await user.click(screen.getByTestId('booking-form-continue-button'))

    expect(mockFetch).not.toHaveBeenCalled()
    const alerts = await screen.findAllByRole('alert')
    expect(alerts.length).toBeGreaterThan(0)
    expect(alerts[0]).toHaveTextContent(/Name must be at least 2 characters|required/i)
  })

  it('should handle date and time selection', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)

    // Manual navigation to step 3
    await user.type(screen.getByTestId('name-input'), 'Date Test User')
    await user.type(screen.getByTestId('email-input'), 'date-test@example.com')
    await user.type(screen.getByTestId('phone-input'), '0123456789')
    await user.selectOptions(screen.getByTestId('goals-select'), 'strength')
    await user.click(screen.getByTestId('booking-form-continue-button'))

    await screen.findByTestId('booking-form-step-2')
    await user.click(
      screen.getByTestId('service-option-1-on-1-Personal-Training')
    )
    await user.click(screen.getByTestId('booking-form-continue-button'))

    // Now on step 3, interact with the calendar
    await screen.findByTestId('booking-form-step-3')
    const datePickerTrigger = screen.getByTestId('date-picker-trigger')
    await user.click(datePickerTrigger)

    const dateToSelect = new Date()
    dateToSelect.setDate(dateToSelect.getDate() + 5)
    const day = dateToSelect.getDate().toString()
    
    // Find the date button by its text content and ensure it's not disabled
    const dateCells = await screen.findAllByText(day)
    const enabledDateCell = dateCells.find(cell =>
      cell.tagName === 'BUTTON' && !cell.hasAttribute('disabled')
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
    await user.click(screen.getByTestId('booking-form-submit-button'))

    expect(await screen.findByText(/Booking Confirmed!/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalled()
    })
  })

  it('should handle different service types', async () => {
    const services = ['1-on-1 Personal Training', 'Double Trouble & Tiny Toots']

    for (const service of services) {
      render(<BookingForm isOpen={true} onClose={() => {}} />)
      await fillBookingForm({ service })
      await user.click(screen.getByTestId('booking-form-submit-button'))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      const callArgs = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
      const requestBody = JSON.parse(callArgs[1].body as string)
      expect(requestBody.service).toBe(service)
      cleanup() // Clean up between iterations
    }
  })

  it('should handle form accessibility', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)

    await user.type(screen.getByTestId('name-input'), 'Test User')
    await user.type(screen.getByTestId('email-input'), 'test@example.com')
    await user.type(screen.getByTestId('phone-input'), '0123456789')
    await user.selectOptions(screen.getByTestId('goals-select'), 'strength')
    await user.click(screen.getByTestId('booking-form-continue-button'))

    await screen.findByTestId('booking-form-step-2')
    expect(
      screen.getByTestId('service-option-1-on-1-Personal-Training')
    ).toBeInTheDocument()

    // Actually select a service before continuing
    await user.click(screen.getByTestId('service-option-1-on-1-Personal-Training'))
    await user.click(screen.getByTestId('booking-form-continue-button'))

    await screen.findByTestId('booking-form-step-3')
    const submitButton = screen.getByTestId('booking-form-submit-button')
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should maintain form state during validation errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Invalid form data.',
        errors: { email: ['Invalid email format'] },
      }),
    })

    render(<BookingForm isOpen={true} onClose={() => {}} />)
    const formData = await fillBookingForm()
    await user.click(screen.getByTestId('booking-form-submit-button'))

    expect(await screen.findByText(/Booking Failed/i)).toBeInTheDocument()
    const nameInput = screen.getByTestId('name-input') as HTMLInputElement
    expect(nameInput.value).toBe(formData.name)
  })
})
