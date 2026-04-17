// Database types for Agribnv

// Database enum - must match DB exactly
export type PropertyCategory = 
  | 'farmstay'
  | 'agri_tourism_farm'
  | 'integrated_farm'
  | 'working_farm'
  | 'nature_farm'
  | 'homestead_farm'
  | 'crop_farm'
  | 'livestock_farm'
  | 'mixed_farm'
  | 'educational_farm';

// Image category enum - must match DB exactly
// Cancellation policy enum - must match DB exactly
export type CancellationPolicy = 
  | 'flexible'
  | 'moderate'
  | 'strict'
  | 'non_refundable';

export type ImageCategory = 
  | 'exterior'
  | 'living_area'
  | 'bedroom'
  | 'bathroom'
  | 'kitchen'
  | 'outdoor'
  | 'amenities'
  | 'farm_animals';

// Listing type for top-level tabs (mirrors property_listing_type enum in DB)
export type ListingType = 'farm_stay' | 'farm_experience' | 'farm_tour';

// Farmstay subcategory (mirrors farmstay_subcategory enum in DB)
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
  listing_type: ListingType;
  subcategory: FarmstaySubcategory;
  amenities: string[];
  is_published: boolean;
  // Property settings
  check_in_time: string;
  check_out_time: string;
  house_rules: string[];
  safety_features: string[];
  cancellation_policy: CancellationPolicy;
  additional_rules: string | null;
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
  category: ImageCategory;
  caption: string | null;
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
  farmstay: 'Farmstay',
  agri_tourism_farm: 'Agri-Tourism Farm',
  integrated_farm: 'Integrated Farm',
  working_farm: 'Working Farm',
  nature_farm: 'Nature Farm',
  homestead_farm: 'Homestead Farm',
  crop_farm: 'Crop Farm',
  livestock_farm: 'Livestock Farm',
  mixed_farm: 'Mixed Farm',
  educational_farm: 'Educational Farm',
};

export const CATEGORY_ICONS: Record<PropertyCategory, string> = {
  farmstay: '🏡',
  agri_tourism_farm: '🌾',
  integrated_farm: '🔄',
  working_farm: '🚜',
  nature_farm: '🌿',
  homestead_farm: '🏠',
  crop_farm: '🌽',
  livestock_farm: '🐄',
  mixed_farm: '🌻',
  educational_farm: '📚',
};

// Image category labels and icons
export const IMAGE_CATEGORY_LABELS: Record<ImageCategory, string> = {
  exterior: 'Exterior',
  living_area: 'Living Area',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  kitchen: 'Kitchen',
  outdoor: 'Outdoor/Views',
  amenities: 'Amenities',
  farm_animals: 'Farm & Animals',
};

export const IMAGE_CATEGORY_ICONS: Record<ImageCategory, string> = {
  exterior: '🏠',
  living_area: '🛋️',
  bedroom: '🛏️',
  bathroom: '🚿',
  kitchen: '🍳',
  outdoor: '🌳',
  amenities: '✨',
  farm_animals: '🐔',
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

// Cancellation policy labels
export const CANCELLATION_POLICY_LABELS: Record<CancellationPolicy, string> = {
  flexible: 'Flexible',
  moderate: 'Moderate',
  strict: 'Strict',
  non_refundable: 'Non-refundable',
};

export const CANCELLATION_POLICY_DESCRIPTIONS: Record<CancellationPolicy, string> = {
  flexible: 'Free cancellation up to 24 hours before check-in',
  moderate: 'Free cancellation up to 5 days before check-in',
  strict: 'Free cancellation up to 14 days before check-in. 50% refund up to 7 days before.',
  non_refundable: 'No refunds after booking confirmation',
};

// Common house rules presets
export const HOUSE_RULES_OPTIONS = [
  'No smoking',
  'No pets',
  'No parties or events',
  'No loud music after 10 PM',
  'Respect farm animals',
  'Stay on designated paths',
  'Children must be supervised',
  'No outside food in accommodations',
  'Remove shoes before entering',
  'Dispose of trash properly',
  'No open flames outside designated areas',
  'Quiet hours: 10 PM - 7 AM',
];

// Common safety features
export const SAFETY_FEATURES_OPTIONS = [
  'Smoke detector',
  'Carbon monoxide alarm',
  'Fire extinguisher',
  'First aid kit',
  'Security camera (outdoor)',
  'Gated property',
  'Well-lit pathways',
  'Nearby hospital',
  'Pool/hot tub without gate or lock',
  'Nearby lake, river, or water body',
  'Farm machinery on site',
  'Livestock on property',
];

// Guimaras municipalities for location focus
export const GUIMARAS_MUNICIPALITIES = [
  'Jordan',
  'Buenavista', 
  'Nueva Valencia',
  'San Lorenzo',
  'Sibunag',
] as const;

export type GuimarasMunicipality = typeof GUIMARAS_MUNICIPALITIES[number];
