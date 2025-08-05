'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { CalendarNavigation } from './calendar/navigation'
import { getCalendarStyles } from './calendar/styles'
import { createCalendarEventHandlers } from './calendar/event-handlers'

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onDayMouseEnter?: (day: Date) => void
}

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  onMonthChange,
  onDayMouseEnter,
  ...props
}: CalendarProps): React.ReactElement {
  const currentDay = new Date().getDate()

  const eventHandlers = createCalendarEventHandlers(
    currentDay,
    onMonthChange,
    onDayMouseEnter
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={getCalendarStyles(classNames)}
      components={{
        Chevron: CalendarNavigation.Chevron,
      }}
      onMonthChange={eventHandlers.handleMonthChange}
      onDayMouseEnter={eventHandlers.handleDayMouseEnter}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
