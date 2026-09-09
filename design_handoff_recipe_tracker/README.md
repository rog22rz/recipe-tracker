# Handoff: Kitchen Log — personal recipe & meal-frequency tracker

## Overview
A private (single household) app for logging what you actually cook. Three jobs:

1. **Log a meal** — for any day of the week, with a meal slot and an optional photo. Attaching a recipe is *optional*: you can log a free-text meal name ("chicken thing again") without creating a recipe.
2. **Keep a recipe bank** — a library of recipes with ingredients, notes, rating, prep time, and a running count of how many times you've made each.
3. **See frequency** — which recipes dominate the rotation, and which ones have gathered dust, plus a "cook this next" suggestion.

Primary target is **mobile web**; a **desktop web** layout is also specified. Both are in one design file that switches at 880px.

## About the design files
The files in this bundle are **design references authored in HTML** — prototypes showing intended look and behavior. They are **not production code to copy**. The task is to **recreate these designs in the target codebase's existing environment** (React/Next, Vue, SwiftUI, native, etc.) using its established patterns, component library, and routing. If no codebase exists yet, choose an appropriate stack (a React + TypeScript SPA with local persistence is a good fit for this scope) and implement the designs there.

Two conventions in the prototype that should **not** be carried over literally:
- All styling is inline (a constraint of the prototyping environment). Use the target codebase's styling system; the exact values are tabulated under **Design tokens**.
- `<image-slot>` is a prototype-only drag-and-drop image placeholder. In production these are real image uploads (see **Photos**).

## Fidelity
**High fidelity.** Colors, typography, spacing, radii, copy, and interaction behavior are final and should be matched closely. Sample data is illustrative, not real.

---

## Information architecture

Three top-level destinations plus one detail view and one modal:

| Route | Name | Mobile chrome | Desktop chrome |
|---|---|---|---|
| `/` | Week | bottom tab 1 | sidebar item 1 |
| `/recipes` | Recipes (library) | bottom tab 2 | sidebar item 2 |
| `/recipes/:id` | Recipe detail | pushed screen, back chevron | in-place, "‹ All recipes" link |
| `/rotation` | Rotation (stats) | bottom tab 3 | sidebar item 3 |
| — | Log a meal | bottom sheet | centered modal |

Recipe detail is a child of Recipes: while on it, the Recipes tab stays active.

---

## Screens

### 1. Week (home)

**Purpose:** see what was cooked this week, day by day; log into any day.

**Mobile layout** — single column, 430px max width, page padding 20px.
- Header block, padding `26px 20px 8px`: eyebrow "Sep 7 — 13, 2026" (12px, 700, uppercase, `letter-spacing:.14em`, `#a9808f`); title "This week" (Newsreader 40px/1, weight 500, `#3b1f2b`); right-aligned "{n} meals / cooked" (13px, `#9a7688`, two lines, baseline-aligned to the title).
- Then one **day row** per day, each `padding:14px 20px` with `border-top:1px solid #f3dde4`, laid out as a 14px-gap flex row:
  - Left rail, fixed 42px: day-of-week (11px/700 uppercase `.1em`, `#b58c9b`) over date number (Newsreader 22px, `#3b1f2b`).
  - Right column: one **entry card** per logged meal, 10px gap.
- **Entry card:** `background:#fffafb`, `border:1px solid #f3dde4`, `radius:14px`, `padding:8px`, flex row, 12px gap, whole card tappable → recipe detail (no-op for free-text meals). Hover: `border-color:#c2436f`.
  - 56×56 initial tile: `background:#fae4ec`, `border:1px solid #f4d3de`, `radius:10px`, centered first letter of the meal name in Newsreader 22px `#d19cb0`. *(A real photo thumbnail replaces this when the meal has a photo — see Photos.)*
  - Name in Newsreader 19px/1.15 `#3b1f2b`; below it the meal slot in 12px/600 uppercase `.06em` `#a9808f` (hidden when the "meal slot labels" setting is off).
  - Trailing chevron `›`, 20px, `#dfb9c8`.
- **Empty day:** dashed placeholder, `border:1px dashed #edcedb`, `radius:14px`, `padding:14px 12px`, min-height 48px, 14px `#b58c9b`, `+` glyph then label. Label copy: "Nothing logged today" for today, "Leftovers / out" for other days. Tap → open Log sheet pre-set to that day. Hover: border and text → `#c2436f`.

**Desktop layout** — week board.
- Header row: eyebrow + "This week" (Newsreader 46px) on the left; the rotation summary sentence (14px `#9a7688`, max-width 340px) right-aligned.
- Day board: `display:grid; grid-template-columns:repeat(auto-fill,minmax(148px,1fr)); gap:14px; align-items:start` — 7 across on wide screens, wrapping to 3–4 columns between 880–1100px. **Do not use a fixed 7-track grid**; it collapses at narrow desktop widths.
- Each column: day header (dow + date, baseline row, `border-bottom:1px solid #f0d6df`, `padding-bottom:8px`), then entry cards stacked with 10px gap.
- **Desktop entry card:** same colors as mobile but vertical — full-width 1:1 initial tile (or photo) at the top, radius 10px, then name (Newsreader 16px/1.2, `overflow-wrap:anywhere`, `text-wrap:pretty`) and slot label.
- Empty day: dashed box, min-height 86px, centered 12.5px label.

### 2. Recipes (library)

**Purpose:** browse the bank; find a recipe; see counts at a glance.

- **Mobile:** title "Recipes" (Newsreader 40px); search input full width, height 46px, `radius:12px`, `border:1px solid #f0d6df`, `background:#fffafb`, 15px text, placeholder "Search recipes"; then sort pills.
- **Sort pills:** three, in a wrapping 8px-gap row. `padding:9px 15px`, `radius:999px`, 13px/600, `border:1px solid #f0d6df`, `flex:none`, `white-space:nowrap` (**required** — they wrap and clip otherwise). Inactive `background:#fffafb`, `color:#7d5b69`; active `background:#3b1f2b`, `color:#fdf1f4`. Labels: "Most cooked" (default), "Recently made", "A–Z".
- **Card grid:** mobile `repeat(2,minmax(0,1fr))`, gap 14px; desktop `repeat(auto-fill,minmax(196px,1fr))`, gap 22px.
- **Recipe card:** photo on top — mobile 1:1 radius 14px, desktop 4:3 radius 16px, `background:#fae4ec`, `border:1px solid #f3dde4`; name Newsreader 19px (desktop 21px) `#3b1f2b`, 9–10px above it; meta line 12.5–13px `#9a7688` reading `"{times}× · {ago}"`. Whole card → detail.
- Mobile only, below the grid: a dashed "+ Log a meal" button (height 50px, `radius:14px`, same dashed treatment as the empty day).
- **Search** filters on recipe name and cuisine, case-insensitive, substring.

### 3. Recipe detail

**Purpose:** read the recipe; see how often it's cooked; log another instance; see past photos.

- **Mobile:** full-bleed 280px photo at the top with a floating 44×44 circular back button (`top:16px; left:16px`, `background:#fffafb`, `border:1px solid #f0d6df`, `‹` 20px). Body padding 20px.
- **Desktop:** "‹ All recipes" text link (13.5px/700 `#c2436f`), then a two-column grid `minmax(0,1.05fr) minmax(0,1fr)`, gap 44px, `align-items:start`. Left: 400px-tall hero photo (radius 20px) and the past-cooks gallery. Right: all text content.
- Content order (right column on desktop, straight down on mobile):
  1. Eyebrow `"{cuisine} · {minutes} min"` (11.5–12px/700 uppercase `.14em` `#a9808f`).
  2. Title, Newsreader 34px mobile / 42px desktop, weight 500, line-height ~1.05.
  3. Star rating as filled/empty stars, 17–18px, `#c2436f`, `letter-spacing:.1em`. Display-only in this design.
  4. **Stat trio** — 3-up grid with 1px gaps over a `#f3dde4` background, outer `border:1px solid #f3dde4`, `radius:14–16px`, cells `background:#fffafb`, `padding:14–16px 10px`, centered. Big number Newsreader 28–30px; caption 11px/700 uppercase `.08em` `#a9808f`. The three: **times** (lifetime count), **last cooked** (compact — `today`, `1d`, `19d`), **per month** (lifetime count ÷ 12, one decimal — replace with a real windowed average when you have real dates).
  5. **Ingredients** — section label, then rows `padding:9–10px 0` with `border-bottom:1px solid #f3dde4`, 15px `#55323f`.
  6. **Notes** — section label, then Newsreader 18–19px/1.5 `#55323f`, `text-wrap:pretty`.
  7. **Every time we made it** — 3-column photo grid, 1:1, radius 10–12px, gap 8–12px, each with a caption underneath (11–11.5px `#a9808f`, centered) reading when that photo was taken.
  8. **Primary button** "Log that we made this" — height 52–54px, `radius:14px`, `background:#c2436f`, `color:#fffafb`, 16px/700. Hover `#a02b56`. Logs the recipe to today with slot "Dinner" and fires the toast.

Section labels throughout: 11.5–12px, weight 700, uppercase, `letter-spacing:.14em`, `#a9808f`, ~28px top margin.

### 4. Rotation (stats)

**Purpose:** answer "what do we make too much of, and what have we forgotten?"

- Title "Rotation" (Newsreader 40/46px) + summary sentence (14–15px `#9a7688`): `"{n} meals logged this week across {m} recipes. {k} haven't come round in a while."`
- **Most cooked, all time** — every recipe sorted by lifetime count descending. Each: name (Newsreader 17–19px) on the left, `"{times}×"` (13–13.5px/700 `#9a7688`) right-aligned on the same baseline; below, a bar track height 7–8px, `radius:999px`, `background:#f3dde4`, with a fill `background:#c2436f` whose width is `times / max(times) × 100%`. Row → recipe detail.
- **Gathering dust** — recipes not cooked within the stale threshold (default 14 days), sorted oldest first. Row: `background:#fffafb`, `border:1px solid #f3dde4`, `radius:14px`, `padding:10–12px`, 48–52px initial tile, name (Newsreader 18–19px), and `"Last made {ago}"` in 12.5–13px/600 `#c2436f`. Hover border `#c2436f`.
- **Cook this next** card — `background:#fffafb`, `border:1px solid #f3dde4`, `radius:16–18px`, `padding:18–22px`. Suggested recipe name (Newsreader 22–26px), reason line `"You've made it {times} times but not since {ago}."` (13.5–14px `#9a7688`), then a dark button "Cook it tonight" — height 46–48px, `radius:12px`, `background:#3b1f2b`, `color:#fdf1f4`, hover `#55323f`. Logs the suggestion to today / Dinner.
- Suggestion rule: the stalest stale recipe; if nothing is stale, the least-cooked recipe.
- **Desktop:** two columns `minmax(0,1.25fr) minmax(0,1fr)`, gap 44px — bars on the left; "Cook this next" then "Gathering dust" on the right.

### 5. Log a meal (the core flow)

Reachable from: the FAB (mobile), the sidebar button (desktop), the "+ Log a meal" button (mobile library), and any empty day (pre-selects that day).

**Mobile — bottom sheet.** Scrim `rgba(60,25,40,.45)` (tap to dismiss), sheet `background:#fdf1f4`, `radius:20px 20px 0 0`, `max-height:92%`, scrollable, `padding:16px 20px 20px`, 40×4 grab handle (`#efd3dd`) centered. Header "Log a meal" (Newsreader 28px) with a "Cancel" text button. Animation: `translateY(100%) → 0`, 240ms `cubic-bezier(.2,.8,.2,1)`; scrim fades in 180ms.

**Desktop — centered modal.** Same scrim; panel max-width 620px, `max-height:88vh`, `radius:20px`, `border:1px solid #f0d6df`, `box-shadow:0 30px 70px rgba(140,50,85,.25)`, `padding:26px 28px 28px`, 200ms fade. Its body is a two-column grid (`1fr 1fr`, gap 24px): left = day / meal / photo, right = name field + recipe list (list capped at 260px, scrolls).

**Fields, in order (mobile):**
1. **Which day** — 7 chips in a single flex row, `flex:1`, min-height 52px, `radius:11–12px`, `border:1px solid #f0d6df`; two lines: two-letter day (10px/700 uppercase — "Mo, Tu, We, Th, Fr, Sa, Su"; **not** single letters) over the date (Newsreader 15–16px). Selected: `background:#3b1f2b`, `color:#fdf1f4`. Defaults to today, or to the day the sheet was opened from.
2. **Meal** — 3 pills (Breakfast / Lunch / Dinner), `flex:1`, min-height 44px, `radius:999px`, 13.5px/600, same selected treatment. Defaults to Dinner.
3. **Photo** — one image drop/upload area, height 150–170px, `radius:14px`, `background:#fae4ec`, `border:1px solid #f3dde4`. Optional.
4. **What was it** — free-text input, height 46–48px, `radius:12px`, placeholder "Just type it — no recipe needed". This is what makes the recipe optional.
5. Divider row: hairline, then "or pick from the bank" (11–11.5px/700 uppercase `.12em` `#b58c9b`), then hairline.
6. **Recipe list** — every recipe, sorted most-recently-cooked first. Row: `radius:12–14px`, `padding:9–10px`, 40–44px initial tile, name (Newsreader 16.5–18px), meta `"{times}× · {ago}"` (12px `#9a7688`), and a trailing `✓` slot (15px `#c2436f`) shown when selected. Unselected: `background:#fffafb`, `border-color:#f3dde4`. Selected: `background:#fbe4ee`, `border-color:#c2436f`. Tapping the selected row **deselects** it.
7. **Save button** — height 54px, `radius:14px`. Enabled when either a recipe is selected or the name field is non-empty: `background:#c2436f`, label `"Save to {Day}"`. Disabled-looking otherwise: `background:#e2bccc`, label "Name it or pick a recipe"; pressing it flashes the toast "Name it or pick a recipe" rather than doing nothing silently.

**On save:** append the entry to that day, increment the recipe's lifetime count and reset its "last cooked" to today (skipped for free-text meals), close the sheet, clear the name field, show the toast, and attach the photo to both the log entry and the recipe's gallery.

---

## Chrome

**Mobile bottom tab bar** — `position:sticky; bottom:0`, `background:#fffafb`, `border-top:1px solid #f0d6df`, `grid-template-columns:repeat(3,1fr)`, each tab min-height 60px, glyph 16px over label 11.5px/700 uppercase `.06em`. Active `#c2436f`, inactive `#b58c9b`. Content area reserves 96px bottom padding so the bar never covers content.

**Mobile FAB** — 56px circle, `right:18px`, 78px above the bottom (just over the tab bar), `background:#c2436f`, `color:#fffafb`, `+` at 28px, `box-shadow:0 8px 20px rgba(150,40,85,.3)`, hover `#a02b56`.

**Desktop sidebar** — fixed 252px, `background:#fffafb`, `border-right:1px solid #f0d6df`, `padding:30px 20px`, column with 26px gaps: wordmark "Kitchen Log" (Newsreader 27px) with the eyebrow "What we actually cook"; nav items (min-height 46px, `radius:12px`, `padding:0 14px`, 14.5px/700, glyph + label; active `background:#fbe4ee` `color:#c2436f`, inactive text `#b58c9b`); the primary "+ Log a meal" button (48px, `radius:12px`, `#c2436f`); and pinned to the bottom above a hairline, the week count (Newsreader 34px) over "meals this week".

**Toast** — pill, `background:#3b1f2b`, `color:#fdf1f4`, `padding:11–12px 18–20px`, `radius:999px`, 14–14.5px/600, `white-space:nowrap`, centered horizontally; 86px from the bottom on mobile (above the tab bar), 34px on desktop. Enters with `opacity 0→1` + 14px rise, 220ms ease-out. Auto-dismisses after 2200ms. Copy: `"{Meal name} logged · {Day}"`.

---

## Interactions & behavior

- Every card, row, chip, and tab is a full-size tap target; mobile targets are ≥44px.
- Hover states are desktop-only affordances: card borders → `#c2436f`; primary button `#c2436f → #a02b56`; dark button `#3b1f2b → #55323f`; dashed placeholders → `#c2436f` border and text.
- Navigation is instant, no page transitions. Recipe detail returns to the library.
- The layout switch is at **880px** viewport width, live on resize. Provide an override (auto / force mobile / force desktop) if the codebase has a debug or settings surface; otherwise pure media-query behavior is fine.
- Dates in the prototype are frozen to the week of Sep 7–13, 2026 with "today" = Sunday the 13th. In production, derive the week from the real current date, Monday-start, and highlight today.
- Relative-time strings: `today`, `yesterday`, `{n} days ago` under 14, `{n} weeks ago` under 60, `{n} months ago` beyond. Compact form for the stat cell: `today`, `1d`, `{n}d`.
- No empty state is designed for a brand-new user with zero recipes. If you need one, reuse the dashed-placeholder treatment and the "or pick from the bank" voice.

## Photos

Each **log entry** carries at most one photo; a recipe's gallery is the set of photos from its log entries, newest first (the detail screen shows three). Requirements:
- Capture from camera or library on mobile (`accept="image/*"`, `capture` where appropriate), drag-and-drop or file picker on desktop.
- Client-side downscale before upload/storage (long edge ~1600px, JPEG ~0.8) — these are phone photos and there will be a lot of them.
- Square crop for thumbnails and the gallery, `object-fit:cover`; the detail hero is 4:3 on desktop, 280px full-bleed on mobile.
- Where a meal has no photo, render the **initial tile** described above rather than an empty frame.

## State

Client state, in a single store:

| State | Notes |
|---|---|
| `screen` | `week` \| `library` \| `recipe` \| `stats` — replace with real routes |
| `currentRecipeId` | selected recipe for the detail view |
| `recipes[]` | `{ id, name, cuisine, minutes, rating, ingredients[], notes, timesCooked, lastCookedAt }` |
| `log[]` | `{ id, date, slot, recipeId \| null, freeName \| null, photoId \| null }` |
| `sort` | library sort key; default `cooked` |
| `query` | library search string |
| `sheet` | `{ open, day, slot, recipeId, freeName }` |
| `toast` | message string, cleared on a 2200ms timer |
| `settings` | `{ staleAfterDays: 14, showMealSlots: true, defaultSort: 'cooked' }` |

Derived, not stored: week rows, `timesCooked` (count the log), `lastCookedAt` (max log date), bar percentages, stale list, suggestion, and the rotation summary sentence. The prototype stores counts on the recipe for convenience — prefer deriving them from the log so edits and deletes stay consistent.

Persistence: single-user, offline-tolerant. Local-first (IndexedDB, photos as blobs) with optional sync is the right shape. Nothing here needs a server round-trip to feel instant.

## Design tokens

**Color**
| Token | Hex | Use |
|---|---|---|
| Page | `#fdf1f4` | app background, sheet background |
| Page outer | `#f6dde6` | body behind the mobile column |
| Surface | `#fffafb` | cards, inputs, tab bar, sidebar |
| Ink | `#3b1f2b` | headings, primary text, dark buttons/chips |
| Ink secondary | `#55323f` | body copy, ingredients, dark-button hover |
| Muted | `#9a7688` | meta text, secondary copy |
| Label | `#a9808f` | eyebrows, section labels, captions |
| Faint | `#b58c9b` | inactive nav, placeholder copy, day-of-week |
| Chip text | `#7d5b69` | unselected pill text |
| Line | `#f0d6df` | outer borders, inputs, sidebar/tab dividers |
| Line soft | `#f3dde4` | card borders, hairlines, bar track |
| Dashed | `#edcedb` | dashed placeholder borders |
| Tile | `#fae4ec` | photo/initial tile fill |
| Tile line | `#f4d3de` | initial tile border |
| Tile ink | `#d19cb0` | initial letter |
| Accent | `#c2436f` | primary buttons, active nav, bars, stars, hover borders |
| Accent hover | `#a02b56` | primary button hover |
| Accent soft | `#fbe4ee` | selected row, active sidebar item |
| Accent disabled | `#e2bccc` | disabled save button |
| Chevron | `#dfb9c8` | trailing chevrons |

**Shadows** — mobile column `0 0 0 1px #efd3dd, 0 24px 60px rgba(140,50,85,.16)`; FAB `0 8px 20px rgba(150,40,85,.3)`; desktop modal `0 30px 70px rgba(140,50,85,.25)`; scrim `rgba(60,25,40,.45)`.

**Type** — headings and numerals: **Newsreader** (Google), weight 400/500, used at 15–46px, line-height 1–1.25. UI text: **Karla** (Google), 400/500/600/700, used at 10–16px. Section labels/eyebrows: Karla 11–12px, weight 700, uppercase, `letter-spacing:.14em`. Chip and nav labels: `letter-spacing:.06–.12em`. Body prose gets `text-wrap:pretty`.

**Radii** — 999px pills; 20px sheets/modals/hero; 16–18px feature cards; 14px cards and buttons; 10–12px tiles, inputs, small rows.

**Spacing** — 20px mobile page gutter; 38px 44px desktop main padding; 14px day-row vertical padding; gaps 8 / 10 / 12 / 14 / 22 / 24 / 44px; 96px bottom reserve on mobile for the tab bar.

**Motion** — sheet 240ms `cubic-bezier(.2,.8,.2,1)`; scrim 180ms ease-out; modal 200ms ease-out; toast 220ms ease-out; toast lifetime 2200ms.

## Assets
No bitmap or vector assets. Nav glyphs are text characters (`▤ ◉ ▮`) and the back/forward chevrons are `‹ ›` — substitute the codebase's icon set (calendar, book/grid, chart, chevron). Stars are `★ ☆`. Both fonts are Google Fonts (Newsreader, Karla). All photos are user-supplied.

## Files in this bundle
- `Recipe Tracker.dc.html` — the design, both layouts, working sample data and interactions. Open it in a browser; resize past 880px to see the desktop layout.
- `image-slot.js` — prototype-only image-placeholder component the design references. Not for production.
- `EXECUTION_PLAN.md` — suggested build order.
