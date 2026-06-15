# kawa.

A real-time co-working space management dashboard built as a portfolio project.

**Live:** [kawa-workspace.pages.dev](https://kawa-workspace.pages.dev)

---

## Concept

Kawa (川, Japanese for "river") is a seat booking and floor management system for a developer-focused co-working space in Bandung. The name maps to the idea of flow state — the kind of deep focus that good working environments are built around.

The dashboard shows a live floor plan where visitors can see which desks and private pods are available in real time. An admin account controls all seat operations — booking, reserving, and unbooking seats — while regular visitors get a read-only live view.

---

## Core Features

- **Live floor plan** — desk and pod nodes update in real time across all connected browsers via Supabase WebSocket subscriptions
- **Seat booking** — admin can book, reserve, or unbook any seat; changes persist in the database immediately
- **Role-based access** — visitors see the floor plan live but cannot interact; only the authenticated admin can manage seats
- **Environment strip** — displays zone conditions (temperature, noise, lighting, occupancy)
- **Live clock** — current session time displayed in the nav

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Edge Runtime) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase WebSocket (postgres_changes) |
| Auth | Supabase Auth |
| Hosting | Cloudflare Pages |

---

## Project Structure

```
src/
├── app/
│   └── page.tsx              # Root page, state owner
├── components/
│   ├── auth/
│   │   └── LoginModal.tsx    # Admin login modal
│   ├── booking/
│   │   └── BookingSidebar.tsx # Seat control panel
│   └── floor/
│       ├── FloorPlan.tsx     # Floor grid, zones, legend
│       └── DeskNode.tsx      # Individual seat node
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── auth.ts               # Auth helpers
└── types/
    └── index.ts              # Shared TypeScript interfaces
```

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local and add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Run dev server
npm run dev
```

---

## Part of a larger project

Kawa is one of two projects built under the same initiative. The second — **Davinchii** — is a gaming lounge booking system with a neon aesthetic inspired by Honkai: Star Rail. Coming soon.

# Kawa Workspace — Dev Log
**Date:** June 14, 2026  
**Session:** Project kickoff + UI scaffold  
**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Shadcn/UI · Supabase (planned)

---

## 1. Project Origin

Started from a Gemini-generated project proposition stored in `NextJS_Project_Plans.md`. The file outlined two concepts:

- **Nexus Space** — a developer-focused co-working hub with dark glassmorphism UI and real-time seat availability
- **Aether Lounge** — a gaming lounge with neon aesthetics inspired by HSR, ZZZ, and MLBB

Decision was made to build both. Branding was settled as:

- **Kawa** → co-working hub (Japanese for "river," maps to flow-state focus energy)
- **Davinchii** → gaming lounge (stylized spelling fits the game aesthetic)

---

## 2. Tech Stack Decision

### Kawa (Co-Working Hub)
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + API routes needed for real-time dashboard |
| Styling | Tailwind CSS + Shadcn/UI | Rapid accessible components, dark mode ready |
| Database + Realtime | Supabase free tier | PostgreSQL + WebSocket out of the box |
| Hosting | Azure Static Web Apps | Free tier, $100 credit preserved for Davinchii |

### Davinchii (Gaming Lounge)
| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Same base |
| Styling | Tailwind CSS + Shadcn/UI + custom CSS | Neon glow effects on top |
| Auth | Supabase Auth | Protected dashboard routes |
| State | Zustand | Cart + session state across pages |
| Animation | Framer Motion | Physics-based UI transitions |
| Hosting | Azure App Service (B1) | Stateful app needs persistent Node.js env, burn $100 credit here |

---

## 3. UI Design Process

### Three Prototypes Built (React artifacts)

**V1 — Dark Navy Glassmorphism (baseline)**
- Palette: `#0A0F1E` base, `#4FACDE` accent, `#E05A5A` occupied, `#C07A2A` reserved
- Typography: Space Grotesk (display) · Inter (body) · JetBrains Mono (all data/numbers)
- Layout: sticky nav → hero strip with live stats → split main (floor plan + sidebar) → env cards
- Signature element: floor plan with glowing pulsing desk nodes on a dot grid background

**V2 — Terminal Ops / Grafana-style**
- Full IBM Plex Mono, near-black `#080C0A`, phosphor green `#39FF8F` accent
- Three-column layout: floor plan · booking+env · live system log
- ENV rendered as a data table with delta values, not cards
- Rejected as primary direction, kept as reference

**V3 — Stripped, Map-First**
- Floor plan centered with maximum whitespace, no competing sections
- Stats demoted to tiny nav strip numbers
- Booking sidebar anchored with ENV table at the bottom
- Rejected as primary direction

**Decision: V1 chosen as the build baseline.**

---

## 4. Project Initialization

```bash
npx create-next-app@latest kawa-workspace \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

### Additional dependencies installed

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install lucide-react class-variance-authority clsx tailwind-merge
npx shadcn@latest init
npx shadcn@latest add button card badge separator
```

Shadcn init answers: Style → Default · Base color → Slate · CSS variables → Yes

---

## 5. Folder Structure

```
kawa-workspace/
└── src/
    ├── app/
    │   └── page.tsx          # Root page, state owner
    ├── components/
    │   ├── floor/
    │   │   ├── FloorPlan.tsx # Grid, zone rows, legend
    │   │   └── DeskNode.tsx  # Single clickable desk/pod node
    │   ├── booking/
    │   │   └── BookingSidebar.tsx  # Sidebar, booking form, today's stats
    │   └── ui/               # Shadcn auto-generated components
    ├── lib/                  # Supabase client, utilities (upcoming)
    └── types/
        └── index.ts          # Shared TypeScript interfaces
```

---

## 6. Type Definitions

`src/types/index.ts`

```ts
export type SeatStatus = "available" | "occupied" | "reserved";
export type SeatType = "desk" | "pod";

export interface Seat {
  id: string;
  zone: string;
  type: SeatType;
  status: SeatStatus;
  since?: string | null;
}

export interface Zone {
  id: string;
  label: string;
  seats: Seat[];
}
```

---

## 7. Components Built

### `DeskNode.tsx`
- Accepts `seat`, `selected`, `onClick` props
- Renders desk (rounded rect) or pod (circle) based on `seat.type`
- Color + glow driven by `seat.status`
- Pulse animation on available seats
- Blocked click on occupied seats

**Bug fixed:** React warned about mixing `border` shorthand with `borderColor` non-shorthand on the same element during rerender. Fixed by replacing both with explicit `borderTop / borderRight / borderBottom / borderLeft` properties.

### `FloorPlan.tsx`
- Accepts `seats`, `selected`, `onSelect` props
- Renders dot-grid background, zone labels, desk rows (A/B/C), pods column (P)
- Vertical divider separates open desks from private pods
- Renders legend at bottom
- Hosts `@keyframes` for pulse animations via inline `<style>` tag

### `BookingSidebar.tsx`
- Accepts `selected`, `onBook`, `booked` props
- Empty state when nothing selected
- Shows seat ID, type, zone, status when selected
- Book button turns green on confirmation, auto-resets after 2s
- Today's stats panel below (static placeholder for now)

### `page.tsx`
- Owns all state: `seats`, `selected`, `booked`, `activeNav`, `time`
- `handleSelect` toggles selection, clears booked state
- `handleBook` flips seat status to occupied, triggers booked state, resets after 2s
- Renders: nav → hero strip → `<FloorPlan>` + `<BookingSidebar>` → env cards strip

---

## 8. Known Issues & Bugs Fixed

| Issue | Cause | Fix |
|---|---|---|
| `useEffect` build error on first load | `page.tsx` treated as Server Component by App Router | Added `"use client"` directive at top of file |
| `borderColor` console error on booking | Mixed `border` shorthand + `borderColor` non-shorthand in same style object | Replaced with four explicit border properties |

---

## 9. Current State

The UI scaffold is complete and matches the V1 prototype visually. Booking interaction works — selecting a seat, confirming, and watching it flip to occupied all function correctly. No backend wired yet; all state is local React.

---

## 10. Next Steps (Upcoming Sessions)

- [x] Supabase project setup (create project, get URL + anon key)
- [x] `.env.local` configuration
- [x] `src/lib/supabase.ts` client setup
- [x] Database schema: `seats` table with `id`, `zone`, `type`, `status`, `booked_at`
- [x] Replace `INITIAL_SEATS` static data with Supabase fetch
- [x] Real-time subscription for live seat status updates via WebSocket
- [x] Booking write — insert booking record to Supabase on confirm
- [ ] Auth (Supabase Auth) — user login, protected routes
- [ ] Replace "Today" stats panel with real per-user booking data
- [ ] Environment cards hooked to a real `environment` table in Supabase
- [ ] Azure Static Web Apps deployment

---

## 11. Supabase Integration (Session 2)

### Project Setup
- Project name: `kawa-workspace`
- Region: Southeast Asia (Singapore)
- Supabase account: Davinchii53

### Database Schema

```sql
CREATE TABLE seats (
  id          TEXT PRIMARY KEY,
  zone        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('desk', 'pod')),
  status      TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  booked_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Seeded with 15 seats across zones A, B, C (open desks) and P (private pods).

### Supabase Client

`src/lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### What `page.tsx` now does
- Fetches all seats from Supabase on mount via `fetchSeats()`
- Shows `fetching seats...` loading state while waiting
- Subscribes to `postgres_changes` on the `seats` table via WebSocket for live updates
- `handleBook()` writes `status: "occupied"` and `booked_at` timestamp to Supabase on confirm
- Occupancy card in env strip now calculates live from real seat data

### Bugs & Issues Fixed This Session

| Issue | Cause | Fix |
|---|---|---|
| "Invalid path specified in request URL" | `.env.local` had JS syntax (`'`, `;`) and `/rest/v1/` appended to URL | Removed all syntax, stripped URL to base `.supabase.co` only |
| "Permission denied for table seats" | Project created with RLS auto-enabled and public exposure disabled | Ran `GRANT SELECT, UPDATE ON seats TO anon` and `ALTER TABLE seats DISABLE ROW LEVEL SECURITY` |
| Missing `key` prop warning in hero stats | Fragment `<>` used inside `.map()` can't carry a `key` prop | Replaced fragment with a keyed `<div>` wrapper |
| Supabase connection using wrong key format | Supabase now shows "Publishable" keys by default; new format not compatible with current JS client | Switched to legacy `anon` key from the Legacy tab in API settings |

### Confirmed Working
- Floor plan loads 15 seats from Supabase on every page load
- Booking A3 flips it to `occupied` in the database and persists across refreshes
- Realtime subscription active — status changes propagate across browser tabs without refresh

---

## 12. Auth & Admin Controls (Session 3 — June 15, 2026)

### Admin Account Setup
- Created admin user manually via Supabase Dashboard → Authentication → Users
- Email confirmation fixed via SQL since account was created manually outside the email flow:

```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email-here@gmail.com';
```

- Admin role assigned via user metadata:

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email-here@gmail.com';
```

- `booked_by` column added to seats table:

```sql
ALTER TABLE seats ADD COLUMN booked_by UUID REFERENCES auth.users(id);
```

### Files Added
- `src/lib/auth.ts` — `signIn`, `signOut`, `getSession`, `getUser`, `isAdmin` helpers
- `src/components/auth/LoginModal.tsx` — modal with email/password fields, Enter key support, error display

### Auth Flow in `page.tsx`
- `supabase.auth.getSession()` on mount to restore existing session
- `supabase.auth.onAuthStateChange()` listener keeps `user` state in sync
- `isAdmin(user)` check gates all booking controls
- `handleBook()` now writes `booked_by: user.id` to Supabase
- `handleUnbook()` resets `status` to `available`, clears `booked_at` and `booked_by`
- `handleReserve()` sets `status` to `reserved` with `booked_at` and `booked_by`

### Role Model
| Role | Permissions |
|---|---|
| Visitor (no login) | Read-only floor plan view |
| Admin (logged in) | Book, reserve, unbook any seat |

### UI Changes
- Nav bar shows "Admin login" button for visitors
- Nav bar shows "admin" badge + "Sign out" button when logged in as admin
- `BookingSidebar` shows "Seat control" title and action buttons for admin
- `BookingSidebar` shows "Seat status" title and no buttons for visitors
- Book + Reserve buttons shown when selected seat is available
- Unbook button shown when selected seat is occupied or reserved

### Bugs & Issues Fixed This Session

| Issue | Cause | Fix |
|---|---|---|
| "Invalid login credentials" | User created manually without email confirmation | Ran `UPDATE auth.users SET email_confirmed_at = NOW()` |
| Unbook button unreachable | `DeskNode` blocked all clicks on occupied/reserved seats unconditionally | Added `isAdmin` prop to `DeskNode`, only blocks clicks when `!isAdmin` |
| `isAdmin` unused variable warning in `FloorPlan` | Prop passed but not used internally | Removed from destructure initially, added back when needed for `DeskNode` |

### Confirmed Working
- Admin login and logout via modal
- "admin" badge appears in nav on successful login
- Book a seat → writes `occupied` + `booked_at` + `booked_by` to Supabase
- Reserve a seat → writes `reserved` + `booked_at` + `booked_by` to Supabase
- Unbook a seat → resets to `available`, clears `booked_at` and `booked_by`
- Visitors see floor plan live but cannot interact with seats
- All changes persist in Supabase and reflect across browser tabs via realtime

### Remaining Next Steps
- [ ] "Today" stats panel with real per-user booking data
- [ ] Environment cards hooked to a real Supabase `environment` table
- [ ] Azure Static Web Apps deployment

---

## 13. Cloudflare Pages Deployment (Session 3 — June 15, 2026)

### Build Configuration
- **Framework preset:** Next.js
- **Build command:** `npx @cloudflare/next-on-pages@1`
- **Build output directory:** `.vercel/output/static`
- **Branch:** main

### Changes Made for Cloudflare Compatibility
- `next.config.ts` stripped to empty config (removed experimental runtime flag)
- `export const runtime = "edge"` added to `src/app/page.tsx`
- `package-lock.json` regenerated via `npm install` to resolve missing `@emnapi` packages

### Issues Fixed

| Issue | Cause | Fix |
|---|---|---|
| `npm ci` sync error | `package-lock.json` out of sync with `package.json` | Ran `npm install` locally, committed updated lock file |
| Node.js Compatibility Error on live URL | `nodejs_compat` flag not set | Added flag under Settings → Runtime → Compatibility flags in Cloudflare dashboard |
| Cloudflare building old commit | Dashboard not auto-picking up new push | Triggered manual redeploy via empty commit (`git commit --allow-empty`) |


Auto-deploys on every push to `main`.