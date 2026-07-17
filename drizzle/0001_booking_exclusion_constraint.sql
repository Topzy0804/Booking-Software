-- Restores the double-booking guarantee that SQLite couldn't express.
-- This makes it physically impossible to insert two overlapping,
-- non-cancelled bookings for the same resource -- no race condition,
-- no app-level locking required. Run this AFTER 0000_*.sql.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_no_overlapping_resource_time
  EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  )
  WHERE (status <> 'cancelled');