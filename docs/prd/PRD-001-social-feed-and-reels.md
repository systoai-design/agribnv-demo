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

### Persona 2: Maya (Eco-Conscious Traveler & Foodie from Manila - Mobile User)
* *"As a traveler on my phone, I want to open Agribnv and immediately see authentic, relaxing farm reels and harvesting stories, so I can discover unique rural escapes."*
* *"As a traveler watching a reel about a hillside kubo, I want to tap a button directly on the video to check availability and reserve my stay without searching for the listing manually."*

### Persona 3: Leo (Remote Worker & Group Trip Organizer - Desktop Website User)
* *"As a traveler planning a team offsite on my laptop browser, I want to browse farm stays on an expansive screen with an interactive map, watch farm video reels in a high-res theater mode, and review room configurations, Wi-Fi speeds, and dates side-by-side with comments."*
* *"As a desktop user, I want keyboard shortcuts to quickly navigate through reels and look up booking details without clumsy touch-swiping emulation."*

### Persona 4: Elena (Farm Admin & Marketing Manager - Desktop Creator Studio)
* *"As a farm marketing manager sitting at my office computer, I want to drag and drop professionally shot drone and landscape videos directly from my desktop, select the best video thumbnail frame, tag our cottages, and track view counts and direct booking conversions."*

---

## 4. Detailed Feature Specifications

### 4.1 Farmer Creator Profile
* **Header Elements:** 
  - Farm avatar (120x120), Cover banner, Farm Name, Verified Green Checkmark.
  - Farmer Full Name & Title (e.g. "Master Beekeeper & Host").
  - Stats Bar: `[ 42 Posts | 1.8k Followers | 340 Following | 12k Likes ]`.
  - Bio: Max 280 characters + external link (website/social) + Terroir/Municipality tag.
  - Action row: `[ Follow / Following ]`, `[ Direct Message ]`, `[ Share Farm ]`.
* **Profile Tabs:**
  1. `Reels`: Vertical thumbnail grid with view count badges (4 columns on desktop $\ge 1024\text{px}$, 3 columns on mobile).
  2. `Posts`: Square thumbnail grid of photo journals and updates.
  3. `Stays`: Cards of overnight accommodations with price per night.
  4. `Products`: Cards of farm goods with price and harvest season.
* **Desktop Website Enhancements:**
  - High-resolution 16:5 panoramic cover banner with smooth parallax scrolling.
  - Sticky sub-navigation tab bar maintaining visibility during long vertical page scrolls.
  - Hover previews on Reels thumbnails: hovering for $>300\text{ms}$ initiates silent video looping.
  - Floating "Book a Stay" widget pinned on the right side of the profile on wide viewports.

### 4.2 Home Screen Feed (`[ Feed | Explore ]`)
* **Dual Header:** Fixed segment controller at top of Home screen.
* **Sub-Tabs:** `For You` (algorithmically ranked by location & engagement) and `Following` (reverse chronological).
* **Feed Card Elements:**
  - Host info header with avatar, name, and post timestamp.
  - Media container: Aspect ratio 4:5 or 1:1 for photos; auto-looping silent video.
  - Action row: Like button (animated heart pop), Comment button, Share button, Bookmark button.
  - Tagged Entity Pill: e.g. `📍 Guimaras Mango Farm` or `🏷️ Sweet Carabao Mangoes (₱150/kg)`.
  - Expandable caption with hashtags.
* **Desktop Website 3-Column Layout:**
  - **Left Rail (240px):** Persistent sidebar navigation (`Home`, `Explore`, `AgriReels`, `Saved Stays`, `Messages`, `Creator Studio`).
  - **Center Feed (640px max):** Optimized readable line-length avoiding wide monitor distortion.
  - **Right Rail (340px):** Contextual discovery widgets:
    - *"Featured Farms to Follow"* (with 1-click follow button).
    - *"Seasonal Harvest Calendar"* (e.g., Carabao Mangoes in Guimaras, Heirloom Rice in Batad, Arabica Coffee in Benguet).
    - *"Farming Hub Weather"* (real-time weather at top agritourism destinations).
  - Hover-to-play for embedded feed videos with un-mute and full-screen controls.

### 4.3 AgriReels (Short-Form Video Engine)
* **Viewport Adaptations:**
  - **Mobile:** Full viewport height ($100\text{vh}$ / $100\text{dvh}$) with CSS scroll snap.
  - **Desktop Website (Theater Mode):** Split 2-column modal/page layout:
    - *Left Video Canvas (9:16 Frame):* Centered video stage (max-height 85vh) surrounded by ambient frosted-glass glow sampled from the video colors.
    - *Right Information & Commerce Panel (400px):* Host profile card, follow button, full caption with hashtags, audio track name, scrollable comments list with inline reply field, and **Sticky Instant Booking Card** (`[ Thumbnail | "Sunset Kubo" | ₱2,200/night | Book Now ]`).
* **Desktop Playback Controls:**
  - Video timeline scrubber bar with hover timestamp tooltip.
  - Custom volume slider with hover popup and mute toggle.
  - Picture-in-Picture (PiP) button allowing the user to multitask across the site while audio/video plays in a floating window.
  - Fullscreen toggle button (`F`).
* **Desktop Keyboard Shortcuts:**
  - `Space` / `K`: Toggle Play / Pause.
  - `ArrowDown` / `J`: Next Reel.
  - `ArrowUp`: Previous Reel.
  - `M`: Toggle Audio Mute / Unmute.
  - `L`: Like / Unlike Reel.
  - `C`: Focus comment input.
  - `B`: Open instant booking modal for tagged stay.
  - `Esc`: Close theater mode.
  *(Disabled when typing inside text inputs).*

### 4.4 Desktop Creator Studio & Media Uploader
* **Drag-and-Drop Media Zone:** Hosts can drag video files (MP4, MOV, WebM up to 30MB/60s) directly into browser.
* **Video Frame Scrubber:** Interactive canvas-based scrubber allowing hosts to choose the exact cover frame for their video thumbnail.
* **Tagging Selector:** Searchable dropdown to link an active property stay or direct farm product to the reel.
* **Host Performance Analytics:** Visual charts showing Reel views, average watch duration, profile visits, and booking conversions.

---

## 5. Acceptance Criteria

* [ ] **AC-1:** Unauthenticated users can view public feeds, reels, and profiles, but tapping Like, Comment, Follow, or Book triggers the Auth modal.
* [ ] **AC-2:** Video reels snap cleanly on mobile touch swipe without getting stuck between frames.
* [ ] **AC-3:** When a user scrolls past a video, audio stops immediately and video memory is evicted to prevent mobile WebView crashes.
* [ ] **AC-4:** Tapping the commerce pill on any reel opens the verified listing booking flow with pre-populated property data.
* [ ] **AC-5:** Only hosts with `app_role = 'host'` see the "Create Reel / Post" floating action button.
* [ ] **AC-6 (Desktop Layout Parity):** On screen widths $\ge 1024\text{px}$, Agribnv displays the persistent 3-column layout with left navigation, centered 640px feed, and right discovery sidebar.
* [ ] **AC-7 (Desktop Theater Mode & Hotkeys):** Navigating to `/reels` on desktop renders the 2-column theater mode; pressing `Space` pauses/plays, `J`/`Down` advances to the next reel, and `M` toggles mute.
* [ ] **AC-8 (Desktop Drag-and-Drop Upload):** Hosts on desktop web can drag-and-drop a video file into Creator Studio and scrub frames to pick a thumbnail.
* [ ] **AC-9 (SEO & OpenGraph Previews):** Direct links to `/@farm_handle` and `/reels/:id` generate complete OpenGraph and Twitter Card previews with video and image previews.
* [ ] **AC-10 (Cross-Browser Support):** Desktop web operates without console errors or layout degradation across Chrome, Safari, Firefox, and Edge.

---

## 6. Success Metrics & KPIs

1. **Engagement Time:** Average daily time spent in app increases from $< 2$ minutes (transactional) to $> 7$ minutes (social discovery).
2. **Follower Graph:** $> 40\%$ of active users follow at least 3 local farms within 30 days.
3. **Reel-to-Booking Conversion:** $> 15\%$ of total stay bookings originate from a tagged Reel or Story post.
4. **Desktop Booking Share:** Desktop web maintains $> 35\%$ of total booking transactions due to high-value group trip planners utilizing the desktop calendar and theater view.
