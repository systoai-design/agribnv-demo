# Software Requirements Specification (SRS)
## Agribnv v2: The Agritourism Platform for Farmers ("bed & venture")

**Document Version:** 2.0  
**Status:** Baseline Draft  
**Target Platform:** Web (Responsive SPA) + Native Mobile (iOS & Android via Capacitor)  
**Reference Document:** [`docs/PRODUCT_VISION_V2.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/PRODUCT_VISION_V2.md)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the complete revamp of the **Agribnv** platform (v2). It provides the definitive technical and architectural contract for engineers, designers, and stakeholders.

### 1.2 Scope
Agribnv is an agritourism discovery and creator marketplace connecting agricultural producers (farmers) with conscious travelers, eco-tourists, and direct consumers. The platform integrates four core domains:
1. **Farm Profile & Identity:** Digital presence highlighting farmer heritage, story, and agricultural practices.
2. **Direct Farm Products:** Catalog of raw harvests and artisan farm-made goods.
3. **Experiences & Stays ("bed & venture"):** Day workshops, harvest tours, and overnight eco-stays with an atomic booking engine.
4. **Social Discovery Layer:** Farmer-generated story updates, follower feeds, and community sharing.

### 1.3 Definitions, Acronyms & Abbreviations
* **SRS:** Software Requirements Specification
* **PRD:** Product Requirements Document
* **RLS:** Row-Level Security (PostgreSQL / Supabase)
* **GiST:** Generalized Search Tree (PostgreSQL index used for atomic range exclusion)
* **Capacitor:** Cross-platform native runtime enabling web code execution on iOS and Android
* **FSD:** Feature-Sliced Design
* **Host/Farmer:** Verified agricultural producer listing a farm, experiences, stays, or products
* **Guest/Consumer:** End user browsing, following, booking, or purchasing from farms

---

## 2. Overall Description

### 2.1 Product Perspective
Agribnv operates as a unified multi-platform application (Web, iOS, and Android) powered by a single Vite + React + TypeScript codebase packaged with Capacitor. The backend is powered by Supabase (PostgreSQL 15+, Auth, Storage, Edge Functions, and Realtime).

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (React 18 + TS)                │
│    Web Browser  │  iOS App (Capacitor)  │ Android (Capacitor)│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / WSS
┌──────────────────────────────▼──────────────────────────────┐
│                    Supabase Backend Engine                  │
│  • PostgreSQL 15+ (RLS + GiST atomic constraints)            │
│  • Supabase Auth (JWT session management)                   │
│  • Supabase Realtime (Chat & Live notifications)            │
│  • Supabase Storage (Optimized farm imagery)                │
│  • Edge Functions (Serverless business operations)          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 User Classes & Personas
1. **The Farmer / Host:**
   * Creates and manages the farm profile, story, photos, and location.
   * Publishes periodic stories and harvest updates to the social feed.
   * Lists overnight stays (kubos, cottages) and day experiences (tours, workshops).
   * Manages incoming bookings, availability calendars, and guest messages.
2. **The Guest / Explorer:**
   * Discovers farms via social feed, category filters, or interactive map.
   * Follows specific farms to receive updates on harvest seasons and activities.
   * Books overnight stays or activity sessions with real-time price calculation.
   * Inquires about direct farm products and coordinates with hosts.
3. **The System Administrator:**
   * Moderates listings, reviews, and farm verification badges.
   * Manages platform categories, safety policies, and system telemetry.

### 2.3 Operating Environment & Constraints
* **Client Environments:** iOS 15+, Android 10+, Modern Evergreen Browsers (Chrome, Safari, Firefox, Edge).
* **Network Tolerance:** Must handle intermittent connectivity common in rural agricultural areas (optimistic UI updates and graceful offline states).
* **Database Invariant:** Concurrency control on booking dates must be mathematically enforced at the database level via PostgreSQL GiST exclusion constraints.

---

## 3. System Features & Functional Requirements

### 3.1 Module 1: Identity, Authentication & Role Management
* **REQ-AUTH-1:** The system shall support email/password authentication and password recovery with secure JWT session refresh.
* **REQ-AUTH-2:** The system shall implement strict Role-Based Access Control (`guest` vs `host` via `user_roles`).
* **REQ-AUTH-3:** Any authenticated user shall be able to apply to become a host/farmer via an onboarding wizard.
* **REQ-AUTH-4:** Profiles must support avatar uploads, bio, location coordinates, contact phone, and social links.

### 3.2 Module 2: Farm Profile & Digital Identity
* **REQ-FARM-1:** Each farm shall have a public profile containing:
  - Farm Name, Tagline, Detailed Story, and Farmer Biography.
  - Geo-location coordinates, address, and interactive map marker.
  - "What We Grow" taxonomy (crops, livestock, organic certifications).
  - Curated photo gallery with primary hero image.
* **REQ-FARM-2:** The farm profile shall present tabs for:
  1. *About & Story* (Farmer ethos, certifications, land background)
  2. *Stays & Lodging* (Available accommodations)
  3. *Experiences & Tours* (Day activities)
  4. *Products* (Available farm goods)
  5. *Updates & Journal* (Social feed posts)
  6. *Reviews* (Verified visitor testimonials)

### 3.3 Module 3: Social Discovery & Content Layer
* **REQ-SOC-1:** Farmers shall be able to create "Updates" (posts with media, caption, crop tag, and optional event link).
* **REQ-SOC-2:** Guests shall be able to "Follow" a farm and view a curated chronological activity feed.
* **REQ-SOC-3:** Guests shall be able to bookmark/wishlist farms and like farm updates.
* **REQ-SOC-4:** The system shall support native content sharing via the Web Share API on mobile, with fallback clipboard link copying on desktop.

### 3.4 Module 4: Direct Farm Products Catalog
* **REQ-PROD-1:** Hosts shall be able to list products with title, description, price, stock status, seasonal availability, and photos.
* **REQ-PROD-2:** Guests shall be able to filter products by category (Fresh Produce, Specialty, Seedlings, Artisan/Processed).
* **REQ-PROD-3:** Guests shall be able to initiate an inquiry or reservation for products directly through host messaging.

### 3.5 Module 5: Experiences & Stays Booking Engine
* **REQ-BOOK-1:** The system shall display real-time calendar availability per property, reflecting blocked dates and active bookings.
* **REQ-BOOK-2:** Dynamic Price Calculator: Total price shall calculate base rate $\times$ nights $+$ guest surcharge $+$ selected experience add-ons.
* **REQ-BOOK-3 (Double Booking Prevention):** The database shall enforce an atomic GiST exclusion constraint on `daterange(check_in, check_out, '[)')` for active bookings (`pending`, `confirmed`).
* **REQ-BOOK-4:** Guests shall be able to view their upcoming, completed, and cancelled bookings with full receipts.
* **REQ-BOOK-5:** Hosts shall have a calendar view to manage reservations, accept/decline bookings, and manually block custom maintenance dates.

### 3.6 Module 6: Realtime Messaging & In-App Notifications
* **REQ-MSG-1:** Guests and hosts shall be able to message each other in real-time using Supabase Realtime WebSocket channels.
* **REQ-MSG-2:** Unread message counts shall update reactively on the navigation bar.
* **REQ-MSG-3:** The system shall support push notifications on native mobile platforms via the Capacitor Push Notifications plugin.

---

## 4. Non-Functional Requirements

### 4.1 Performance & Bundle Budget
* **NFR-PERF-1:** Initial JavaScript bundle size shall be **$\le$ 150 KB gzip** achieved via route-level code splitting (`React.lazy()`).
* **NFR-PERF-2:** Largest Contentful Paint (LCP) shall be **$\le$ 2.0s** on mobile 4G connections.
* **NFR-PERF-3:** Heavy dependencies (`maplibre-gl`, `recharts`) shall load asynchronously only when the user navigates to map or analytics screens.

### 4.2 Security & Data Integrity
* **NFR-SEC-1:** All database tables shall enforce Supabase Row-Level Security (RLS) policies.
* **NFR-SEC-2:** Sensitive API keys or service roles must never be exposed to the client bundle (`VITE_` variables are public anon keys only).
* **NFR-SEC-3:** All user input must be sanitized and validated using Zod schemas on both client and database levels.

### 4.3 Mobile Usability & Platform Polish
* **NFR-MOB-1:** UI must strictly respect device safe-area insets (iOS dynamic island, notch, and Android navigation bar).
* **NFR-MOB-2:** Mobile touch targets must meet the minimum 44x44 pt touch standard.
* **NFR-MOB-3:** Action triggers (e.g., booking confirmation, wishlisting) shall provide subtle haptic feedback on supported mobile devices.

### 4.4 Accessibility (a11y)
* **NFR-A11Y-1:** All color combinations (Canopy greens, creams, terracottas) must achieve **WCAG 2.1 AA** contrast ratios ($\ge 4.5:1$ for normal text).
* **NFR-A11Y-2:** Modals, sheets, and popovers must support full keyboard focus-trapping and ESC-key dismissal.

---

## 5. Architectural Quality Standards

1. **Layer Separation:** Pure domain logic (pricing math, date calculations) must be isolated in `domain/` without React or DOM dependencies.
2. **State Management:** All server state shall be managed exclusively by **TanStack Query v5**; client UI state shall be managed by **Zustand**.
3. **Style Enforcement:** Visual styling must adhere strictly to design tokens defined in [`tailwind.config.ts`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/tailwind.config.ts).
