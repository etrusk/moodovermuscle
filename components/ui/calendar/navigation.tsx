import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ChevronProps {
  className?: string
  size?: number
  disabled?: boolean
  orientation?: 'left' | 'right' | 'up' | 'down'
}

export const CalendarNavigation = {
  Chevron: ({ orientation, ...props }: ChevronProps) => {
    if (orientation === 'left') {
      return (
        <ChevronLeft
          className="h-4 w-4"
          data-testid="calendar-prev-button"
          {...props}
        />
      )
    }
    return (
      <ChevronRight
        className="h-4 w-4"
        data-testid="calendar-next-button"
        {...props}
      />
    )
  },
}
