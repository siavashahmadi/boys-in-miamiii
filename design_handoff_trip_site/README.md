# Handoff: Miami & Fort Lauderdale Trip Dashboard

## Overview
A group-trip dashboard for a July 23–26, 2026 Miami / Fort Lauderdale trip. It shows the itinerary, lets any friend request/pitch activities and vote on them, lets everyone vote on which Airbnb to book, tracks shared expenses with a settle-up split, and gives one "admin" (Sia) a fun full-screen approve/deny flow for reviewing pitched activities. No real backend — all state currently lives in `localStorage` in the browser.

## About the Design Files
The bundled file (`Miami Trip.dc.html`) is a **design reference built as a self-contained HTML/JS prototype** (a "Design Component" — plain React-like class component + templated HTML, no build step). It is **not production code to copy directly**. The task is to **recreate this design and behavior in the target codebase's environment** (React, Vue, Swift, native, etc. — whatever the project already uses, or the most sensible choice if this is a fresh build), using that environment's own component patterns, routing, and state management, rather than embedding this HTML as-is.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interaction behavior are final/intentional. Recreate pixel-for-pixel where feasible; treat all copy (the jokey trip-specific text) as real content to preserve, not placeholder lorem ipsum.

## Global Structure
Single-page app with **hash-based client-side routing** between 6 views, all sharing one persistent top nav:
- `#home` (default) — dashboard
- `#stay` — Airbnb voting
- `#plan` — day-by-day itinerary
- `#map` — interactive map + activity board
- `#weather` — 4-day forecast
- `#budget` — expense tracker / settle-up
- `#admin` — full-screen overlay (not a nav tab; reached via a footer link or by manually typing `#admin`) for approving/denying pitched activities

Switching tabs scrolls to top and does **not** unmount the whole app — only the active view's section renders (others are simply not in the DOM), and shared logic (theme, countdown timer, localStorage state) persists across navigation.

## Design Tokens

### Typography
- Display/headings: **DM Serif Display** (italic used for accent words like "&")
- Body/UI: **Outfit** (weights 300–700)
- Google Fonts, loaded via `<link>`

### Color system (CSS custom properties, themed via `html[data-theme]`)
Light (default) / Dark values:
```
--bg:            #FBF6EF   / #1E1830
--bg2:           #F3EAE0   / #251E38
--surface:       #FFFFFF   / #2A2240
--surface2:      #FBF3EB   / #31294A
--border:        rgba(64,54,74,.12)   / rgba(255,255,255,.10)
--ink:           #3A3350   / #F1ECF8   (primary text)
--ink2:          #6E6784   / #BCB2D0   (secondary text)
--ink3:          #9C95AC   / #8A82A2   (tertiary/meta text)
--shadow:        0 12px 34px rgba(120,90,110,.12) / 0 14px 40px rgba(0,0,0,.4)
--shadowSm:      0 4px 14px rgba(120,90,110,.10)  / 0 6px 18px rgba(0,0,0,.32)
--navBg:         rgba(251,246,239,.82) / rgba(30,24,48,.82)  (nav, blurred)
--glass:         rgba(255,255,255,.55) / rgba(20,16,30,.42)
--glassBorder:   rgba(255,255,255,.75) / rgba(255,255,255,.14)
--heroGrad:      linear-gradient(135deg,#FADFCF 0%,#F5D8E3 32%,#DDECE5 66%,#D3E6F1 100%)
                 / linear-gradient(135deg,#3C2A3F 0%,#432F4A 32%,#2C3B45 66%,#293446 100%)
--mapOcean/Land/Island/Road/Label: see file (theme-aware map SVG fills)
```
Category / accent colors (constant across themes):
```
--c-coral: #E38C74   (eats)       --c-coral-s: rgba(227,140,116,.16)
--c-teal:  #3FA5B2   (water)      --c-teal-s:  rgba(63,165,178,.16)
--c-gold:  #D6A94E   (beach)      --c-gold-s:  rgba(214,169,78,.18)
--c-lav:   #987FCF   (nightlife)  --c-lav-s:   rgba(152,127,207,.16)
--c-mint:  #5AA57E   (culture)    --c-mint-s:  rgba(90,165,126,.16)
--c-pink:  #CE86A6   (chaos/misc) --c-pink-s:  rgba(206,134,166,.16)
```
Squad member colors reuse these: Sia = coral, Joseph = teal, Marcus = lavender, Devon = mint.

### Shape / spacing
- Card radius: 18–22px. Pills/chips: 999px (fully rounded).
- Page content max-width: 1120–1200px, centered, ~22px horizontal gutter.
- Card padding: ~18–24px. Grid gaps: 12–18px.
- Shadows: `--shadowSm` for resting cards, `--shadow` for elevated/modal surfaces.

### Theme switching
- A small `🌙`/`☀️` button in the nav toggles `light`/`dark` by setting `data-theme` on `<html>`.
- On first load (no stored preference), it respects `prefers-color-scheme`. Preference persists (localStorage key `miami_theme`).
- **Recreate this as a standard app-wide theme toggle** (e.g. CSS variables / a ThemeProvider), defaulting to system preference, persisted per-user.

## Views

### 1. Nav (persistent, all pages)
- Left: wordmark "Miami & Ftl." (serif, italic ampersand in coral) — acts as a home button.
- Center/right: tab group in a pill-shaped tray (Home 🏠 / Stay 🏝️ / Plan 🗓️ / Map 📍 / Weather 🌤️ / Budget 💸). Active tab has a white/surface pill background and coral text; inactive tabs are plain text.
- **Mobile**: the tab tray scrolls horizontally (`overflow-x:auto`, `white-space:nowrap`) instead of wrapping — it never breaks nav layout on narrow screens.
- Far right: theme toggle button.
- **Only one countdown is shown app-wide**, and it lives on the Home dashboard header — do not duplicate it in the nav.

### 2. Home — Trip Dashboard (`#home`)
- **Header**: small coral eyebrow "TRIP DASHBOARD", serif H1 "Miami & Fort Lauderdale", one-line meta ("Jul 23–26, 2026 · home base in Fort Lauderdale · N degenerates confirmed"), and a live countdown tile on the right ("WHEELS UP IN" + `Nd Nh Nm Ns`, ticking every second, target = 2026-07-23T18:40:00 -04:00).
- **Stat tiles row** (auto-fit grid, min 148px per tile): Trip length (static "4 days"), Total spent, Per person, Plans locked (approved count), Awaiting Sia (pending count), The squad (member count). Each tile: emoji+label header, big serif number, small caption.
- **"Getting there & staying" panel**: 4 info cards (Flights, Rental car, Home base, The kitty) with icon swatch + short copy. Home-base card links to Stay tab.
- **"Quick look" panel**: eyebrow-style section heading, then 4 snapshot cards (Stay leader / Budget so far / The plan / Weather), each with a "→" link to its full page.
- **No weather widget lives on Home beyond the compact snapshot card** — full forecast is its own tab.

### 3. Stay — Airbnb Showdown (`#stay`)
- Header: eyebrow "HOME BASE", H1 "Where should we stay?", subtitle.
- Grid of Airbnb option cards (auto-fit, min 250px): colored gradient photo-placeholder block with price badge, name, bed/bath/sleeps line, blurb, and a vote button showing a heart count. Voting is single-choice per browser (click toggles your one pick; button relabels "✓ This is my pick").

### 4. Plan — Itinerary (`#plan`)
- Header: eyebrow "DAY BY DAY", H1 "The game plan".
- 4 day-cards (Thu–Sun), auto-fit grid. Each card: colored header band (day label, title, date) + a list of time-stamped activity rows (time, title, note).

### 5. Map — interactive map + activity board (`#map`)
- Header + "＋ Pitch a place" button (opens an inline add-activity form).
- Category filter pill row: All / Eats / Water / Beach / Nightlife / Culture / Chaos.
- Optional add-activity form: title, "who's in" (comma names), category chips, link URL, free-text justification. Submits as status "pending".
- **Two-column layout** (map canvas left, list/detail right on desktop; **stacks to one column on mobile** via `auto-fit, minmax(300px,1fr)`):
  - Map canvas: a stylized (hand-drawn, non-satellite) SVG coastline of Fort Lauderdale → Miami with theme-aware ocean/land/island fills, road line, and text labels. Two fixed "anchor" markers (⭐ Home base, ✈️ FLL airport) plus one circular pin per activity that has map coordinates, colored by category, sized up + ringed when selected. A small legend in the corner maps category colors.
  - Side panel: selected-place detail card (category tag, title, location, requester, note/quote, who's-in list, status badge, vote button, external link) when something is selected; otherwise a hint prompt. Below it, a scrollable list of all visible activities (icon, title, location + status, vote button) — clicking a row selects it (and its pin).
- A "Graveyard of denied dreams" strip at the bottom lists denied pitches struck through, for comedic effect.

### 6. Weather (`#weather`)
- Header: eyebrow "THE FORECAST", H1 "Weather", subtitle.
- One card per city (Fort Lauderdale, Miami): colored header band with current temp + a one-line note, then a 4-day forecast row (Thu–Sun): day/date, weather emoji, hi/lo temps, condition text, rain %.
- A "What to actually pack" tip card below.
- **This data is currently static/hand-authored — not a live weather API call.** If wiring to a real service, keep the same layout/fields (day, icon, hi, lo, condition, rain%) and the two-city, 4-day structure.

### 7. Budget — expenses & split (`#budget`)
- Header + "＋ Add expense" button opening an inline form: description, dollar amount, "who paid" (single-select chip: Sia/Joseph/Marcus/Devon), "split between" (multi-select toggle chips, defaults to everyone).
- Stat tiles: Total spent, Per person, Expense count, Biggest spender.
- Two-column layout (stacks on mobile): 
  - Left: **"Who's up, who's down"** balance list — one row per squad member (avatar-initial circle in their color, name, "paid $X · owes $Y", net balance in mint if they're owed money / coral if they owe / muted "all square" otherwise).
  - Left, below: **"Settle up"** — computed minimal list of "A pays B $amount" transactions (a greedy debtor→creditor matching over net balances), or a "🎉 All square" message when nothing's owed.
  - Right: expense list — one row per logged expense (payer avatar, description, amount, "payer paid · split N ways · $X each", chips for each split participant, delete button).

### Admin — "Throne Room" (`#admin`, overlay)
- Reached by navigating to `#admin` directly (a subtle "management" link in the footer also triggers it) — intentionally a bit hidden, not a nav tab.
- Full-screen overlay over whatever page was active. Shows one pending activity at a time as a large card (category tag + location, title, requester + who's in, a quoted "their defense" note, vote count, link) with two giant buttons: "👎 Denied" / "👑 Approved", plus a "decide later" (send-to-back-of-queue) button.
- Approving/denying plays a ~1.9s full-screen celebratory or comedic animation (color flash + giant rotated stamp text "Approved"/"Denied" + a burst of ~22 randomly-flung emoji particles, CSS-driven via random per-particle CSS custom properties `--tx`/`--ty`/`--r`), then commits the status change and advances to the next pending item.
- Empty state ("The court is adjourned") shown when no pending items remain.
- Exiting returns to whichever tab was active underneath before opening admin.

## Interactions & Behavior Summary
- **Voting** (activities): per-browser toggle, persisted; vote count increments/decrements optimistically.
- **Airbnb voting**: single-choice per browser; switching picks moves your one vote.
- **Pitch/request form**: creates a new "pending" activity; visible immediately on the Map board and list with an "⏳ awaiting Sia's blessing" badge; only Sia (admin) can approve/deny.
- **Expense form**: validates non-empty description, positive amount, and at least one participant before submitting.
- **Settle-up algorithm**: for each person, `net = amountPaid − theirShareAcrossAllExpensesTheyParticipatedIn` (shares split evenly among an expense's participants). Then greedily match the largest debtor to the largest creditor repeatedly until balances are ~0, producing the minimum number of payment transactions.
- **Countdown**: recalculated every second from a fixed target timestamp; shown as days/hours/minutes/seconds.
- **All persistence is client-side** (`localStorage`), keyed per-browser — there is no shared backend, so different people's browsers currently have independent copies of votes/expenses/requests. **A real implementation needs a shared backend/database** so all trip members see the same live state (this is the most important functional gap to close when productionizing).

## State / Data Model (recreate as real app state + backend schema)
- **Activity/request**: `{ id, title, category (enum: eats|water|beach|night|culture|chaos), place, mapX, mapY, link, note, participants[], requester, votes, status (pending|approved|denied) }`
- **Airbnb option**: `{ name, priceLabel, bedsSummary, blurb, iconEmoji, gradient, baseVoteCount }` + per-user single selection
- **Itinerary day**: `{ label, title, date, accentColor, items: [{ time, title, note }] }`
- **Expense**: `{ id, description, amount (number), payer (squad member name), participants[] (squad member names) }`
- **Squad member**: `{ name, color }` — currently a fixed 4-person roster (Sia, Joseph, Marcus, Devon); consider making this editable/data-driven for reuse on other trips.
- **Weather day**: `{ day, date, icon, hi, lo, condition, rainChance }`, grouped per city.
- **Theme**: `light | dark`, persisted per-user.
- **Admin auth**: currently just "knowing the URL" (`#admin`) — no real access control. If productionizing, add real auth distinguishing the one admin/organizer from other members.

## Assets
No external image assets — all iconography is emoji, and the map is hand-drawn inline SVG (no map tiles/imagery, no external map API). Fonts are Google Fonts (DM Serif Display, Outfit). No API integrations (weather is static sample data).

## Files
- `Miami Trip.dc.html` — the full prototype (single file: HTML template + a class-based JS "logic" component). All markup, styling (inline styles + CSS custom properties + a small `<style>` block for fonts/keyframes/theme variables), and behavior for every view described above live in this one file.
