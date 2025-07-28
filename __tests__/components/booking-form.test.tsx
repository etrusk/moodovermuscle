import React from 'react'
import { render, screen, waitFor } from '@/__tests__/setup/test-utils'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { BookingForm } from '@/components/booking-form'
import { TEST_STRINGS } from '@/__tests__/constants/test-strings'
import '@testing-library/jest-dom'
import { server } from '@/__tests__/setup/server'
import { http, HttpResponse } from 'msw'

describe('BookingForm Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  test('renders when isOpen is true and has no accessibility violations', async () => {
    const { container } = render(
      <BookingForm isOpen={true} onClose={mockOnClose} />
    )

    expect(screen.getByText(TEST_STRINGS.BOOKING.FORM_TITLE)).toBeInTheDocument()
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
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Fill form
    await user.type(
      screen.getByLabelText(TEST_STRINGS.LABELS.NAME),
      'John Doe'
    )
    await user.type(
      screen.getByLabelText(TEST_STRINGS.LABELS.EMAIL),
      'john.doe@example.com'
    )
    await user.click(screen.getByText(TEST_STRINGS.BOOKING.CTA_BUTTON))

    // Submit
    await user.click(screen.getByText(/submit/i))

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  test('handles API submission error', async () => {
    server.use(
      http.post('/api/book-session', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)

    // Fill form
    await user.type(
      screen.getByLabelText(TEST_STRINGS.LABELS.NAME),
      'John Doe'
    )
    await user.type(
      screen.getByLabelText(TEST_STRINGS.LABELS.EMAIL),
      'fail@example.com'
    )
    await user.click(screen.getByText(TEST_STRINGS.BOOKING.CTA_BUTTON))

    // Submit
    await user.click(screen.getByText(/submit/i))

    await waitFor(() => {
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })
})
