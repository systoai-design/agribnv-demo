import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  propertyName: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
}

// Image section configuration for visual variety
const getImageSections = (images: string[]) => {
  if (images.length === 0) return [];
  
  const sections: { title: string; images: { url: string; fullWidth: boolean }[] }[] = [];
  
  // First image is always hero/full-width
  sections.push({
    title: 'Photo tour',
    images: [{ url: images[0], fullWidth: true }]
  });
  
  if (images.length > 1) {
    // Outdoor section (images 1-2)
    const outdoorImages = images.slice(1, 3).map((url, idx) => ({
      url,
      fullWidth: false
    }));
    if (outdoorImages.length > 0) {
      sections.push({ title: 'Outdoor spaces', images: outdoorImages });
    }
  }
  
  if (images.length > 3) {
    // Living area with one full-width
    sections.push({
      title: 'Living area',
      images: [{ url: images[3], fullWidth: true }]
    });
  }
  
  if (images.length > 4) {
    // Remaining images in 2-column grid
    const remainingImages = images.slice(4).map(url => ({
      url,
      fullWidth: false
    }));
    if (remainingImages.length > 0) {
      sections.push({ title: 'More spaces', images: remainingImages });
    }
  }
  
  return sections;
};

export function PhotoGalleryModal({
  isOpen,
  onClose,
  images,
  propertyName,
  isLiked = false,
  onToggleLike
}: PhotoGalleryModalProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sections = getImageSections(images);
  
  // Get flat index for lightbox navigation
  const allImages = images;
  
  const handlePrev = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (lightboxIndex !== null && lightboxIndex < allImages.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (lightboxIndex !== null) {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setLightboxIndex(null);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </Button>
            
            <h2 className="font-medium text-sm hidden sm:block">{propertyName}</h2>
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:bg-muted">
                <Share className="h-4 w-4" />
                <span className="hidden sm:inline underline text-sm">Share</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 rounded-full hover:bg-muted"
                onClick={onToggleLike}
              >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-destructive text-destructive')} />
                <span className="hidden sm:inline underline text-sm">Save</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Image count badge */}
        <div className="max-w-5xl mx-auto px-4 py-4">
          <span className="text-sm text-muted-foreground">{images.length} photos</span>
        </div>

        {/* Gallery Content */}
        <div className="max-w-5xl mx-auto px-4 pb-12 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 130px)' }}>
          {sections.map((section, sectionIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIdx * 0.1 }}
              className="mb-8"
            >
              <h3 className="text-lg font-medium mb-4 text-foreground">{section.title}</h3>
              
              <div className="grid gap-3">
                {section.images.map((image, imgIdx) => {
                  // Calculate global index for lightbox
                  let globalIndex = 0;
                  for (let i = 0; i < sectionIdx; i++) {
                    globalIndex += sections[i].images.length;
                  }
                  globalIndex += imgIdx;
                  
                  return image.fullWidth ? (
                    <motion.div
                      key={imgIdx}
                      className="relative group cursor-pointer overflow-hidden rounded-2xl"
                      whileHover={{ scale: 1.005 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setLightboxIndex(globalIndex)}
                    >
                      <img
                        src={image.url}
                        alt=""
                        className="w-full h-auto max-h-[500px] object-cover transition-all duration-300 group-hover:brightness-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ) : null;
                })}
                
                {/* 2-column grid for non-full-width images */}
                {section.images.some(img => !img.fullWidth) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {section.images.filter(img => !img.fullWidth).map((image, imgIdx) => {
                      // Calculate correct global index
                      let globalIndex = 0;
                      for (let i = 0; i < sectionIdx; i++) {
                        globalIndex += sections[i].images.length;
                      }
                      globalIndex += section.images.filter(img => img.fullWidth).length + imgIdx;
                      
                      return (
                        <motion.div
                          key={imgIdx}
                          className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-[4/3]"
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setLightboxIndex(globalIndex)}
                        >
                          <img
                            src={image.url}
                            alt=""
                            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-95"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
              onClick={() => setLightboxIndex(null)}
            >
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 left-4 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
              
              {/* Image counter */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
                {lightboxIndex + 1} / {allImages.length}
              </div>

              {/* Navigation */}
              {lightboxIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}
              
              {lightboxIndex < allImages.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 text-white h-12 w-12"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* Main image */}
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={allImages[lightboxIndex]}
                alt=""
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
