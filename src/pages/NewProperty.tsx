import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGeocoding } from '@/hooks/useGeocoding';
import { PropertyCategory, CATEGORY_LABELS, CATEGORY_ICONS, ImageCategory } from '@/types/database';
import { ImageUploader, UploadedImage } from '@/components/properties/ImageUploader';
import { Loader2, ArrowLeft, MapPin, Bed, Bath, Users, DollarSign, Camera, MapPinned, Check } from 'lucide-react';

const AMENITIES = [
  'WiFi', 
  'Kitchen', 
  'Free Parking', 
  'Garden View', 
  'Farm Tour', 
  'Breakfast Included', 
  'Pool', 
  'Hot Tub', 
  'BBQ Grill', 
  'Bonfire Area', 
  'Farm Animals', 
  'Hiking Trails', 
  'Beach Access',
  'Air Conditioning',
  'Outdoor Dining',
  'Fishing'
];

const propertySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(3, 'Location is required'),
  address: z.string().optional(),
  price_per_night: z.number().min(100, 'Price must be at least ₱100'),
  max_guests: z.number().min(1).max(20),
  bedrooms: z.number().min(1).max(10),
  bathrooms: z.number().min(1).max(10),
  category: z.string(),
});

type PropertyForm = z.infer<typeof propertySchema>;

export default function NewProperty() {
  const navigate = useNavigate();
  const { user, isHost } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const { geocode, isLoading: isGeocoding } = useGeocoding();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      max_guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      category: 'farmstay',
    },
  });

  const locationValue = watch('location');
  const addressValue = watch('address');

  // Auto-geocode when location or address changes
  useEffect(() => {
    const geocodeLocation = async () => {
      const searchAddress = addressValue 
        ? `${addressValue}, ${locationValue}` 
        : locationValue;
      
      if (searchAddress && searchAddress.length >= 3) {
        const result = await geocode(searchAddress);
        if (result) {
          setCoordinates({ lat: result.latitude, lng: result.longitude });
        }
      }
    };

    const debounce = setTimeout(geocodeLocation, 1000);
    return () => clearTimeout(debounce);
  }, [locationValue, addressValue, geocode]);

  const onSubmit = async (data: PropertyForm) => {
    if (!user || !isHost) return;

    if (uploadedImages.length === 0) {
      toast({
        title: 'Images required',
        description: 'Please upload at least one image of your property',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create property with coordinates
      const { data: property, error } = await supabase
        .from('properties')
        .insert([{
          name: data.name,
          description: data.description,
          location: data.location,
          address: data.address,
          price_per_night: data.price_per_night,
          max_guests: data.max_guests,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          category: data.category as PropertyCategory,
          host_id: user.id,
          amenities: selectedAmenities,
          is_published: false,
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lng || null,
        }])
        .select()
        .single();

      if (error) throw error;

      // Save all uploaded images to property_images table
      if (property && uploadedImages.length > 0) {
        const imageRecords = uploadedImages.map((img, index) => ({
          property_id: property.id,
          image_url: img.url,
          is_primary: img.isPrimary,
          display_order: index,
          category: img.category as ImageCategory,
          caption: img.caption || null,
        }));

        const { error: imageError } = await supabase
          .from('property_images')
          .insert(imageRecords);

        if (imageError) {
          console.error('Error saving images:', imageError);
          toast({
            title: 'Warning',
            description: 'Property created but some images may not have saved correctly',
            variant: 'destructive',
          });
        }
      }

      toast({ 
        title: 'Property created!', 
        description: `${uploadedImages.length} images uploaded. You can now publish it from the dashboard.` 
      });
      navigate('/host');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !isHost) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">You need to be a host to add properties</h1>
          <Button className="mt-4" onClick={() => navigate('/host')}>Go to Host Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/host')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">Add New Property</CardTitle>
              <CardDescription>Fill in the details below to list your farm or property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input id="name" placeholder="e.g., The Mango Orchard Retreat" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your property, the experience guests can expect, and what makes it special..." 
                    rows={4} 
                    {...register('description')} 
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select defaultValue="farmstay" onValueChange={(val) => setValue('category', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CATEGORY_LABELS) as PropertyCategory[]).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Location
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">City/Municipality *</Label>
                    <Input id="location" placeholder="e.g., Jordan, Guimaras" {...register('location')} />
                    {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" placeholder="e.g., Brgy. Rizal, Jordan" {...register('address')} />
                  </div>
                </div>

                {/* Geocoding Status */}
                <div className="flex items-center gap-2 text-sm">
                  {isGeocoding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Finding coordinates...</span>
                    </>
                  ) : coordinates ? (
                    <>
                      <MapPinned className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Location found ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})
                      </span>
                    </>
                  ) : locationValue && locationValue.length >= 3 ? (
                    <span className="text-muted-foreground">Enter location to auto-detect coordinates</span>
                  ) : null}
                </div>
              </div>

              {/* Property Details Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Property Details</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_per_night" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Price/Night (₱) *
                    </Label>
                    <Input 
                      id="price_per_night" 
                      type="number" 
                      placeholder="2500" 
                      {...register('price_per_night', { valueAsNumber: true })} 
                    />
                    {errors.price_per_night && <p className="text-sm text-destructive">{errors.price_per_night.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_guests" className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> Max Guests
                    </Label>
                    <Input id="max_guests" type="number" {...register('max_guests', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms" className="flex items-center gap-1">
                      <Bed className="h-4 w-4" /> Bedrooms
                    </Label>
                    <Input id="bedrooms" type="number" {...register('bedrooms', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms" className="flex items-center gap-1">
                      <Bath className="h-4 w-4" /> Bathrooms
                    </Label>
                    <Input id="bathrooms" type="number" {...register('bathrooms', { valueAsNumber: true })} />
                  </div>
                </div>
              </div>

              {/* Amenities Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          setSelectedAmenities(prev =>
                            checked ? [...prev, amenity] : prev.filter(a => a !== amenity)
                          );
                        }}
                      />
                      <label htmlFor={amenity} className="text-sm cursor-pointer">{amenity}</label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Property Photos
              </CardTitle>
              <CardDescription>
                Upload photos of your property organized by room/area. 
                The first image will be your cover photo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                userId={user.id}
                images={uploadedImages}
                onChange={setUploadedImages}
                maxImages={20}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <Card>
            <CardContent className="py-6">
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Property
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Your property will be saved as a draft. You can publish it from the dashboard.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
