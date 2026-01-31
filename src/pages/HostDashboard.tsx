import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Property, Booking, CATEGORY_LABELS, CATEGORY_ICONS, BOOKING_STATUS_LABELS } from '@/types/database';
import { Plus, Home, Calendar, Users, MapPin, Eye, Edit, ToggleLeft, ToggleRight, Loader2, TrendingUp, DollarSign, Building2 } from 'lucide-react';

export default function HostDashboard() {
  const { user, isHost, becomeHost } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBecomingHost, setIsBecomingHost] = useState(false);

  useEffect(() => {
    if (user && isHost) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user, isHost]);

  const fetchData = async () => {
    const [propertiesRes, bookingsRes] = await Promise.all([
      supabase
        .from('properties')
        .select(`*, images:property_images(*), experiences(*)`)
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('bookings')
        .select(`*, property:properties(*), guest:profiles(*)`)
        .in('property_id', (await supabase.from('properties').select('id').eq('host_id', user?.id)).data?.map(p => p.id) || [])
        .order('check_in', { ascending: true })
    ]);

    if (propertiesRes.data) setProperties(propertiesRes.data as unknown as Property[]);
    if (bookingsRes.data) setBookings(bookingsRes.data as unknown as Booking[]);
    setIsLoading(false);
  };

  const handleBecomeHost = async () => {
    setIsBecomingHost(true);
    const { error } = await becomeHost();
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome, Host!', description: 'You can now list your properties.' });
    }
    setIsBecomingHost(false);
  };

  const handleBookingStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      const statusMessages: Record<Booking['status'], string> = {
        confirmed: 'Booking approved!',
        cancelled: 'Booking cancelled',
        completed: 'Booking marked as complete',
        pending: 'Status updated',
      };
      toast({ title: statusMessages[newStatus] });
    }
  };

  const togglePublish = async (propertyId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('properties')
      .update({ is_published: !currentStatus })
      .eq('id', propertyId);

    if (!error) {
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, is_published: !currentStatus } : p));
      toast({ title: currentStatus ? 'Property unpublished' : 'Property published!' });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to access Host Dashboard</h1>
          <Button asChild><Link to="/auth">Sign In</Link></Button>
        </div>
      </Layout>
    );
  }

  if (!isHost) {
    return (
      <Layout>
        <div className="container py-16 text-center max-w-lg mx-auto">
          <div className="text-6xl mb-4">🏡</div>
          <h1 className="font-display text-3xl font-bold mb-4">Become a Host</h1>
          <p className="text-muted-foreground mb-6">
            Share your farm or rural property with travelers seeking authentic agritourism experiences. 
            Earn extra income while showcasing Guimaras' agricultural heritage.
          </p>
          <Button size="lg" onClick={handleBecomeHost} disabled={isBecomingHost}>
            {isBecomingHost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Start Hosting
          </Button>
        </div>
      </Layout>
    );
  }

  const upcomingBookings = bookings.filter(b => new Date(b.check_in) >= new Date() && b.status !== 'cancelled');
  const publishedCount = properties.filter(p => p.is_published).length;
  const confirmedRevenue = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + Number(b.total_price), 0);

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Host Dashboard</h1>
            <p className="text-muted-foreground">Manage your properties and bookings</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/host/properties/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Total Properties</span>
              </div>
              <div className="text-2xl font-bold">{properties.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">Published</span>
              </div>
              <div className="text-2xl font-bold">{publishedCount}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-warning" />
                <span className="text-sm text-muted-foreground">Upcoming</span>
              </div>
              <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-accent">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-accent-foreground" />
                <span className="text-sm text-muted-foreground">Revenue</span>
              </div>
              <div className="text-2xl font-bold">₱{confirmedRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Commission Info */}
        <Card className="mb-8 bg-muted/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Commission Rates</p>
                <p className="text-xs text-muted-foreground">15% on accommodations • 10% on farm experiences</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="properties">Properties ({properties.length})</TabsTrigger>
            <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            {isLoading ? (
              <PropertiesSkeleton />
            ) : properties.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No properties yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first property to start hosting guests</p>
                  <Button asChild><Link to="/host/properties/new"><Plus className="h-4 w-4 mr-2" />Add Property</Link></Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {properties.map((property) => (
                  <PropertyRow key={property.id} property={property} onTogglePublish={togglePublish} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {isLoading ? (
              <BookingsSkeleton />
            ) : bookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground">Publish your properties to start receiving bookings</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} onStatusChange={handleBookingStatusChange} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function PropertyRow({ property, onTogglePublish }: { property: Property; onTogglePublish: (id: string, current: boolean) => void }) {
  const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <img
            src={primaryImage?.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200'}
            alt={property.name}
            className="w-full md:w-32 h-24 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant={property.is_published ? 'default' : 'secondary'} className={property.is_published ? 'bg-success' : ''}>
                {property.is_published ? 'Published' : 'Draft'}
              </Badge>
              <Badge variant="outline">
                {CATEGORY_ICONS[property.category]} {CATEGORY_LABELS[property.category]}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg truncate">{property.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {property.location}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm">
              <span className="font-medium">₱{property.price_per_night.toLocaleString()} / night</span>
              <span className="text-muted-foreground">{property.bedrooms} bed • {property.bathrooms} bath • {property.max_guests} guests</span>
            </div>
          </div>
          <div className="flex md:flex-col gap-2 md:items-end">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/properties/${property.id}`}><Eye className="h-4 w-4 mr-1" />View</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/host/properties/${property.id}/edit`}><Edit className="h-4 w-4 mr-1" />Edit</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePublish(property.id, property.is_published)}
              className={property.is_published ? 'text-destructive' : 'text-success'}
            >
              {property.is_published ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
              {property.is_published ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingRow({ booking, onStatusChange }: { booking: Booking; onStatusChange: (id: string, status: Booking['status']) => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-white';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  const handleApprove = async () => {
    setIsUpdating(true);
    await onStatusChange(booking.id, 'confirmed');
    setIsUpdating(false);
  };

  const handleCancel = async () => {
    setIsUpdating(true);
    await onStatusChange(booking.id, 'cancelled');
    setIsUpdating(false);
  };

  const handleComplete = async () => {
    setIsUpdating(true);
    await onStatusChange(booking.id, 'completed');
    setIsUpdating(false);
  };

  const isPast = new Date(booking.check_out) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={getStatusColor(booking.status)}>{BOOKING_STATUS_LABELS[booking.status]}</Badge>
            </div>
            <h3 className="font-semibold">{booking.property?.name}</h3>
            <p className="text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 inline mr-1" />
              {booking.guest?.full_name || 'Unknown Guest'} • {booking.guests_count} guest{booking.guests_count > 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(booking.check_in), 'MMM d')} - {format(new Date(booking.check_out), 'MMM d, yyyy')}
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">₱{Number(booking.total_price).toLocaleString()}</p>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2">
            {booking.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={isUpdating}
                  className="bg-success hover:bg-success/90"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="text-destructive border-destructive/50 hover:bg-destructive/10"
                >
                  Decline
                </Button>
              </>
            )}
            {booking.status === 'confirmed' && isPast && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleComplete}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark Complete'}
              </Button>
            )}
            {booking.status === 'confirmed' && !isPast && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PropertiesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <Card key={i}>
          <CardContent className="p-4 flex gap-4">
            <Skeleton className="w-32 h-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
