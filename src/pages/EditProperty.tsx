import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useGeocoding } from '@/hooks/useGeocoding';
import { 
  Property,
  PropertyCategory, 
  CancellationPolicy,
  CATEGORY_LABELS, 
  CATEGORY_ICONS,
  CANCELLATION_POLICY_LABELS,
  CANCELLATION_POLICY_DESCRIPTIONS,
  HOUSE_RULES_OPTIONS,
  SAFETY_FEATURES_OPTIONS,
} from '@/types/database';
import { ImageUploader, UploadedImage } from '@/components/properties/ImageUploader';
import { 
  Loader2, ArrowLeft, MapPin, Bed, Bath, Users, DollarSign, Camera, 
  Clock, Shield, FileText, AlertTriangle, Settings, MapPinned, Check 
} from 'lucide-react';

const AMENITIES = [
  'WiFi', 'Kitchen', 'Free Parking', 'Garden View', 'Farm Tour', 
  'Breakfast Included', 'Pool', 'Hot Tub', 'BBQ Grill', 'Bonfire Area', 
  'Farm Animals', 'Hiking Trails', 'Beach Access', 'Air Conditioning',
  'Outdoor Dining', 'Fishing'
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
  check_in_time: z.string(),
  check_out_time: z.string(),
  cancellation_policy: z.string(),
  additional_rules: z.string().optional(),
});

type PropertyForm = z.infer<typeof propertySchema>;

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isHost } = useAuth();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedHouseRules, setSelectedHouseRules] = useState<string[]>([]);
  const [selectedSafetyFeatures, setSelectedSafetyFeatures] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const { geocode, isLoading: isGeocoding } = useGeocoding();

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
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

  useEffect(() => {
    if (id && user) {
      fetchProperty();
    }
  }, [id, user]);

  const fetchProperty = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select(`*, images:property_images(*)`)
      .eq('id', id)
      .eq('host_id', user?.id)
      .single();

    if (error || !data) {
      toast({ title: 'Error', description: 'Property not found', variant: 'destructive' });
      navigate('/host');
      return;
    }

    const prop = data as unknown as Property;
    setProperty(prop);
    setSelectedAmenities(prop.amenities || []);
    setSelectedHouseRules(prop.house_rules || []);
    setSelectedSafetyFeatures(prop.safety_features || []);

    // Set form values
    reset({
      name: prop.name,
      description: prop.description || '',
      location: prop.location,
      address: prop.address || '',
      price_per_night: prop.price_per_night,
      max_guests: prop.max_guests,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      category: prop.category,
      check_in_time: prop.check_in_time || '14:00',
      check_out_time: prop.check_out_time || '12:00',
      cancellation_policy: prop.cancellation_policy || 'moderate',
      additional_rules: prop.additional_rules || '',
    });

    // Load existing images
    if (prop.images && prop.images.length > 0) {
      setUploadedImages(
        prop.images.map(img => ({
          id: img.id,
          url: img.image_url,
          category: img.category,
          caption: img.caption || '',
          isPrimary: img.is_primary,
        }))
      );
    }

    setIsLoading(false);
  };

  const onSubmit = async (data: PropertyForm) => {
    if (!user || !id) return;

    setIsSaving(true);
    try {
      // Update property with coordinates
      const { error } = await supabase
        .from('properties')
        .update({
          name: data.name,
          description: data.description,
          location: data.location,
          address: data.address,
          price_per_night: data.price_per_night,
          max_guests: data.max_guests,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          category: data.category as PropertyCategory,
          amenities: selectedAmenities,
          check_in_time: data.check_in_time,
          check_out_time: data.check_out_time,
          house_rules: selectedHouseRules,
          safety_features: selectedSafetyFeatures,
          cancellation_policy: data.cancellation_policy as CancellationPolicy,
          additional_rules: data.additional_rules || null,
          latitude: coordinates?.lat || null,
          longitude: coordinates?.lng || null,
        })
        .eq('id', id)
        .eq('host_id', user.id);

      if (error) throw error;

      // Sync images: delete removed, update existing, add new
      const existingImageIds = property?.images?.map(img => img.id) || [];
      const currentImageIds = uploadedImages.filter(img => !img.id.startsWith('temp-')).map(img => img.id);
      const deletedImageIds = existingImageIds.filter(id => !currentImageIds.includes(id));

      // Delete removed images
      if (deletedImageIds.length > 0) {
        await supabase.from('property_images').delete().in('id', deletedImageIds);
      }

      // Update/insert images
      for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i];
        if (img.id.startsWith('temp-')) {
          // New image - insert
          await supabase.from('property_images').insert({
            property_id: id,
            image_url: img.url,
            is_primary: img.isPrimary,
            display_order: i,
            category: img.category,
            caption: img.caption || null,
          });
        } else {
          // Existing image - update
          await supabase.from('property_images').update({
            is_primary: img.isPrimary,
            display_order: i,
            category: img.category,
            caption: img.caption || null,
          }).eq('id', img.id);
        }
      }

      toast({ title: 'Property updated!', description: 'Your changes have been saved.' });
      navigate('/host');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || !isHost) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Access denied</h1>
          <Button className="mt-4" onClick={() => navigate('/host')}>Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-[600px] w-full" />
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

        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Edit Property</h1>
          <p className="text-muted-foreground">{property?.name}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="rules">House Rules</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Property Name *</Label>
                    <Input id="name" {...register('name')} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea id="description" rows={4} {...register('description')} />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      defaultValue={property?.category} 
                      onValueChange={(val) => setValue('category', val)}
                    >
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> City/Municipality *
                      </Label>
                      <Input id="location" {...register('location')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Input id="address" {...register('address')} />
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" /> Price/Night (₱)
                      </Label>
                      <Input type="number" {...register('price_per_night', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> Max Guests
                      </Label>
                      <Input type="number" {...register('max_guests', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Bed className="h-4 w-4" /> Bedrooms
                      </Label>
                      <Input type="number" {...register('bedrooms', { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Bath className="h-4 w-4" /> Bathrooms
                      </Label>
                      <Input type="number" {...register('bathrooms', { valueAsNumber: true })} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold border-b pb-2">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {AMENITIES.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-${amenity}`}
                            checked={selectedAmenities.includes(amenity)}
                            onCheckedChange={(checked) => {
                              setSelectedAmenities(prev =>
                                checked ? [...prev, amenity] : prev.filter(a => a !== amenity)
                              );
                            }}
                          />
                          <label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">{amenity}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Property Photos
                  </CardTitle>
                  <CardDescription>
                    Organize photos by room/area. The cover photo will be displayed in search results.
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
            </TabsContent>

            {/* House Rules Tab */}
            <TabsContent value="rules">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    House Rules
                  </CardTitle>
                  <CardDescription>
                    Set clear expectations for your guests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Check-in/out times */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Check-in Time
                      </Label>
                      <Input type="time" {...register('check_in_time')} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Check-out Time
                      </Label>
                      <Input type="time" {...register('check_out_time')} />
                    </div>
                  </div>

                  {/* House Rules Checkboxes */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Select applicable rules</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {HOUSE_RULES_OPTIONS.map((rule) => (
                        <div key={rule} className="flex items-center space-x-2">
                          <Checkbox
                            id={`rule-${rule}`}
                            checked={selectedHouseRules.includes(rule)}
                            onCheckedChange={(checked) => {
                              setSelectedHouseRules(prev =>
                                checked ? [...prev, rule] : prev.filter(r => r !== rule)
                              );
                            }}
                          />
                          <label htmlFor={`rule-${rule}`} className="text-sm cursor-pointer">{rule}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Rules */}
                  <div className="space-y-2">
                    <Label htmlFor="additional_rules">Additional Rules (optional)</Label>
                    <Textarea 
                      id="additional_rules" 
                      placeholder="Any other rules or important information for guests..."
                      rows={3}
                      {...register('additional_rules')} 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Safety Features */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Safety & Property
                  </CardTitle>
                  <CardDescription>
                    Let guests know about safety features and potential hazards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SAFETY_FEATURES_OPTIONS.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`safety-${feature}`}
                          checked={selectedSafetyFeatures.includes(feature)}
                          onCheckedChange={(checked) => {
                            setSelectedSafetyFeatures(prev =>
                              checked ? [...prev, feature] : prev.filter(f => f !== feature)
                            );
                          }}
                        />
                        <label htmlFor={`safety-${feature}`} className="text-sm cursor-pointer">{feature}</label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Cancellation Policy
                  </CardTitle>
                  <CardDescription>
                    Choose a policy that works for your property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(Object.keys(CANCELLATION_POLICY_LABELS) as CancellationPolicy[]).map((policy) => (
                      <div
                        key={policy}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          property?.cancellation_policy === policy ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => setValue('cancellation_policy', policy)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            {...register('cancellation_policy')}
                            value={policy}
                            className="h-4 w-4"
                          />
                          <span className="font-medium">{CANCELLATION_POLICY_LABELS[policy]}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 ml-6">
                          {CANCELLATION_POLICY_DESCRIPTIONS[policy]}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <Card className="mt-6">
            <CardContent className="py-6">
              <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
