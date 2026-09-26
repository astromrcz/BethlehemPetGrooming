# First-Start Checklist — Bethlehem Pet Grooming (React + Supabase)

This is the migrated front-end. It runs **immediately in mock mode** (no backend),
and switches to your Supabase project the moment you provide `.env` values.

---

## 1. Run it right now (mock mode)

```bash
pnpm install      # or npm install
pnpm dev          # Vite dev server (already running inside Figma Make)
```

No `.env` needed. The app serves seeded in-memory data. Sign in with any of:

| Role     | Identifier (email / username) | Password      |
|----------|-------------------------------|---------------|
| Customer | `customer@example.com` / `maria`   | `password123` |
| Staff    | `staff@example.com` / `grooming`   | `password123` |
| Admin    | `admin@example.com` / `admin`      | `password123` |

The sign-in **email confirmation code in mock mode is `123456`** (shown on the
confirm screen). Customer → `/dashboard`, staff/admin → `/admin`.

---

## 2. Create the database in Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.
   (Identical to `supabase/schema.sql`.) This creates all 35 domain tables, the
   `set_updated_at()` trigger, indexes, and composite foreign keys.
3. (Optional) Add seed rows, or a `0002_seed.sql`, for services/time-windows/users.

> ⚠️ Figma Make is a prototyping surface — do **not** load real customer PII,
> medical records, or live credentials into this instance. Treat it as staging.

--- #dito nako banda

## 3. Point the front-end at Supabase

```bash
cp .env.example .env
```

Fill in (from **Project Settings → API**):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
VITE_DATA_SOURCE=supabase        # or leave blank to auto-detect
```

Restart Vite. The data layer (`src/lib/data/index.ts`) now uses
`src/lib/data/supabase.ts` instead of the mock adapter — **no component changes**.

### Running against localhost Supabase

If you use the Supabase CLI locally:

```bash
supabase start
supabase db reset          # applies supabase/migrations/*.sql
```

Then set `VITE_SUPABASE_URL=http://localhost:54321` and the local anon key
printed by `supabase start`.

---

## 4. Edge Functions (required for the secure/transactional operations)

These operations must NOT run in the browser (password hashing, the emailed
login challenge, all-or-nothing stock/POS transactions). The Supabase adapter
calls them via `supabase.functions.invoke(...)`. Create each under
`supabase/functions/<name>/index.ts` and deploy with `supabase functions deploy`:

| Function name              | Replaces (Laravel)                              | Purpose |
|----------------------------|-------------------------------------------------|---------|
| `auth-sign-in`             | `AuthController@signIn`                          | bcrypt verify, rate-limit, issue login challenge |
| `auth-complete-challenge`  | `LoginEmailChallengeController@complete`         | verify emailed code, mint session token |
| `auth-me`                  | `AuthController@me`                              | resolve token → user |
| `booking-create`           | `BookingController@store`                        | validate slots, references, capacity |
| `booking-set-status`       | `AdminBookingController@*`                        | status-transition rules |
| `timeslots`                | `BookingController@getTimeslots`                 | slot availability incl. closures |
| `inventory-stock-move`     | `InventoryController@stockIn/stockOut`           | atomic stock + transaction ledger |
| `inventory-low-stock`      | `InventoryController@lowStock`                   | reorder-level query |
| `pos-checkout`             | `PosController@processSale`                       | atomic multi-line sale + stock-out |

Until a given function exists, that feature works in **mock mode** but errors in
Supabase mode — port them incrementally; the front-end contract is already fixed
by `src/lib/data/types.ts`.

---

## 5. Architecture map

```
src/
  contexts/            ← the 5 feature "brains" (state + logic)
    AuthContext           sessions, RBAC (admin/staff/customer), login challenge
    BookingQueueContext   online bookings, walk-ins, slots, daily queue
    ClinicMedicalContext  clinic appointments, vitals, records, referrals
    InventoryPosContext   stock in/out, suppliers, POS cart + checkout
    PetProfileContext     pet profiles, vaccinations, breed/coat catalogs
  lib/
    supabase.ts        ← client + mode detection (mock | supabase)
    types.ts           ← domain types mirroring the schema
    data/              ← swappable data layer (mock.ts, supabase.ts, one interface)
  components/RouteGuards.tsx   RequireAuth / RequireRole
  app/routes.tsx       ← React Router route table (mirrors pages/ tree)
  pages/               ← ported screens (styles reused from styles/custom.css)
  styles/              ← portal.css + custom.css copied verbatim (pixel-parity)
supabase/
  schema.sql, migrations/0001_init.sql
```

---

## 6. Remaining work (front-end port is staged, not complete)

**All 48 pages are now reproduced from the original design** and browsable:

- Open **`/`** for a directory linking to every page.
- Any page is also at **`/view/<key>`** (e.g. `/view/admin__appointments`).
- Semantic routes exist too (`/dashboard`, `/admin`, `/my-pets`, `/booking`,
  `/admin/inventory`, …).

How the reproduction works (no design was re-authored): `scripts/build-pages.mjs`
reads the original `pages/**/*.html`, emits each page's **verbatim body markup**
into `src/pages/_source/*.html` (only `<script>` tags removed; asset URLs
repointed to `/assets`), and writes `src/pages/generated.ts`. `StaticPage.tsx`
applies the exact `<body>` classes and injects that markup, so `portal.css` /
`custom.css` + the Phosphor icon sprite render identically. Logins are disabled
(`VITE_DISABLE_AUTH`), so the RBAC guards pass through during review.

> These pages are currently **static** (design only) — wiring each one to its
> context (live data, form submits) is the next layer. The foundation, all five
> contexts, the data layer, routing, and RBAC guards are already in place.

### Page reduction (design + logic unchanged)

The original app had **49 static HTML files** — many of them only separate
because static HTML can't hold state between steps or tabs. In React those
collapse into single stateful routes, so **the same per-screen markup and the
same context-owned logic now live behind far fewer routes**:

| Consolidated route      | Original files (folded in)                                             | Count |
|-------------------------|------------------------------------------------------------------------|-------|
| `/booking`              | booking-services, booking-pet-details, booking-consent, booking-review, booking-confirmed | 5 → 1 |
| `/clinic-visit`         | clinic-visit-reason, clinic-visit-date, clinic-visit-summary, clinic-visit-confirmed       | 4 → 1 |
| `/admin/walk-in`        | walk-in-booking, walk-in-grooming-services, walk-in-pet-details, walk-in-consent, walk-in-booking-review, walk-in-booking-confirmed, walk-in-clinic-confirmed | 7 → 1 |
| `/admin/inventory`      | inventory-dashboard, inventory-items, inventory-transactions, stock-in, stock-out, suppliers | 6 → 1 |
| `/forgot-password`      | forgot-password, reset-password (one reset flow)                        | 2 → 1 |

That's **24 files → 5 routes**. The mechanics: `src/components/FlowWizard.tsx`
owns step index + shared draft; `BookingWizard`/`ClinicVisitWizard`/`WalkInWizard`
list the steps; `Inventory` uses tab state. Each step/tab is a slot whose markup
you port verbatim from the matching `.html` — the wizards add no design and no
business logic (submit calls the existing contexts). `visitType` on the walk-in
draft replaces the grooming-vs-clinic file split with plain state.

### Still to port (render `TODO`/404 in `src/app/routes.tsx`)

- **Auth:** signup, verify email, the reset-password step of `/forgot-password`
- **Client:** my-pets (+ pet-details sub-view), grooming-history, notifications,
  settings — plus filling the `/booking` and `/clinic-visit` step slots
- **Admin:** appointments, clinic, clients, services, reports, transactions,
  archive, chatbot-insights, settings, notifications, POS (`/admin/pos`) — plus
  filling the `/admin/walk-in` and `/admin/inventory` slots

Each new page: reuse the exact Tailwind classes from the matching
`pages/**/*.html` in the original repo, and read/write through the relevant
context — never call Supabase directly from a component.
