import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calendar } from '@/components/ui/calendar'
import { addMonths, format } from 'date-fns'

describe('Calendar Component Integration Tests', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  it('renders calendar and navigation buttons', () => {
    render(<Calendar mode="single" />)
    const prevButton = screen.getByRole('button', { name: /previous month/i })
    const nextButton = screen.getByRole('button', { name: /next month/i })
    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })

  it('calls onSelect when a valid date is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    render(<Calendar mode="single" onSelect={onSelect} />)

    const dateCell = screen.getByRole('gridcell', {
      name: format(tomorrow, 'd'),
    })
    const dateButton = dateCell.querySelector('button')
    if (!dateButton) throw new Error('Date button not found')
    await user.click(dateButton)

    expect(onSelect).toHaveBeenCalled()
    const selectedDate = onSelect.mock.calls[0][0]
    expect(selectedDate.toDateString()).toBe(tomorrow.toDateString())
  })

  it('does not call onSelect for disabled dates', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    render(<Calendar mode="single" onSelect={onSelect} disabled={[today]} />)

    const disabledCell = screen.getByRole('gridcell', {
      name: format(today, 'd'),
    })
    const disabledButton = disabledCell.querySelector('button')
    if (!disabledButton) throw new Error('Disabled date button not found')

    expect(disabledButton).toBeDisabled()
    await user.click(disabledButton)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('navigates months when prev and next clicked', async () => {
    const user = userEvent.setup()
    const onMonthChange = jest.fn()
    render(<Calendar mode="single" onMonthChange={onMonthChange} />)

    const nextButton = screen.getByRole('button', { name: /next month/i })
    await user.click(nextButton)

    const nextMonth = addMonths(today, 1)
    expect(onMonthChange).toHaveBeenCalledWith(nextMonth)

    const prevButton = screen.getByRole('button', { name: /previous month/i })
    await user.click(prevButton)
    expect(onMonthChange).toHaveBeenCalledWith(today)
    expect(onMonthChange).toHaveBeenCalledTimes(2)
  })
})
