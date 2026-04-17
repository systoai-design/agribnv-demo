-- =====================================================================
-- Agribnv — Fresh Supabase project setup
-- Paste this whole file into Supabase dashboard → SQL Editor → Run.
-- Safe to re-run: cleanup block at top drops any partial state first.
-- =====================================================================

-- Cleanup (safe on a fresh project; clears partial state on re-run) ----

-- Drop trigger on auth.users that our handle_new_user depends on
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop storage policies we'll recreate
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;

-- Remove messages from realtime publication if already added
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;
EXCEPTION WHEN undefined_object OR undefined_table THEN NULL;
END $$;

-- Drop public-schema tables (CASCADE drops dependent policies/triggers/constraints)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.booking_experiences CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.experiences CASCADE;
DROP TABLE IF EXISTS public.property_images CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.is_property_owner(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_timestamp() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE;

-- Drop types last (functions that reference them must be gone first)
DROP TYPE IF EXISTS public.booking_status CASCADE;
DROP TYPE IF EXISTS public.cancellation_policy CASCADE;
DROP TYPE IF EXISTS public.image_category CASCADE;
DROP TYPE IF EXISTS public.farmstay_subcategory CASCADE;
DROP TYPE IF EXISTS public.property_listing_type CASCADE;
DROP TYPE IF EXISTS public.property_category CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Extensions -----------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enums ----------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('guest', 'host');

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

CREATE TYPE public.image_category AS ENUM (
  'exterior',
  'living_area',
  'bedroom',
  'bathroom',
  'kitchen',
  'outdoor',
  'amenities',
  'farm_animals'
);

CREATE TYPE public.cancellation_policy AS ENUM (
  'flexible',
  'moderate',
  'strict',
  'non_refundable'
);

CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Tables ---------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price_per_night DECIMAL(10, 2) NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  category property_category NOT NULL DEFAULT 'farmstay',
  listing_type public.property_listing_type NOT NULL DEFAULT 'farm_stay',
  subcategory public.farmstay_subcategory NOT NULL DEFAULT 'agrifarm',
  amenities TEXT[] DEFAULT '{}',
  check_in_time TEXT DEFAULT '14:00',
  check_out_time TEXT DEFAULT '12:00',
  house_rules TEXT[] DEFAULT '{}',
  safety_features TEXT[] DEFAULT '{}',
  cancellation_policy public.cancellation_policy DEFAULT 'moderate',
  additional_rules TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  category public.image_category DEFAULT 'exterior',
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_hours DECIMAL(4, 2) NOT NULL DEFAULT 2,
  max_participants INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (check_out > check_in),
  CONSTRAINT valid_guests CHECK (guests_count > 0),
  CONSTRAINT no_overlapping_bookings
    EXCLUDE USING gist (
      property_id WITH =,
      daterange(check_in, check_out, '[)') WITH &&
    ) WHERE (status IN ('pending', 'confirmed'))
);

CREATE TABLE public.booking_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  participants INTEGER NOT NULL DEFAULT 1,
  price_at_booking DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id, experience_id, scheduled_date)
);

CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, property_id)
);

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL,
  host_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, guest_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Functions (after tables so SQL bodies can resolve refs) --------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_property_owner(_property_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties
    WHERE id = _property_id AND host_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'guest');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Triggers -------------------------------------------------------------

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- Indexes --------------------------------------------------------------
CREATE INDEX idx_properties_host_id ON public.properties(host_id);
CREATE INDEX idx_properties_is_published ON public.properties(is_published);
CREATE INDEX idx_properties_category ON public.properties(category);
CREATE INDEX idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX idx_properties_subcategory ON public.properties(subcategory);
CREATE INDEX idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX idx_experiences_property_id ON public.experiences(property_id);
CREATE INDEX idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_property_dates_active
  ON public.bookings (property_id, check_in, check_out)
  WHERE status IN ('pending', 'confirmed');
CREATE INDEX idx_booking_experiences_booking_id ON public.booking_experiences(booking_id);
CREATE INDEX idx_conversations_guest_id ON public.conversations(guest_id);
CREATE INDEX idx_conversations_host_id ON public.conversations(host_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Row-Level Security ---------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- user_roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own role"
  ON public.user_roles FOR INSERT WITH CHECK (user_id = auth.uid());

-- profiles policies
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (id = auth.uid());

-- properties policies
CREATE POLICY "Anyone can view published properties"
  ON public.properties FOR SELECT
  USING (is_published = true OR host_id = auth.uid());

CREATE POLICY "Hosts can create properties"
  ON public.properties FOR INSERT
  WITH CHECK (host_id = auth.uid() AND public.has_role(auth.uid(), 'host'));

CREATE POLICY "Hosts can update their own properties"
  ON public.properties FOR UPDATE USING (host_id = auth.uid());

CREATE POLICY "Hosts can delete their own properties"
  ON public.properties FOR DELETE USING (host_id = auth.uid());

-- property_images policies
CREATE POLICY "Anyone can view images of accessible properties"
  ON public.property_images FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties
      WHERE is_published = true OR host_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can add images to their properties"
  ON public.property_images FOR INSERT
  WITH CHECK (public.is_property_owner(property_id));

CREATE POLICY "Hosts can update their property images"
  ON public.property_images FOR UPDATE
  USING (public.is_property_owner(property_id));

CREATE POLICY "Hosts can delete their property images"
  ON public.property_images FOR DELETE
  USING (public.is_property_owner(property_id));

-- experiences policies
CREATE POLICY "Anyone can view experiences of accessible properties"
  ON public.experiences FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties
      WHERE is_published = true OR host_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can create experiences for their properties"
  ON public.experiences FOR INSERT
  WITH CHECK (public.is_property_owner(property_id));

CREATE POLICY "Hosts can update their property experiences"
  ON public.experiences FOR UPDATE
  USING (public.is_property_owner(property_id));

CREATE POLICY "Hosts can delete their property experiences"
  ON public.experiences FOR DELETE
  USING (public.is_property_owner(property_id));

-- bookings policies
CREATE POLICY "Users can view their bookings or bookings for their properties"
  ON public.bookings FOR SELECT
  USING (
    guest_id = auth.uid() OR
    property_id IN (SELECT id FROM public.properties WHERE host_id = auth.uid())
  );

CREATE POLICY "Guests can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Users can update relevant bookings"
  ON public.bookings FOR UPDATE
  USING (
    guest_id = auth.uid() OR
    property_id IN (SELECT id FROM public.properties WHERE host_id = auth.uid())
  );

-- booking_experiences policies
CREATE POLICY "Users can view their booking experiences"
  ON public.booking_experiences FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM public.bookings
      WHERE guest_id = auth.uid() OR
            property_id IN (SELECT id FROM public.properties WHERE host_id = auth.uid())
    )
  );

CREATE POLICY "Guests can add experiences to their bookings"
  ON public.booking_experiences FOR INSERT
  WITH CHECK (booking_id IN (SELECT id FROM public.bookings WHERE guest_id = auth.uid()));

-- wishlists policies
CREATE POLICY "Users can view their own wishlists"
  ON public.wishlists FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add to their wishlist"
  ON public.wishlists FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove from their wishlist"
  ON public.wishlists FOR DELETE USING (user_id = auth.uid());

-- conversations policies
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (guest_id = auth.uid() OR host_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Participants can update conversation"
  ON public.conversations FOR UPDATE
  USING (guest_id = auth.uid() OR host_id = auth.uid());

-- messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE guest_id = auth.uid() OR host_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE guest_id = auth.uid() OR host_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE USING (sender_id = auth.uid());

-- Storage: property-images bucket --------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can update their own property images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own property images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Realtime: enable live message streams --------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
