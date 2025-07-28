import { z } from "zod";

export const bookingSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  service: z.string({ required_error: "Please select a service." }),
  date: z.string({ required_error: "Please select a date." }),
  time: z.string({ required_error: "Please select a time." }),
  message: z.string().max(500, { message: "Message must be less than 500 characters." }).optional(),
  goals: z.string({ required_error: "Please select a goal." }),
  experience: z.string().optional(),
});