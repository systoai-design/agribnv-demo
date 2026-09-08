# PRD-001: Social Feed, Farmer Creator Profiles & AgriReels

**Feature Title:** Social Discovery, Farmer Profiles & Short-Form Video Feed (AgriReels)  
**Target Milestone:** v2.0 Revamp  
**Status:** In Review  
**Owners:** Engineering & Product Design  

---

## 1. Problem Statement
In Agribnv v1, farm stays were presented as static real-estate listings. However, agricultural tourism is deeply personal and seasonal: crops ripen at specific times, farmers have rich cultural traditions, and travelers crave authentic behind-the-scenes stories rather than sterile hotel rooms. Without social discovery, farms struggle with organic discovery and repeat engagement outside of travel peak seasons.

## 2. Solution Overview
Introduce a **creator marketplace paradigm** where farmers share daily life via short-form video reels and story posts. Travelers browse an engaging visual feed that connects storytelling directly to booking stays and purchasing farm products.

---

## 3. User Personas & User Stories

### Persona 1: Tatay Roman (Organic Mango & Honey Farmer in Guimaras)
* *"As a farmer, I want to record a 30-second video of our mango harvest on my phone, so that tourists in Iloilo and Manila see that fruit picking is in season and book a weekend stay."*
* *"As a farmer, I want a public profile where my follower count and farm history are displayed, giving credibility to my certified organic products."*

### Persona 2: Maya (Eco-Conscious Traveler & Foodie from Manila)
* *"As a traveler, I want to open the Agribnv app and immediately see authentic, relaxing farm reels and harvesting stories, so I can discover unique rural escapes."*
* *"As a traveler watching a reel about a hillside kubo, I want to tap a button directly on the video to check availability and reserve my stay without searching for the listing manually."*

---

## 4. Detailed Feature Specifications

### 4.1 Farmer Creator Profile
* **Header Elements:** 
  - Farm avatar (120x120), Cover banner, Farm Name, Verified Green Checkmark.
  - Farmer Full Name & Title (e.g. "Master Beekeeper & Host").
  - Stats Bar: `[ 42 Posts | 1.8k Followers | 340 Following | 12k Likes ]`.
  - Bio: Max 280 characters + external link (website/social) + Municipality tag.
  - Action row: `[ Follow / Following ]`, `[ Direct Message ]`, `[ Share Farm ]`.
* **Profile Tabs:**
  1. `Reels`: 3-column vertical thumbnail grid with view count badges.
  2. `Posts`: Square thumbnail grid of photo journals and updates.
  3. `Stays`: Cards of overnight accommodations with price per night.
  4. `Products`: Cards of farm goods with price and harvest season.

### 4.2 Home Screen Feed (`[ Feed | Explore ]`)
* **Dual Header:** Fixed segment controller at top of Home screen.
* **Sub-Tabs:** `For You` (algorithmically ranked by location & engagement) and `Following` (reverse chronological).
* **Feed Card Elements:**
  - Host info header with avatar, name, and post timestamp.
  - Media container: Aspect ratio 4:5 or 1:1 for photos; auto-looping silent video.
  - Action row: Like button (animated heart pop), Comment button, Share button, Bookmark button.
  - Tagged Entity Pill: e.g. `📍 Guimaras Mango Farm` or `🏷️ Sweet Carabao Mangoes (₱150/kg)`.
  - Expandable caption with hashtags.

### 4.3 AgriReels (Short-Form Video Engine)
* **Viewport:**
  - Mobile: Full viewport height ($100\text{vh}$ / $100\text{dvh}$) with CSS scroll snap.
  - Desktop: Centered 9:16 player frame with comments/stay panel to the right.
* **Right-Side Interaction Rail:**
  - Host avatar with quick-follow `+` badge.
  - Like button + formatted count (e.g., `1.4k`).
  - Comment button + count (taps open sliding bottom sheet on mobile).
  - Bookmark button.
  - Share button (triggers native Web Share API).
  - Mute/Unmute audio toggle button.
* **Bottom Commerce Card:**
  - Pill displaying: `[ Thumbnail | "Sunset View Kubo" | ₱2,200/night | Book Now ]`.
  - Tapping `Book Now` slides up the booking calendar drawer without stopping video audio/playback.

---

## 5. Acceptance Criteria

* [ ] **AC-1:** Unauthenticated users can view public feeds, reels, and profiles, but tapping Like, Comment, Follow, or Book triggers the Auth modal.
* [ ] **AC-2:** Video reels snap cleanly on mobile touch swipe without getting stuck between frames.
* [ ] **AC-3:** When a user scrolls past a video, audio stops immediately and video memory is evicted to prevent mobile WebView crashes.
* [ ] **AC-4:** Tapping the commerce pill on any reel opens the verified listing booking flow with pre-populated property data.
* [ ] **AC-5:** Only hosts with `app_role = 'host'` see the "Create Reel / Post" floating action button.

---

## 6. Success Metrics & KPIs

1. **Engagement Time:** Average daily time spent in app increases from $< 2$ minutes (transactional) to $> 7$ minutes (social discovery).
2. **Follower Graph:** $> 40\%$ of active users follow at least 3 local farms within 30 days.
3. **Reel-to-Booking Conversion:** $> 15\%$ of total stay bookings originate from a tagged Reel or Story post.
