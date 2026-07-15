import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { bookingsForCalendarDay } from '@/app/admin/calendar/bookingDayFilter'

// Regression test for the admin calendar showing no bookings.
//
// The admin bookings API returns `date` as a full ISO string (Prisma `DateTime`,
// e.g. "2025-08-11T00:00:00.000Z"). The old code compared `booking.date` against
// `cellDate.toISOString().split('T')[0]` (a date-only string) — full-ISO never
// equals date-only, so no day was ever matched: no day colours, empty detail
// panel. The existing calendar tests hid this by mocking `date` as date-only.
//
// The match is asymmetric on purpose: a booking is stored as UTC midnight of the
// selected day (read via UTC parts), while a react-day-picker grid cell is
// *local* midnight of the day it represents (read via local parts).
describe('bookingsForCalendarDay', () => {
  const originalTZ = process.env.TZ
  beforeAll(() => {
    process.env.TZ = 'Australia/Sydney' // UTC+10 — where the shift is visible
  })
  afterAll(() => {
    process.env.TZ = originalTZ
  })

  // Real API shape: full ISO strings from Prisma DateTime, parsed to Date (as the
  // component does via `new Date(booking.date)`).
  const booking = (id: string, iso: string) => ({ id, dateObj: new Date(iso) })

  const bookings = [
    booking('a', '2025-08-11T00:00:00.000Z'),
    booking('b', '2025-08-11T00:00:00.000Z'),
    booking('c', '2025-08-12T00:00:00.000Z'),
  ]

  it('matches bookings whose stored UTC-midnight day equals the local grid cell day', () => {
    const cell = new Date(2025, 7, 11) // local midnight, 11 Aug (react-day-picker cell)
    const result = bookingsForCalendarDay(bookings, cell)
    expect(result.map(b => b.id)).toEqual(['a', 'b'])
  })

  it('does not match the adjacent day', () => {
    const cell = new Date(2025, 7, 12) // 12 Aug
    expect(bookingsForCalendarDay(bookings, cell).map(b => b.id)).toEqual(['c'])
  })

  it('returns nothing for a day with no bookings', () => {
    const cell = new Date(2025, 7, 13)
    expect(bookingsForCalendarDay(bookings, cell)).toEqual([])
  })
})
