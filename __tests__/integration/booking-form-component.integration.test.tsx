import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '@/components/booking-form'
import { setupIntegrationTest, teardownIntegrationTest } from '../setup/test-db'

// Mock the email functions but allow real API calls
jest.mock('@/lib/email', () => ({
  sendCustomerConfirmation: jest.fn().mockResolvedValue({ success: true, messageId: 'test-customer-id' }),
  sendAdminNotification: jest.fn().mockResolvedValue({ success: true, messageId: 'test-admin-id' }),
}))

// Mock fetch to intercept API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Booking Form Component Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(async () => {
    await setupIntegrationTest()
    mockFetch.mockClear()
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
      goals: 'community',
      message: 'Looking forward to the session!',
      ...overrides
    }

    // Step 1: Fill personal details
    await user.type(screen.getByTestId('name-input'), defaultData.name)
    await user.type(screen.getByTestId('email-input'), defaultData.email)
    await user.type(screen.getByTestId('phone-input'), defaultData.phone)
    
    // Select goals
    const goalsSelect = screen.getByTestId('goals-select')
    await user.selectOptions(goalsSelect, defaultData.goals)
    
    // Continue to step 2
    const continueButton = screen.getByTestId('booking-form-continue-button')
    await user.click(continueButton)
    
    // Step 2: Select service
    const serviceOption = await screen.findByTestId('service-option-1-on-1-Personal-Training');
    await user.click(serviceOption)
    
    // Continue to step 3
    const continueButton2 = screen.getByTestId('booking-form-continue-button')
    await user.click(continueButton2)
    
    // Step 3: Select date and time
    await screen.findByTestId('date-picker-trigger');
    
    // Select time
    const timeSelect = screen.getByTestId('time-select')
    await user.selectOptions(timeSelect, '10:00 AM')
    
    // Fill message
    await user.type(screen.getByTestId('message-textarea'), defaultData.message)

    return defaultData
  }

  it('should submit form and call API with correct data', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        message: 'Booking submitted successfully!',
        data: { id: 'test-booking-id' }
      })
    })

    render(<BookingForm isOpen={true} onClose={() => {}} />)

    const formData = await fillBookingForm()
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /book my free session/i })
    await user.click(submitButton)

    // Verify API was called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/book-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining(formData.name)
      })
    })

    // Verify success message is shown
    await waitFor(() => {
      expect(screen.getByText(/booking submitted successfully/i)).toBeInTheDocument()
    })
  })

  it('should handle API validation errors', async () => {
    // Mock validation error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Invalid form data.',
        errors: {
          email: ['Invalid email format']
        }
      })
    })

    render(<BookingForm isOpen={true} onClose={() => {}} />)

    await fillBookingForm({ email: 'invalid-email' })
    
    const submitButton = screen.getByRole('button', { name: /book my free session/i })
    await user.click(submitButton)

    // Verify error message is shown
    await waitFor(() => {
      expect(screen.getByText(/invalid form data/i)).toBeInTheDocument()
    })
  })

  it('should handle network errors gracefully', async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<BookingForm isOpen={true} onClose={() => {}} />)

    await fillBookingForm()
    
    const submitButton = screen.getByRole('button', { name: /book my free session/i })
    await user.click(submitButton)

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('should disable submit button during submission', async () => {
    // Mock slow API response
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          status: 201,
          json: async () => ({ message: 'Success', data: { id: 'test-id' } })
        }), 100)
      )
    )

    render(<BookingForm isOpen={true} onClose={() => {}} />)

    await fillBookingForm()
    
    const submitButton = screen.getByRole('button', { name: /book my free session/i })
    await user.click(submitButton)

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled()

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    }, { timeout: 2000 })
  })

  it('should validate required fields before submission', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /book my free session/i })
    await user.click(submitButton)

    // Should show validation errors without calling API
    expect(mockFetch).not.toHaveBeenCalled()
    
    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/name is required/i) || screen.getByText(/required/i)).toBeInTheDocument()
    })
  })

  it('should handle date and time selection', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        message: 'Booking submitted successfully!',
        data: { id: 'test-booking-id' }
      })
    })

    render(<BookingForm isOpen={true} onClose={() => {}} />)

    await fillBookingForm()

    // Select a date (assuming date picker is available)
    const dateInput = screen.getByTestId('date-picker-trigger');
    if (dateInput) {
      await user.type(dateInput, '2024-12-25')
    }

    // Select a time
    const timeSelect = screen.getByTestId('time-select');
    if (timeSelect) {
      await user.selectOptions(timeSelect, '10:00 AM')
    }

    const submitButton = screen.getByRole('button', { name: /book my free session/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    const callArgs = mockFetch.mock.calls[0]
    const requestBody = JSON.parse(callArgs[1].body)
    
    if (dateInput) {
      expect(requestBody.date).toBeDefined()
    }
    if (timeSelect) {
      expect(requestBody.time).toBeDefined()
    }
  })

  it('should reset form after successful submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        message: 'Booking submitted successfully!',
        data: { id: 'test-booking-id' }
      })
    })

    render(<BookingForm isOpen={true} onClose={() => {}} />)

    await fillBookingForm()
    
    const submitButton = screen.getByRole('button', { name: /book my free session/i })
    await user.click(submitButton)

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText(/booking submitted successfully/i)).toBeInTheDocument()
    })

    // Check if form fields are reset
    await waitFor(() => {
      const nameInput = screen.getByTestId('name-input') as HTMLInputElement
      expect(nameInput.value).toBe('')
    })
  })

  it('should handle different service types', async () => {
    const services = [
      '1-on-1 Personal Training',
      'Group Fitness Class',
      'Nutrition Consultation'
    ]

    for (const service of services) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          message: 'Booking submitted successfully!',
          data: { id: `test-booking-${service}` }
        })
      })

      render(<BookingForm isOpen={true} onClose={() => {}} />)

      await fillBookingForm({ service })
      
      const submitButton = screen.getByRole('button', { name: /book my free session/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      const callArgs = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
      const requestBody = JSON.parse(callArgs[1].body)
      expect(requestBody.service).toBe(service)

      // Clean up for next iteration
      mockFetch.mockClear()
    }
  })

  it('should handle form accessibility', async () => {
    render(<BookingForm isOpen={true} onClose={() => {}} />)

    // Check that form elements are properly labeled
    expect(screen.getByTestId('name-input')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('service-option-1-on-1-Personal-Training')).toBeInTheDocument()

    // Check that submit button is accessible
    const submitButton = screen.getByRole('button', { name: /book my free session/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should maintain form state during validation errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'Invalid form data.',
        errors: {
          email: ['Invalid email format']
        }
      })
    })

    render(<BookingForm isOpen={true} onClose={() => {}} />)

    const formData = await fillBookingForm({ email: 'invalid-email' })
    
    const submitButton = screen.getByRole('button', { name: /book my free session/i })
    await user.click(submitButton)

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/invalid form data/i)).toBeInTheDocument()
    })

    // Verify form data is still there
    const nameInput = screen.getByTestId('name-input') as HTMLInputElement
    expect(nameInput.value).toBe(formData.name)
  })
})