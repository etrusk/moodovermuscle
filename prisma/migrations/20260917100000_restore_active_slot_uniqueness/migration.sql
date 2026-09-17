/*
  Restore slot uniqueness to ACTIVE bookings only.

  Booking_date_time_key is a status-blind UNIQUE (date, time), so a cancelled
  booking holds its slot forever and that hour can never be rebooked.

  Migration 20250808083400 created booking_active_time_conflict_prevention for
  exactly this reason ("This allows cancelled bookings to exist without
  blocking the slot"), but that index is no longer present in the database --
  only the status-blind one survives. This restores it and drops the broad one.

  Both must change together. The partial index alone would let the form offer a
  slot the broad index then rejects, which surfaces as a 500 rather than a 409.

  Rollback:
    DROP INDEX IF EXISTS "booking_active_time_conflict_prevention";
    CREATE UNIQUE INDEX "Booking_date_time_key" ON "Booking" ("date", "time");
  The rollback only succeeds while no two bookings share a (date, time). Once
  two cancelled bookings occupy one slot, it needs deduplication first.
*/

DROP INDEX IF EXISTS "Booking_date_time_key";

CREATE UNIQUE INDEX IF NOT EXISTS "booking_active_time_conflict_prevention"
ON "Booking" ("date", "time")
WHERE ("status" IN ('PENDING', 'CONFIRMED'));
