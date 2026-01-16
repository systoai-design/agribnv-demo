import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Property, Experience, CATEGORY_LABELS } from '@/types/database';
import {
  MapPin, Users, BedDouble, Bath, Wifi, Car, Utensils, TreePine, Tv, Wind,
  Clock, ChevronLeft, ChevronRight, Loader2, Star, Share, Heart, Grid3X3,
  Warehouse, DoorOpen, ShieldCheck, X, Award, CalendarDays, MessageCircle
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

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [guestCount, setGuestCount] = useState(1);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select(`*, images:property_images(*), experiences(*), host:profiles!properties_host_id_fkey(*)`)
      .eq('id', id)
      .single();

    if (!error && data) {
      setProperty(data as unknown as Property);
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
    <Layout showMobileNav={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <Button variant="ghost" size="sm" className="gap-2 rounded-lg hover:bg-muted">
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
                  "relative hidden md:block cursor-pointer",
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

        {/* Photo Gallery Dialog */}
        <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
          <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto">
            <div className="grid gap-2">
              {imageUrls.map((img, idx) => (
                <img key={idx} src={img} alt="" className="w-full rounded-lg" />
              ))}
            </div>
          </DialogContent>
        </Dialog>

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
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
              <Button variant="link" className="px-0 mt-2 underline text-foreground font-semibold">
                Show more
              </Button>
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
                    {property.amenities.slice(0, showAllAmenities ? property.amenities.length : 10).map((amenity) => {
                      const IconComponent = amenityIcons[amenity] || Wifi;
                      return (
                        <div key={amenity} className="flex items-center gap-4 py-2">
                          <IconComponent className="h-6 w-6 text-foreground" />
                          <span>{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                  {property.amenities.length > 10 && !showAllAmenities && (
                    <Button 
                      variant="outline" 
                      className="mt-6 rounded-lg border-foreground"
                      onClick={() => setShowAllAmenities(true)}
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
              <div className="h-[300px] md:h-[400px] bg-muted rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sage/20 to-primary/10" />
                <div className="text-center z-10">
                  <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">Map view coming soon</p>
                </div>
              </div>
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
                  <Button className="rounded-lg bg-foreground text-background hover:bg-foreground/90 mt-4">
                    <MessageCircle className="h-4 w-4 mr-2" />
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
                    <li>Check-in: 2:00 PM - 10:00 PM</li>
                    <li>Checkout before 12:00 PM</li>
                    <li>{property.max_guests} guests maximum</li>
                  </ul>
                  <Button variant="link" className="px-0 mt-2 underline text-foreground font-semibold text-sm">
                    Show more
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Safety & property</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>Pool/hot tub without a gate or lock</li>
                    <li>Nearby lake, river, other body of water</li>
                    <li>Carbon monoxide alarm</li>
                  </ul>
                  <Button variant="link" className="px-0 mt-2 underline text-foreground font-semibold text-sm">
                    Show more
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Cancellation policy</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>Free cancellation before check-in</li>
                    <li>Review the full policy for details</li>
                  </ul>
                  <Button variant="link" className="px-0 mt-2 underline text-foreground font-semibold text-sm">
                    Show more
                  </Button>
                </div>
              </div>
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
                      <div className="p-3 border-r hover:bg-muted/50 cursor-pointer transition-colors">
                        <p className="text-[10px] font-bold uppercase tracking-wide">Check-in</p>
                        <p className="text-sm">{dateRange.from ? format(dateRange.from, 'M/d/yyyy') : 'Add date'}</p>
                      </div>
                      <div className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                        <p className="text-[10px] font-bold uppercase tracking-wide">Checkout</p>
                        <p className="text-sm">{dateRange.to ? format(dateRange.to, 'M/d/yyyy') : 'Add date'}</p>
                      </div>
                    </div>
                    <div className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                      <p className="text-[10px] font-bold uppercase tracking-wide">Guests</p>
                      <p className="text-sm">{guestCount} guest{guestCount > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 rounded-lg text-base font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
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
    </Layout>
  );
}
