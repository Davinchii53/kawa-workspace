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

- [ ] Supabase project setup (create project, get URL + anon key)
- [ ] `.env.local` configuration
- [ ] `src/lib/supabase.ts` client setup
- [ ] Database schema: `seats` table with `id`, `zone`, `type`, `status`, `booked_at`
- [ ] Replace `INITIAL_SEATS` static data with Supabase fetch
- [ ] Real-time subscription for live seat status updates via WebSocket
- [ ] Booking write — insert booking record to Supabase on confirm
- [ ] Auth (Supabase Auth) — user login, protected routes
- [ ] Azure Static Web Apps deployment