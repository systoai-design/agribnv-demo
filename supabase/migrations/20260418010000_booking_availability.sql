-- Prevent double bookings: a property cannot have two active bookings whose
-- date ranges overlap. Uses a GiST EXCLUDE constraint on daterange, which is
-- atomic at the DB level (no race conditions even under concurrent inserts).
--
-- check_in is inclusive, check_out is exclusive. This matches the common
-- hotel convention where a guest checking out on day X frees the property
-- for another guest checking in on day X.
--
-- Only bookings with status 'pending' or 'confirmed' block the calendar.
-- Cancelled and completed bookings are ignored.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    property_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status IN ('pending', 'confirmed'));

-- Speeds up calendar/availability lookups per property
CREATE INDEX IF NOT EXISTS idx_bookings_property_dates_active
  ON public.bookings (property_id, check_in, check_out)
  WHERE status IN ('pending', 'confirmed');
