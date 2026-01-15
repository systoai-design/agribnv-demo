-- Create user role enum
CREATE TYPE public.app_role AS ENUM ('guest', 'host');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create property category enum
CREATE TYPE public.property_category AS ENUM ('fruit_picking', 'livestock', 'wellness', 'farm_to_table', 'eco_trail', 'organic_farm');

-- Create properties table
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
    category property_category NOT NULL DEFAULT 'organic_farm',
    amenities TEXT[] DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create property_images table
CREATE TABLE public.property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create experiences table
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

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create bookings table
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
    CONSTRAINT valid_guests CHECK (guests_count > 0)
);

-- Create booking_experiences junction table
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

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_experiences ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Helper function to check if user owns a property
CREATE OR REPLACE FUNCTION public.is_property_owner(_property_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.properties
        WHERE id = _property_id
          AND host_id = auth.uid()
    )
$$;

-- user_roles RLS policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own guest role"
ON public.user_roles FOR INSERT
WITH CHECK (user_id = auth.uid() AND role = 'guest');

-- profiles RLS policies
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- properties RLS policies
CREATE POLICY "Anyone can view published properties"
ON public.properties FOR SELECT
USING (is_published = true OR host_id = auth.uid());

CREATE POLICY "Hosts can create properties"
ON public.properties FOR INSERT
WITH CHECK (host_id = auth.uid() AND public.has_role(auth.uid(), 'host'));

CREATE POLICY "Hosts can update their own properties"
ON public.properties FOR UPDATE
USING (host_id = auth.uid());

CREATE POLICY "Hosts can delete their own properties"
ON public.properties FOR DELETE
USING (host_id = auth.uid());

-- property_images RLS policies
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

-- experiences RLS policies
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

-- bookings RLS policies
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

-- booking_experiences RLS policies
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
WITH CHECK (
    booking_id IN (SELECT id FROM public.bookings WHERE guest_id = auth.uid())
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
    
    -- Assign guest role by default
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'guest');
    
    RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
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

-- Add update triggers
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

-- Create indexes for better query performance
CREATE INDEX idx_properties_host_id ON public.properties(host_id);
CREATE INDEX idx_properties_is_published ON public.properties(is_published);
CREATE INDEX idx_properties_category ON public.properties(category);
CREATE INDEX idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX idx_experiences_property_id ON public.experiences(property_id);
CREATE INDEX idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_booking_experiences_booking_id ON public.booking_experiences(booking_id);