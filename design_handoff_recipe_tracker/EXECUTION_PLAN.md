# Execution plan — Kitchen Log

Read `README.md` first; it is the source of truth for layout, copy, and tokens. This file is the build order. Adapt naming and structure to the target codebase's conventions.

Assumed shape if starting fresh: React + TypeScript, client-only, local-first persistence (IndexedDB via a thin wrapper), CSS modules or the codebase's styling system. No backend required for v1.

---

## Phase 0 — Foundations (half a day)

1. Scaffold the app shell and routing for `/`, `/recipes`, `/recipes/:id`, `/rotation`.
2. Load Newsreader (400, 500) and Karla (400, 500, 600, 700).
3. Encode the **Design tokens** table from the README as the codebase's token layer — colors, radii, spacing steps, type scale, motion durations. Everything after this references tokens, never literals.
4. Build the responsive primitive: a single `useIsDesktop()` (or equivalent media query) at 880px. Both layouts render from the same data; only chrome and grid geometry differ.

**Done when:** three empty routes render with correct background, fonts, and the mobile/desktop shell switch.

## Phase 1 — Data model & store (half a day)

1. Types: `Recipe { id, name, cuisine, minutes, rating, ingredients[], notes }`, `LogEntry { id, date, slot, recipeId | null, freeName | null, photoId | null }`, `Settings { staleAfterDays, showMealSlots, defaultSort }`.
2. Store with actions: `addLog`, `deleteLog`, `addRecipe`, `updateRecipe`, `setSort`, `setQuery`, `openSheet(day?)`, `closeSheet`, `toast(msg)`.
3. **Derived selectors** — build these as pure functions and unit-test them; they carry all the product logic:
   - `timesCooked(recipeId)` — count of log entries.
   - `lastCookedAt(recipeId)` → `relativeAgo()` (`today` / `yesterday` / `{n} days ago` < 14 / `{n} weeks ago` < 60 / `{n} months ago`) and `compactAgo()` (`today` / `1d` / `{n}d`).
   - `weekRows(anchorDate)` — Monday-start, 7 days, each with its entries; flags today.
   - `ranked()` — recipes by lifetime count desc, with `pct = times / max`.
   - `stale()` — `daysSinceLastCooked >= settings.staleAfterDays`, oldest first.
   - `suggestion()` — stalest stale recipe, else least-cooked.
   - `librarySorted(query, sort)` — substring match on name + cuisine, then sort by cooked / recent / A–Z.
4. Seed with the eight sample recipes and the sample week from the prototype so every screen has content while you build.
5. Persistence: hydrate on boot, write on mutation.

**Done when:** selectors are tested and the store survives a reload.

## Phase 2 — Log a meal (the core flow — do it early)

This is the app's reason to exist; everything else is reading. Build it before the browse screens so there is real data to read.

1. Sheet/modal container: bottom sheet on mobile (240ms slide, scrim tap-to-dismiss, grab handle), centered modal on desktop (620px, 200ms fade, two-column body). Trap focus, close on Escape, restore focus on close.
2. Day chips (two-letter labels), meal-slot pills, free-text name field, recipe list with tap-to-select / tap-again-to-deselect.
3. Save-button state machine: enabled when `recipeId || freeName.trim()`; label `Save to {Day}` vs `Name it or pick a recipe`; pressing while disabled fires the toast rather than doing nothing.
4. `addLog` + toast + close + clear the name field. Verify the Week screen picks it up.
5. Entry points: FAB (mobile), sidebar button (desktop), library button (mobile), empty-day tap (pre-selects that day).

**Done when:** you can log both a recipe-backed meal and a free-text meal into any day, and the counts move.

## Phase 3 — Week screen

1. Mobile day rows: left date rail, entry cards, dashed empty state with the correct copy for today vs other days.
2. Initial tile component (first letter, Newsreader, tile colors) — used in five places; build once.
3. Desktop board: `repeat(auto-fill,minmax(148px,1fr))`, vertical entry cards, `overflow-wrap:anywhere` on names. **Do not hard-code 7 columns.**
4. Header counts and the rotation summary sentence.
5. Tapping a recipe-backed entry → recipe detail; free-text entries are inert.

**Done when:** the week reflects the log on both layouts and nothing overflows between 320px and 1600px.

## Phase 4 — Recipes library

1. Search input + three sort pills (`white-space:nowrap`, `flex:none`).
2. Card grid: 2-up mobile, `auto-fill minmax(196px,1fr)` desktop; photo aspect 1:1 mobile / 4:3 desktop; meta line `{times}× · {ago}`.
3. Wire search and sort to `librarySorted`.

## Phase 5 — Recipe detail

1. Mobile: full-bleed hero + floating back button. Desktop: two-column grid with hero and gallery left, content right.
2. Stat trio (hairline-grid card), star rating, ingredients rows, notes.
3. Past-cooks gallery from the recipe's log photos, newest first, with relative-time captions.
4. "Log that we made this" → `addLog` for today / Dinner + toast.

## Phase 6 — Rotation

1. Frequency bar list (name, `{times}×`, track + accent fill at `pct`), rows navigate to detail.
2. "Gathering dust" list from `stale()`.
3. "Cook this next" card from `suggestion()` with the dark CTA.
4. Desktop two-column split.

## Phase 7 — Photos

1. Capture/upload component: camera or library on mobile, drag-and-drop + picker on desktop.
2. Client-side downscale (long edge ~1600px, JPEG ~0.8) before storing; store blobs, keep ids on entries.
3. Render paths: 56/48/44px thumbs, 1:1 card and gallery crops (`object-fit:cover`), the detail hero. Fall back to the initial tile when there is no photo.
4. Revoke object URLs on unmount; lazy-load off-screen images.

**Done when:** a photo taken in the log sheet appears in the week row, the recipe card, and the recipe's gallery.

## Phase 8 — Settings, polish, QA

1. Settings surface for `staleAfterDays` (3–60), `showMealSlots`, `defaultSort` — and the layout override if the codebase wants a debug toggle.
2. Real dates: current week, Monday start, today highlighted; verify week rollover and month boundaries.
3. Accessibility: 4.5:1 text contrast (the token pairs in the README already meet it), ≥44px mobile targets, visible focus rings, labelled inputs, `aria-current` on the active nav item, toast announced politely, modal focus trap.
4. Motion: honor `prefers-reduced-motion` — skip the slide/fade, keep the toast.
5. Empty states: no recipes yet, no meals logged this week, nothing stale (hide "Gathering dust" and fall back to the least-cooked suggestion). Reuse the dashed-placeholder treatment.
6. Responsive sweep at 320 / 390 / 430 / 768 / 880 / 924 / 1100 / 1440px. 880 and 924 are the risky ones.

---

## Sequencing notes

- Phases 0–2 are the critical path; 3–6 are parallelizable across contributors once selectors exist.
- Photos (7) can lag: every photo surface has a designed fallback, so shipping without uploads is a coherent milestone.
- Prefer deriving `timesCooked` / `lastCookedAt` from the log over storing them on the recipe (the prototype stores them for convenience) — otherwise editing or deleting a log entry silently desynchronizes the stats.

## Out of scope for v1 (confirm with the owner before adding)
Multi-user or shared households, editable ratings, recipe creation/editing UI (the bank is seeded), grocery lists, servings or scaling, recipe import from URL, meal planning ahead of today, and search across ingredients or notes.
