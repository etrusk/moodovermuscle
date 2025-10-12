/*
  Fix: Remove booking_future_date_check constraint that blocks status updates on past bookings
  
  Problem: The constraint prevents updating bookings with dates in the past, even when just
  changing the status field (e.g., cancelling a past booking).
  
  Root Cause: PostgreSQL check constraints apply to both INSERT and UPDATE operations.
  There's no native SQL syntax to restrict constraints to INSERT only.
  
  Solution: Drop the constraint and implement date validation at the application level,
  where we can distinguish between creating new bookings (must be future dates) and
  updating existing bookings (allow any date for status changes).
  
  Application-level validation should be added to:
  - POST /api/book endpoint: Validate date is not in the past when creating bookings
  - PATCH /api/admin/bookings: Allow status updates regardless of booking date
*/

-- Drop the constraint that blocks updates to past bookings
ALTER TABLE "Booking" 
DROP CONSTRAINT IF EXISTS "booking_future_date_check";
