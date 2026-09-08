# SPEC-001: Social Feed, Reels & Creator Architecture

**Specification ID:** SPEC-001  
**Category:** Frontend Architecture, Database Schema, Media Streaming  
**Status:** Approved  
**Related Documents:** [`SRS.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/SRS.md), [`docs/prd/PRD-001-social-feed-and-reels.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/prd/PRD-001-social-feed-and-reels.md)  

---

## 1. Database Schema Architecture

The social layer adds 5 relational tables to Supabase, strictly integrated with existing `profiles`, `properties`, and `user_roles`.

```mermaid
erDiagram
    PROFILES ||--o{ FARM_POSTS : "publishes"
    PROFILES ||--o{ FARM_REELS : "publishes"
    PROFILES ||--o{ FARM_FOLLOWS : "follows"
    PROFILES ||--o{ POST_LIKES : "likes"
    PROFILES ||--o{ POST_COMMENTS : "comments"
    PROPERTIES ||--o{ FARM_REELS : "tagged in"
    PROPERTIES ||--o{ FARM_POSTS : "tagged in"
    
    FARM_REELS {
        UUID id PK
        UUID author_id FK
        UUID property_id FK
        UUID product_id FK
        TEXT video_url
        TEXT thumbnail_url
        NUMERIC duration_seconds
        TEXT caption
        INT view_count
        TIMESTAMPTZ created_at
    }

    FARM_FOLLOWS {
        UUID id PK
        UUID follower_id FK
        UUID farm_id FK
        TIMESTAMPTZ created_at
    }
```

### SQL Migration Definition

```sql
-- 1. Farm Reels Table (Short-Form Video)
CREATE TABLE public.farm_reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    duration_seconds DECIMAL(5, 2) NOT NULL CHECK (duration_seconds <= 60),
    caption TEXT,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Farm Posts Table (Photo Journals & Story Updates)
CREATE TABLE public.farm_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    caption TEXT NOT NULL,
    crop_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Social Follows Graph
CREATE TABLE public.farm_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    farm_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (follower_id, farm_id),
    CONSTRAINT no_self_follow CHECK (follower_id != farm_id)
);

-- 4. Unified Likes Table
CREATE TABLE public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.farm_posts(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES public.farm_reels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT target_exists CHECK (
        (post_id IS NOT NULL AND reel_id IS NULL) OR
        (post_id IS NULL AND reel_id IS NOT NULL)
    ),
    UNIQUE (user_id, post_id),
    UNIQUE (user_id, reel_id)
);

-- 5. Unified Comments Table
CREATE TABLE public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.farm_posts(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES public.farm_reels(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT target_exists CHECK (
        (post_id IS NOT NULL AND reel_id IS NULL) OR
        (post_id IS NULL AND reel_id IS NOT NULL)
    )
);

-- Performance Indexes
CREATE INDEX idx_reels_author_created ON public.farm_reels (author_id, created_at DESC);
CREATE INDEX idx_posts_author_created ON public.farm_posts (author_id, created_at DESC);
CREATE INDEX idx_follows_lookup ON public.farm_follows (follower_id, farm_id);
CREATE INDEX idx_likes_reel ON public.post_likes (reel_id);
CREATE INDEX idx_comments_reel ON public.post_comments (reel_id, created_at ASC);

-- Row-Level Security Policies
ALTER TABLE public.farm_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view reels" ON public.farm_reels FOR SELECT USING (true);
CREATE POLICY "Hosts can create reels" ON public.farm_reels FOR INSERT WITH CHECK (
    auth.uid() = author_id AND public.has_role(auth.uid(), 'host')
);
CREATE POLICY "Authors can update their reels" ON public.farm_reels FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their reels" ON public.farm_reels FOR DELETE USING (auth.uid() = author_id);
```

---

## 2. High-Performance Video Feed (Mobile WebView Optimization)

### The 3-Slot Sliding Window Architecture
To ensure iOS WKWebView and Android WebView never crash from hardware video decoder exhaustion, the frontend renders only **3 virtual video slots** at any time:

```
[ Slot i-1: PREVIOUS ] -> Component unmounted, video.pause(), src cleared.
[ Slot i:   ACTIVE   ] -> Playing, hardware audio routed, full interactive overlay.
[ Slot i+1: NEXT     ] -> Preloading first 3 seconds of buffer, muted, paused.
```

### Video Cleanup Implementation Hook
```ts
// src/shared/hooks/useVideoCleanup.ts
import { useEffect, RefObject } from 'react';

export function useVideoCleanup(
  videoRef: RefObject<HTMLVideoElement>,
  isActive: boolean
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {
        // Auto-play was prevented; fallback to muted
        video.muted = true;
        video.play().catch(console.error);
      });
    } else {
      video.pause();
      // Clear buffered media from hardware decoder
      video.removeAttribute('src');
      video.load();
    }

    return () => {
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [isActive, videoRef]);
}
```

---

## 3. Server State & TanStack Query Keys

Centralized query keys ensure cache consistency between social actions (e.g. following a farm immediately updates both the Feed and the Farmer Profile):

```ts
// src/entities/social/queryKeys.ts
export const socialKeys = {
  all: ['social'] as const,
  reels: () => [...socialKeys.all, 'reels'] as const,
  reelList: (feedType: 'for-you' | 'following') => [...socialKeys.reels(), feedType] as const,
  feed: (type: 'discover' | 'following') => [...socialKeys.all, 'feed', type] as const,
  farmProfile: (farmId: string) => [...socialKeys.all, 'profile', farmId] as const,
  followers: (farmId: string) => [...socialKeys.farmProfile(farmId), 'followers'] as const,
  comments: (reelId: string) => [...socialKeys.all, 'comments', reelId] as const,
};
```

---

## 4. Cross-Platform Responsive Layout Architecture

### 4.1 Component Tree & Breakpoints

Agribnv leverages a responsive adaptive layout system cleanly separated between Mobile (Capacitor/Touch) and Desktop Web:

```
                                  AppShell
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼ (Screen < 1024px)                                 ▼ (Screen >= 1024px)
      MobileShell                                         DesktopShell
 ┌─────────────────────┐                     ┌─────────────┬─────────────────┬─────────────┐
 │ TopHeader (Feed/Nav)│                     │ SidebarNav  │  Main Stage     │ ContextRail │
 │ MainFeed / Reels    │                     │  (240px)    │   (640px/Auto)  │   (340px)   │
 │ BottomNavBar (5-tab)│                     └─────────────┴─────────────────┴─────────────┘
 └─────────────────────┘
```

| Component | Mobile (< 1024px / Touch) | Desktop Web (>= 1024px) |
| :--- | :--- | :--- |
| **Reels View** | Fullscreen 9:16 scroll-snap; overlay action rail right-aligned; bottom booking drawer. | 2-Column Theater: 9:16 player on left with ambient canvas glow; right panel with comments, audio, and sticky booking card. |
| **Feed Stream** | Single-column edge-to-edge cards with micro-padded action bar. | Centered 640px feed container flanked by left navigation and right suggested farms/seasonal alerts. |
| **Creator Profile** | Compact header, 2-line bio with "more" toggle, 3-column reels grid. | Wide 16:5 panoramic banner, side-by-side farm terroir stats, 4-column reels grid with hover-preview, sticky booking widget. |
| **Explore View** | Card list with floating "Map" pill toggle button. | Split-screen dual-pane: Left 55% listing cards; Right 45% sticky MapLibre GL vector map. |
| **Media Upload** | Native Camera Picker via `@capacitor/camera` with direct thumbnail preview. | Desktop dropzone supporting drag-and-drop, client-side canvas frame thumbnail scrubber, and tagging dropdown. |

---

### 4.2 Desktop AgriReels Keyboard Navigation Hook

To deliver an ergonomic desktop experience matching premier video platforms, `useReelsKeyboardNav` binds global hotkeys with strict input focus protection:

```ts
// src/features/reels/hooks/useReelsKeyboardNav.ts
import { useEffect } from 'react';

interface ReelsKeyNavActions {
  onNext: () => void;
  onPrev: () => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleLike: () => void;
  onFocusComment: () => void;
  onOpenBooking: () => void;
  onClose?: () => void;
}

export function useReelsKeyboardNav({
  onNext,
  onPrev,
  onTogglePlay,
  onToggleMute,
  onToggleLike,
  onFocusComment,
  onOpenBooking,
  onClose,
}: ReelsKeyNavActions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard: Ignore hotkeys if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          onTogglePlay();
          break;
        case 'ArrowDown':
        case 'j':
        case 'J':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onPrev();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          onToggleMute();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          onToggleLike();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          onFocusComment();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          onOpenBooking();
          break;
        case 'Escape':
          if (onClose) {
            e.preventDefault();
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onTogglePlay, onToggleMute, onToggleLike, onFocusComment, onOpenBooking, onClose]);
}
```

---

### 4.3 Desktop Client-Side Frame Thumbnail Extractor

To eliminate heavy server processing for thumbnail extraction on desktop uploads, video thumbnails are captured directly in the browser using an off-screen HTML5 `<canvas>`:

```ts
// src/features/creator/utils/extractVideoThumbnail.ts
export async function extractVideoThumbnail(
  file: File,
  timeInSeconds: number = 1.0
): Promise<{ blob: Blob; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timeInSeconds, video.duration);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            resolve({ blob, previewUrl });
          } else {
            reject(new Error('Failed to generate thumbnail blob'));
          }
          URL.revokeObjectURL(video.src);
        },
        'image/jpeg',
        0.85
      );
    };

    video.onerror = (e) => reject(e);
  });
}
```

---

### 4.4 Desktop OpenGraph & SEO Head Specification

For public viral sharing of Farmer Profiles and AgriReels across desktop web platforms:

```html
<!-- Example Head metadata emitted for /reels/:id -->
<meta property="og:type" content="video.other" />
<meta property="og:title" content="Harvesting Carabao Mangoes in Guimaras | Tatay Roman" />
<meta property="og:description" content="Watch how we pick fresh organic mangoes at Guimaras Organic Farmstead. Book a stay at our Sunset View Kubo." />
<meta property="og:url" content="https://agribnv.com/reels/c4a7e8b2-..." />
<meta property="og:image" content="https://cdn.agribnv.com/thumbnails/c4a7e8b2.jpg" />
<meta property="og:video" content="https://cdn.agribnv.com/reels/c4a7e8b2.mp4" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="720" />
<meta property="og:video:height" content="1280" />
<meta name="twitter:card" content="player" />
<meta name="twitter:player" content="https://agribnv.com/embed/reels/c4a7e8b2" />
<meta name="twitter:player:width" content="360" />
<meta name="twitter:player:height" content="640" />
```

---

## 5. Security & Rate Limiting Verification

* **Upload Quota:** Enforced at Supabase Edge Function: Max 5 videos/24h per verified host.
* **SQL Injection & XSS Defense:** All captions and comments sanitized through Zod schema validation (`z.string().trim().min(1).max(500)`).
* **Storage Access:** Uploads write to private staging bucket before automated moderation; published videos migrate to the public CDN bucket.
* **Content Moderation:** Background trigger invokes Vision/Safety API before setting `farm_reels.status = 'published'`.
