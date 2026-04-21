-- =====================================================================
-- Agribnv — Sample listings for visual demo
-- Run this ONCE after setup.sql and after you have at least one host user.
-- Uses the first host in user_roles as the owner. Re-running is safe
-- (DELETE block at top clears previous seeded listings by name prefix).
-- =====================================================================

-- Clear previously-seeded properties so this script is re-runnable
DELETE FROM public.properties WHERE name LIKE '[SEED] %';

DO $$
DECLARE
  seed_host_id UUID;
  prop_id UUID;
BEGIN
  -- Grab the first host account we find
  SELECT user_id INTO seed_host_id
  FROM public.user_roles
  WHERE role = 'host'
  ORDER BY created_at ASC
  LIMIT 1;

  IF seed_host_id IS NULL THEN
    RAISE EXCEPTION 'No host user found. Sign up at least one host account in the app before running this seed.';
  END IF;

  ---------------------------------------------------------------------
  -- 1. Mango Heritage Farm — Guimaras (farm_stay / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Mango Heritage Farm',
    'Stay among century-old mango trees on a working heritage farm in Guimaras. Wake up to fresh fruit breakfasts and wander orchard trails with the host family.',
    'Jordan, Guimaras',
    'Brgy. Rizal, Jordan',
    10.6591, 122.5962,
    2500, 6, 2, 1,
    'farmstay', 'farm_stay', 'agrifarm',
    ARRAY['WiFi', 'Free Parking', 'Farm Tour', 'Breakfast Included', 'Farm Animals', 'Garden View'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80', true, 0, 'exterior', 'Golden hour over the mango orchard'),
    (prop_id, 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=1200&q=80', false, 1, 'outdoor', 'Orchard trail'),
    (prop_id, 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80', false, 2, 'outdoor', 'Morning mist on the farm');

  ---------------------------------------------------------------------
  -- 2. Pinto Highland Cottage — Tagaytay (farm_stay / farm_cottage)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Pinto Highland Cottage',
    'A cozy 2-bedroom cottage overlooking rolling Tagaytay ridges. Cool highland air, organic vegetable garden, and a bonfire pit for chilly evenings.',
    'Tagaytay, Cavite',
    'Calabuso, Tagaytay',
    14.1153, 120.9621,
    3800, 4, 2, 2,
    'farmstay', 'farm_stay', 'farm_cottage',
    ARRAY['WiFi', 'Kitchen', 'Free Parking', 'Garden View', 'Bonfire Area', 'BBQ Grill'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80', true, 0, 'exterior', 'Cottage at dusk'),
    (prop_id, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80', false, 1, 'outdoor', 'Ridge views'),
    (prop_id, 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', false, 2, 'living_area', 'Warm interior');

  ---------------------------------------------------------------------
  -- 3. Bamboo Nipa Hut — Nueva Valencia (farm_stay / kubo_hut)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Bamboo Nipa Hut by the Shore',
    'Authentic nipa hut a few steps from a quiet cove. Hand-built bamboo furniture, outdoor shower, and hammocks under the stars.',
    'Nueva Valencia, Guimaras',
    'Lucmayan, Nueva Valencia',
    10.5128, 122.5758,
    1800, 2, 1, 1,
    'farmstay', 'farm_stay', 'kubo_hut',
    ARRAY['Beach Access', 'Outdoor Dining', 'Free Parking', 'Fishing'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80', true, 0, 'exterior', 'Hut at golden hour'),
    (prop_id, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', false, 1, 'outdoor', 'Cove a short walk away');

  ---------------------------------------------------------------------
  -- 4. Baguio Strawberry Homestay — (farm_stay / homestay)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Baguio Strawberry Homestay',
    'Family-run homestay with a working strawberry patch. Pick your own berries for breakfast and hike pine-scented trails right from the front porch.',
    'Baguio, Benguet',
    'Km. 6 La Trinidad, Baguio',
    16.4023, 120.5960,
    4200, 8, 3, 2,
    'farmstay', 'farm_stay', 'homestay',
    ARRAY['WiFi', 'Kitchen', 'Free Parking', 'Breakfast Included', 'Hiking Trails', 'Farm Tour'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80', true, 0, 'exterior', 'Home and garden'),
    (prop_id, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=1200&q=80', false, 1, 'outdoor', 'Strawberry rows'),
    (prop_id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', false, 2, 'living_area', 'Breakfast nook');

  ---------------------------------------------------------------------
  -- 5. Lakbay Dairy Farm Experience — Batangas (farm_experience / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Lakbay Dairy Farm Experience',
    'Half-day hands-on experience on a working dairy farm. Milk a cow, churn butter, sample fresh carabao cheese, and pack a picnic of farm-made treats.',
    'Lipa, Batangas',
    'Barangay San Salvador, Lipa',
    13.9414, 121.1624,
    2100, 10, 2, 2,
    'farmstay', 'farm_experience', 'agrifarm',
    ARRAY['Farm Tour', 'Farm Animals', 'Free Parking', 'Outdoor Dining'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&q=80', true, 0, 'farm_animals', 'Dairy herd at dawn'),
    (prop_id, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200&q=80', false, 1, 'outdoor', 'Rolling pastures');

  ---------------------------------------------------------------------
  -- 6. Carabao Countryside Tour — Laguna (farm_tour / agrifarm)
  ---------------------------------------------------------------------
  INSERT INTO public.properties (
    host_id, name, description, location, address,
    latitude, longitude, price_per_night,
    max_guests, bedrooms, bathrooms,
    category, listing_type, subcategory,
    amenities, is_published
  ) VALUES (
    seed_host_id,
    '[SEED] Carabao Countryside Tour',
    'Guided half-day tour of Calauan rice terraces by carabao cart. Includes traditional merienda, coconut husking demo, and a visit to a heritage kubo.',
    'Calauan, Laguna',
    'Barangay Prinza, Calauan',
    14.1486, 121.3155,
    1900, 12, 1, 1,
    'farmstay', 'farm_tour', 'agrifarm',
    ARRAY['Farm Tour', 'Farm Animals', 'Outdoor Dining', 'Free Parking'],
    true
  ) RETURNING id INTO prop_id;

  INSERT INTO public.property_images (property_id, image_url, is_primary, display_order, category, caption) VALUES
    (prop_id, 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=1200&q=80', true, 0, 'outdoor', 'Rice terraces'),
    (prop_id, 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80', false, 1, 'farm_animals', 'Our carabao');

  RAISE NOTICE 'Seeded 6 sample properties under host %', seed_host_id;
END $$;
