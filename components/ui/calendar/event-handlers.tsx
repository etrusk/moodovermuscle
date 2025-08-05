export const createCalendarEventHandlers = (
  currentDay: number,
  onMonthChange?: (date: Date) => void,
  onDayMouseEnter?: (day: Date) => void
): {
  handleDayMouseEnter: (day: Date) => void
  handleMonthChange: (date: Date) => void
} => ({
  handleDayMouseEnter: (day: Date): void => {
    if (onDayMouseEnter) {
      onDayMouseEnter(day)
    }
  },

  handleMonthChange: (date: Date): void => {
    if (onMonthChange) {
      onMonthChange(new Date(date.getFullYear(), date.getMonth(), currentDay))
    }
  },
})
