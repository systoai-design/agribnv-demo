# Agent Operating Guidelines: Agribnv

> **CRITICAL INSTRUCTION FOR ALL AGENTS:**  
> Before designing, refactoring, or implementing any features in this repository, you **MUST ALWAYS read and align with [`docs/PRODUCT_VISION_V2.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/PRODUCT_VISION_V2.md)**.  
> This file contains the official business strategy, pitch deck requirements, and product pillars for the Agribnv revamp.

---

## 1. Project Context & Vision

Agribnv is undergoing a comprehensive revamp from the ground up:
* **The Pivot:** Shifting from a transactional rental listing clone (Airbnb-style) to a **social-first agritourism creator marketplace** ("bed & venture") that retains complete booking and hospitality capabilities.
* **Core Brand Identity:**
  * **Tagline:** *"Your Farm. Your Story. Your Market."*
  * **Subtitle:** *"bed & venture"*
  * **Visual Direction:** The *Terraced Light* design philosophy (earth-rooted, editorial typography, natural organic palette: Canopy Green, Sage, Linen/Cream, Terracotta).
* **The 4 Product Pillars:**
  1. **Farm Profile (Identity):** Farm story, farmer bio, location, "what you grow", certifications.
  2. **Products (Commerce):** Direct farm offerings (crops, honey, coffee, seeds, artisanal goods).
  3. **Experiences & Stays (Hospitality):** Day tours, harvesting workshops, and overnight kubo/cottage stays.
  4. **Social & Marketing (Discovery):** Farmer updates, seasonal stories, follower feeds, and community sharing.

---

## 2. Mandatory Architectural Invariants

Whenever you write code, respect these non-negotiable engineering rules:

### A. Preserving Core Infrastructure
1. **Zero Double-Booking Invariant:** The database enforces calendar concurrency through a PostgreSQL GiST exclusion constraint (`no_overlapping_bookings`) on `bookings.daterange`. **Do not bypass or disable this constraint.**
2. **Supabase Row-Level Security (RLS):** All tables must maintain strict RLS policies separating public read access from authenticated host/guest mutations.
3. **Capacitor Mobile Bridge:** Agribnv runs as both a web app and a native iOS/Android app via Capacitor. Always decouple platform-specific code (safe areas, haptics, camera) behind a clean adapter facade in `core/platform`. Never break native mobile builds in `/ios` and `/android`.

### B. Clean Architecture & Code Quality
1. **Vertical Slices / Feature-Sliced Structure:** Organize new code by domain and feature (`core/`, `domain/`, `entities/`, `features/`, `shared/`) rather than creating monolithic files.
2. **Deconstruct God Components:** The legacy monoliths (e.g., [`PropertyDetails.tsx`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/src/pages/PropertyDetails.tsx)) must be decomposed into isolated, testable widgets and domain calculators.
3. **Server State with TanStack Query v5:** Never use raw `useState` + `useEffect` fetch loops. Use structured Query Hooks and centralized Query Key factories.
4. **Token-Driven Design System:** Never hardcode random hex colors or ad-hoc margins. Use the semantic tokens defined in [`tailwind.config.ts`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/tailwind.config.ts) and [`src/index.css`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/src/index.css).
5. **Route-Level Code Splitting:** Heavy libraries (`maplibre-gl`, `recharts`) and route pages must be lazy-loaded using `React.lazy()` to maintain an initial bundle under 150 KB gzip.

---

## 3. Project Documentation Structure

* **Product Strategy & Vision:** [`docs/PRODUCT_VISION_V2.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/PRODUCT_VISION_V2.md)
* **Software Requirements Specification:** [`SRS.md`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/SRS.md)
* **Product Requirements Documents (PRDs):** [`docs/prd/`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/prd/)
* **Technical Specifications:** [`docs/spec/`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/docs/spec/)
* **Database Migrations:** [`supabase/migrations/`](file:///Users/Kyle/Desktop/Claude/Agribnv/agribnv-demo/supabase/migrations/)
