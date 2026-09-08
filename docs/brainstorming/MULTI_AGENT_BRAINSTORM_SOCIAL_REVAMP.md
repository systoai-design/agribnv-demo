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
3. **Desktop vs. Mobile Experience:**
   * *Mobile:* Full-bleed immersive 9:16 vertical scroll with touch gestures.
   * *Desktop:* 3-column layout (Left: Navigation & Filters; Center: High-density 9:16 framed video card with comment panel; Right: Sticky Farm Stay & Product Booking Card).

---

### 5️⃣ Integrator / Arbiter Agent (Synthesis & Final Rulings)

#### Verdicts & Rationales:

| Issue / Objection | Arbiter Ruling | Technical & Product Solution |
| :--- | :--- | :--- |
| **Cold Start / Inactive Farmers** | **ACCEPTED** | Introduce **"Collaborator/Visitor Stories"**: Verified guests who book stays can tag the farm in their own visitor reels (subject to farmer approval), generating organic content without burdening the farmer. |
| **Video Delivery Cost & OOM** | **ACCEPTED** | Mandate a 3-slot virtualized window in the React video component and implement Cloudflare Stream or HLS CDN with strict 60s/30MB caps. |
| **Feed vs. Search Collision** | **ACCEPTED** | Do not replace the search engine entirely. Split the primary view into **"Feed"** and **"Explore"** tabs at the top of the Home screen, with a dedicated **"Reels"** button on the bottom nav. |
| **Content Moderation** | **ACCEPTED** | Automated basic file inspection + Supabase Edge Function with Google Cloud Vision / Gemini Flash moderation check for NSFW/spam before post activation. |

---

## 3. Decision Log (Locked Decisions)

* **DEC-001:** Farmers receive verified creator profiles containing social feeds, follower counters, crop badges, and direct links to stays/products.
* **DEC-002:** The App Home screen features a dual-mode header: `[ Feed | Explore ]`. When in `Feed`, users see updates, harvest stories, and embedded video previews. When in `Explore`, users access date pickers, price sliders, and map view.
* **DEC-003:** A dedicated `Reels` bottom-bar tab provides an immersive vertical short-form video experience. Every reel MUST include a clickable bottom card linking to the host's farm stay or product.
* **DEC-004:** Video playback engine enforces strict 3-element DOM virtualization and cleanup to prevent mobile WebView crashes.
* **DEC-005:** Database schema expands with `farm_posts`, `post_media`, `post_likes`, `post_comments`, and `farm_follows` protected by Supabase RLS.

**Disposition:** **APPROVED** (Ready for SRS and PRD integration).
