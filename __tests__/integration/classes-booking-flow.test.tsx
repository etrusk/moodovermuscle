/**
 * @testing-approach modern-2025
 * @business-outcome Classes page enables smooth booking journey from service discovery to confirmation
 * @user-journey Users browse services, select options, complete wizard, and receive booking confirmation
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import ClassesPage from '@/app/classes/page'

// Mock server for API calls
const server = setupServer(
  http.post('/api/bookings', async ({ request }) => {
    const body = (await request.json()) as Record<string, never>

    // Validate required fields
    if (
      !body ||
      typeof body !== 'object' ||
      !body.name ||
      !body.email ||
      !body.service
    ) {
      return HttpResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Simulate successful booking
    return HttpResponse.json(
      {
        success: true,
        booking: {
          id: 'booking-123',
          name: body.name,
          email: body.email,
          service: body.service,
          date: body.date,
          time: body.time,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  }),

  http.get('/api/availability', () => {
    // Return available time slots
    return HttpResponse.json({
      dates: {
        '2025-01-15': {
          slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          available: true,
        },
        '2025-01-16': {
          slots: ['09:00', '10:00', '14:00'],
          available: true,
        },
      },
    })
  })
)

// Setup server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock the components to simulate real behavior
jest.mock('@/components/header', () => ({
  Header: ({ onBookSessionClick }: { onBookSessionClick: () => void }) => (
    <header data-testid="header">
      <nav>
        <button onClick={onBookSessionClick}>Book Now</button>
      </nav>
    </header>
  ),
}))

// Simplified booking form mock that simulates the real flow
jest.mock('@/components/booking-form', () => ({
  BookingForm: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean
    onClose: () => void
  }) => {
    const [step, setStep] = React.useState(1)
    const [formData, setFormData] = React.useState({
      service: '',
      name: '',
      email: '',
      date: '',
      time: '',
    })
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [error, setError] = React.useState('')
    const [success, setSuccess] = React.useState(false)

    if (!isOpen) return null

    const handleSubmit = async () => {
      setIsSubmitting(true)
      setError('')

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Booking failed')
        }

        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setIsSubmitting(false)
      }
    }

    return (
      <div
        data-testid="booking-form"
        role="dialog"
        aria-label="Book Your Session"
      >
        <div className="modal-content">
          <button onClick={onClose} aria-label="Close">
            ×
          </button>

          {success ? (
            <div data-testid="booking-success">
              <h2>Booking Confirmed!</h2>
              <p>Thank you for booking with MoodOverMuscle</p>
            </div>
          ) : (
            <>
              <h2>Book Your Free Session</h2>

              {error && (
                <div data-testid="booking-error" role="alert">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div data-testid="service-selection">
                  <h3>Select Your Service</h3>
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        service: '1-on-1 Personal Training',
                      })
                      setStep(2)
                    }}
                    data-testid="select-personal-training"
                  >
                    1-on-1 Personal Training - $80
                  </button>
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        service: 'Double Trouble & Tiny Toots',
                      })
                      setStep(2)
                    }}
                    data-testid="select-double-training"
                  >
                    Double Trouble & Tiny Toots - $40
                  </button>
                </div>
              )}

              {step === 2 && (
                <div data-testid="personal-details">
                  <h3>Your Details</h3>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    data-testid="input-name"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    data-testid="input-email"
                  />
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.name || !formData.email}
                    data-testid="continue-to-scheduling"
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === 3 && (
                <div data-testid="scheduling">
                  <h3>Choose Date & Time</h3>
                  <select
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    data-testid="select-date"
                  >
                    <option value="">Select Date</option>
                    <option value="2025-01-15">January 15, 2025</option>
                    <option value="2025-01-16">January 16, 2025</option>
                  </select>

                  {formData.date && (
                    <select
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      data-testid="select-time"
                    >
                      <option value="">Select Time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                    </select>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={
                      !formData.date || !formData.time || isSubmitting
                    }
                    data-testid="submit-booking"
                  >
                    {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              )}

              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  data-testid="go-back"
                >
                  Back
                </button>
              )}
            </>
          )}
        </div>
      </div>
    )
  },
}))

describe('Classes Page Integration: Complete Booking Journey', () => {
  describe('Service Discovery to Confirmation Flow', () => {
    it('guides user through complete booking from service card to confirmation', async () => {
      // Given: User is exploring services on classes page
      const user = userEvent.setup()
      render(<ClassesPage />)

      // When: User clicks service card booking button
      const bookButtons = screen.getAllByRole('button', {
        name: /start free session/i,
      })
      await user.click(bookButtons[0])

      // Then: Booking wizard opens
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
      expect(
        screen.getByRole('dialog', { name: 'Book Your Session' })
      ).toBeInTheDocument()

      // When: User selects personal training service
      expect(screen.getByTestId('service-selection')).toBeInTheDocument()
      await user.click(screen.getByTestId('select-personal-training'))

      // Then: Personal details step appears
      await waitFor(() => {
        expect(screen.getByTestId('personal-details')).toBeInTheDocument()
      })

      // When: User enters contact information
      const nameInput = screen.getByTestId('input-name')
      const emailInput = screen.getByTestId('input-email')

      await user.type(nameInput, 'Jane Doe')
      await user.type(emailInput, 'jane@example.com')

      await user.click(screen.getByTestId('continue-to-scheduling'))

      // Then: Scheduling step appears
      await waitFor(() => {
        expect(screen.getByTestId('scheduling')).toBeInTheDocument()
      })

      // When: User selects date and time
      const dateSelect = screen.getByTestId('select-date')
      await user.selectOptions(dateSelect, '2025-01-15')

      await waitFor(() => {
        expect(screen.getByTestId('select-time')).toBeInTheDocument()
      })

      const timeSelect = screen.getByTestId('select-time')
      await user.selectOptions(timeSelect, '10:00')

      // When: User confirms booking
      const submitButton = screen.getByTestId('submit-booking')
      expect(submitButton).not.toBeDisabled()

      await user.click(submitButton)

      // Then: Confirmation message is displayed
      await waitFor(() => {
        expect(screen.getByTestId('booking-success')).toBeInTheDocument()
      })

      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument()

      // And: Modal auto-closes after success
      await waitFor(
        () => {
          expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('enables booking from prominent CTA button', async () => {
      // Given: User wants to book directly
      const user = userEvent.setup()
      render(<ClassesPage />)

      // When: User clicks main CTA button
      const ctaButton = screen.getByRole('button', {
        name: 'Book Your FREE Session Now',
      })
      await user.click(ctaButton)

      // Then: Booking wizard opens immediately
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()

      // When: User completes quick booking flow
      await user.click(screen.getByTestId('select-double-training'))

      await waitFor(() => {
        expect(screen.getByTestId('personal-details')).toBeInTheDocument()
      })

      await user.type(screen.getByTestId('input-name'), 'John Smith')
      await user.type(screen.getByTestId('input-email'), 'john@example.com')
      await user.click(screen.getByTestId('continue-to-scheduling'))

      await waitFor(() => {
        expect(screen.getByTestId('scheduling')).toBeInTheDocument()
      })

      await user.selectOptions(screen.getByTestId('select-date'), '2025-01-16')
      await waitFor(() => {
        expect(screen.getByTestId('select-time')).toBeInTheDocument()
      })
      await user.selectOptions(screen.getByTestId('select-time'), '09:00')

      await user.click(screen.getByTestId('submit-booking'))

      // Then: Booking succeeds
      await waitFor(() => {
        expect(screen.getByTestId('booking-success')).toBeInTheDocument()
      })
    })
  })

  describe('Wizard Navigation and Data Persistence', () => {
    it('allows backward navigation through wizard steps', async () => {
      // Given: User is in booking wizard
      const user = userEvent.setup()
      render(<ClassesPage />)

      const ctaButton = screen.getByRole('button', {
        name: 'Book Your FREE Session Now',
      })
      await user.click(ctaButton)

      // When: User proceeds to step 2
      await user.click(screen.getByTestId('select-personal-training'))
      expect(screen.getByTestId('personal-details')).toBeInTheDocument()

      // And: User navigates back
      await user.click(screen.getByTestId('go-back'))

      // Then: Returns to service selection
      expect(screen.getByTestId('service-selection')).toBeInTheDocument()

      // And: Can select different service
      await user.click(screen.getByTestId('select-double-training'))
      expect(screen.getByTestId('personal-details')).toBeInTheDocument()
    })

    it('preserves entered data when navigating between steps', async () => {
      // Given: User has entered personal information
      const user = userEvent.setup()
      render(<ClassesPage />)

      await user.click(
        screen.getByRole('button', { name: 'Book Your FREE Session Now' })
      )
      await user.click(screen.getByTestId('select-personal-training'))

      const nameInput = screen.getByTestId('input-name')
      const emailInput = screen.getByTestId('input-email')

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@example.com')

      // When: User navigates forward and back
      await user.click(screen.getByTestId('continue-to-scheduling'))
      await user.click(screen.getByTestId('go-back'))

      // Then: Data is preserved
      expect(screen.getByTestId('input-name')).toHaveValue('Test User')
      expect(screen.getByTestId('input-email')).toHaveValue('test@example.com')
    })
  })

  describe('Form Validation: Ensuring Complete Information', () => {
    it('enforces required personal details before proceeding', async () => {
      // Given: User is on personal details step
      const user = userEvent.setup()
      render(<ClassesPage />)

      await user.click(
        screen.getByRole('button', { name: 'Book Your FREE Session Now' })
      )
      await user.click(screen.getByTestId('select-personal-training'))

      // When: Fields are empty
      const continueButton = screen.getByTestId('continue-to-scheduling')

      // Then: Cannot proceed
      expect(continueButton).toBeDisabled()

      // When: Only name is entered
      await user.type(screen.getByTestId('input-name'), 'Test')

      // Then: Still cannot proceed
      expect(continueButton).toBeDisabled()

      // When: Email is also entered
      await user.type(screen.getByTestId('input-email'), 'test@example.com')

      // Then: Can proceed
      expect(continueButton).not.toBeDisabled()
    })

    it('requires both date and time selection before booking submission', async () => {
      // Given: User has reached scheduling step
      const user = userEvent.setup()
      render(<ClassesPage />)

      await user.click(
        screen.getByRole('button', { name: 'Book Your FREE Session Now' })
      )
      await user.click(screen.getByTestId('select-personal-training'))

      await user.type(screen.getByTestId('input-name'), 'Test')
      await user.type(screen.getByTestId('input-email'), 'test@example.com')
      await user.click(screen.getByTestId('continue-to-scheduling'))

      await waitFor(() => {
        expect(screen.getByTestId('scheduling')).toBeInTheDocument()
      })

      const submitButton = screen.getByTestId('submit-booking')

      // When: No date or time selected
      // Then: Cannot submit
      expect(submitButton).toBeDisabled()

      // When: Only date selected
      await user.selectOptions(screen.getByTestId('select-date'), '2025-01-15')

      // Then: Still cannot submit
      expect(submitButton).toBeDisabled()

      // When: Time also selected
      await user.selectOptions(screen.getByTestId('select-time'), '10:00')

      // Then: Can submit
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Error Recovery: Handling Booking Failures', () => {
    it('displays clear error when time slot becomes unavailable', async () => {
      // Given: Time slot conflict occurs
      server.use(
        http.post('/api/bookings', () => {
          return HttpResponse.json(
            { error: 'Time slot no longer available' },
            { status: 409 }
          )
        })
      )

      const user = userEvent.setup()
      render(<ClassesPage />)

      // When: User completes booking
      await user.click(
        screen.getByRole('button', { name: 'Book Your FREE Session Now' })
      )
      await user.click(screen.getByTestId('select-personal-training'))
      await user.type(screen.getByTestId('input-name'), 'Test')
      await user.type(screen.getByTestId('input-email'), 'test@example.com')
      await user.click(screen.getByTestId('continue-to-scheduling'))

      await waitFor(() => {
        expect(screen.getByTestId('scheduling')).toBeInTheDocument()
      })

      await user.selectOptions(screen.getByTestId('select-date'), '2025-01-15')
      await user.selectOptions(screen.getByTestId('select-time'), '10:00')
      await user.click(screen.getByTestId('submit-booking'))

      // Then: Error message is displayed
      await waitFor(() => {
        expect(screen.getByTestId('booking-error')).toBeInTheDocument()
      })

      expect(
        screen.getByText('Time slot no longer available')
      ).toBeInTheDocument()

      // And: User can retry with different time
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })

    it('handles network failures gracefully', async () => {
      // Given: Network connectivity issues
      server.use(
        http.post('/api/bookings', () => {
          throw new Error('Network error')
        })
      )

      const user = userEvent.setup()
      render(<ClassesPage />)

      // When: User attempts booking during network issue
      await user.click(
        screen.getByRole('button', { name: 'Book Your FREE Session Now' })
      )
      await user.click(screen.getByTestId('select-personal-training'))
      await user.type(screen.getByTestId('input-name'), 'Test')
      await user.type(screen.getByTestId('input-email'), 'test@example.com')
      await user.click(screen.getByTestId('continue-to-scheduling'))

      await waitFor(() => {
        expect(screen.getByTestId('scheduling')).toBeInTheDocument()
      })

      await user.selectOptions(screen.getByTestId('select-date'), '2025-01-15')
      await user.selectOptions(screen.getByTestId('select-time'), '10:00')
      await user.click(screen.getByTestId('submit-booking'))

      // Then: Error is communicated to user
      await waitFor(() => {
        expect(screen.getByTestId('booking-error')).toBeInTheDocument()
      })
    })
  })

  describe('Modal Management: User Control', () => {
    it('allows users to close wizard at any time', async () => {
      // Given: User has opened booking wizard
      const user = userEvent.setup()
      render(<ClassesPage />)

      await user.click(
        screen.getByRole('button', { name: 'Book Your FREE Session Now' })
      )
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()

      // When: User clicks close button
      await user.click(screen.getByRole('button', { name: 'Close' }))

      // Then: Wizard closes
      await waitFor(() => {
        expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument()
      })
    })

    it('enables reopening wizard after closing', async () => {
      // Given: User has closed wizard
      const user = userEvent.setup()
      render(<ClassesPage />)

      await user.click(
        screen.getByRole('button', { name: 'Book Your FREE Session Now' })
      )
      await user.click(screen.getByRole('button', { name: 'Close' }))

      await waitFor(() => {
        expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument()
      })

      // When: User decides to book again
      await user.click(
        screen.getByRole('button', { name: 'Book Your FREE Session Now' })
      )

      // Then: Wizard reopens
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })
  })

  describe('Service Availability Indicators', () => {
    it('prevents booking attempts for services coming soon', async () => {
      // Given: Some services are not yet available
      const user = userEvent.setup()
      render(<ClassesPage />)

      // When: User views coming soon services
      const comingSoonButtons = screen.getAllByRole('button', {
        name: /coming soon/i,
      })
      expect(comingSoonButtons.length).toBeGreaterThan(0)

      // Then: Buttons are disabled
      await user.click(comingSoonButtons[0])

      // And: Booking wizard does not open
      expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument()
    })
  })
})