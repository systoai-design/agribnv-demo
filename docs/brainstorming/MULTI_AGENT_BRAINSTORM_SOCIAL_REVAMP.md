# Multi-Agent Brainstorming Report: Social Feed & Short-Form Video (Reels)

> **Process Framework:** Multi-Agent Peer Review (`multi-agent-brainstorming`)  
> **Topic:** Integrating Farmer Social Profiles, Discover Feed, and Short-Form Video Reels into Agribnv ("bed & venture")  
> **Date:** September 2026  
> **Status:** REVIEW COMPLETE & RATIFIED BY ARBITER  

---

## 1. Executive Summary & Design Premise

Agribnv is transitioning from an Airbnb-clone transactional platform to a **social-first agritourism creator marketplace ("bed & venture")**.
The user requested brainstorming and specifying three upcoming core features:
1. **Farmer Social Profiles:** Comprehensive creator profiles with posts, following/followers, likes, bio, and farm identity.
2. **Immediate Feed Experience:** Users opening the app are immediately greeted with a rich activity/discovery feed.
3. **Short-Form Video (Reels):** Vertical full-screen video feed showcasing daily farm life, harvesting, Kubos, and workshops.

---

## 2. Multi-Agent Review Transcripts

### 1️⃣ Primary Designer (Lead Proposal)

#### Core Proposal:
* **The "Social-to-Booking" Pipeline:** Every social artifact (profile, feed post, video reel) is directly linked to an underlying hospitality or commerce entity (Stay, Tour, or Farm Product).
* **Profile Architecture:** An Instagram-style header (Avatar, Farmer Bio, Follow/Following counts, Verified Farm Badge) over a 4-tab content grid:
  1. *Reels* (9:16 vertical video clips)
  2. *Posts* (Photo journals, harvest updates, seasonal announcements)
  3. *Stays & Tours* (Bookable rooms, kubos, workshops)
  4. *Shop* (Direct farm products: honey, coffee, fruits)
* **The Dual-Feed System:**
  * **"For You" (Discover):** Algorithmically/location-curated feed mixing Reels, featured farms, and seasonal harvest stories.
  * **"Following":** Reverse-chronological timeline of updates from farms the user has explicitly followed.
* **Short-Form Video (AgriReels):**
  * Vertical scroll (snap-to-page) 9:16 video player.
  * Floating interactive overlay: Farmer avatar + Follow button, Like count, Share button, and a **"Shop / Book This Farm" sticky card** at the bottom.

---

### 2️⃣ Skeptic / Challenger Agent

> *"Assume this design fails in production. Why?"*

#### Objections Raised:
1. **The "Empty Fields" Cold-Start Trap:** Unlike lifestyle influencers in cities, rural farmers work 12-hour days in fields. If Agribnv expects them to produce high-gloss TikToks daily, 90% of profiles will be blank, dead, or have one grainy video from 2024. An empty feed destroys user retention.
2. **Bandwidth & Video Costs:** Video streaming is orders of magnitude more expensive than static photos. If raw video files are uploaded directly to Supabase Storage, streaming costs will explode, and users in rural destinations with 3G connections will experience infinite loading spinners.
3. **Intent Mismatch (Entertainment vs. Vacation Planning):** If a user opens Agribnv to book a stay in Guimaras next weekend, forcing them into a full-screen dopamine video loop will frustrate high-intent bookers who just want dates, prices, and maps.
4. **Moderation & Agricultural Spam:** Who moderates videos? What happens when unauthorized users post non-agricultural content, spam, or scams disguised as farm stays?

---

### 3️⃣ Constraint Guardian Agent

> *"Enforce non-functional and real-world constraints (Performance, Mobile WebView, Security, Cost)."*

#### Technical Invariants & Hard Limits:
1. **Mobile WebView Memory Limit (OOM Crash Prevention):**
   * Capacitor on iOS (WKWebView) and Android WebView will **crash with Out-Of-Memory (OOM)** if more than 3-4 HTML5 `<video>` elements remain active in the DOM simultaneously.
   * **Rule:** Strict virtualization with a **3-slot window** `[Previous (unloaded), Active (playing), Next (preloading)]`. When a video leaves the viewport, the player must execute:
     ```ts
     video.pause();
     video.removeAttribute('src');
     video.load();
     ```
2. **Media Pipeline & Transcoding Constraint:**
   * Farmers must never upload uncompressed 4K 60fps mobile videos.
   * **Rule:** Client-side pre-flight check: Video duration capped at **60 seconds**, max upload size **30 MB**, forced compression to 720p/1080p H.264 before upload, with adaptive bitrate HLS delivery (Cloudflare Stream or HLS chunking via Supabase Storage + CDN).
3. **Security & RLS Policies:**
   * Only authenticated users with `app_role = 'host'` can publish Reels or tag commercial products.
   * Guests can comment, like, and share, but can only post "Visitor Reviews" with video attachments, not official farm updates.
   * Rate limiting: Max 5 video uploads per host per day; max 30 comments per hour to prevent spam botting.

---

### 4️⃣ User Advocate Agent

> *"Evaluate cognitive load, clarity of flows, and user expectations."*

#### UX Analysis:
1. **The Farmer's Realities (Low Digital Literacy & Field Work):**
   * Farmers need **"Zero-Friction Creation"**: 1-tap camera capture, automated geotagging, simple templates ("Harvest Day", "Farm Walkthrough", "New Product Arrival"). No complex video editing timeline.
2. **The Traveler's Dual Mode (Lean-Back vs. Lean-Forward):**
   * The home screen must not trap travelers in a video loop if they are trying to search.
   * **Solution:** A prominent **Top Navigation Segment** on the Home screen:
     - `Feed` (Social & Stories)
     - `Explore` (Search, Date Filter, Categories, and Map)
     - `Reels` (Dedicated vertical video tab in bottom nav)
   * This respects both users: those seeking inspiration (social feed) and those ready to book (search engine).
3. **Desktop Website Experience vs. Mobile:**
   * *Mobile Form Factor:* Full-bleed 9:16 vertical video player with touch gestures, bottom navigation, and compact bottom sheets.
   * *Desktop Website (Evergreen Web Browsers):*
     - **3-Column Canvas:** Left persistent sidebar navigation (Logo, Home, Explore, Reels, Saved, Messages, Creator Studio), center content stream (max-width 640px for feed, 420px for 9:16 video frame), right contextual discovery rail (Trending Farms, Seasonal Crop Alerts, Weather Widget, Sticky Booking Card).
     - **AgriReels Desktop Theater Mode:** When navigating to `/reels` on desktop, render a 2-column theater view: 
       - Left: 9:16 framed player with ambient frosted-glass background glow, progress bar scrubber, volume slider, and Picture-in-Picture (PiP) trigger.
       - Right: Persistent farmer info panel with follow button, full caption, real-time scrolling comments, and an instant booking widget with date-picker and price breakdown.
     - **Keyboard First Navigation:** Full desktop keyboard shortcut matrix (`Space` = Play/Pause, `J`/`Down` = Next, `K`/`Up` = Prev, `M` = Mute, `L` = Like, `C` = Comment, `B` = Quick Book).
     - **Split-Screen Explore Mode:** In `Explore`, desktop renders an interactive dual-pane view (left: property/tour card grid with filters; right: interactive MapLibre GL map with custom farm pins).
     - **Desktop Creator Studio:** Dedicated web workspace for hosts to drag-and-drop 4K/1080p clips, scrub video frames to select a custom thumbnail, tag stays and products, and inspect analytics.
     - **SEO & Deep-Linking:** Direct URLs for all profiles (`/@farm_handle`), posts (`/p/:id`), and reels (`/reels/:id`) equipped with OpenGraph video/image tags and schema.org `LodgingBusiness` / `VideoObject` structured data for search engine discovery.

---

### 5️⃣ Integrator / Arbiter Agent (Synthesis & Final Rulings)

#### Verdicts & Rationales:

| Issue / Objection | Arbiter Ruling | Technical & Product Solution |
| :--- | :--- | :--- |
| **Cold Start / Inactive Farmers** | **ACCEPTED** | Introduce **"Collaborator/Visitor Stories"**: Verified guests who book stays can tag the farm in their own visitor reels (subject to farmer approval), generating organic content without burdening the farmer. |
| **Video Delivery Cost & OOM** | **ACCEPTED** | Mandate a 3-slot virtualized window in the React video component and implement Cloudflare Stream or HLS CDN with strict 60s/30MB caps. |
| **Feed vs. Search Collision** | **ACCEPTED** | Do not replace the search engine entirely. Split the primary view into **"Feed"** and **"Explore"** tabs at the top of the Home screen, with a dedicated **"Reels"** button on the bottom nav (mobile) or left sidebar (desktop). |
| **Content Moderation** | **ACCEPTED** | Automated basic file inspection + Supabase Edge Function with Google Cloud Vision / Gemini Flash moderation check for NSFW/spam before post activation. |
| **Desktop Website Parity** | **ACCEPTED** | Desktop is not an afterthought or scaled-up phone screen. Desktop web shall feature an ergonomic 3-column layout, theater-mode reel player with split booking/comment panel, keyboard shortcuts, split-screen map explore, and desktop creator studio. |

---

## 3. Decision Log (Locked Decisions)

* **DEC-001:** Farmers receive verified creator profiles containing social feeds, follower counters, crop badges, and direct links to stays/products.
* **DEC-002:** The App Home screen features a dual-mode header: `[ Feed | Explore ]`. When in `Feed`, users see updates, harvest stories, and embedded video previews. When in `Explore`, users access date pickers, price sliders, and map view.
* **DEC-003:** A dedicated `Reels` tab (bottom nav on mobile, left sidebar on desktop) provides an immersive short-form video experience with sticky commerce booking integration.
* **DEC-004:** Video playback engine enforces strict 3-element DOM virtualization and cleanup to prevent mobile WebView crashes.
* **DEC-005:** Database schema expands with `farm_posts`, `post_media`, `post_likes`, `post_comments`, and `farm_follows` protected by Supabase RLS.
* **DEC-006 (Desktop Website Experience):** Desktop web implements a 3-column layout, 2-column theater mode for reels with keyboard shortcuts (`Space`, `J/K`, `M`, `L`, `B`), inline video hover previews in feed, and split-screen map view in Explore mode.
* **DEC-007 (Desktop Creator Studio & Web SEO):** Desktop web includes a creator studio with drag-and-drop uploads, frame thumbnail selector, and SSR/OpenGraph meta tags for all public creator, post, and reel URLs.

**Disposition:** **APPROVED** (Ready for SRS, PRD, and SPEC integration).
