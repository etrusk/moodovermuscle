# MoodOverMuscle — Product Spec

**Purpose**: a reliable booking system that prevents double-bookings for a solo fitness trainer (Emilia) and her clients.

**Status**: production MVP — transaction-safe booking, real-time availability, admin dashboard. Exact stack versions live in `package.json`; the DB schema in `prisma/schema.prisma`; system design and gotchas in `architecture.md`.

---

## User Requirements

### Emilia (trainer)
- View all bookings in a clear calendar.
- Manage booking status (confirm, cancel, complete).
- Never worry about double-bookings.
- Instant notification of new bookings.
- Access from any device.

### Clients
- See real-time availability without conflicts.
- Book sessions with instant confirmation.
- Receive professional booking confirmations.
- Seamless mobile booking experience.
- *(Future)* manage their own bookings.

### Core journeys
1. **Client books**: browse availability → select time → enter details → receive confirmation.
2. **Emilia manages**: view schedule → update booking status → communicate with clients.
3. **System prevents conflicts**: check availability → block double-bookings → update in real-time.

## Technical Constraints

- **Framework**: Next.js (App Router), TypeScript end-to-end. Versions in `package.json`.
- **Database**: Neon PostgreSQL via Prisma (driver adapter — see `architecture.md`); schema in `prisma/schema.prisma`.
- **Email**: fire-and-forget Nodemailer/SMTP — email failures never block a booking.
- **Auth**: JWT (jose) in HTTP-only cookies, 8-hour admin sessions; a single hardcoded admin.
- **Testing**: Vitest + Testing Library + Playwright + MSW; automated quality gates (lint, type-check, critical tests, security scan, build verify).
- **Deployment**: Vercel + GitHub Actions CI/CD; `main` = prod, `preview` = staging.

Boundaries: single developer + agentic LLM assistance; FLOSS preference; privacy-first (minimal data collection).

## Booking Domain

### Status workflow
Statuses: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, with a `BookingStatusChange` audit row per transition. Cancellation is allowed from `PENDING` or `CONFIRMED`; `COMPLETED` and `CANCELLED` are terminal (reject other transitions with 400).

### Conflict prevention
`@@unique([date, time])` on `Booking` plus a Prisma `$transaction` that validates real-time availability *before* create — guarantees zero double-bookings.

### Real-time availability API
`GET /api/availability?date=YYYY-MM-DD[&time=HH:MM]` →

```typescript
interface AvailabilityResponse {
  availableTimes: string[] // real-time filtered slots
  bookedTimes: string[]    // already taken
  date: string             // requested date
  isAvailable?: boolean    // for single-slot checks
}
```

### API endpoints (production)
- `POST /api/book-session` — create booking (transaction-safe).
- `GET  /api/availability` — availability (date + optional time).
- `POST /api/admin/login` — admin auth.
- `GET  /api/admin/session` — verify admin session.
- `GET/PATCH /api/admin/bookings` — admin CRUD.
- `GET  /api/admin/stats` — dashboard stats.

## Quality Gates

**Critical (never bypass):**
- Transaction safety — 100% booking-conflict prevention.
- Type safety — zero TypeScript errors.
- Accessibility — WCAG 2.1 AA; ≥95% Lighthouse; zero critical violations.
- Security — input validation; dependency audit (moderate+); semgrep.
- Core Web Vitals — LCP <2.5s, CLS <0.1.

**Non-critical (warn, non-blocking):**
- Overall Lighthouse performance ≥85%; bundle <1MB.
- Full integration suite (CI runs it `continue-on-error`).

## Scope

- **In scope**: booking-system reliability and Emilia's admin needs.
- **Out of scope**: multi-user auth, payment processing, advanced analytics.
- **Future growth** (planned, not built): client booking portal (view/cancel own bookings); multi-trainer support; payment integration; recurring-appointment scheduling; analytics/reporting; richer email templates.

### Known gaps / debt
- Admin "Recent Activity" section shows mock data.
- No server-side past/future bound on the booking `date` (client-side `<input min>` only, bypassable via the API) — see the comment in `lib/schemas.ts`.

---
*Requirements doc. Stack versions: `package.json`. Schema: `prisma/schema.prisma`. System design + gotchas: `architecture.md` and code comments.*
