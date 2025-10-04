-- Drop the old constraint that expects AM/PM format
ALTER TABLE "Booking" 
DROP CONSTRAINT IF EXISTS "booking_business_hours_check";

-- Add new constraint using 24-hour format (HH:MM)
ALTER TABLE "Booking" 
ADD CONSTRAINT "booking_business_hours_check" 
CHECK (
  -- Ensure time format is valid 24-hour format (HH:MM)
  "time" ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  AND 
  -- Ensure booking is within business hours (07:00 to 19:00)
  "time" >= '07:00' AND "time" <= '19:00'
);