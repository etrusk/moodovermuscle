import { toDateKey, utcDateKey } from '@/lib/utils/date-key'

/**
 * Select the bookings that fall on a given calendar grid day.
 *
 * The match is deliberately asymmetric: a booking's `dateObj` is UTC midnight of
 * the selected day (read via UTC parts), while `cellDate` is a react-day-picker
 * grid cell built as *local* midnight (read via local parts). Comparing both as
 * `YYYY-MM-DD` keys makes the admin calendar agree with stored bookings
 * regardless of the viewer's timezone.
 */
export function bookingsForCalendarDay<T extends { dateObj: Date }>(
  bookings: T[],
  cellDate: Date
): T[] {
  const cellKey = toDateKey(cellDate)
  return bookings.filter(booking => utcDateKey(booking.dateObj) === cellKey)
}
