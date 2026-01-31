import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ShareData {
  title: string;
  text?: string;
  url?: string;
}

export function useShare() {
  const { toast } = useToast();

  const share = useCallback(async ({ title, text, url }: ShareData) => {
    const shareUrl = url || window.location.href;
    const shareText = text || `Check out ${title} on Agribnv!`;

    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
        return true;
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
        return false;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description: 'Share this listing with friends and family.',
      });
      return true;
    } catch (error) {
      console.error('Clipboard failed:', error);
      toast({
        title: 'Unable to share',
        description: 'Please copy the URL manually from your browser.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return { share, canNativeShare };
}
