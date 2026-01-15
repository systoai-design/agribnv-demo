import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, differenceInDays, addDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Property, Experience, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/database';
import {
  MapPin, Users, BedDouble, Bath, Wifi, Car, Utensils, TreePine,
  Clock, ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi,
  'Free Parking': Car,
  Kitchen: Utensils,
  Garden: TreePine,
};

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
  const totalPrice = accommodationTotal + experiencesTotal;

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!dateRange.from || !dateRange.to || !property) return;

    setIsBooking(true);
    try {
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

      // Add selected experiences
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

      toast({ title: 'Booking confirmed!', description: 'Check your bookings page for details.' });
      navigate('/bookings');
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
          <h1 className="text-2xl font-bold">Property not found</h1>
          <Button onClick={() => navigate('/')} className="mt-4">Back to Explore</Button>
        </div>
      </Layout>
    );
  }

  const images = property.images?.sort((a, b) => a.display_order - b.display_order) || [];
  const currentImage = images[currentImageIndex]?.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800';

  return (
    <Layout>
      <div className="container py-6">
        {/* Image Gallery */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden mb-6">
          <img src={currentImage} alt={property.name} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2"
                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    className={cn('w-2 h-2 rounded-full transition-colors', idx === currentImageIndex ? 'bg-white' : 'bg-white/50')}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}
          <Badge className="absolute top-4 left-4 bg-card/90 text-foreground backdrop-blur">
            {CATEGORY_ICONS[property.category]} {CATEGORY_LABELS[property.category]}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>{property.location}</span>
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">{property.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Up to {property.max_guests} guests</span>
                <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {property.bedrooms} bedrooms</span>
                <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms} bathrooms</span>
              </div>
            </div>

            <Separator />

            {/* Host */}
            {property.host && (
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={property.host.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {property.host.full_name?.charAt(0) || 'H'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Hosted by {property.host.full_name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{property.host.bio}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-3">About this place</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="font-display text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => {
                      const Icon = AMENITY_ICONS[amenity] || TreePine;
                      return (
                        <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Experiences */}
            {property.experiences && property.experiences.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="font-display text-xl font-semibold mb-4">Add Experiences</h2>
                  <div className="grid gap-4">
                    {property.experiences.filter(e => e.is_active).map((exp) => (
                      <Card key={exp.id} className={cn('cursor-pointer transition-colors', selectedExperiences.includes(exp.id) && 'ring-2 ring-primary')}>
                        <CardContent className="p-4 flex items-start gap-4">
                          <Checkbox
                            checked={selectedExperiences.includes(exp.id)}
                            onCheckedChange={(checked) => {
                              setSelectedExperiences(prev => 
                                checked ? [...prev, exp.id] : prev.filter(id => id !== exp.id)
                              );
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{exp.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" /> {exp.duration_hours}h
                              </span>
                              <span className="font-semibold text-primary">₱{exp.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">₱{property.price_per_night.toLocaleString()}</span>
                  <span className="text-base font-normal text-muted-foreground">/ night</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Dates</label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    disabled={{ before: new Date() }}
                    className="rounded-lg border"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Guests</label>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => setGuestCount(Math.max(1, guestCount - 1))} disabled={guestCount <= 1}>-</Button>
                    <span className="w-8 text-center">{guestCount}</span>
                    <Button variant="outline" size="icon" onClick={() => setGuestCount(Math.min(property.max_guests, guestCount + 1))} disabled={guestCount >= property.max_guests}>+</Button>
                  </div>
                </div>

                {nights > 0 && (
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>₱{property.price_per_night.toLocaleString()} × {nights} nights</span>
                      <span>₱{accommodationTotal.toLocaleString()}</span>
                    </div>
                    {experiencesTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Experiences ({selectedExperiences.length})</span>
                        <span>₱{experiencesTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>₱{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg" 
                  disabled={!dateRange.from || !dateRange.to || isBooking}
                  onClick={handleBooking}
                >
                  {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {user ? 'Book Now' : 'Sign in to Book'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
