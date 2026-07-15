import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { toDateKey, utcDateKey } from '@/lib/utils/date-key'

// Regression test for the booking off-by-one bug.
//
// The booking form builds the selected date as *local* midnight
// (`new Date('YYYY-MM-DDT00:00:00')`, see DateSelector.tsx). The old code turned
// that into a `YYYY-MM-DD` key — and the request payload — via `.toISOString()`,
// which is UTC. For any positive-UTC-offset timezone (e.g. Australia/Sydney,
// UTC+10) local midnight is the *previous* day in UTC, so "22 Jul" was sent and
// stored as "21 Jul", and availability (which queried UTC-midnight of the raw
// string) then disagreed with what was stored.
//
// `toDateKey` must derive the key from the date's *local* calendar parts so the
// user's selected day survives regardless of timezone.
describe('toDateKey (timezone-safe booking calendar day)', () => {
  const originalTZ = process.env.TZ
  beforeAll(() => {
    process.env.TZ = 'Australia/Sydney' // UTC+10 — reproduces the shift
  })
  afterAll(() => {
    process.env.TZ = originalTZ
  })

  it('keeps the selected calendar day for a local-midnight date (no UTC shift)', () => {
    const selected = new Date('2026-07-22T00:00:00') // local (AEST) midnight

    // Documents the old bug: .toISOString() shifted the day back to the 21st.
    expect(selected.toISOString().split('T')[0]).toBe('2026-07-21')

    // The fix preserves the selected day.
    expect(toDateKey(selected)).toBe('2026-07-22')
  })

  it('zero-pads month and day', () => {
    expect(toDateKey(new Date('2026-03-05T00:00:00'))).toBe('2026-03-05')
    expect(toDateKey(new Date('2026-12-31T00:00:00'))).toBe('2026-12-31')
  })
})

// Bookings are stored as UTC midnight of the selected day; utcDateKey recovers
// that day from a stored instant regardless of the viewer's timezone (used by
// the admin calendar, where grid cells are local but bookings are UTC-midnight).
describe('utcDateKey (timezone-independent stored-booking day)', () => {
  const originalTZ = process.env.TZ
  beforeAll(() => {
    process.env.TZ = 'Australia/Sydney'
  })
  afterAll(() => {
    process.env.TZ = originalTZ
  })

  it('reads the UTC calendar day, not the local one', () => {
    // 23:00Z on the 11th is already the 12th in Sydney (UTC+10).
    const d = new Date('2025-08-11T23:00:00.000Z')
    expect(utcDateKey(d)).toBe('2025-08-11') // UTC day
    expect(toDateKey(d)).toBe('2025-08-12') // local (Sydney) day — contrast
  })

  it('returns the stored day for a canonical UTC-midnight booking', () => {
    expect(utcDateKey(new Date('2025-08-11T00:00:00.000Z'))).toBe('2025-08-11')
  })
})
