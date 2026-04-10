import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PhotoGalleryModal } from '@/components/properties/PhotoGalleryModal';
import { FarmExperiences } from '@/components/properties/FarmExperiences';
import { FarmCalendar } from '@/components/properties/FarmCalendar';
import { AmenitiesModal } from '@/components/properties/AmenitiesModal';
import PropertyMap from '@/components/map/PropertyMap';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useShare } from '@/hooks/useShare';
import { useConversations } from '@/hooks/useConversations';
import { Property, Experience, CATEGORY_LABELS, CANCELLATION_POLICY_LABELS, CANCELLATION_POLICY_DESCRIPTIONS } from '@/types/database';
import {
  MapPin, Users, BedDouble, Bath, Wifi, Car, Utensils, TreePine, Tv, Wind,
  Clock, ChevronLeft, ChevronRight, Loader2, Star, Share, Heart, Grid3X3,
  Warehouse, DoorOpen, ShieldCheck, X, Award, CalendarDays, MessageCircle, Minus, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Amenity icon mapping
const amenityIcons: Record<string, any> = {
  'Kitchen': Utensils,
  'Wifi': Wifi,
  'Free parking': Car,
  'Parking': Car,
  'Pool': TreePine,
  'TV': Tv,
  'Air conditioning': Wind,
  'Washer': Warehouse,
};


// Mock reviews data
const mockReviews = [
  { id: 1, name: 'Blessed Fernsby', date: '5 months ago', avatar: null, rating: 5, text: "Wonderful! I admire how the hosts made this property a reality. It's full of love and thoughtfulness. We really appreciate how Bing answered and..."  },
  { id: 2, name: 'Cynthia', date: '6 months ago', avatar: null, rating: 5, text: 'Thank you kuya Bing for being so helpful and nice. A place so...' },
  { id: 3, name: 'Aisa Lyne', date: '7 months ago', avatar: null, rating: 5, text: 'Comfortable and fun. Friendly staff. I will come back again. The place was clean and the atmosphere relaxed. We enjoyed every...' },
  { id: 4, name: 'Ryan Mark Tinio', date: '7 months ago', avatar: null, rating: 5, text: 'Super ganda ng view at very accomodating si kuya Bing! Too bad we only had 2 nights here. Will definitely book again!...' },
  { id: 5, name: 'Wea Shei', date: '8 months ago', avatar: null, rating: 5, text: 'Everyone was so nice! super nice nila! Will come back again...' },
  { id: 6, name: 'Christine', date: '9 months ago', avatar: null, rating: 5, text: 'Lovely what a nice surrounding and the host is very helpful. Wonderful about this place. The view was worth it and peaceful environment...' },
];

const ratingCategories = [
  { label: 'Cleanliness', rating: 4.9, icon: '🧹' },
  { label: 'Accuracy', rating: 4.9, icon: '✓' },
  { label: 'Check-in', rating: 5.0, icon: '🔑' },
  { label: 'Communication', rating: 5.0, icon: '💬' },
  { label: 'Location', rating: 5.0, icon: '📍' },
  { label: 'Value', rating: 5.0, icon: '💰' },
];

// Helper to format time (e.g., "14:00" -> "2:00 PM")
const formatTime = (time: string) => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return time;
  }
};

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { share } = useShare();
  const { getOrCreateConversation } = useConversations();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [guestCount, setGuestCount] = useState(1);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  // Share handler
  const handleShare = () => {
    if (!property) return;
    share({
      title: property.name,
      text: `Check out ${property.name} in ${property.location}! 🌿`,
      url: window.location.href,
    });
  };

  // Contact host handler
  const handleContactHost = async () => {
    if (!user) {
      toast({
        title: 'Sign in to message host',
        description: 'Create an account to send messages to hosts.',
      });
      navigate('/auth');
      return;
    }

    if (!property) return;

    setIsStartingConversation(true);
    try {
      const conversationId = await getOrCreateConversation(property.id, property.host_id);
      if (conversationId) {
        navigate(`/inbox?conversation=${conversationId}`);
      } else {
        navigate('/inbox');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      navigate('/inbox');
    } finally {
      setIsStartingConversation(false);
    }
  };

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    // Query without FK hint - fetch property with images and experiences only
    const { data, error } = await supabase
      .from('properties')
      .select(`*, images:property_images(*), experiences(*)`)
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      // Add mock host data based on property ID
      const mockHost = mockHosts[id] || defaultHost;
      const propertyWithHost = {
        ...data,
        host: mockHost,
      };
      setProperty(propertyWithHost as unknown as Property);
    }
    setIsLoading(false);
  };

  const nights = dateRange.from && dateRange.to ? differenceInDays(dateRange.to, dateRange.from) : 0;
  const accommodationTotal = nights * (property?.price_per_night || 0);
  const experiencesTotal = selectedExperiences.reduce((sum, expId) => {
    const exp = property?.experiences?.find(e => e.id === expId);
    return sum + (exp?.price || 0);
  }, 0);
  const serviceFee = Math.round(accommodationTotal * 0.12);
  const totalPrice = accommodationTotal + experiencesTotal + serviceFee;

  const handleBooking = async () => {
    if (!dateRange.from || !dateRange.to || !property) return;

    setIsBooking(true);
    try {
      if (user) {
        const { data: booking, error } = await supabase
          .from('bookings')
          .insert({
            guest_id: user.id,
            property_id: property.id,
            check_in: format(dateRange.from, 'yyyy-MM-dd'),
            check_out: format(dateRange.to, 'yyyy-MM-dd'),
            guests_count: guestCount,
            total_price: totalPrice,
            status: 'confirmed', // Auto-confirm for test mode (no payment gateway)
          })
          .select()
          .single();

        if (error) throw error;

        if (selectedExperiences.length > 0 && booking) {
          const expInserts = selectedExperiences.map(expId => {
            const exp = property.experiences?.find(e => e.id === expId);
            return {
              booking_id: booking.id,
              experience_id: expId,
              scheduled_date: format(dateRange.from!, 'yyyy-MM-dd'),
              participants: guestCount,
              price_at_booking: exp?.price || 0,
            };
          });
          await supabase.from('booking_experiences').insert(expInserts);
        }

        toast({ 
          title: 'Booking confirmed! 🎉', 
          description: 'Check your trips for details.' 
        });
        navigate('/bookings');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast({ 
          title: 'Demo booking successful! 🎉', 
          description: `${property.name} reserved for ${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}. Sign up to save your bookings!` 
        });
      }
    } catch (error: any) {
      toast({ title: 'Booking failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-semibold">Property not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4 rounded-lg">Back to Explore</Button>
        </div>
      </Layout>
    );
  }

  const images = property.images?.sort((a, b) => a.display_order - b.display_order) || [];
  const imageUrls = images.length > 0 
    ? images.map(img => img.image_url) 
    : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'];

  return (
    <Layout hideNavbarOnMobile={true} showMobileNav={false} showFooter={false}>
      {/* Mobile Header - Transparent with floating buttons only */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex items-center justify-between p-4 pt-safe">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center pointer-events-auto"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </motion.button>
          <div className="flex gap-2 pointer-events-auto">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center"
            >
              <Share className="h-4 w-4 text-foreground" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLiked(!isLiked)}
              className="h-9 w-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center"
            >
              <Heart className={cn('h-4 w-4', isLiked ? 'fill-destructive text-destructive' : 'text-foreground')} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Full-Width Image Carousel */}
      <div className="md:hidden relative -mt-16">
        <div className="relative h-[280px] overflow-hidden">
          <motion.img
            key={currentImageIndex}
            src={imageUrls[currentImageIndex]}
            alt={property.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full object-cover"
          />
          {/* Image navigation */}
          {imageUrls.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? imageUrls.length - 1 : prev - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === imageUrls.length - 1 ? 0 : prev + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          {/* Dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imageUrls.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                )}
              />
            ))}
          </div>
          {/* Image counter */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
            {currentImageIndex + 1} / {imageUrls.length}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden px-4 py-4 pb-24 space-y-4">
        {/* Title */}
        <div>
          <h1 className="text-xl font-semibold">{property.name}</h1>
          <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[property.category]} · {property.location}</p>
        </div>

        {/* Rating & Reviews summary */}
        <div className="flex items-center gap-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-foreground" />
            <span className="font-semibold">4.89</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm underline cursor-pointer">{mockReviews.length} reviews</span>
        </div>

        {/* Host Info */}
        <div className="flex items-center gap-4 py-4 border-b border-border/50">
          <Avatar className="h-12 w-12">
            <AvatarImage src={property.host?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {property.host?.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">Hosted by {property.host?.full_name}</p>
            <p className="text-sm text-muted-foreground">Superhost · 2 years hosting</p>
          </div>
        </div>

        {/* Quick highlights */}
        <div className="space-y-4 py-4 border-b border-border/50">
          <div className="flex gap-4">
            <Users className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-medium">{property.max_guests} guests · {property.bedrooms} bedroom · {property.bathrooms} bath</p>
            </div>
          </div>
          <div className="flex gap-4">
            <DoorOpen className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-medium">Self check-in</p>
              <p className="text-sm text-muted-foreground">Check yourself in with the lockbox</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Award className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-medium">{property.host?.full_name} is a Superhost</p>
              <p className="text-sm text-muted-foreground">Superhosts are experienced, highly rated hosts</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="py-4 border-b border-border/50">
          <AnimatePresence mode="wait">
            <motion.p 
              key={showFullDescription ? 'full' : 'clipped'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn("text-sm leading-relaxed", !showFullDescription && "line-clamp-4")}
            >
              {property.description}
            </motion.p>
          </AnimatePresence>
          {property.description && property.description.length > 200 && (
            <Button 
              variant="link" 
              className="px-0 h-auto text-sm font-semibold underline mt-2"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>

        {/* Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="py-4 border-b border-border/50">
            <h3 className="font-semibold mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-3">
              {property.amenities.slice(0, 6).map((amenity) => {
                const IconComponent = amenityIcons[amenity] || Wifi;
                return (
                  <div key={amenity} className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                );
              })}
            </div>
            {property.amenities.length > 6 && (
              <Button 
                variant="outline" 
                className="w-full mt-4 rounded-lg border-foreground"
                onClick={() => setShowAmenitiesModal(true)}
              >
                Show all {property.amenities.length} amenities
              </Button>
            )}
          </div>
        )}

        {/* Farm Experiences Section - NEW */}
        <FarmExperiences
          experiences={property.experiences || []}
          selectedExperiences={selectedExperiences}
          onToggleExperience={(expId) => {
            if (selectedExperiences.includes(expId)) {
              setSelectedExperiences(selectedExperiences.filter(id => id !== expId));
            } else {
              setSelectedExperiences([...selectedExperiences, expId]);
            }
          }}
        />

        {/* Farm Calendar Section - NEW */}
        <FarmCalendar />

        {/* Reviews Section */}
        <div className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 fill-foreground" />
            <span className="text-lg font-semibold">4.89</span>
            <span className="text-muted-foreground">· {mockReviews.length} reviews</span>
          </div>
          {/* Sample reviews */}
          <div className="space-y-4">
            {mockReviews.slice(0, 2).map((review) => (
              <div key={review.id} className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-300 text-gray-600 text-sm">
                      {review.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <p className="text-sm line-clamp-3">{review.text}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 rounded-lg border-foreground">
            Show all {mockReviews.length} reviews
          </Button>
        </div>
      </div>

      {/* Mobile Sticky Bottom Booking Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/50 px-4 py-3 safe-area-pb">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">
              <span className="font-semibold">₱{property.price_per_night.toLocaleString()}</span>
              <span className="text-muted-foreground"> / night</span>
            </p>
            <p className="text-xs underline text-muted-foreground">
              {nights > 0 ? `${format(dateRange.from!, 'MMM d')} – ${format(dateRange.to!, 'MMM d')}` : 'Select dates'}
            </p>
          </div>
          <Button 
            onClick={handleBooking}
            disabled={!dateRange.from || !dateRange.to || isBooking}
            className="rounded-lg px-6 h-12 bg-primary hover:bg-primary/90 font-semibold"
          >
            {isBooking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reserve'}
          </Button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-xl md:text-2xl font-semibold mb-2">{property.name}</h1>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1 text-sm">
              <span className="underline font-medium cursor-pointer hover:text-primary transition-colors">
                {property.location}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2 rounded-lg hover:bg-muted" onClick={handleShare}>
                <Share className="h-4 w-4" /> <span className="underline">Share</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 rounded-lg hover:bg-muted"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-destructive text-destructive')} /> 
                <span className="underline">Save</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-xl overflow-hidden mb-10"
        >
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[400px]">
            <div className="col-span-2 row-span-2 relative cursor-pointer" onClick={() => setShowAllPhotos(true)}>
              <img src={imageUrls[0]} alt={property.name} className="w-full h-full object-cover hover:brightness-90 transition-all" />
            </div>
            {imageUrls.slice(1, 5).map((img, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "relative cursor-pointer",
                  idx === 1 && "rounded-tr-xl overflow-hidden",
                  idx === 3 && "rounded-br-xl overflow-hidden"
                )}
                onClick={() => setShowAllPhotos(true)}
              >
                <img src={img} alt="" className="w-full h-full object-cover hover:brightness-90 transition-all" />
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute bottom-4 right-4 gap-2 bg-white hover:bg-white rounded-lg shadow-md border-foreground/20"
            onClick={() => setShowAllPhotos(true)}
          >
            <Grid3X3 className="h-4 w-4" /> Show all photos
          </Button>
        </motion.div>

        {/* Photo Gallery Modal */}
        <PhotoGalleryModal
          isOpen={showAllPhotos}
          onClose={() => setShowAllPhotos(false)}
          images={imageUrls}
          propertyName={property.name}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked(!isLiked)}
        />

        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Type & Host */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">
                  {CATEGORY_LABELS[property.category]} in {property.location.split(',')[0]}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {property.max_guests} guests · {property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''} · {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''} · {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                  <AvatarImage src={property.host?.avatar_url || undefined} />
                  <AvatarFallback className="bg-foreground text-background font-semibold">
                    {property.host?.full_name?.charAt(0) || 'H'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </motion.div>

            <Separator />

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex gap-6 items-start">
                <div className="p-2">
                  <Award className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{property.host?.full_name} is a Superhost</p>
                  <p className="text-muted-foreground text-sm">Superhosts are experienced, highly rated hosts.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="p-2">
                  <DoorOpen className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Self check-in</p>
                  <p className="text-muted-foreground text-sm">Check yourself in with the lockbox.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="p-2">
                  <CalendarDays className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Free cancellation before check-in</p>
                  <p className="text-muted-foreground text-sm">Get a full refund if you change your mind.</p>
                </div>
              </div>
            </motion.div>

            <Separator />

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AnimatePresence mode="wait">
                <motion.p 
                  key={showFullDescription ? 'full' : 'clipped'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn("text-foreground leading-relaxed whitespace-pre-line", !showFullDescription && "line-clamp-6")}
                >
                  {property.description}
                </motion.p>
              </AnimatePresence>
              {property.description && property.description.length > 300 && (
                <Button 
                  variant="link" 
                  className="px-0 mt-2 underline text-foreground font-semibold"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </Button>
              )}
            </motion.div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <>
                <Separator />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-xl font-semibold mb-6">What this place offers</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {property.amenities.slice(0, 10).map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || Wifi;
                      return (
                        <div key={amenity} className="flex items-center gap-4 py-2">
                          <IconComponent className="h-6 w-6 text-foreground" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                  {property.amenities.length > 10 && (
                    <Button 
                      variant="outline" 
                      className="mt-6 rounded-lg border-foreground"
                      onClick={() => setShowAmenitiesModal(true)}
                    >
                      Show all {property.amenities.length} amenities
                    </Button>
                  )}
                </motion.div>
              </>
            )}

            {/* Calendar Section */}
            <Separator />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-semibold mb-2">
                {nights > 0 
                  ? `${nights} night${nights > 1 ? 's' : ''} in ${property.location.split(',')[0]}`
                  : `Select check-in date`
                }
              </h3>
              {dateRange.from && dateRange.to && (
                <p className="text-muted-foreground text-sm mb-6">
                  {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                </p>
              )}
              <div className="flex justify-center lg:justify-start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  disabled={{ before: new Date() }}
                  className="rounded-xl p-3 pointer-events-auto"
                  numberOfMonths={2}
                />
              </div>
              <Button 
                variant="link" 
                className="px-0 mt-4 underline text-foreground"
                onClick={() => setDateRange({ from: undefined, to: undefined })}
              >
                Clear dates
              </Button>
            </motion.div>

            {/* Rating Section */}
            <Separator />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex flex-col items-center text-center py-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-7xl font-semibold">4.9</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-foreground text-foreground" />
                  ))}
                </div>
                <p className="text-lg font-semibold">Guest favorite</p>
                <p className="text-muted-foreground text-sm max-w-md">
                  One of the most loved homes on Agribnv based on ratings, reviews, and reliability.
                </p>
              </div>

              {/* Rating Categories */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 border-y py-6">
                {ratingCategories.map((cat) => (
                  <div key={cat.label} className="text-center border-r last:border-r-0 px-2">
                    <p className="text-sm text-muted-foreground mb-1">{cat.label}</p>
                    <p className="font-semibold">{cat.rating}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="pt-4"
            >
              <div className="grid md:grid-cols-2 gap-8">
                {mockReviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-foreground text-background text-sm font-medium">
                          {review.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{review.name}</p>
                        <p className="text-muted-foreground text-xs">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{review.text}</p>
                    <Button variant="link" className="px-0 text-sm underline text-foreground font-semibold">
                      Show more
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="mt-8 rounded-lg border-foreground"
              >
                Show all 128 reviews
              </Button>
            </motion.div>

            {/* Map Section */}
            <Separator className="mt-8" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-4"
            >
              <h3 className="text-xl font-semibold mb-2">Where you'll be</h3>
              <p className="text-muted-foreground mb-6">{property.location}</p>
              {property.latitude && property.longitude ? (
                <PropertyMap
                  properties={[property]}
                  selectedPropertyId={property.id}
                  className="h-[300px] md:h-[400px] rounded-xl"
                />
              ) : (
                <div className="h-[300px] md:h-[400px] bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sage/20 to-primary/10" />
                  <div className="text-center z-10">
                    <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
                    <p className="text-muted-foreground">Location coordinates not available</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Host Section */}
            <Separator className="mt-8" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="pt-4"
            >
              <h3 className="text-xl font-semibold mb-6">Meet your Host</h3>
              <div className="flex flex-col md:flex-row gap-8">
                <Card className="flex-shrink-0 p-6 text-center shadow-lg rounded-xl bg-gradient-to-br from-background to-muted/30">
                  <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-background shadow-lg">
                    <AvatarImage src={property.host?.avatar_url || undefined} />
                    <AvatarFallback className="bg-foreground text-background text-3xl font-semibold">
                      {property.host?.full_name?.charAt(0) || 'H'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xl font-semibold">{property.host?.full_name}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-foreground" />
                    <span className="text-sm font-medium">Superhost</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                    <div className="border-r pr-4">
                      <p className="font-bold text-lg">203</p>
                      <p className="text-muted-foreground text-xs">Reviews</p>
                    </div>
                    <div className="border-r pr-4">
                      <p className="font-bold text-lg">4.88</p>
                      <p className="text-muted-foreground text-xs">Rating</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg">3</p>
                      <p className="text-muted-foreground text-xs">Years</p>
                    </div>
                  </div>
                </Card>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="font-semibold">Superhost</p>
                    <p className="text-sm text-muted-foreground">Superhosts are experienced, highly rated hosts who are committed to providing great stays.</p>
                  </div>
                  <div>
                    <p className="font-semibold">Co-hosts</p>
                    <ul className="text-sm text-muted-foreground">
                      <li>• Guest Service</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">Host details</p>
                    <p className="text-sm text-muted-foreground">Response rate: 100%</p>
                    <p className="text-sm text-muted-foreground">Responds within an hour</p>
                  </div>
                  <Button 
                    className="rounded-lg bg-foreground text-background hover:bg-foreground/90 mt-4"
                    onClick={handleContactHost}
                    disabled={isStartingConversation}
                  >
                    {isStartingConversation ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Message Host
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Things to Know */}
            <Separator className="mt-8" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="pt-4 pb-8"
            >
              <h3 className="text-xl font-semibold mb-6">Things to know</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-semibold mb-4">House rules</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Check-in: {property.check_in_time ? formatTime(property.check_in_time) : '2:00 PM'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Checkout: {property.check_out_time ? formatTime(property.check_out_time) : '12:00 PM'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {property.max_guests} guests maximum
                    </li>
                    {property.house_rules?.slice(0, 2).map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                  {property.house_rules && property.house_rules.length > 2 && (
                    <Button variant="link" className="px-0 mt-2 underline text-foreground font-semibold text-sm">
                      Show more
                    </Button>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Safety & property</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {property.safety_features && property.safety_features.length > 0 ? (
                      property.safety_features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          {feature}
                        </li>
                      ))
                    ) : (
                      <>
                        <li>Carbon monoxide alarm</li>
                        <li>Smoke detector</li>
                        <li>First aid kit</li>
                      </>
                    )}
                  </ul>
                  {property.safety_features && property.safety_features.length > 3 && (
                    <Button variant="link" className="px-0 mt-2 underline text-foreground font-semibold text-sm">
                      Show more
                    </Button>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Cancellation policy</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="font-medium text-foreground">
                      {property.cancellation_policy 
                        ? CANCELLATION_POLICY_LABELS[property.cancellation_policy]
                        : 'Moderate'}
                    </li>
                    <li>
                      {property.cancellation_policy 
                        ? CANCELLATION_POLICY_DESCRIPTIONS[property.cancellation_policy]
                        : 'Free cancellation up to 5 days before check-in'}
                    </li>
                  </ul>
                </div>
              </div>
              {property.additional_rules && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Additional information</h4>
                  <p className="text-sm text-muted-foreground">{property.additional_rules}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <Card className="shadow-xl border rounded-xl overflow-hidden">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">₱{property.price_per_night.toLocaleString()}</span>
                    <span className="text-muted-foreground">night</span>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 border-b">
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="p-3 border-r hover:bg-muted/50 cursor-pointer transition-colors">
                            <p className="text-[10px] font-bold uppercase tracking-wide">Check-in</p>
                            <p className={cn("text-sm", !dateRange.from && "text-muted-foreground")}>
                              {dateRange.from ? format(dateRange.from, 'M/d/yyyy') : 'Add date'}
                            </p>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                            disabled={{ before: new Date() }}
                            numberOfMonths={2}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                            <p className="text-[10px] font-bold uppercase tracking-wide">Checkout</p>
                            <p className={cn("text-sm", !dateRange.to && "text-muted-foreground")}>
                              {dateRange.to ? format(dateRange.to, 'M/d/yyyy') : 'Add date'}
                            </p>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                            disabled={{ before: dateRange.from || new Date() }}
                            numberOfMonths={2}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                          <p className="text-[10px] font-bold uppercase tracking-wide">Guests</p>
                          <p className="text-sm">{guestCount} guest{guestCount > 1 ? 's' : ''}</p>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-72" align="start">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Guests</p>
                            <p className="text-sm text-muted-foreground">Max {property.max_guests}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              disabled={guestCount <= 1}
                              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{guestCount}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                              disabled={guestCount >= property.max_guests}
                              onClick={() => setGuestCount(Math.min(property.max_guests, guestCount + 1))}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button 
                    className="w-full h-12 rounded-lg text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                    disabled={!dateRange.from || !dateRange.to || isBooking}
                    onClick={handleBooking}
                  >
                    {isBooking ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reserve'}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">You won't be charged yet</p>

                  {nights > 0 && (
                    <div className="space-y-3 text-sm pt-2">
                      <div className="flex justify-between">
                        <span className="underline">₱{property.price_per_night.toLocaleString()} × {nights} nights</span>
                        <span>₱{accommodationTotal.toLocaleString()}</span>
                      </div>
                      {experiencesTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="underline">Experiences</span>
                          <span>₱{experiencesTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="underline">Agribnv service fee</span>
                        <span>₱{serviceFee.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold pt-2">
                        <span>Total before taxes</span>
                        <span>₱{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Report listing link */}
              <div className="text-center mt-4">
                <Button variant="link" className="text-muted-foreground underline text-sm">
                  Report this listing
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal - Works for both mobile and desktop */}
      <PhotoGalleryModal
        isOpen={showAllPhotos}
        onClose={() => setShowAllPhotos(false)}
        images={imageUrls}
        propertyName={property.name}
        isLiked={isLiked}
        onToggleLike={() => setIsLiked(!isLiked)}
      />

      {/* Amenities Modal */}
      <AmenitiesModal
        isOpen={showAmenitiesModal}
        onClose={() => setShowAmenitiesModal(false)}
        amenities={property.amenities || []}
        propertyName={property.name}
      />
    </Layout>
  );
}
