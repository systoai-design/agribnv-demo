-- Create wishlists table for saving favorite properties
CREATE TABLE public.wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, property_id)
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlists
CREATE POLICY "Users can view their own wishlists"
  ON public.wishlists FOR SELECT
  USING (user_id = auth.uid());

-- Users can add to their own wishlist
CREATE POLICY "Users can add to their wishlist"
  ON public.wishlists FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can remove from their wishlist
CREATE POLICY "Users can remove from their wishlist"
  ON public.wishlists FOR DELETE
  USING (user_id = auth.uid());

-- Update existing properties with sample coordinates for map view
UPDATE public.properties SET 
  latitude = 10.5908, 
  longitude = 122.6155 
WHERE location ILIKE '%Guimaras%';

UPDATE public.properties SET 
  latitude = 14.1153, 
  longitude = 120.9621 
WHERE location ILIKE '%Tagaytay%';

UPDATE public.properties SET 
  latitude = 16.4023, 
  longitude = 120.5960 
WHERE location ILIKE '%Baguio%';

UPDATE public.properties SET 
  latitude = 13.7565, 
  longitude = 121.0583 
WHERE location ILIKE '%Batangas%';

UPDATE public.properties SET 
  latitude = 16.6159, 
  longitude = 120.3209 
WHERE location ILIKE '%La Union%';

UPDATE public.properties SET 
  latitude = 11.5674, 
  longitude = 124.0066 
WHERE location ILIKE '%Leyte%';