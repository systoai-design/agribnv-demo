# WF-001: Home Feed & Discovery Stream Wireframe Specification

**Document ID:** WF-001  
**Category:** UX/UI Wireframe Layout & Behavioral Annotation  
**Target Milestone:** v2.0 Revamp Baseline  
**Fidelity Level:** Annotated Mid-Fidelity Wireframe Specification  
**Governing Documents:** [`SRS.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/SRS.md), [`docs/prd/PRD-001-social-feed-and-reels.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/prd/PRD-001-social-feed-and-reels.md)  

---

## 1. Content Priority & Information Hierarchy

The Home Feed is the primary entry point for travelers and community members. It balances **social inspiration** (daily harvests, farmer journals, short videos) with **direct commerce conversion** (booking stays and ordering farm goods).

| Priority | Component | Visibility & Role | Source API / Data Hook |
| :--- | :--- | :--- | :--- |
| **P1** | **Top Header & Mode Switcher** | Fixed top. Dual-mode toggle: `[ Feed | Explore ]` | Local UI state + Route (`/?mode=feed`) |
| **P2** | **Sub-Stream Filter Bar** | Sticky under header: `[ For You | Following ]` | Query param (`/feed?tab=for-you`) |
| **P3** | **Harvest Stories Carousel** | Horizontal avatar tray for active stories / harvest alerts | `useHarvestStoriesQuery()` |
| **P4** | **Primary Feed Stream** | Vertically stacked cards (Media 4:5, author, caption, commerce pill) | `useInfiniteFeedQuery()` |
| **P5 (Desktop)** | **Left Navigation Rail (240px)** | Persistent desktop sidebar: Branding, Primary routes, Host switch | AppShell State |
| **P6 (Desktop)** | **Right Discovery Rail (340px)** | Sticky sidebar: "Farms to Follow", "Crop Calendar", "Local Weather" | `useSuggestedFarmsQuery()`, Weather API |
| **P7 (Mobile)** | **Bottom Tab Bar (5-Tabs)** | Fixed bottom: `[ Home | Explore | Reels | Inbox | Profile ]` | Safe Area Layout Container |

---

## 2. Responsive Wireframe Schematics

### 2.1 Desktop Web Wireframe (Screen $\ge 1024\text{px}$, Canvas 1440px Centered)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [TOP BAR: Desktop Slim Header] (Height: 64px)                                                         │
│  [Logo: Agribnv] "bed & venture"         [🔍 Search farms, crops, or kubos...]          [Host Portal] [User] │
├──────────────────────────┬─────────────────────────────────────────────┬───────────────────────────────┤
│ [LEFT SIDEBAR] (240px)   │ [CENTER FEED STAGE] (640px Max Width)       │ [RIGHT DISCOVERY RAIL] (340px)│
│                          │                                             │                               │
│ 🏠 Home Feed             │ ┌─────────────────────────────────────────┐ │ ┌───────────────────────────┐ │
│ 🧭 Explore & Map         │ │ [ Feed (Active) ] | [ Explore (Search)] │ │ │ 🌱 Seasonal Harvests      │ │
│ 🎬 AgriReels             │ └─────────────────────────────────────────┘ │ │ • Guimaras Mangoes (Peak) │ │
│ 🔖 Saved Stays           │                                             │ │ • Benguet Arabica Coffee  │ │
│ 💬 Messages (3)          │ ┌─ [Stories / Harvest Highlights Tray] ───┐ │ │ • Batad Heirloom Rice     │ │
│ 🛒 Farm Market           │ │ (Tatay) (Nanay) (Bukid) (Honey) (Mang)  │ │ └───────────────────────────┘ │
│                          │ └─────────────────────────────────────────┘ │                               │
│ ──────────────────────── │                                             │ ┌───────────────────────────┐ │
│ [Switch to Host Mode]    │ ┌─────────────────────────────────────────┐ │ │ 🧑‍🌾 Recommended Farms     │ │
│ ┌──────────────────────┐ │ │ [Feed Card #1: Harvest Photo Journal]   │ │ │ [Avatar] Batangas Dairy   │ │
│ │ 🌿 Farm Creator Hub  │ │ │ [Avatar] Green Hills Eco-Farm  (Follow) │ │ │          "Fresh Chevre"   │ │
│ │  New Reel / Post     │ │ │ 📍 Lipa, Batangas · 2 hours ago   [...] │ │ │          [+ Follow]       │ │
│ └──────────────────────┘ │ │ ─────────────────────────────────────── │ │ │                           │
│                          │ │ [ MEDIA CONTAINER: 4:5 Aspect Ratio   ] │ │ │ [Avatar] Benguet Berries  │ │
│ ℹ️ Terms · Privacy · FAQ │ │ [ [X] Image: Fresh Heirloom Strawberries│ │ │          "Pick your own"  │ │
│ © 2026 Agribnv Inc.      │ │ [                                     ] │ │ │          [+ Follow]       │ │
│                          │ │ ─────────────────────────────────────── │ │ └───────────────────────────┘ │
│                          │ │ 🏷️ [ Tagged Stay: Mountain Ridge Kubo ] │ │                               │
│                          │ │    ₱2,400/night · ⭐ 4.95 · [Book Now]   │ │ ┌───────────────────────────┐ │
│                          │ │ ─────────────────────────────────────── │ │ │ ⛅ Farming Hub Weather    │ │
│                          │ │ ❤️ 142   💬 18   ↗️ Share   🔖 Save     │ │ │ • Benguet: 18°C Sunny     │ │
│                          │ │                                         │ │ │ • Bukidnon: 24°C Mist     │ │
│                          │ │ **GreenHills**: Morning harvest of our  │ │ └───────────────────────────┘ │
│                          │ │ Sagada strawberries! Book a stay this   │ │                               │
│                          │ │ weekend to join our picking workshop.   │ │                               │
│                          │ │ #StrawberrySeason #OrganicAgri #Benguet │ │                               │
│                          │ │                                         │ │                               │
│                          │ │ [💬 Write a public comment...       [Post]│ │                               │
│                          │ └─────────────────────────────────────────┘ │                               │
└──────────────────────────┴─────────────────────────────────────────────┴───────────────────────────────┘
```

---

### 2.2 Mobile Wireframe (Capacitor & Mobile Web, Screen $< 768\text{px}$)

```
┌────────────────────────────────────────────────────────┐
│ [--sat Safe Area Top Inset: 44px --]                  │
├────────────────────────────────────────────────────────┤
│ [TOP NAVIGATION BAR] (Height: 52px)                    │
│  [Logo: Agribnv]          [ Feed | Explore ]       [🔔]│
├────────────────────────────────────────────────────────┤
│ [SUB-TABS] [ For You (Underline) ]   [ Following ]     │
├────────────────────────────────────────────────────────┤
│ [HARVEST STORIES TRAY] (Height: 88px, Scroll-X)        │
│  (+) You    (●) Roman   (●) Maya    (●) Benguet  (●)   │
├────────────────────────────────────────────────────────┤
│ [FEED STREAM: Single Column Full-Width]                │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Avtr] Tatay Roman · Guimaras  [+ Follow]    [...] │ │
│ ├────────────────────────────────────────────────────┤ │
│ │                                                    │ │
│ │       [ MEDIA CONTAINER: 1:1 or 4:5 ]              │ │
│ │       [ Auto-looping silent video / photo ]        │ │
│ │       [ 🔊 Tap to Unmute overlay ]                 │ │
│ │                                                    │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ 🏷️ [ 🏡 Mango Grove Kubo · ₱1,800/nt · Book Now ]  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │  ❤️ 842      💬 64      ↗️ Share      🔖 Bookmark  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │  **tatay_roman** Golden mangoes ready for picking!  │ │
│ │  We have 2 kubos open this weekend. Come visit!    │ │
│ │  ...more                                           │ │
│ │  View all 64 comments                              │ │
│ │  18 minutes ago                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Feed Card #2...]                                  │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ [BOTTOM NAVIGATION BAR] (Height: 60px + --sab)         │
│   [🏠 Home]   [🧭 Explore]   [🎬 Reels]   [💬 Inbox]  [👤] │
└────────────────────────────────────────────────────────┘
```

---

## 3. Feed Card Detailed Component Anatomy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [ZONE A: AUTHOR HEADER] (Height: 56px)                                      │
│  [Avatar 40x40]  Farmer/Farm Name  [✓ Badge]                   [... More]   │
│                  Terroir / Municipality · Timestamp                         │
│                  [+ Follow] (if not followed yet)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ZONE B: MEDIA CONTAINER] (Height: 400px - 500px, Aspect 4:5 or 1:1)       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Photo Carousel (Swipeable with pagination dots [• • ○ ○])            │  │
│  │  -- OR --                                                             │  │
│  │  Short Video Loop (Silent autoplay, [🔊/🔇] corner toggle, [▶] pause)  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ZONE C: TAGGED COMMERCE ENTITY PILL] (Height: 44px)                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 🏡 [Thumbnail 32x32] "Sunset Kubo" · ₱1,800/night      [Instant Book] │  │
│  │ -- OR --                                                              │  │
│  │ 🍯 [Thumbnail 32x32] "Wild Forest Honey" · ₱350/jar    [Add to Bag]   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ZONE D: SOCIAL ACTION RAIL] (Height: 44px)                                 │
│  ❤️ [Like Icon] (842)    💬 [Comment Icon] (48)    ↗️ [Share]    🔖 [Bookmark]│
├─────────────────────────────────────────────────────────────────────────────┤
│ [ZONE E: CAPTION & COMMENTS PREVIEW] (Variable Height)                      │
│  **farm_handle**: Caption body text up to 150 chars before clamp... [more]   │
│  #Hashtag1 #Hashtag2                                                        │
│  "View all 48 comments" (clickable trigger opens comment sheet/modal)        │
│  "Nanay Cora: Are the mangoes ripe already?"                                │
│  "2 hours ago"                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ZONE F: DESKTOP INLINE COMMENT INPUT] (Desktop Only, Height: 48px)         │
│  [Avatar 28x28] [ Add a comment for Tatay Roman...            ] [Post]      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Behavioral & Interaction Annotations

### AN-01: Header Mode Switching (`Feed` $\leftrightarrow$ `Explore`)
* **Trigger:** User taps or clicks `[ Feed ]` or `[ Explore ]` segment.
* **Transition:** Smooth sliding underline animation (duration: `200ms ease-out`).
* **Behavior:**
  - In `Feed`: Page scrolls smoothly to the social story/post stream.
  - In `Explore`: View transitions to search bar, property filter carousels, and split-screen map (desktop) or card list with floating "Map" button (mobile).
  - URL synchronizes to `/?tab=feed` or `/?tab=explore` to support browser back/forward buttons and direct bookmarking.

### AN-02: Sub-Stream Filtering (`For You` vs `Following`)
* **Trigger:** Tapping sub-filter pills under the header.
* **Logic:**
  - `For You`: Fetches globally trending posts + nearby farms within 100km radius.
  - `Following`: Fetches reverse-chronological updates strictly from farms where `auth.uid() = follower_id` in `farm_follows`.
* **Empty State Gate:** If the user follows 0 farms, the `Following` tab immediately renders **State C (Empty Follows Onboarding)** with suggested grower profiles.

### AN-03: Feed Video Playback & Mobile WebView Memory Guard
* **Auto-Play Threshold:** Video elements begin silent playback only when $>50\%$ of the card is inside the active viewport (tracked via `IntersectionObserver`).
* **Auto-Pause:** When the card scrolls out of view ($<25\%$ visibility), video immediately pauses.
* **Desktop Hover Action:** Hovering over a feed video displays desktop volume slider and expand button; clicking video toggles play/pause.
* **Mobile Hardware Decoder Eviction:** Only 2 off-screen videos retain buffer; any video $>2$ cards away clears `.removeAttribute('src')` and calls `.load()` to satisfy mobile WebView memory constraints.

### AN-04: Tagged Commerce Pill Conversion Interaction
* **Trigger:** Tapping either the entity pill or the `[Instant Book]` / `[Add to Bag]` button in Zone C.
* **Mobile Action:** Slides up a native bottom drawer containing property photos, calendar availability picker, price calculation, and "Confirm Reservation" button. Video/feed state remains active beneath the sheet.
* **Desktop Action:** Opens an interactive booking modal or slides open a right-side inquiry drawer with pre-filled check-in dates without unmounting the feed.

### AN-05: Like Micro-Interaction
* **Trigger:** Tapping the Heart icon or double-tapping the media container.
* **Animation:** Heart pops with a scale pulse (`scale: 1.3 -> 1.0`) with Terracotta fill (`#D97706` / `#E07A5F`) and native light haptic feedback on mobile (`ImpactStyle.Light`).
* **Optimistic Update:** Counter increments immediately in UI (+1) while asynchronous mutation fires to `post_likes`.

---

## 5. Multi-State Specifications

### State A: Populated Feed (Standard Happy Path)
* Rendered when query returns $\ge 1$ post.
* Infinite scrolling with TanStack Query `useInfiniteQuery`.
* Fetches batches of 10 cards per page.
* Bottom spinner displayed when pre-fetching the next page at 80% scroll threshold.

### State B: Skeleton / Loading State
* Rendered on initial page mount or active search filter changes.
* To eliminate **Cumulative Layout Shift (CLS)**, skeleton cards strictly mirror the exact pixel dimensions:
  - Header avatar circle ($40\times 40\text{px}$) + two text rectangles.
  - Media rectangle with fixed aspect ratio (`aspect-4/5`).
  - Action bar placeholder pill.
  - Subtle shimmering gradient pulse using semantic tokens (`bg-muted/40 animate-pulse`).

### State C: Empty State (`Following` Tab with 0 Follows)
```
┌────────────────────────────────────────────────────────┐
│                   [ Illustrated Icon ]                 │
│              🌱 No Harvest Stories Yet                │
│                                                        │
│ You haven't followed any local farms yet. Follow local │
│ growers to see their daily harvests and seasonal stays │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Avatar] Costales Nature Farms · Majayjay, Laguna  │ │
│ │ "Organic vegetables & farm-stay kubos"   [+ Follow]│ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [Avatar] Bohol Bee Farm · Dauis, Bohol             │ │
│ │ "Artisanal organic honey & ice cream"    [+ Follow]│ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│               [ Discover Nearby Farms ]                │
└────────────────────────────────────────────────────────┘
```

### State D: Error & Rural Offline State
* When device has spotty rural connectivity or API times out:
  - Sticky banner at top: *"⚠️ Slow or offline connection. Showing cached farm stories."*
  - Cached cards from IndexedDB/TanStack query cache remain readable.
  - "Retry Connection" button at the bottom of the feed.

---

## 6. Touch Targets & Accessibility (a11y) Specifications

1. **Touch Target Dimensions:** All interactive buttons (`Heart`, `Comment`, `Share`, `Bookmark`, `[+ Follow]`, `[Instant Book]`) have a minimum tap area of **$44 \times 44\text{px}$** to conform with WCAG 2.1 AA and Apple HIG standards.
2. **Screen Reader Landmarks:**
   - `<nav aria-label="Home Feed Streams">` for `[ For You | Following ]`.
   - `<main aria-label="Social Activity Stream">` for the feed card container.
   - `<article aria-labelledby="post-author-title">` for each individual feed card.
   - `<button aria-label="Like this post, 842 likes">` with `aria-pressed="true|false"`.
3. **Typography & Color Contrast:**
   - Headings & Author Names: HSL `var(--foreground)` over `var(--card)` with contrast ratio $\ge 7:1$.
   - Captions: High-contrast dark charcoal / off-white text.
   - Reduced Motion: If `prefers-reduced-motion: reduce` is detected, heart-pop scaling and carousel transitions are instant cuts without spring animations.
