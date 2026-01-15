import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, BOOKING_STATUS_LABELS } from '@/types/database';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, property:properties(*, images:property_images(*))`)
      .eq('guest_id', user?.id)
      .order('check_in', { ascending: false });

    if (!error && data) {
      setBookings(data as unknown as Booking[]);
    }
    setIsLoading(false);
  };

  const upcomingBookings = bookings.filter(b => new Date(b.check_in) >= new Date() && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => new Date(b.check_in) < new Date() || b.status === 'cancelled');

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-white';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to view your bookings</h1>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-6">My Bookings</h1>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <BookingsSkeleton />
            ) : upcomingBookings.length === 0 ? (
              <EmptyState message="No upcoming bookings" actionLabel="Explore Farm Stays" actionLink="/" />
            ) : (
              <div className="grid gap-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} getStatusColor={getStatusColor} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {isLoading ? (
              <BookingsSkeleton />
            ) : pastBookings.length === 0 ? (
              <EmptyState message="No past bookings yet" />
            ) : (
              <div className="grid gap-4">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} getStatusColor={getStatusColor} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function BookingCard({ booking, getStatusColor }: { booking: Booking; getStatusColor: (status: Booking['status']) => string }) {
  const primaryImage = booking.property?.images?.find(img => img.is_primary) || booking.property?.images?.[0];
  
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-40 md:h-auto">
          <img
            src={primaryImage?.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'}
            alt={booking.property?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="flex-1 p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(booking.status)}>
                  {BOOKING_STATUS_LABELS[booking.status]}
                </Badge>
              </div>
              <h3 className="font-display font-semibold text-lg">
                <Link to={`/properties/${booking.property_id}`} className="hover:text-primary">
                  {booking.property?.name}
                </Link>
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {booking.property?.location}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(booking.check_in), 'MMM d')} - {format(new Date(booking.check_out), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {booking.guests_count} guests
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-xl">₱{booking.total_price.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function EmptyState({ message, actionLabel, actionLink }: { message: string; actionLabel?: string; actionLink?: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📅</div>
      <p className="text-muted-foreground mb-4">{message}</p>
      {actionLabel && actionLink && (
        <Button asChild>
          <Link to={actionLink}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <Skeleton className="md:w-48 h-40" />
            <div className="p-4 flex-1 space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
