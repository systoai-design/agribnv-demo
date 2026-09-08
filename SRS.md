# Software Requirements Specification (SRS)
## Agribnv v2: The Agritourism Platform for Farmers ("bed & venture")

**Document Version:** 2.1  
**Status:** Approved Baseline (Incorporating Social Discovery, Creator Profiles & Short-Form Video Reels)  
**Target Platform:** Web (Desktop & Mobile Responsive) + Native Mobile (iOS & Android via Capacitor)  
**Reference Documents:** 
* [`docs/PRODUCT_VISION_V2.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/PRODUCT_VISION_V2.md)
* [`docs/brainstorming/MULTI_AGENT_BRAINSTORM_SOCIAL_REVAMP.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/brainstorming/MULTI_AGENT_BRAINSTORM_SOCIAL_REVAMP.md)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) establishes the complete functional and non-functional requirements for **Agribnv v2**. Agribnv is pivoting from a traditional transactional rental listing platform to a **social-first agritourism creator marketplace** ("bed & venture") that integrates social discovery, short-form video reels, and direct farmer commerce while retaining an atomic stay-and-experience booking engine.

### 1.2 Scope
Agribnv bridges the gap between rural agricultural producers and urban consumers/travelers across four interconnected pillars:
1. **Farmer Social Profiles:** Creator identity highlighting farmer background, crop specializations, and verified credentials with follow/follower mechanics.
2. **Social Discovery Feed & Short-Form Video (AgriReels):** Engaging visual content (stories, updates, 60s vertical video reels) that drives discovery and viral sharing.
3. **Direct Farm Commerce (Products):** Farm-to-consumer store for local harvests, honey, coffee, and specialty goods.
4. **Hospitality & Booking Engine (Stays & Experiences):** Day workshops and overnight accommodations with atomic double-booking prevention.

### 1.3 Definitions & Acronyms
* **AgriReels:** 9:16 vertical short-form video content showcasing farm activities, kubo stays, and harvesting.
* **GiST:** Generalized Search Tree (PostgreSQL index used for atomic range exclusion on booking calendars).
* **FSD:** Feature-Sliced Design.
* **OOM:** Out Of Memory (mobile WebView crash condition caused by un-reclaimed video decoders).
* **RLS:** Row-Level Security (PostgreSQL / Supabase policy engine).
* **Host/Farmer:** Verified producer eligible to list properties, products, and publish creator content.
* **Guest/Consumer:** End user browsing feeds, following farms, purchasing goods, and booking stays.

---

## 2. System Architecture & Platform Support

### 2.1 Cross-Platform Strategy: Web + Capacitor
The application runs as a unified TypeScript codebase with responsive layouts designed specifically for both **Desktop Web** and **Mobile App (iOS & Android via Capacitor)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT PRESENTATION LAYER                        │
├──────────────────────────────────────┬──────────────────────────────────────┤
│             DESKTOP WEB              │       MOBILE (WEB & CAPACITOR)       │
│ • 3-Column Social & Video Layout     │ • Full-Bleed 9:16 Vertical Video     │
│ • Persistent Left Nav & Search Hero  │ • Bottom Navigation Bar (5 Tabs)     │
│ • Split-Screen Map & Listing Grid    │ • Touch Gestures & Haptic Feedback   │
│ • Keyboard Shortcuts & Hover Popovers│ • Capacitor Safe Area & Push Bridge  │
└──────────────────────────────────────┴──────────────────────────────────────┘
                                       │
                                       ▼ (HTTPS / WSS)
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE BACKEND CLOUD                             │
├───────────────────┬───────────────────┬──────────────────┬──────────────────┤
│    POSTGRESQL     │   SUPABASE AUTH   │    REALTIME      │     STORAGE      │
│ • Relational DB   │ • JWT Sessions    │ • Live Chat      │ • Image CDN      │
│ • GiST Exclusion  │ • Role RBAC       │ • Feed Broadcast │ • HLS Video CDN  │
│ • Strict RLS      │ • OAuth & Email   │ • Notifications  │ • Signed Uploads │
└───────────────────┴───────────────────┴──────────────────┴──────────────────┘
```

### 2.2 Device-Specific Architectural Invariants

#### A. Mobile Devices (iOS & Android via Capacitor)
* **Touch-First Navigation:** Bottom navigation bar housing 5 primary tabs: `[ Home (Feed) | Explore (Map/Search) | Reels | Inbox | Profile ]`.
* **Safe-Area Insets:** Must dynamically bind `--sat`, `--sab`, `--sar`, `--sal` via `capacitor-plugin-safe-area`.
* **Hardware Haptics:** Subtle haptic feedback (`Haptics.impact({ style: ImpactStyle.Light })`) on like, bookmark, and booking taps.
* **WebView Video Memory Management (OOM Prevention):** HTML5 `<video>` decoders in mobile WebViews must strictly enforce a **3-slot virtualization window** `[Previous (unloaded), Active (playing), Next (preloading)]`. Scrolled-out video elements must immediately invoke `.pause()`, clear `.src = ""`, and call `.load()` to prevent memory accumulation.

#### B. Desktop Devices (Evergreen Browsers)
* **3-Column Canvas:** Left-hand persistent navigation, central content feed (or 9:16 video card with accompanying comment/info panel), and right-hand sticky farm discovery widget.
* **High Information Density:** Larger search modals with interactive date-range pickers and dual-view split maps.
* **Keyboard Navigation:** Arrow keys for next/previous reel navigation; `Esc` for modal dismissal; `Space` for play/pause.

---

## 3. Functional Requirements

### 3.1 Module 1: Identity & Farmer Creator Profiles
* **REQ-PROF-1 (Creator Profile Header):** Every farm/farmer shall have a public creator profile displaying:
  - Farm Name, Verified Farmer Badge, Avatar, and Cover Banner.
  - Farmer Bio, Agricultural Philosophy, and Terroir/Location.
  - Follower Count, Following Count, and Total Likes Received.
  - "What We Grow" category badges (e.g. Heirloom Rice, Mangoes, Arabica Coffee, Bees).
  - Quick action buttons: `[ Follow / Unfollow ]`, `[ Message ]`, `[ Share Profile ]`.
* **REQ-PROF-2 (Tabbed Profile Layout):** Profiles shall feature 4 structured tabs:
  1. **Reels:** Grid of short-form video thumbnails with view counts.
  2. **Posts:** Chronological photo journals, harvest announcements, and seasonal updates.
  3. **Stays & Experiences:** Available kubo huts, cottages, and day workshops with pricing pills.
  4. **Farm Shop:** Direct agricultural products available for order or inquiry.
* **REQ-PROF-3 (Follow System):**
  - Guests can follow/unfollow farms with instantaneous optimistic UI updates.
  - Following updates create real-time entries in the user's personal activity feed.

### 3.2 Module 2: Home Screen & Social Discovery Feed
* **REQ-FEED-1 (Dual-Mode Home Navigation):** The primary Home view shall feature a persistent segment controller:
  - **Feed Tab (Default):** Displays the community social feed.
  - **Explore Tab:** Displays search filters, category carousels, property grid, and map view.
* **REQ-FEED-2 (Feed Streams):** Within the Feed tab, users can toggle between:
  - **"For You" (Discover):** Curated blend of trending reels, popular harvest stories, and featured nearby farms.
  - **"Following":** Reverse-chronological timeline exclusively from followed farms.
* **REQ-FEED-3 (Feed Card Anatomy):** Each feed item shall support:
  - Author header with farm avatar, name, location, and timestamp.
  - Rich media carousel (photos or embedded auto-looping silent video).
  - Post caption, crop hashtags, and linked tagged stay or product pill.
  - Social interactions: Like button (with heart-pop animation), Comment count, Share button, and Save/Bookmark button.

### 3.3 Module 3: Short-Form Video Engine (AgriReels)
* **REQ-REELS-1 (Full-Screen Vertical Experience):**
  - Mobile: Immersive 9:16 vertical full-screen viewport with snap-scrolling (`snap-y snap-mandatory`).
  - Desktop: Centered 9:16 player frame with right-hand panel for farm details, comments, and booking widget.
* **REQ-REELS-2 (Interactive Video Overlay):**
  - Right-aligned action rail: Farmer avatar with quick-follow `+`, Like button with counter, Comment trigger (opens bottom sheet), Share trigger, and Mute/Unmute toggle.
  - Bottom info rail: Farmer handle, video caption, background audio title, and **Sticky Commerce Card** (`"Stay at this Kubo - ₱1,800/night"` or `"Buy Organic Wild Honey - ₱350"`).
  - Tapping the commerce card opens the instant booking or product drawer without terminating video playback.
* **REQ-REELS-3 (Playback Controls & Auto-Play):**
  - Videos shall auto-play when $>50\%$ visible in viewport.
  - Audio starts muted by default; tapping anywhere on the video toggles pause/play, while tapping the sound icon toggles global audio un-mute.
* **REQ-REELS-4 (Creator Upload Studio):**
  - Verified hosts can upload video clips directly from their camera roll or device camera via the Capacitor Camera API.
  - Maximum video duration: **60 seconds**.
  - Maximum upload size: **30 MB**.
  - Host can attach a caption, crop category tags, and link 1 stay or 1 product to the reel.

### 3.4 Module 4: Stays & Experiences Booking Engine (Retained Core)
* **REQ-BOOK-1 (Zero Double-Booking Guarantee):** The database enforces a PostgreSQL GiST exclusion constraint (`no_overlapping_bookings`) on `daterange(check_in, check_out, '[)')` for active bookings (`pending`, `confirmed`).
* **REQ-BOOK-2 (Interactive Availability Calendar):** Real-time month calendar displaying blocked dates, active reservations, and price-per-night indicators.
* **REQ-BOOK-3 (Price Breakdown Calculation):** Automatic calculator computing:
  $$\text{Total} = (\text{Base Rate} \times \text{Nights}) + \text{Cleaning Fee} + \text{Service Fee} + \sum \text{Experience Add-ons}$$
* **REQ-BOOK-4 (Booking Drawer):** Accessible directly from both Property Details and Video Reel overlays.

### 3.5 Module 5: Direct Farm Products Catalog
* **REQ-PROD-1:** Product catalog categorized into *Fresh Harvests, Specialty Herbs, Seedlings, and Processed/Artisanal Goods*.
* **REQ-PROD-2:** Each product card lists name, seasonal harvest window, price, stock status, and farm origin.
* **REQ-PROD-3:** Guests can add items to an inquiry cart or initiate direct checkout messaging with the host.

### 3.6 Module 6: Realtime Messaging & Community
* **REQ-MSG-1:** Direct 1-on-1 chat between guests and farmers using Supabase Realtime channels.
* **REQ-MSG-2:** Chat cards can embed a direct reference to a listing, booking reservation, or farm product.
* **REQ-MSG-3:** Native push notifications for new messages, booking confirmations, and post likes via Capacitor.

---

## 4. Security, Moderation & Access Control Requirements

### 4.1 Row-Level Security (RLS) Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | Public | Auth User (`auth.uid() = id`) | Auth User (`auth.uid() = id`) | Admin Only |
| `farm_posts` | Public | Hosts Only (`has_role(auth.uid(), 'host')`) | Post Author (`author_id = auth.uid()`) | Post Author or Admin |
| `farm_reels` | Public | Hosts Only (`has_role(auth.uid(), 'host')`) | Reel Author (`author_id = auth.uid()`) | Reel Author or Admin |
| `post_likes` | Public | Authenticated (`auth.uid() = user_id`) | N/A | Like Owner (`auth.uid() = user_id`) |
| `post_comments` | Public | Authenticated (`auth.uid() = user_id`) | Comment Author | Comment Author or Admin |
| `farm_follows` | Public | Authenticated (`auth.uid() = follower_id`) | N/A | Follower (`auth.uid() = follower_id`) |
| `bookings` | Guest & Host | Authenticated Guest | Host (Accept/Decline) or Guest (Cancel) | Admin Only |

### 4.2 Content Moderation & Abuse Prevention
* **SEC-MOD-1 (Automated Pre-Flight Check):** Video uploads and image uploads are scanned for prohibited/NSFW content via Supabase Edge Function prior to publishing.
* **SEC-MOD-2 (Rate Limiting):** Max 5 video reels per host per 24-hour rolling window; max 30 comments per user per hour to prevent spam.
* **SEC-MOD-3 (Reporting Mechanism):** All posts, reels, and profiles include a 1-tap "Report Content" action flagging inappropriate items to administrators.

---

## 5. Non-Functional Requirements & Performance Budgets

### 5.1 Video Streaming & Bandwidth Optimization
* **NFR-VID-1 (Streaming Protocol):** Video reels shall be transcoded into adaptive bitrate HLS streams (`.m3u8`) with fallback MP4 for low-end devices.
* **NFR-VID-2 (Prefetching & Caching):** Only the immediately following video (1 item ahead) may be pre-buffered. Buffer size capped at 3 seconds of forward playback.
* **NFR-VID-3 (Offline & Poor Connectivity):** In low-signal rural areas (common in Philippine farmsteads), videos shall display an instant low-resolution blurred thumbnail (LQIP) while the HLS stream negotiates the lowest bitrate.

### 5.2 Application Performance & Bundle Budget
* **NFR-PERF-1:** Initial page bundle size shall not exceed **150 KB gzip** by lazy-loading heavy libraries (`maplibre-gl`, `recharts`, video controls).
* **NFR-PERF-2:** Virtualized video feeds must sustain a consistent **60 FPS scroll performance** on standard mobile devices without UI jank.

### 5.3 Accessibility (a11y)
* **NFR-A11Y-1:** All video players must support closed captions (VTT subtitles) and full screen reader accessibility (`aria-label` on like, comment, and volume controls).
* **NFR-A11Y-2:** Video auto-play must respect the user's device preference for `prefers-reduced-motion`.
