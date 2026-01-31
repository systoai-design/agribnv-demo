// Database types for Agribnv

// Database enum - must match DB exactly
export type PropertyCategory = 
  | 'fruit_picking' 
  | 'livestock' 
  | 'wellness' 
  | 'farm_to_table' 
  | 'eco_trail' 
  | 'organic_farm';

// UI-only listing type for top-level tabs
export type ListingType = 'farm_stay' | 'farm_experience' | 'farm_tour';

// UI-only farmstay subcategory for display
export type FarmstaySubcategory = 
  | 'agrifarm'
  | 'aquafarm'
  | 'homestay'
  | 'kubo_hut'
  | 'farm_cottage'
  | 'camp_stay'
  | 'dorm_shared';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type AppRole = 'guest' | 'host';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  host_id: string;
  name: string;
  description: string | null;
  location: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  category: PropertyCategory;
  amenities: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  images?: PropertyImage[];
  experiences?: Experience[];
  host?: Profile;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface Experience {
  id: string;
  property_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_hours: number;
  max_participants: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  guest_id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  status: BookingStatus;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  property?: Property;
  guest?: Profile;
  booking_experiences?: BookingExperience[];
}

export interface BookingExperience {
  id: string;
  booking_id: string;
  experience_id: string;
  scheduled_date: string;
  participants: number;
  price_at_booking: number;
  created_at: string;
  // Joined data
  experience?: Experience;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

// Category display helpers
export const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  fruit_picking: 'Fruit Picking',
  livestock: 'Livestock Farm',
  wellness: 'Wellness Retreat',
  farm_to_table: 'Farm-to-Table',
  eco_trail: 'Eco Trail',
  organic_farm: 'Organic Farm',
};

export const CATEGORY_ICONS: Record<PropertyCategory, string> = {
  fruit_picking: '🍎',
  livestock: '🐄',
  wellness: '🧘',
  farm_to_table: '🍽️',
  eco_trail: '🥾',
  organic_farm: '🌱',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

// Listing type labels for top tabs
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  farm_stay: 'Farm Stay',
  farm_experience: 'Experience',
  farm_tour: 'Farm Tour',
};

// Farmstay subcategory labels and icons
export const FARMSTAY_LABELS: Record<FarmstaySubcategory, string> = {
  agrifarm: 'Agrifarm',
  aquafarm: 'Aquafarm',
  homestay: 'Homestay',
  kubo_hut: 'Kubo/Hut',
  farm_cottage: 'Cottage',
  camp_stay: 'Camp Stay',
  dorm_shared: 'Dorm',
};

// Guimaras municipalities for location focus
export const GUIMARAS_MUNICIPALITIES = [
  'Jordan',
  'Buenavista', 
  'Nueva Valencia',
  'San Lorenzo',
  'Sibunag',
] as const;

export type GuimarasMunicipality = typeof GUIMARAS_MUNICIPALITIES[number];
