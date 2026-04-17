-- Adds listing type + farmstay subcategory as first-class columns on properties,
-- so the app can query these directly from Supabase (previously they lived only
-- in a separate Turso read cache).

CREATE TYPE public.property_listing_type AS ENUM (
  'farm_stay',
  'farm_experience',
  'farm_tour'
);

CREATE TYPE public.farmstay_subcategory AS ENUM (
  'agrifarm',
  'aquafarm',
  'homestay',
  'kubo_hut',
  'farm_cottage',
  'camp_stay',
  'dorm_shared'
);

ALTER TABLE public.properties
  ADD COLUMN listing_type public.property_listing_type NOT NULL DEFAULT 'farm_stay',
  ADD COLUMN subcategory public.farmstay_subcategory NOT NULL DEFAULT 'agrifarm';

CREATE INDEX idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX idx_properties_subcategory ON public.properties(subcategory);
