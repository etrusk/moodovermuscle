import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Calendar } from '@/components/ui/calendar'

describe('Calendar Component Integration Tests', () => {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  it('renders calendar and navigation buttons', () => {
    render(<Calendar mode="single" selected={undefined} onDayClick={() => {}} />)
    const prevButton = screen.getByTestId('calendar-prev-button')
    const nextButton = screen.getByTestId('calendar-next-button')
    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })

  it('calls onSelect when a valid date is clicked', async () => {
    const user = userEvent.setup()
    const onDayClick = jest.fn()
    render(<Calendar mode="single" selected={undefined} onDayClick={onDayClick} />)
    const dateCells = screen.getAllByRole('gridcell', {
      name: tomorrow.getDate().toString(),
    })
    const dateCell = dateCells.find(cell => !cell.getAttribute('data-outside'))
    if (!dateCell) throw new Error('Valid date cell not found')
    const button = dateCell.querySelector('button')
    if (!button) throw new Error('Date button not found')
    await user.click(button)
    expect(onDayClick).toHaveBeenCalled()
  })

  it('does not call onSelect for disabled dates', async () => {
    const user = userEvent.setup()
    const onDayClick = jest.fn()
    render(
      <Calendar
        mode="single"
        selected={undefined}
        onDayClick={onDayClick}
        disabled={[today]}
      />
    )
    const disabledCells = screen.getAllByRole('gridcell', {
      name: today.getDate().toString(),
    })
    const disabledDate = disabledCells.find(
      cell => !cell.getAttribute('data-outside')
    )
    if (!disabledDate) throw new Error('Disabled date cell not found')
    const disabledButton = disabledDate.querySelector('button')
    if (!disabledButton) throw new Error('Disabled date button not found')
    await user.click(disabledButton)
    expect(onDayClick).not.toHaveBeenCalled()
  })

  it('navigates months when prev and next clicked', async () => {
    const user = userEvent.setup()
    const onMonthChange = jest.fn()
    render(
      <Calendar
        mode="single"
        selected={undefined}
        onDayClick={() => {}}
        onMonthChange={onMonthChange}
      />
    )
    const nextButton = screen.getByTestId('calendar-next-button')
    await user.click(nextButton)
    expect(onMonthChange).toHaveBeenCalled()
    const prevButton = screen.getByTestId('calendar-prev-button')
    await user.click(prevButton)
    expect(onMonthChange).toHaveBeenCalledTimes(2)
  })
})
