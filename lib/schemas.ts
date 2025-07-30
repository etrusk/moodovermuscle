import { z } from 'zod'

export const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }).optional(),
  service: z.enum(
    ['1-on-1 Personal Training', 'Double Trouble & Tiny Toots', 'Small Mums & Bubs Classes'],
    { errorMap: () => ({ message: 'Please select a valid service.' }) }
  ),
  date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg)
      return date
    }
  }, z.date({ required_error: 'Please select a date.' }).refine((date) => !isNaN(date.getTime()), { message: 'Please select a valid date.' })),
  time: z.string({ required_error: 'Please select a time.' }).min(1, { message: 'Please select a time.' }),
  message: z
    .string()
    .max(500, { message: 'Message must be less than 500 characters.' })
    .optional(),
  goals: z.string({ required_error: 'Please select a goal.' }).min(1, { message: 'Please select a goal.' }),
  experience: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    required_error: 'Please select your experience level.',
  }).optional(),
})
