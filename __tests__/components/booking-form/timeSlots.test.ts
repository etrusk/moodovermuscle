import { describe, it, expect } from 'vitest'
import { timeSlots } from '@/components/booking-form/steps/timeSlots'

// Postgres enforces booking_business_hours_check on "Booking"."time":
//   time ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$' AND time >= '07:00' AND time <= '19:00'
// A slot offered outside that window reaches tx.booking.create and fails the
// check constraint, which surfaces to the customer as a 500, not a 409.
const BUSINESS_HOURS_START = '07:00'
const BUSINESS_HOURS_END = '19:00'

describe('timeSlots', () => {
  it('only offers slots the database will accept', () => {
    const rejected = timeSlots.filter(
      (slot) => slot < BUSINESS_HOURS_START || slot > BUSINESS_HOURS_END
    )

    expect(rejected).toEqual([])
  })

  it('uses 24-hour HH:MM format', () => {
    const malformed = timeSlots.filter(
      (slot) => !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot)
    )

    expect(malformed).toEqual([])
  })
})
