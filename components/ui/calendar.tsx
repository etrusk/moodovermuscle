'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

// Import react-day-picker styles to ensure proper base styling
import 'react-day-picker/dist/style.css'

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onDayMouseEnter?: (day: Date) => void
}

const getCalendarClassNames = (customClassNames?: Record<string, string>) => ({
  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
  month: 'space-y-4',
  caption: 'flex justify-center pt-1 relative items-center',
  caption_label: 'text-sm font-medium',
  nav: 'space-x-1 flex items-center',
  nav_button: cn(
    buttonVariants({ variant: 'outline' }),
    'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
  ),
  nav_button_previous: 'absolute left-1',
  nav_button_next: 'absolute right-1',
  table: 'w-full border-separate border-spacing-0 border border-border rounded-md',
  head_row: '',
  head_cell: 'text-muted-foreground font-normal text-[0.8rem] p-2 text-center border-b border-border w-[14.28%] h-10',
  row: '',
  cell: 'text-center text-sm p-0 relative border-b border-r border-border w-[14.28%] h-10 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
  day: cn(
    buttonVariants({ variant: 'ghost' }),
    'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
  ),
  day_range_end: 'day-range-end',
  day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
  day_today: 'bg-accent text-accent-foreground',
  day_outside: 'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
  day_disabled: 'text-muted-foreground opacity-50',
  day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
  day_hidden: 'invisible',
  ...customClassNames,
})

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onDayMouseEnter,
  ...props
}: CalendarProps): React.ReactElement {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={getCalendarClassNames(classNames)}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') {
            return <ChevronLeft className="h-4 w-4" />
          }
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      onDayMouseEnter={onDayMouseEnter}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

export { Calendar }
