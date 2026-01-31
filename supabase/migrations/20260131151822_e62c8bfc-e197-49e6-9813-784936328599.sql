-- First, update any existing properties to use 'livestock_farm' (closest match)
UPDATE public.properties SET category = 'livestock' WHERE category IN ('fruit_picking', 'wellness', 'farm_to_table', 'eco_trail', 'organic_farm');

-- Drop and recreate the enum with new values
ALTER TYPE public.property_category RENAME TO property_category_old;

CREATE TYPE public.property_category AS ENUM (
  'farmstay',
  'agri_tourism_farm',
  'integrated_farm',
  'working_farm',
  'nature_farm',
  'homestead_farm',
  'crop_farm',
  'livestock_farm',
  'mixed_farm',
  'educational_farm'
);

-- Update the column to use new enum
ALTER TABLE public.properties 
  ALTER COLUMN category DROP DEFAULT,
  ALTER COLUMN category TYPE public.property_category USING 'farmstay'::public.property_category,
  ALTER COLUMN category SET DEFAULT 'farmstay'::public.property_category;

-- Drop old enum
DROP TYPE public.property_category_old;