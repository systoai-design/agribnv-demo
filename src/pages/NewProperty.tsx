import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PropertyCategory, CATEGORY_LABELS } from '@/types/database';
import { Loader2, ArrowLeft } from 'lucide-react';

const AMENITIES = ['WiFi', 'Kitchen', 'Free Parking', 'Garden View', 'Farm Tour', 'Breakfast Included', 'Pool', 'Hot Tub', 'BBQ Grill', 'Bonfire Area', 'Farm Animals', 'Hiking Trails', 'Beach Access'];

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
          category: data.category as any,
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
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate('/host')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Add New Property</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input id="name" placeholder="The Mango Orchard Retreat" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" placeholder="Describe your property..." rows={4} {...register('description')} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input id="location" placeholder="Jordan, Guimaras" {...register('location')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input id="address" placeholder="Brgy. Rizal, Jordan" {...register('address')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select defaultValue="organic_farm" onValueChange={(val) => setValue('category', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABELS) as PropertyCategory[]).map((cat) => (
                      <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_night">Price/Night (₱) *</Label>
                  <Input id="price_per_night" type="number" placeholder="2500" {...register('price_per_night', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_guests">Max Guests</Label>
                  <Input id="max_guests" type="number" {...register('max_guests', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" type="number" {...register('bedrooms', { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" type="number" {...register('bathrooms', { valueAsNumber: true })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Cover Image URL</Label>
                <Input id="imageUrl" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </div>

              <div className="space-y-3">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Property
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
