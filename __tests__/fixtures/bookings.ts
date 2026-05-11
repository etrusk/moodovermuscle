export type MockBookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export interface MockBooking {
  id: string
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  duration: number
  status: MockBookingStatus
  goals?: string
  experience: string
  message?: string
  location?: string
  createdAt: string
  updatedAt: string
}

interface MockBookingsOptions {
  lisaDate?: string
}

export const buildMockBookings = (
  { lisaDate = '2025-08-09' }: MockBookingsOptions = {}
): MockBooking[] => [
  {
    id: 'booking-1',
    name: 'Sarah Miller',
    email: 'sarah@example.com',
    phone: '+61 400 123 456',
    service: 'Personal Training',
    date: '2025-08-10',
    time: '10:00:00',
    duration: 60,
    status: 'PENDING',
    goals: 'Lose weight and build strength',
    experience: 'Beginner',
    message: 'Looking forward to the session!',
    location: 'Home Gym',
    createdAt: '2025-08-08T02:00:00Z',
    updatedAt: '2025-08-08T02:00:00Z',
  },
  {
    id: 'booking-2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+61 400 987 654',
    service: 'Group Class',
    date: '2025-08-10',
    time: '14:30:00',
    duration: 45,
    status: 'CONFIRMED',
    goals: 'Improve fitness',
    experience: 'Intermediate',
    createdAt: '2025-08-07T15:30:00Z',
    updatedAt: '2025-08-07T16:00:00Z',
  },
  {
    id: 'booking-3',
    name: 'Lisa Chen',
    email: 'lisa@example.com',
    phone: '+61 400 555 111',
    service: 'Mums & Bubs Class',
    date: lisaDate,
    time: '09:00:00',
    duration: 60,
    status: 'COMPLETED',
    experience: 'Beginner',
    createdAt: '2025-08-05T10:00:00Z',
    updatedAt: '2025-08-09T10:00:00Z',
  },
  {
    id: 'booking-4',
    name: 'Tom Wilson',
    email: 'tom@example.com',
    phone: '+61 400 777 888',
    service: 'Personal Training',
    date: '2025-08-12',
    time: '16:00:00',
    duration: 60,
    status: 'CANCELLED',
    goals: 'Rehabilitation',
    experience: 'Advanced',
    message: 'Need to reschedule due to injury',
    createdAt: '2025-08-06T12:00:00Z',
    updatedAt: '2025-08-08T01:00:00Z',
  },
]
