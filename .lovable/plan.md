# Agribnv Feature Completion Plan

## Overview
This comprehensive plan covers making ALL buttons, filters, links, and interactive features fully functional across the entire Agribnv application.

---

## Part 1: Home Page (Index.tsx) - Filters & Navigation ✅ PHASE 1 COMPLETE

### 1.1 Listing Type Tabs - ✅ WORKING
**Implementation:**
- Created Turso database integration with `listing_type` column
- Created `useTursoProperties` hook for filtered queries
- Tabs now filter properties by type (farm_stay | farm_experience | farm_tour)

### 1.2 Farmstay Subcategory Filters - ✅ WORKING
**Implementation:**
- Added `subcategory` column to Turso schema
- Updated FarmstayCategories to actually filter properties via Turso
- Categories: agrifarm, aquafarm, homestay, kubo_hut, farm_cottage, camp_stay, dorm_shared

### 1.3 Turso Database Integration - ✅ NEW
**Implementation:**
- Created `supabase/functions/turso-db/index.ts` edge function
- Created `src/lib/turso.ts` client library
- Created `src/hooks/useTursoProperties.ts` for reactive filtering
- Data auto-migrates from existing Supabase on first load

### 1.3 Price Range Filter - ✅ WORKING
Already functional in the filters sheet.

### 1.4 Guest Count Filter - ✅ WORKING  
Already functional in the filters sheet.

### 1.5 Date Range Filter - ✅ WORKING (UI only)
Calendar selection works. For actual availability checking, would need availability table.

### 1.6 Search Bar - ✅ WORKING
Location search filters properties by name/location.

### 1.7 "Show All" Button in Carousels - ✅ WORKING
Sets search location to filter properties.

### 1.8 Floating Map Button - NEEDS NAVIGATION
**Current State:** Button visible but doesn't navigate
**Action Required:** Add `onClick={() => navigate('/map')}`

---

## Part 2: Property Details Page

### 2.1 Booking Flow - ✅ WORKING
- Date selection, guest count, experience selection, reserve button all work

### 2.2 Share Button - NEEDS IMPLEMENTATION
**Action Required:** Implement Web Share API for mobile, copy link fallback for desktop

### 2.3 Wishlist/Heart Button - ✅ WORKING
Connected to useWishlist hook.

### 2.4 "Show All Photos" - ✅ WORKING
Opens PhotoGalleryModal.

### 2.5 "Show All Amenities" - NEEDS MODAL
**Action Required:** Wire up `showAllAmenities` state to display full list

### 2.6 "Show More" Description - NEEDS IMPLEMENTATION
**Action Required:** Toggle full description visibility

### 2.7 Reviews Section - ✅ WORKING (Mock Data)

### 2.8 "Contact Host" Button - NEEDS MESSAGING
**Action Required:** Navigate to inbox or open message modal

### 2.9 Farm Experiences Section - ✅ WORKING

### 2.10 Farm Calendar Section - ✅ WORKING (Static)

---

## Part 3: Navigation & Pages

### 3.1 Mobile Bottom Navigation - ✅ ALL WORKING
| Tab | Route | Status |
|-----|-------|--------|
| Explore | `/` | ✅ Working |
| Bookmark | `/wishlists` | ✅ Working |
| Home | `/` | ✅ Working |
| Inbox | `/inbox` | ✅ Working (Mock) |
| Profile | `/profile` or `/auth` | ✅ Working |

### 3.2 Desktop Navbar Dropdown - ✅ ALL WORKING

### 3.3 Wishlists Page - ✅ WORKING

### 3.4 Bookings Page - ✅ WORKING

### 3.5 Inbox Page - USES MOCK DATA
**Future:** Create real messaging system

### 3.6 Profile Page Settings
| Feature | Status |
|---------|--------|
| Edit name | ✅ Working |
| Edit avatar URL | ✅ Working |
| Become Host | ✅ Working |
| Change Password | ❌ Placeholder |
| Language | ❌ Placeholder |
| About App | ❌ Placeholder |
| Terms of Use | ❌ Placeholder |
| Privacy Policy | ❌ Placeholder |
| Share App | ❌ Placeholder |
| Sign Out | ✅ Working |

---

## Part 4: Database Schema Updates Required

```sql
-- 1. Add listing_type and subcategory columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'farm_stay';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS subcategory TEXT DEFAULT 'agrifarm';

-- 2. Update existing properties
UPDATE properties SET 
  listing_type = 'farm_stay',
  subcategory = CASE 
    WHEN category = 'fruit_picking' THEN 'agrifarm'
    WHEN category = 'livestock' THEN 'agrifarm'
    WHEN category = 'wellness' THEN 'homestay'
    WHEN category = 'farm_to_table' THEN 'farm_cottage'
    WHEN category = 'eco_trail' THEN 'camp_stay'
    WHEN category = 'organic_farm' THEN 'agrifarm'
    ELSE 'agrifarm'
  END;
```

---

## Part 5: Implementation Priority

### Phase 1: Core Filtering (Critical) ✅ COMPLETE
1. Database migration: Add `listing_type` and `subcategory` columns ✅
2. Update Index.tsx to filter by listing type ✅
3. Update Index.tsx to filter by subcategory ✅
4. Fix FloatingMapButton navigation to /map ✅

### Phase 2: Property Details Enhancements ✅ COMPLETE
5. Implement Share functionality (Web Share API) ✅
6. Implement "Show all amenities" modal ✅
7. Implement "Show more" description toggle ✅
8. Implement "Contact Host" functionality ✅

### Phase 3: Static/Info Pages ✅ COMPLETE
9. Create About App page ✅
10. Create Terms of Use page ✅
11. Create Privacy Policy page ✅
12. Implement password change flow ✅
13. Implement Share App functionality ✅

### Phase 4: Real Messaging ✅ COMPLETE
13. Create conversations/messages tables ✅
14. Implement real-time chat with Supabase Realtime ✅
15. Replace mock inbox data ✅

---

## Part 6: Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Add listing_type and subcategory filtering to filteredProperties |
| `src/components/properties/FloatingMapButton.tsx` | Add onClick navigation to /map |
| `src/pages/PropertyDetails.tsx` | Add share, show more description, show all amenities, contact host |
| `src/pages/MapView.tsx` | Verify map displays correctly with property markers |
| `src/pages/Profile.tsx` | Create actual pages for settings links or modal handlers |
| `src/pages/Auth.tsx` | Add forgot password functionality |
| Database | Migration for listing_type and subcategory columns |

---

## Part 7: Console Warning Fix

**Warning:** `Function components cannot be given refs` in Navbar
**Cause:** AnimatePresence wrapping functional component without forwardRef
**Fix:** Wrap dropdown content component with React.forwardRef

---

## Success Criteria

After full implementation:
- [x] Listing Type tabs filter properties by type
- [x] Subcategory buttons filter properties accordingly
- [x] Floating map button navigates to map view
- [x] Share button works on property details
- [x] All navigation links work correctly
- [x] Show all amenities displays full list
- [x] Show more description expands text
- [x] Contact host opens messaging
- [x] Profile settings pages work (or show "coming soon")

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1: Core Filtering | ~2 hours |
| Phase 2: Property Enhancements | ~1.5 hours |
| Phase 3: Static Pages | ~1 hour |
| Phase 4: Real Messaging | ~4 hours (future) |

**Total for immediate MVP: ~4.5 hours**
