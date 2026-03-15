## System Blueprint – “SoLuna”

### 1. High‑Level Concept

- **Purpose**: A private, romantic, interactive website for one specific person (“gf”). It reveals memories, letters, surprises, mini‑games, and a final confession inside a themed universe.
- **Core ideas**:
  - Secret access via a **code gate**.
  - Different “phases” of the journey: entry → welcome → space travel → planet → inner world.
  - Everything is configurable from Supabase (texts, messages, codes, timing, music).

### 2. Tech Stack & Global Structure

- **Framework**: Next.js App Router (`app/` directory), TypeScript.
- **UI**: Tailwind CSS (see `tailwind.config.ts`) with custom classes like `cosmic-gradient`, `glow`, animation utilities, etc.
- **3D / Visuals**:
  - `@react-three/fiber` + `@react-three/drei` (for the planet scene in `/planet`).
  - Custom GSAP animations (page entrances, modals, warp‑speed transition, game win animations).
  - Canvas‑based particle background (`ParticleField`).
- **Data / Backend**: Supabase (`lib/supabase.ts`) with typed interfaces for:
  - `SiteSettings`, `Memory`, `Letter`, `Surprise`, `Game`, `Wish`, `DailyMessage`, `VisitStats`.
- **Audio**:
  - Ambient music controlled globally by `AmbientSound`, driven by `site_settings.music_url` (supports direct audio files and YouTube links).

### 3. Data Model (Supabase)

Defined in `lib/supabase.ts`:

- **`SiteSettings`**
  - `site_name`: Title shown on entry page.
  - `gf_name`: Name used in welcome text.
  - `gf_code`: Secret code for girlfriend access.
  - `bf_code`: Optional secret code for boyfriend access (hidden “bf” role, same world but does not advance GF visit stats).
  - `admin_code`: Secret code for admin interface.
  - `time_lock_enabled`: Boolean to delay access until a date.
  - `unlock_date`: When the site unlocks (used for countdown).
  - `music_url`: Ambient music URL (audio or YouTube).
  - `rocket_delay`, `planet_rotation_speed`: Visual tuning for 3D planet / animations.
  - `final_message`: Final confession shown at the “Final Cliff”.

- **`Memory`**
  - Photo memories: title, description, `image_url`, date, location, `visible`.
  - Used in: `MemoryGarden`, `/world` “Memory Garden” modal, `PlanetScene` ring of photos.

- **`Letter`**
  - Love letters: title, content, `order_index`, `visible`.
  - Used in: `/world` “Love Letter House”.

- **`Surprise`**
  - Hidden surprises: `type` (`message` | `audio` | `image`), title, content, position, `visible`.
  - Used in: `/world` “Star Hill”.

- **`Game`**
  - Per‑game config: `game_name`, `success_message`, `enabled`.
  - Used in: `MemoryPuzzle`, `HeartCatcher`, `TimelineRunner` to show win messages.

- **`Wish`**
  - Table `wishes`: id, message, created_at, visible.
  - Represents wish stars created by her at Star Hill.
  - Used in: `/world` Star Hill modal (Wish star field), with admin management panel for visibility.

- **`DailyMessage`**
  - Table `daily_messages`: id, message, order_index, visible.
  - Rotating pool of “Today’s message from me” texts shown at the top of `/world`.
  - Managed via admin “Daily Messages” panel.

- **`VisitStats`**
  - Table `visit_stats`: id (e.g. `'gf_world'`), visit_count, last_visit.
  - Tracks global GF visit count to `/world`, used to unlock the Moon location and show visit‑based copy.

### 4. Global Layout & Ambient Sound

- **`app/layout.tsx`**
  - Sets up fonts (`Poppins` as main, `Dancing_Script` as handwritten via CSS vars).
  - Wraps everything in `dark` HTML and uses global Tailwind typography.
  - Injects `<AmbientSound />` at the root so music control is always available.

- **`AmbientSound`**
  - Loads `music_url` from `site_settings`.
  - Detects YouTube vs normal audio:
    - If YouTube: initializes hidden YouTube IFrame player.
    - If audio: uses `<audio>` element.
  - Reacts to:
    - A custom `speedOfLightComplete` event (so music starts only after the initial animation).
    - First user interaction (click/touch/keydown) to comply with autoplay rules.
    - Local preference `ambientSoundEnabled` in `localStorage`.
  - Exposes a floating button bottom‑right to toggle sound (🔊 / 🔇).

### 5. Entry Flow (Codes, Time Lock, Roles)

#### 5.1 Home Page – `app/page.tsx` + `CodeEntry`

- **Home route `/`**:
  - Shows a loading spinner while mounting.
  - Then renders `CodeEntry`.

- **`CodeEntry`**
  - Full‑screen `cosmic-gradient` background with `ParticleField`.
  - Loads `site_settings` to show:
    - `site_name` as the title (e.g. “SoLuna”).
    - Time lock state (`time_lock_enabled`, `unlock_date`).
  - If time‑locked:
    - Displays a live countdown until unlock.
    - Disables code submission until the unlock time.
  - When user submits a code:
    - If matches `gf_code`:
      - Sets `localStorage.userRole = 'gf'`.
      - Navigates to `/welcome`.
    - If matches `bf_code` (when configured):
      - Sets `localStorage.userRole = 'bf'`.
      - Navigates to `/welcome` (same journey, but GF visit stats are not incremented).
    - If matches `admin_code`:
      - Sets `localStorage.userRole = 'admin'`.
      - Navigates to `/admin`.
    - Else:
      - Shows a soft error: “Hmm… that's not the key. Try again ❤️”.

#### 5.2 Role Guard Pattern

- Many pages (`/welcome`, `/planet`, `/world`, `/admin`) use the same pattern:
  - On mount, read `localStorage.userRole`.
  - `/welcome`, `/planet`, `/world` allow both `'gf'` and `'bf'` roles.
  - `/admin` requires `'admin'`.

### 6. GF Journey Flow (User Experience)

End‑to‑end path for the girlfriend:

1. **Entry (`/`)**
   - Sees the title + code input (and maybe a countdown).
   - Enters the secret **GF code**.
2. **Welcome (`/welcome`)**
   - Guarded by `userRole === 'gf'`.
   - Background: `cosmic-gradient` with `ParticleField`.
   - Text: “Welcome to our world, {gf_name}” from `SiteSettings`.
   - Two big buttons: `YES` and `NO`.
     - Clicking **YES**:
       - Runs `createSpeedOfLightAnimation`.
       - On completion, navigates to `/planet`.
     - Clicking **NO**:
       - Shrinks the NO button and “pumps” the YES button with GSAP, teasing her toward YES.
3. **Planet (`/planet`)**
   - Guarded by `userRole === 'gf'`.
   - Background: full‑screen space scene.
   - Uses `@react-three/fiber` `Canvas` to render:
     - A glowing pink **Planet** (`PlanetScene`).
     - Stars (`<Stars>` from `drei`).
     - Rich lighting setup.
   - On initial load:
     - Triggers a **speed‑of‑light warp animation** via `createSpeedOfLightAnimation`.
     - Once complete:
       - Marks an internal state as `animationComplete`.
       - Dispatches `speedOfLightComplete` (to allow ambient music to start).
   - CTA: floating text “Click the world to enter ✨”.
     - Clicking the planet:
       - Runs another `createSpeedOfLightAnimation`.
       - On completion, navigates to `/world`.
4. **World (`/world`)**
   - Guarded by `userRole === 'gf'` or `'bf'`.
   - Background: cosmic gradient, particle background (desktop only), romantic map.
   - Contains `WorldMap`, which is the inner “map of our relationship”.
   - She can:
     - Explore **Memory Garden** (photos).
     - Read **Love Letter House** (letters).
     - Play **Game Arcade** (3 love‑themed mini‑games).
     - Discover **Star Hill** (hidden surprises).
     - Reach the **Final Cliff** (final confession).

### 7. Core Visual Components

#### 7.1 `ParticleField`

- Canvas‑based background of twinkling particles:
  - Resizes to the viewport.
  - Particles randomly drift and twinkle with glow.
  - Used on entry, welcome, planet, world for a starry ambience.

#### 7.2 `PlanetScene`

- 3D scene rendered inside `/planet`:
  - A glowing pink planet with:
    - Custom GLSL shader for surface details and glow.
    - Atmosphere layers and outline ring.
  - A **ring of memories**:
    - Loads visible memories from Supabase.
    - Places photos around the planet in a belt (Billboards that always face camera).
  - A small decorative rocket bobbing above the planet.
  - Planet rotation and ring rotation speed controlled via `SiteSettings.planet_rotation_speed`.
  - Clicking the planet triggers `onEnterWorld`, which starts the warp animation + navigation to `/world`.

#### 7.3 `WorldMap` and Locations

- `WorldMap` layout:
  - Center card with animated background patterns (starfield + grid) and floating emojis.
  - A **floating island map** (desktop) where each location is a glowing “spot” on the island:
    - `MemoryGarden` spot (🌺) – top‑left area of island.
    - `LoveLetterHouse` spot (💌) – top‑right.
    - `GameArcade` spot (🎮) – near the top center.
    - `StarHill` spot (⭐) – lower left.
    - `FinalCliff` spot (🌅) – lower right.
    - `MoonLocation` spot (🌙) – appears near the bottom center when the Moon is unlocked.
  - On mobile, locations are rendered as a vertical list of “island spots” (icon + label), preserving the island feeling but optimized for small screens.
  - Mobile intro line: “You're in our secret world, my love.”
- Semantic sky:
  - `WorldStarSky` renders a subtle star layer whose stars are derived from existing memories (`MemoryStarData`) so the sky feels filled with their stories.
  - Additional star types (wishes, secrets, anniversaries) can hook into the same system later.
- Clicking a spot:
  - Opens appropriate modal (`LocationModal` or `FinalCliffModal`) with its content.

#### 7.4 `LocationModal` & `FinalCliffModal`

- `LocationModal`:
  - Generic animated modal (GSAP) used for:
    - Memory Garden, Love Letter House, Game Arcade, Star Hill.
  - Structure:
    - Dimmed overlay with blur.
    - Centered card with title, close button, and scrollable content.

- `FinalCliffModal`:
  - Custom two‑step modal for the final confession:
    1. Build‑up step:
       - Explains she has seen memories, letters, games, surprises.
       - Asks “Are you ready for what's next?” with a “Reveal” button.
    2. Confession step:
       - Shows `SiteSettings.final_message` or a default “Will you be mine forever?”.
       - Two buttons: “YES OF COURSE” and “YES” (both positive).

### 8. `/world` Content Details

- **Memory Garden modal**:
  - Thumbnail grid of `MemoryCard`s (image, title, short description, date, optional location).
  - Selecting a memory shows an **expanded detail view** at the top:
    - Large image.
    - Title, date, location.
    - Full description text.
    - Soft floating‑petal overlay for a dreamy effect.
- **Love Letter House modal**:
  - Each `LetterCard` is now a **sealed envelope**:
    - Envelope header with 💌 icon, title, and “Sealed/Open” indicator.
    - Tapping toggles between sealed and open.
    - When open, letter content slides/fades into view inside a parchment‑style panel with extra padding for readability.
- **Star Hill modal**:
  - Upper section: **Wish Star field**:
    - Each wish from `wishes` table is a tappable star in a small sky area.
    - Tapping a star shows that wish’s message in a panel below.
  - Middle section: **Wish form**:
    - Textarea + button “Send wish to the stars” that inserts into `wishes`.
  - Lower section: existing list of `SurpriseCard`s:
    - Icon by type (🎵 for audio, 🖼️ for image, ⭐ for message).
    - Title + text content.
    - Audio player or image preview when needed.
- **Game Arcade modal**:
  - Game selector grid:
    - `MemoryPuzzle`, `HeartCatcher`, `TimelineRunner`.
  - Clicking a game shows the actual minigame and back button.
- **Final Cliff modal + cinematic**:
  - Two‑step modal (build‑up + confession) followed by a **cinematic overlay**:
    - Uses memory photos as glowing “memory stars”.
    - Shows narration about their story turning into stars.
    - Draws a simple constellation and future‑oriented text.
    - Ends with final message from `SiteSettings.final_message` in a bright central star, then fades back to the world map.
- **Secret Moon location**:
  - Unlocked when GF `visit_count` (from `visit_stats`) reaches 10.
  - Appears as a Moon spot on the island.
  - Modal content:
    - 🌙 icon, title “Our quiet place above everything”.
    - Short romantic text about always finding her across universes.
    - Explains that she unlocked this place just by returning many times.

### 9. Games

#### 9.1 `MemoryPuzzle`

- Classic memory matching game with emoji pairs.
- Tracks flips, matched cards, and number of moves.
- Uses `games` table (`game_name = 'memory-puzzle'`) to load a romantic `success_message`.
- When all pairs are matched:
  - Shows success modal with:
    - 🎉 emoji.
    - Custom success message.
    - “Play Again” button.

#### 9.2 `HeartCatcher`

- Click‑to‑catch hearts within a time limit.
- Mechanics:
  - 30 seconds timer.
  - Hearts spawn at random positions and disappear after short time.
  - Clicking a heart increments score.
  - Goal: score ≥ 20 before time ends.
- On win:
  - Loads success message from `games` (`heart-catcher`).
  - Shows success modal with “Play Again” button.

#### 9.3 `TimelineRunner`

- Simple 3‑lane runner controlled by arrow keys.
- Mechanics:
  - Player runs automatically; distance increments until 100.
  - Obstacles spawn in lanes.
  - Player moves lanes with left/right keys to avoid.
  - When distance reaches 100:
    - Game is won; success modal appears.
  - Success message from `games` (`timeline-runner`).

### 10. Admin Side (High‑Level)

> Note: Code is in `app/admin` + `components/admin/**`. The pattern mirrors the GF experience but for content management.

- **Access**:
  - Entering the **admin code** on the entry screen sets `userRole = 'admin'` and navigates to `/admin`.
- **Features**:
  - Admin dashboard with navigation (`AdminDashboard`, `AdminNav`).
  - Panels:
    - `MemoriesPanel` / `LettersPanel` / `SurprisesPanel` / `GamesPanel` / `SettingsPanel` / `DailyMessagesPanel`.
  - Forms for managing:
    - Memories, letters, surprises (with `*Form.tsx` components).
    - Games (enable/disable, per‑game success messages).
    - Site settings (`SiteSettingsPanel`), including:
      - Codes (GF, BF, Admin).
      - Time lock.
      - Music URL.
      - Final message.
      - Global GF visit counter (reset or set to unlock Moon).
    - Daily messages:
      - Add, edit, toggle visibility of `daily_messages` rows.
  - All changes are dynamic (no redeploy needed); the frontend reads directly from Supabase.

### 11. Animation & Transitions

- **GSAP** is used to:
  - Fade/slide‑in location cards.
  - Animate modals opening/closing.
  - Animate buttons (e.g. NO/YES interplay).
  - Show success modals elegantly.
- **`createSpeedOfLightAnimation`**:
  - Overlays the screen with a warp effect (radial gradient).
  - Spawns “stars” that stretch outward, simulating warp speed.
  - After ~1.5s, fades out and runs the provided `onComplete` callback.
  - Used when:
    - Leaving welcome → planet.
    - Initial planet arrival.
    - Clicking planet → world.

### 12. Thematic Summary (For Future Improvements)

- The system is built around a clear emotional arc:
  1. **Mystery & anticipation** (locked gate, countdown, secret code).
  2. **Warm welcome** (personalized text and YES/NO tease).
  3. **Adventure & awe** (space travel and 3D planet).
  4. **Exploration** of shared history (memories, letters, games, surprises).
  5. **Climactic confession** (Final Cliff with only‑yes options).
- All content is data‑driven via Supabase, which makes it easy to:
  - Change texts for her.
  - Add more memories/letters/surprises over time.
  - Adjust timings, music, and the final message.

This document is your **blueprint** of how the system works today. We can now safely evolve the experience (new locations, deeper story beats, special sequences just for her) while keeping this structure in mind.

### 13. Pending / Future Priorities

- **Star sky evolution**
  - Implement **Secret Stars** and **Anniversary Stars**:
    - New tables for `secret_messages` and `special_events`.
    - Integrate them into the star‑sky system (both `/planet` and `/world`).
  - Make some stars directly tappable from the background sky (not only inside modals).
- **Occasion modes**
  - Special themes and copy for anniversaries, birthdays, Valentine’s Day, etc.
  - Triggered via `special_events` or additional fields in `SiteSettings`.
- **Future‑facing space**
  - Additional “future” location(s) beyond the Moon (e.g. “Our Home”, “Next Chapter”).
  - Could unlock after specific combinations of visits, game completions, or surprise discoveries.
- **Deeper game integration**
  - Use relationship photos in `MemoryPuzzle`.
  - Use actual timeline milestones in `TimelineRunner`.
  - Small unlockables (letters or wishes) tied to game achievements.


