import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import ClassesPage from '@/app/classes/page'

// Mock server for API calls
const server = setupServer(
  http.post('/api/bookings', async ({ request }) => {
    const body = await request.json() as Record<string, any>
    
    // Validate required fields
    if (!body || typeof body !== 'object' || !body.name || !body.email || !body.service) {
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
        }
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
      }
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
  BookingForm: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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
      <div data-testid="booking-form" role="dialog" aria-label="Book Your Session">
        <div className="modal-content">
          <button onClick={onClose} aria-label="Close">×</button>
          
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
                      setFormData({ ...formData, service: '1-on-1 Personal Training' })
                      setStep(2)
                    }}
                    data-testid="select-personal-training"
                  >
                    1-on-1 Personal Training - $80
                  </button>
                  <button 
                    onClick={() => {
                      setFormData({ ...formData, service: 'Double Trouble & Tiny Toots' })
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-name"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    data-testid="select-date"
                  >
                    <option value="">Select Date</option>
                    <option value="2025-01-15">January 15, 2025</option>
                    <option value="2025-01-16">January 16, 2025</option>
                  </select>
                  
                  {formData.date && (
                    <select 
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                    disabled={!formData.date || !formData.time || isSubmitting}
                    data-testid="submit-booking"
                  >
                    {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              )}
              
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} data-testid="go-back">
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

describe('Classes Page - Booking Flow Integration', () => {
  describe('Complete Booking Flow', () => {
    it('allows user to complete full booking from service selection to confirmation', async () => {
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      // Step 1: Open booking modal from service card
      const bookButtons = screen.getAllByRole('button', { name: /start free session/i })
      await user.click(bookButtons[0])
      
      // Verify modal opened
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: 'Book Your Session' })).toBeInTheDocument()
      
      // Step 2: Select service
      expect(screen.getByTestId('service-selection')).toBeInTheDocument()
      await user.click(screen.getByTestId('select-personal-training'))
      
      // Step 3: Enter personal details
      await waitFor(() => {
        expect(screen.getByTestId('personal-details')).toBeInTheDocument()
      })
      
      const nameInput = screen.getByTestId('input-name')
      const emailInput = screen.getByTestId('input-email')
      
      await user.type(nameInput, 'Jane Doe')
      await user.type(emailInput, 'jane@example.com')
      
      await user.click(screen.getByTestId('continue-to-scheduling'))
      
      // Step 4: Schedule appointment
      await waitFor(() => {
        expect(screen.getByTestId('scheduling')).toBeInTheDocument()
      })
      
      const dateSelect = screen.getByTestId('select-date')
      await user.selectOptions(dateSelect, '2025-01-15')
      
      // Wait for time slots to appear
      await waitFor(() => {
        expect(screen.getByTestId('select-time')).toBeInTheDocument()
      })
      
      const timeSelect = screen.getByTestId('select-time')
      await user.selectOptions(timeSelect, '10:00')
      
      // Step 5: Submit booking
      const submitButton = screen.getByTestId('submit-booking')
      expect(submitButton).not.toBeDisabled()
      
      await user.click(submitButton)
      
      // Step 6: Verify success
      await waitFor(() => {
        expect(screen.getByTestId('booking-success')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument()
      
      // Modal should auto-close after success
      await waitFor(() => {
        expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('allows booking from CTA button', async () => {
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      // Click CTA button
      const ctaButton = screen.getByRole('button', { name: 'Book Your FREE Session Now' })
      await user.click(ctaButton)
      
      // Verify modal opened
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
      
      // Complete quick booking
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
      
      await waitFor(() => {
        expect(screen.getByTestId('booking-success')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Within Booking Flow', () => {
    it('allows user to go back to previous steps', async () => {
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      // Open modal
      const ctaButton = screen.getByRole('button', { name: 'Book Your FREE Session Now' })
      await user.click(ctaButton)
      
      // Go to step 2
      await user.click(screen.getByTestId('select-personal-training'))
      expect(screen.getByTestId('personal-details')).toBeInTheDocument()
      
      // Go back to step 1
      await user.click(screen.getByTestId('go-back'))
      expect(screen.getByTestId('service-selection')).toBeInTheDocument()
      
      // Select different service
      await user.click(screen.getByTestId('select-double-training'))
      expect(screen.getByTestId('personal-details')).toBeInTheDocument()
    })

    it('maintains form data when navigating between steps', async () => {
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      // Open and fill form
      await user.click(screen.getByRole('button', { name: 'Book Your FREE Session Now' }))
      await user.click(screen.getByTestId('select-personal-training'))
      
      const nameInput = screen.getByTestId('input-name')
      const emailInput = screen.getByTestId('input-email')
      
      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@example.com')
      
      // Go to next step
      await user.click(screen.getByTestId('continue-to-scheduling'))
      
      // Go back
      await user.click(screen.getByTestId('go-back'))
      
      // Data should be preserved
      expect(screen.getByTestId('input-name')).toHaveValue('Test User')
      expect(screen.getByTestId('input-email')).toHaveValue('test@example.com')
    })
  })

  describe('Form Validation', () => {
    it('prevents progression without required fields', async () => {
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      await user.click(screen.getByRole('button', { name: 'Book Your FREE Session Now' }))
      await user.click(screen.getByTestId('select-personal-training'))
      
      // Try to continue without filling fields
      const continueButton = screen.getByTestId('continue-to-scheduling')
      expect(continueButton).toBeDisabled()
      
      // Fill only name
      await user.type(screen.getByTestId('input-name'), 'Test')
      expect(continueButton).toBeDisabled()
      
      // Fill email too
      await user.type(screen.getByTestId('input-email'), 'test@example.com')
      expect(continueButton).not.toBeDisabled()
    })

    it('prevents submission without date and time', async () => {
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      await user.click(screen.getByRole('button', { name: 'Book Your FREE Session Now' }))
      await user.click(screen.getByTestId('select-personal-training'))
      
      await user.type(screen.getByTestId('input-name'), 'Test')
      await user.type(screen.getByTestId('input-email'), 'test@example.com')
      await user.click(screen.getByTestId('continue-to-scheduling'))
      
      await waitFor(() => {
        expect(screen.getByTestId('scheduling')).toBeInTheDocument()
      })
      
      const submitButton = screen.getByTestId('submit-booking')
      expect(submitButton).toBeDisabled()
      
      // Select date only
      await user.selectOptions(screen.getByTestId('select-date'), '2025-01-15')
      expect(submitButton).toBeDisabled()
      
      // Select time too
      await user.selectOptions(screen.getByTestId('select-time'), '10:00')
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('displays error when booking fails', async () => {
      // Override server handler to simulate failure
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
      
      // Complete form
      await user.click(screen.getByRole('button', { name: 'Book Your FREE Session Now' }))
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
      
      // Check for error message
      await waitFor(() => {
        expect(screen.getByTestId('booking-error')).toBeInTheDocument()
      })
      
      expect(screen.getByText('Time slot no longer available')).toBeInTheDocument()
      
      // Should stay on form for retry
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })

    it('handles network errors gracefully', async () => {
      // Simulate network error
      server.use(
        http.post('/api/bookings', () => {
          throw new Error('Network error')
        })
      )
      
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      // Complete form
      await user.click(screen.getByRole('button', { name: 'Book Your FREE Session Now' }))
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
      
      // Should show error
      await waitFor(() => {
        expect(screen.getByTestId('booking-error')).toBeInTheDocument()
      })
    })
  })

  describe('Modal Management', () => {
    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      await user.click(screen.getByRole('button', { name: 'Book Your FREE Session Now' }))
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
      
      await user.click(screen.getByRole('button', { name: 'Close' }))
      
      await waitFor(() => {
        expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument()
      })
    })

    it('can reopen modal after closing', async () => {
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      // Open and close
      await user.click(screen.getByRole('button', { name: 'Book Your FREE Session Now' }))
      await user.click(screen.getByRole('button', { name: 'Close' }))
      
      await waitFor(() => {
        expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument()
      })
      
      // Reopen
      await user.click(screen.getByRole('button', { name: 'Book Your FREE Session Now' }))
      expect(screen.getByTestId('booking-form')).toBeInTheDocument()
    })
  })

  describe('Coming Soon Services', () => {
    it('does not open booking modal for coming soon services', async () => {
      const user = userEvent.setup()
      render(<ClassesPage />)
      
      // Coming soon buttons should be disabled
      const comingSoonButtons = screen.getAllByRole('button', { name: /coming soon/i })
      expect(comingSoonButtons.length).toBeGreaterThan(0)
      
      // Try to click disabled button
      await user.click(comingSoonButtons[0])
      
      // Modal should not open
      expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument()
    })
  })
})