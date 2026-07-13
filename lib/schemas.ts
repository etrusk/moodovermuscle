import { z } from 'zod'

export const bookingSchema = z.object({
  name: z.string({ error: 'Name is required.' }).min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string({ error: 'Email is required.' }).min(1, { message: 'Email is required.' }).email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional().refine((val) => val === undefined || val.length >= 10, { message: 'Please enter a valid phone number.' }),
  service: z.enum(['1-on-1 Personal Training'], { error: 'Please select a valid service.' }),
  // No server-side past/future bound on `date`, deliberately. The Postgres
  // `booking_future_date_check` CHECK was dropped (migration 20251012042622) because it also fires
  // on UPDATE and blocked legit status changes (e.g. cancelling) on past bookings. The app-layer
  // replacement was never built, so any real date passes here — the only past-date guard is the
  // booking form's client-side <input min> (cosmetic, bypassable via the API). If you add a bound,
  // do it on the create path only, not on this shared schema. (Full history in git.)
  date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg)
      return date
    }
  }, z.date({ error: 'Please select a date.' }).refine((date) => !isNaN(date.getTime()), { message: 'Please select a valid date.' })),
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
