import { z } from 'zod'

// A booking `date` is "in the past" if it falls before the start of *yesterday* (UTC). The one-day
// grace is deliberate and is NOT a Brisbane/UTC+10 thing: the client builds the date with
// `new Date(dateValue + 'T00:00:00')` in the *browser's* timezone (unknown, up to ~14h either side
// of the server), so the same calendar-day selection can reach the server as instants ~24h apart.
// The grace guarantees a legitimate same-day booking from any client timezone is never rejected,
// while still blocking genuinely past dates. Do NOT "simplify" this to a strict start-of-today check.
function isBookingDateInPast(date: Date): boolean {
  const now = new Date()
  const startOfYesterdayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)
  return date.getTime() < startOfYesterdayUTC
}

export const bookingSchema = z.object({
  name: z.string({ error: 'Name is required.' }).min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string({ error: 'Email is required.' }).min(1, { message: 'Email is required.' }).email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional().refine((val) => val === undefined || val.length >= 10, { message: 'Please enter a valid phone number.' }),
  service: z.enum(['1-on-1 Personal Training'], { error: 'Please select a valid service.' }),
  // Booking `date` must not be in the past. Safe to enforce here *because* bookingSchema is
  // create-only — the booking form + POST /api/book-session. Admin status-updates
  // (PATCH /api/admin/bookings) do NOT use this schema, so this won't re-block the past-booking
  // status changes (e.g. cancelling) that forced the Postgres `booking_future_date_check` CHECK to
  // be dropped (migration 20251012042622). See isBookingDateInPast above for the timezone grace.
  date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg)
      return date
    }
  }, z.date({ error: 'Please select a date.' })
    .refine((date) => !isNaN(date.getTime()), { message: 'Please select a valid date.' })
    .refine((date) => !isBookingDateInPast(date), { message: 'Booking date cannot be in the past.' })),
  time: z.string({ error: 'Please select a time.' }).min(1, { message: 'Please select a time.' }),
  message: z
    .string()
    .max(500, { message: 'Message must be less than 500 characters.' })
    .optional(),
  goals: z.string({ error: 'Goal is required.' }).min(1, { message: 'Goal is required.' }),
  experience: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    error: 'Please select your experience level.',
  }).optional(),
})
