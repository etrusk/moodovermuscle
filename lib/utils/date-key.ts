/**
 * Format a Date as a `YYYY-MM-DD` calendar-day key using its *local* parts.
 *
 * The booking form represents a chosen day as local midnight
 * (`new Date('YYYY-MM-DDT00:00:00')`). Using `.toISOString()` to derive the key
 * or request payload converts to UTC, which shifts the calendar day for any
 * positive-UTC-offset timezone (e.g. Australia/Sydney) — the off-by-one booking
 * bug. Reading the local calendar parts keeps the day the user actually picked.
 *
 * The server then parses this string as `new Date('YYYY-MM-DD')` (UTC midnight),
 * so storage and availability queries all agree on the same calendar day.
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format a Date as a `YYYY-MM-DD` calendar-day key using its *UTC* parts.
 *
 * Bookings are stored as UTC midnight of the selected day (the server parses the
 * `YYYY-MM-DD` payload with `new Date(...)`). To recover which calendar day a
 * stored booking belongs to — independent of the viewer's timezone — read its
 * UTC parts. Pair with `toDateKey` for values that represent a *local* midnight
 * (e.g. react-day-picker grid cells).
 */
export function utcDateKey(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
