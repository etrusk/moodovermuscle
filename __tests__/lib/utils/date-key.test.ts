import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { toDateKey } from '@/lib/utils/date-key'

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
