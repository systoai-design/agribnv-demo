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
import { Plus, Home, Calendar, Users, MapPin, Eye, Edit, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

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

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Host Dashboard</h1>
            <p className="text-muted-foreground">Manage your properties and bookings</p>
          </div>
          <Button asChild>
            <Link to="/host/properties/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{properties.length}</div>
              <p className="text-sm text-muted-foreground">Total Properties</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{publishedCount}</div>
              <p className="text-sm text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{upcomingBookings.length}</div>
              <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                ₱{bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + Number(b.total_price), 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Confirmed Revenue</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
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
                  <BookingRow key={booking.id} booking={booking} />
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
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <img
            src={primaryImage?.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200'}
            alt={property.name}
            className="w-full md:w-32 h-24 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={property.is_published ? 'default' : 'secondary'}>
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
            <p className="text-sm font-medium mt-1">₱{property.price_per_night.toLocaleString()} / night</p>
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

function BookingRow({ booking }: { booking: Booking }) {
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-white';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={getStatusColor(booking.status)}>{BOOKING_STATUS_LABELS[booking.status]}</Badge>
            </div>
            <h3 className="font-semibold">{booking.property?.name}</h3>
            <p className="text-sm text-muted-foreground">
              Guest: {booking.guest?.full_name || 'Unknown'} • {booking.guests_count} guests
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
        </div>
      </CardContent>
    </Card>
  );
}

function PropertiesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <Card key={i}><CardContent className="p-4 flex gap-4"><Skeleton className="w-32 h-24" /><div className="flex-1 space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div></CardContent></Card>
      ))}
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
      ))}
    </div>
  );
}
