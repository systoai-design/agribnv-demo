import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Property, Experience, CATEGORY_LABELS } from '@/types/database';
import {
  MapPin, Users, BedDouble, Bath, Wifi, Car, Utensils, TreePine,
  Clock, ChevronLeft, ChevronRight, Loader2, Star, Share, Heart, Grid3X3
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
      // If user is logged in, save to database
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
        // Mock booking for non-authenticated users
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
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
      <div className="container py-6 max-w-6xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">{property.name}</h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 font-medium">
                <Star className="h-4 w-4 fill-current" /> 4.95 · 128 reviews
              </span>
              <span className="underline font-medium">{property.location}</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2 rounded-lg">
                <Share className="h-4 w-4" /> Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 rounded-lg"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-primary text-primary')} /> Save
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden mb-8"
        >
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px]">
            <div className="col-span-2 row-span-2 relative">
              <img src={imageUrls[0]} alt={property.name} className="w-full h-full object-cover" />
            </div>
            {imageUrls.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative hidden md:block">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute bottom-4 right-4 gap-2 bg-white rounded-lg shadow-soft"
          >
            <Grid3X3 className="h-4 w-4" /> Show all photos
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">
                  {CATEGORY_LABELS[property.category]} hosted by {property.host?.full_name}
                </h2>
                <p className="text-muted-foreground">
                  {property.max_guests} guests · {property.bedrooms} bedrooms · {property.bathrooms} baths
                </p>
              </div>
              <Avatar className="h-14 w-14">
                <AvatarImage src={property.host?.avatar_url || undefined} />
                <AvatarFallback className="bg-gray-800 text-white text-lg">
                  {property.host?.full_name?.charAt(0) || 'H'}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <Separator />

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {property.experiences && property.experiences.length > 0 && (
                <div className="flex gap-6">
                  <div className="text-2xl">🌾</div>
                  <div>
                    <p className="font-semibold">Hands-on experiences included</p>
                    <p className="text-muted-foreground text-sm">This farm offers {property.experiences.length} unique activities</p>
                  </div>
                </div>
              )}
              <div className="flex gap-6">
                <div className="text-2xl">📍</div>
                <div>
                  <p className="font-semibold">Great location</p>
                  <p className="text-muted-foreground text-sm">95% of recent guests gave the location a 5-star rating</p>
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
              <p className="text-foreground leading-relaxed">{property.description}</p>
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
                    {property.amenities.slice(0, 8).map((amenity) => (
                      <div key={amenity} className="flex items-center gap-4 py-2">
                        <span className="text-lg">✓</span>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                  {property.amenities.length > 8 && (
                    <Button variant="outline" className="mt-4 rounded-lg">
                      Show all {property.amenities.length} amenities
                    </Button>
                  )}
                </motion.div>
              </>
            )}

            {/* Experiences */}
            {property.experiences && property.experiences.length > 0 && (
              <>
                <Separator />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-xl font-semibold mb-6">Add experiences</h3>
                  <div className="space-y-4">
                    {property.experiences.filter(e => e.is_active).map((exp) => (
                      <motion.div
                        key={exp.id}
                        whileHover={{ scale: 1.01 }}
                        className={cn(
                          'p-4 border rounded-xl cursor-pointer transition-colors',
                          selectedExperiences.includes(exp.id) && 'border-foreground bg-muted/30'
                        )}
                        onClick={() => {
                          setSelectedExperiences(prev => 
                            prev.includes(exp.id) ? prev.filter(id => id !== exp.id) : [...prev, exp.id]
                          );
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox checked={selectedExperiences.includes(exp.id)} />
                          <div className="flex-1">
                            <h4 className="font-semibold">{exp.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" /> {exp.duration_hours}h
                              </span>
                              <span className="font-semibold">₱{exp.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <Card className="shadow-card border rounded-xl">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">₱{property.price_per_night.toLocaleString()}</span>
                    <span className="text-muted-foreground">night</span>
                  </div>

                  <div className="border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-2 border-b">
                      <div className="p-3 border-r">
                        <p className="text-[10px] font-semibold uppercase">Check-in</p>
                        <p className="text-sm">{dateRange.from ? format(dateRange.from, 'MMM d, yyyy') : 'Add date'}</p>
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] font-semibold uppercase">Checkout</p>
                        <p className="text-sm">{dateRange.to ? format(dateRange.to, 'MMM d, yyyy') : 'Add date'}</p>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-semibold uppercase">Guests</p>
                      <p className="text-sm">{guestCount} guest{guestCount > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    disabled={{ before: new Date() }}
                    className="rounded-xl border p-3"
                    numberOfMonths={1}
                  />

                  <Button 
                    className="w-full h-12 rounded-lg text-base font-semibold bg-gradient-to-r from-[#E61E4D] to-[#D70466]"
                    disabled={!dateRange.from || !dateRange.to || isBooking}
                    onClick={handleBooking}
                  >
                    {isBooking ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reserve'}
                  </Button>

                  {nights > 0 && (
                    <div className="space-y-3 text-sm">
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
                        <span className="underline">Service fee</span>
                        <span>₱{serviceFee.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold pt-2">
                        <span>Total</span>
                        <span>₱{totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
