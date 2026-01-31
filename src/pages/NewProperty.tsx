import { useState } from 'react';
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
import { PropertyCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/database';
import { Loader2, ArrowLeft, Upload, MapPin, Bed, Bath, Users, DollarSign } from 'lucide-react';

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
  const [imageUrl, setImageUrl] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      max_guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      category: 'organic_farm',
    },
  });

  const onSubmit = async (data: PropertyForm) => {
    if (!user || !isHost) return;

    setIsLoading(true);
    try {
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
        }])
        .select()
        .single();

      if (error) throw error;

      // Add image if provided
      if (imageUrl && property) {
        await supabase.from('property_images').insert({
          property_id: property.id,
          image_url: imageUrl,
          is_primary: true,
        });
      }

      toast({ title: 'Property created!', description: 'You can now add more details and publish it.' });
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
      <div className="container py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/host')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Add New Property</CardTitle>
            <CardDescription>Fill in the details below to list your farm or property</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                  <Select defaultValue="organic_farm" onValueChange={(val) => setValue('category', val)}>
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

              {/* Image Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                  <Upload className="h-5 w-5" /> Cover Image
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input 
                    id="imageUrl" 
                    placeholder="https://example.com/image.jpg" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground">Paste a direct link to your property image</p>
                </div>

                {imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
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

              {/* Submit */}
              <div className="pt-4 border-t">
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Property
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Your property will be saved as a draft. You can publish it from the dashboard.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
