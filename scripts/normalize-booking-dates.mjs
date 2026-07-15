#!/usr/bin/env node
/**
 * One-time data fix: normalize Booking.date to canonical midnight.
 *
 * WHY: before the timezone fix, the booking form sent the selected day as a UTC
 * *instant* of local midnight (e.g. AEST midnight -> `…T14:00:00Z`, the previous
 * calendar day). After the fix, bookings store canonical midnight. The
 * availability check is an exact-match on `date`, and `@@unique([date,time])`
 * only collides on identical values — so an old shifted row and a new canonical
 * row for the *same* calendar day neither match nor collide, opening a
 * double-booking window until the old rows are normalized.
 *
 * STRATEGY: round each `date` to the nearest day, done entirely in SQL on the
 * stored value: `date_trunc('day', date + interval '12 hours')`. The column is
 * `timestamp without time zone` and the app (Prisma) reads/writes it in UTC, so
 * the stored value is the UTC wall-clock of the day. Rounding it in SQL avoids
 * any client timezone interpretation (a JS `Date` round-trip through a non-UTC
 * process TZ silently shifts these values). `date` only ever encodes a day (the
 * clock time lives in the `time` column), so an instant that is any browser's
 * local midnight sits within ~±14h of the intended midnight and rounds back to
 * it. Idempotent: a canonical midnight row maps to itself.
 *
 * If normalization would collapse two rows onto the same (date, time), the
 * UPDATE fails loudly on `@@unique([date,time])` — that is a genuine
 * pre-existing double-booking to resolve by hand, not something to auto-merge.
 *
 * USAGE:
 *   TARGET_DATABASE_URL=<url> node scripts/normalize-booking-dates.mjs          # dry run
 *   TARGET_DATABASE_URL=<url> node scripts/normalize-booking-dates.mjs --apply  # writes
 *
 * Always dry-run first and eyeball the proposed changes. NEVER point this at a
 * database you have not deliberately chosen.
 */
import pg from 'pg'

const APPLY = process.argv.includes('--apply')
const url = process.env.TARGET_DATABASE_URL
if (!url) {
  console.error('Set TARGET_DATABASE_URL to the database you intend to modify.')
  process.exit(1)
}

// Round the stored (naive) timestamp to the nearest day, in SQL — no JS Date,
// no timezone interpretation.
const ROUNDED = `date_trunc('day', date + interval '12 hours')`

const client = new pg.Client({ connectionString: url })

async function main() {
  await client.connect()
  console.log(`Target host: ${new URL(url).hostname}`)
  console.log(APPLY ? 'MODE: APPLY (will write)\n' : 'MODE: dry-run (no writes)\n')

  const { rows: changes } = await client.query(
    `SELECT id, date::text AS current, (${ROUNDED})::text AS normalized, time
       FROM "Booking"
      WHERE date <> ${ROUNDED}
      ORDER BY date`
  )
  const { rows: totalRows } = await client.query('SELECT count(*)::int AS n FROM "Booking"')

  console.log(`Bookings scanned: ${totalRows[0].n}`)
  console.log(`Rows needing normalization: ${changes.length}\n`)
  for (const c of changes) {
    console.log(`  ${c.id}  ${c.current}  ->  ${c.normalized}   (time ${c.time})`)
  }

  if (!APPLY) {
    console.log(changes.length ? '\nDry run — re-run with --apply to write these.' : '\nNothing to do.')
    return
  }
  if (!changes.length) {
    console.log('\nNothing to do.')
    return
  }

  const res = await client.query(`UPDATE "Booking" SET date = ${ROUNDED} WHERE date <> ${ROUNDED}`)
  console.log(`\nApplied ${res.rowCount} update(s).`)
}

main()
  .catch(e => { console.error('ERROR:', e.message); process.exitCode = 1 })
  .finally(() => client.end())
