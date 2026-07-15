#!/usr/bin/env node
/**
 * One-time data fix: normalize Booking.date to canonical UTC midnight.
 *
 * WHY: before the timezone fix, the booking form sent the selected day as a UTC
 * *instant* of local midnight (e.g. AEST midnight -> `…T14:00:00Z`, the previous
 * calendar day). After the fix, bookings store canonical `…T00:00:00Z`. The
 * availability check is an exact-match on `date`, and `@@unique([date,time])`
 * only collides on identical instants — so an old shifted row and a new
 * canonical row for the *same* calendar day neither match nor collide, opening a
 * double-booking window until the old rows are normalized.
 *
 * STRATEGY: round each stored `date` to the nearest UTC midnight. `date` only
 * ever encodes a day (the clock time lives in the `time` column), so an instant
 * that is any browser's local midnight sits within ~±14h of the intended UTC
 * midnight and rounds back to it. This is timezone- and DST-agnostic (pure epoch
 * arithmetic) and idempotent: a canonical `…T00:00:00Z` row maps to itself.
 * (Only |offset| == exactly 12h with a negative sign is ambiguous — uninhabited
 * zones; every Australian offset (+8..+11) rounds up to the correct day.)
 *
 * USAGE:
 *   TARGET_DATABASE_URL=<url> node normalize-booking-dates.mjs          # dry run
 *   TARGET_DATABASE_URL=<url> node normalize-booking-dates.mjs --apply  # writes
 *
 * Always dry-run first and eyeball the proposed changes. NEVER point this at a
 * database you have not deliberately chosen.
 */
import pg from 'pg'

const DAY_MS = 86_400_000
const APPLY = process.argv.includes('--apply')
const url = process.env.TARGET_DATABASE_URL
if (!url) {
  console.error('Set TARGET_DATABASE_URL to the database you intend to modify.')
  process.exit(1)
}

function roundToUtcMidnight(d) {
  // Epoch 0 is 1970-01-01T00:00:00Z, so integer multiples of DAY_MS are exactly
  // UTC midnights. Round to the nearest one.
  return new Date(Math.round(d.getTime() / DAY_MS) * DAY_MS)
}

const client = new pg.Client({ connectionString: url })

async function main() {
  await client.connect()
  const host = new URL(url).hostname
  console.log(`Target host: ${host}`)
  console.log(APPLY ? 'MODE: APPLY (will write)\n' : 'MODE: dry-run (no writes)\n')

  const { rows } = await client.query('SELECT id, date, time FROM "Booking" ORDER BY date')
  const changes = []
  for (const r of rows) {
    const current = r.date // node-pg returns a JS Date for timestamptz
    const fixed = roundToUtcMidnight(current)
    if (current.getTime() !== fixed.getTime()) {
      changes.push({ id: r.id, from: current.toISOString(), to: fixed.toISOString(), time: r.time })
    }
  }

  console.log(`Bookings scanned: ${rows.length}`)
  console.log(`Rows needing normalization: ${changes.length}\n`)
  for (const c of changes) {
    console.log(`  ${c.id}  ${c.from}  ->  ${c.to}   (time ${c.time})`)
  }

  if (!APPLY) {
    console.log(changes.length ? '\nDry run — re-run with --apply to write these.' : '\nNothing to do.')
    return
  }

  for (const c of changes) {
    await client.query('UPDATE "Booking" SET date = $1 WHERE id = $2', [c.to, c.id])
  }
  console.log(`\nApplied ${changes.length} update(s).`)
}

main()
  .catch(e => { console.error('ERROR:', e.message); process.exitCode = 1 })
  .finally(() => client.end())
