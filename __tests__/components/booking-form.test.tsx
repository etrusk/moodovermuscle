import React from 'react'
import { render, screen, waitFor } from '@/__tests__/setup/test-utils'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { BookingForm } from '@/components/booking-form'
import { TEST_STRINGS } from '@/__tests__/constants/test-strings'
import '@testing-library/jest-dom'
// Temporarily disabled MSW imports
// import { server } from '@/__tests__/setup/server'
// import { http, HttpResponse } from 'msw'

describe('BookingForm Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  test('renders when isOpen is true and has no accessibility violations', async () => {
    const { container } = render(
      <BookingForm isOpen={true} onClose={mockOnClose} />
    )

    expect(
      screen.getByText(TEST_STRINGS.BOOKING.FORM_TITLE)
    ).toBeInTheDocument()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('does not render when isOpen is false', () => {
    render(<BookingForm isOpen={false} onClose={mockOnClose} />)

    expect(
      screen.queryByText(TEST_STRINGS.BOOKING.FORM_TITLE)
    ).not.toBeInTheDocument()
  })

  test('submits form successfully and closes', async () => {
    // Mock successful API response
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
    Object.defineProperty(window, 'fetch', {
      writable: true,
      value: mockFetch,
    })

    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Step 1: Fill personal info
    await user.type(screen.getByLabelText(TEST_STRINGS.LABELS.NAME), 'John Doe')
    await user.type(
      screen.getByLabelText(TEST_STRINGS.LABELS.EMAIL),
      'john.doe@example.com'
    )
    await user.type(
      screen.getByLabelText(TEST_STRINGS.LABELS.PHONE),
      '0412345678'
    )

    // Select a goal
    const goalSelect = screen.getByDisplayValue('Choose your goal...')
    await user.selectOptions(goalSelect, 'weight-loss')

    // Continue to step 2
    await user.click(screen.getByText(TEST_STRINGS.BUTTONS.CONTINUE))

    // Step 2: Select service
    await waitFor(() => {
      expect(
        screen.getByText(/What Would You Like to Try/i)
      ).toBeInTheDocument()
    })

    await user.click(screen.getByText(/1-on-1 Personal Training/i))

    // Continue to step 3
    await user.click(screen.getByText(TEST_STRINGS.BUTTONS.CONTINUE))

    // Step 3: Fill date/time and submit
    await waitFor(() => {
      expect(screen.getByText(TEST_STRINGS.BUTTONS.SUBMIT)).toBeInTheDocument()
    })

    // Fill required date and time
    const dateInput = screen.getByLabelText(/Preferred Date/i)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    await user.type(dateInput, tomorrow.toISOString().split('T')[0])

    const timeSelect = screen.getByDisplayValue('Select time...')
    await user.selectOptions(timeSelect, '9:00 AM')

    // Submit
    await user.click(screen.getByText(TEST_STRINGS.BUTTONS.SUBMIT))

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  // Temporarily disabled MSW test
  // test('handles API submission error', async () => {
  //   server.use(
  //     http.post('/api/book-session', () => {
  //       return new HttpResponse(null, { status: 500 })
  //     })
  //   )

  //   const user = userEvent.setup()
  //   render(<BookingForm isOpen={true} onClose={mockOnClose} />)

  //   // Fill form
  //   await user.type(
  //     screen.getByLabelText(TEST_STRINGS.LABELS.NAME),
  //     'John Doe'
  //   )
  //   await user.type(
  //     screen.getByLabelText(TEST_STRINGS.LABELS.EMAIL),
  //     'fail@example.com'
  //   )
  //   await user.click(screen.getByText(TEST_STRINGS.BOOKING.CTA_BUTTON))

  //   // Submit
  //   await user.click(screen.getByText(/submit/i))

  //   await waitFor(() => {
  //     expect(mockOnClose).not.toHaveBeenCalled()
  //   })
  // })
})
