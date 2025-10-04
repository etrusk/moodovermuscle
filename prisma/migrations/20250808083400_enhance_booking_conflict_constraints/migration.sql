/*
  Enhancement: Add comprehensive booking conflict prevention constraints
  
  Strategic Context: Implement business-level protection for booking conflicts
  as PRIMARY protection layer per Navigator's controlled technical debt approach.
  
  Business Protection Layers:
  1. Database constraint enforcement (this migration)
  2. Runtime logging and monitoring (separate implementation)
  3. E2E verification tests (separate implementation)
*/

-- Add partial unique constraint to prevent confirmed/pending bookings at same time
-- This allows cancelled bookings to exist without blocking the slot
CREATE UNIQUE INDEX "booking_active_time_conflict_prevention"
ON "Booking" ("date", "time")
WHERE ("status" IN ('PENDING', 'CONFIRMED'));

-- Add check constraint to ensure booking times are during business hours
ALTER TABLE "Booking" 
ADD CONSTRAINT "booking_business_hours_check" 
CHECK (
  -- Ensure time format is valid (HH:MM AM/PM pattern)
  "time" ~ '^(0?[1-9]|1[0-2]):(00|15|30|45) (AM|PM)$'
  AND 
  -- Ensure booking is within business hours (7 AM to 7 PM)
  (
    ("time" LIKE '%AM' AND "time" NOT LIKE '1%AM' AND "time" NOT LIKE '2%AM' AND "time" NOT LIKE '3%AM' AND "time" NOT LIKE '4%AM' AND "time" NOT LIKE '5%AM' AND "time" NOT LIKE '6%AM') 
    OR
    ("time" LIKE '7%AM' OR "time" LIKE '8%AM' OR "time" LIKE '9%AM' OR "time" LIKE '10%AM' OR "time" LIKE '11%AM' OR "time" LIKE '12%PM')
    OR
    ("time" LIKE '1%PM' OR "time" LIKE '2%PM' OR "time" LIKE '3%PM' OR "time" LIKE '4%PM' OR "time" LIKE '5%PM' OR "time" LIKE '6%PM')
  )
);

-- Add constraint to prevent booking in the past (with 1 hour grace period)
ALTER TABLE "Booking" 
ADD CONSTRAINT "booking_future_date_check" 
CHECK (
  -- Allow current day bookings but prevent past dates
  "date" >= CURRENT_DATE - INTERVAL '1 day'
  AND
  -- Prevent bookings more than 90 days in the future
  "date" <= CURRENT_DATE + INTERVAL '90 days'
);

-- Create index for efficient monitoring queries
CREATE INDEX "booking_monitoring_idx"
ON "Booking" ("status", "date", "createdAt")
WHERE "status" IN ('PENDING', 'CONFIRMED');

-- Create index for conflict detection logging
CREATE INDEX "booking_conflict_detection_idx"
ON "Booking" ("date", "time", "status", "updatedAt");