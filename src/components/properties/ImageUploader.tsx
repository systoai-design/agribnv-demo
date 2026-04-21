import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ImageCategory, IMAGE_CATEGORY_LABELS, IMAGE_CATEGORY_ICONS } from '@/types/database';
import { Upload, X, Loader2, Star, Image as ImageIcon } from 'lucide-react';

export interface UploadedImage {
  id: string;
  url: string;
  category: ImageCategory;
  caption: string;
  isPrimary: boolean;
  file?: File;
}

interface ImageUploaderProps {
  userId: string;
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageUploader({ userId, images, onChange, maxImages = 20 }: ImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ImageCategory>('exterior');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: 'Too many images',
        description: `Maximum ${maxImages} images allowed`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: `${file.name} is not an image`,
          variant: 'destructive',
        });
        continue;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 5MB limit`,
          variant: 'destructive',
        });
        continue;
      }

      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(data.path);

        newImages.push({
          id: `temp-${Date.now()}-${Math.random()}`,
          url: urlData.publicUrl,
          category: selectedCategory,
          caption: '',
          isPrimary: images.length === 0 && newImages.length === 0, // First image is primary
          file,
        });
      } catch (error: any) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload failed',
          description: error.message || 'Failed to upload image',
          variant: 'destructive',
        });
      }
    }

    onChange([...images, ...newImages]);
    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = async (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    
    // If it's a stored image, try to delete from storage
    if (imageToRemove?.url.includes('property-images')) {
      try {
        const path = imageToRemove.url.split('property-images/')[1];
        if (path) {
          await supabase.storage.from('property-images').remove([path]);
        }
      } catch (error) {
        console.error('Failed to delete from storage:', error);
      }
    }

    const updatedImages = images.filter(img => img.id !== imageId);
    
    // If we removed the primary image, make the first remaining image primary
    if (imageToRemove?.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }
    
    onChange(updatedImages);
  };

  const setPrimaryImage = (imageId: string) => {
    onChange(
      images.map(img => ({
        ...img,
        isPrimary: img.id === imageId,
      }))
    );
  };

  const updateImageCategory = (imageId: string, category: ImageCategory) => {
    onChange(
      images.map(img =>
        img.id === imageId ? { ...img, category } : img
      )
    );
  };

  const updateImageCaption = (imageId: string, caption: string) => {
    onChange(
      images.map(img =>
        img.id === imageId ? { ...img, caption } : img
      )
    );
  };

  // Group images by category for display
  const imagesByCategory = images.reduce((acc, img) => {
    if (!acc[img.category]) acc[img.category] = [];
    acc[img.category].push(img);
    return acc;
  }, {} as Record<ImageCategory, UploadedImage[]>);

  return (
    <div className="space-y-6">
      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="space-y-2 flex-1">
          <Label>Select Category</Label>
          <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as ImageCategory)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(IMAGE_CATEGORY_LABELS) as ImageCategory[]).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {IMAGE_CATEGORY_ICONS[cat]} {IMAGE_CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || images.length >= maxImages}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </>
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} images • Supported: JPG, PNG, WebP, GIF • Max 5MB each
      </p>

      {/* Empty State */}
      {images.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No images uploaded yet</p>
          <p className="text-sm text-muted-foreground">
            Select a category and click "Upload Images" to add photos
          </p>
        </div>
      )}

      {/* Images by Category */}
      {(Object.keys(IMAGE_CATEGORY_LABELS) as ImageCategory[]).map((category) => {
        const categoryImages = imagesByCategory[category];
        if (!categoryImages || categoryImages.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{IMAGE_CATEGORY_ICONS[category]}</span>
              <h4 className="font-medium">{IMAGE_CATEGORY_LABELS[category]}</h4>
              <Badge variant="secondary">{categoryImages.length}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryImages.map((image) => (
                <div key={image.id}>
                  <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={image.url}
                      alt={image.caption || IMAGE_CATEGORY_LABELS[image.category]}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <Badge className="absolute top-2 left-2 bg-primary pointer-events-none">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Cover
                      </Badge>
                    )}

                    {/* Always-visible action buttons */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {!image.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(image.id)}
                          className="w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm shadow-md hover:bg-background flex items-center justify-center transition-colors"
                          aria-label="Set as cover"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="w-7 h-7 rounded-full bg-destructive/95 backdrop-blur-sm shadow-md hover:bg-destructive text-destructive-foreground flex items-center justify-center transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Caption Input */}
                  <Input
                    type="text"
                    inputMode="text"
                    enterKeyHint="done"
                    placeholder="Add caption..."
                    value={image.caption}
                    onChange={(e) => updateImageCaption(image.id, e.target.value)}
                    className="mt-2 h-10 text-base md:text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
