
# Agribnv UI Redesign - Guimaras Focus

## Overview
This plan redesigns the platform UI based on your notes, focusing on Guimaras as the primary region with its 5 municipalities, new farmstay categories, and enhanced experience visibility.

---

## Part 1: New Category Structure

### Main Navigation Tabs (Top Segment)
Replace the current category filter with a 3-tab segment control:

| Tab | Description |
|-----|-------------|
| **Farm Stay** | Accommodation-focused listings |
| **Farm Experience** | Activities and workshops |
| **Farm Tour** | Day tours and guided experiences |

### Farmstay Categories (Subcategories)
Update property categories to match your specified types:

| Category | Icon | Description |
|----------|------|-------------|
| Agrifarm | Tractor | Traditional farms |
| Aquafarm | Fish | Fisheries & aquaculture |
| Homestay | House | Inside farmer's house |
| Kubo/Hut Stay | Hut | Nipa or bamboo hut |
| Farm Cottage | Cottage | Small private house |
| Camp Stay | Tent | Tent/camping area |
| Dorm/Shared | Bunk | Group stays |

---

## Part 2: Home Page Redesign

### Location Carousels - Guimaras Focus
Instead of showing all regions, prioritize Guimaras municipalities:

**Carousel Order:**
1. "Available in Jordan" (capital, most farms)
2. "Available in Buenavista"
3. "Available in Nueva Valencia"
4. "Available in San Lorenzo"
5. "Available in Sibunag"

### Property Card Improvements
Based on your notes for subtle outline/shadow partition:

- Add soft shadow or subtle border to each card
- Ensure clear visual separation between cards
- Keep the overlay text style but improve contrast

### Bottom Navigation Bar
Current design is being highlighted in your screenshot - will refine:

- Maintain the 5-tab layout (Explore, Bookmark, Home, Inbox, Profile)
- Ensure proper spacing from content above
- Keep the elevated center Home button

---

## Part 3: Property Details Page - Experience Section

### Add "Farm Experiences" Section
Place after "What this place offers" section, styled similarly:

```text
+----------------------------------+
| Farm Experiences                 |
+----------------------------------+
| [Icon] Mango Picking Adventure   |
|        2 hrs · ₱500/person       |
+----------------------------------+
| [Icon] Farm-to-Table Cooking     |
|        4 hrs · ₱1,200/person     |
+----------------------------------+
| [Book Experience]                |
+----------------------------------+
```

### Add Farm Calendar Section
New section showing the farm's activity schedule:

```text
+----------------------------------+
| Farm Activity Calendar           |
+----------------------------------+
| Planting Season: Mar-May         |
| 🌱 Rice Planting - Available     |
| 🥭 Mango Blooming - Peak Season  |
+----------------------------------+
| Harvest Season: Oct-Dec          |
| 🥭 Mango Harvest - Book Now!     |
+----------------------------------+
```

This helps guests see scheduled farm activities while booking.

---

## Part 4: Database Updates

### Add More Properties to Other Municipalities
Currently Jordan has 62 properties, but others have only 1-2 each.

**Insert balanced sample data:**
- Buenavista: +9 properties (total 10)
- Nueva Valencia: +9 properties (total 10)
- San Lorenzo: +9 properties (total 10)
- Sibunag: +8 properties (total 10)

### Add Missing Experiences
Many Guimaras properties have no experiences. Add sample experiences focusing on:
- Mango-related activities (Guimaras specialty)
- Fishing/aquaculture experiences
- Traditional farming activities
- Local crafts and cooking

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/database.ts` | Add new PropertyCategory types for farmstay subcategories |
| `src/components/properties/CategoryFilter.tsx` | Redesign with 3-tab segment + subcategory cards |
| `src/pages/Index.tsx` | Update carousel logic to prioritize Guimaras municipalities |
| `src/pages/PropertyDetails.tsx` | Add "Farm Experiences" and "Farm Calendar" sections |
| `src/components/properties/PropertyCard.tsx` | Add subtle shadow/border partition |
| `src/components/layout/MobileNav.tsx` | Minor spacing refinements |
| Database | Insert balanced properties across all 5 municipalities |
| Database | Add experiences to properties missing them |

---

## Technical Details

### New Category Types
```typescript
export type PropertyCategory = 
  | 'agrifarm'
  | 'aquafarm'
  | 'homestay'
  | 'kubo_hut'
  | 'farm_cottage'
  | 'camp_stay'
  | 'dorm_shared';

export type ListingType = 'farm_stay' | 'farm_experience' | 'farm_tour';
```

### Property Card Shadow/Border
```css
/* Subtle card separation */
.property-card {
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.05);
}
```

### Farm Calendar Data Structure
Will use the existing `experiences` table with a new optional `scheduled_dates` concept, or display seasonal availability based on experience descriptions.

---

## Visual Mockup - Home Page Mobile

```text
+---------------------------+
| [Avatar] Welcome! Erica   |
|                       🔔  |
+---------------------------+
| 🔍 Search your destination|
+---------------------------+
| [Farm Stay][Exp][Tour]    | ← 3 tabs
+---------------------------+
| [Agri][Aqua][Kubo][Camp]  | ← subcategories
+---------------------------+
| Featured Farms            |
+---------------------------+
| Available in Jordan       |
| [Card][Card][Card]→       |
+---------------------------+
| Available in Buenavista   |
| [Card][Card][Card]→       |
+---------------------------+
|                           |
| [🔍][📑][🏠][✉️][👤]     | ← bottom nav
+---------------------------+
```

---

## Expected Outcomes

1. **Guimaras-first experience** - All 5 municipalities visible with balanced listings
2. **Clear category hierarchy** - Farm Stay/Experience/Tour tabs with subcategories
3. **Experience visibility** - Dedicated section on property details
4. **Farm calendar** - Guests can see planting/harvest schedules
5. **Cleaner card design** - Subtle shadows for visual separation
6. **Better mobile UX** - Refined spacing and navigation

