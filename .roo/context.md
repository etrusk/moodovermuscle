# MoodOverMuscle Project Context

## What We're Building

Next.js 14 booking platform for personal training/wellness services.

**Core Features:**
- Real-time session booking with conflict prevention
- Admin dashboard for booking management
- Calendar integration with availability management
- Client-facing booking forms

## Technology Stack

### Frontend
- **Next.js 14 (App Router)** - Server components, improved data fetching
- **React 18** - Component library
- **TypeScript** - Type safety across codebase
- **Tailwind CSS** - Utility-first styling

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database queries, migrations
- **PostgreSQL** - ACID compliance for booking conflicts
- **JWT** - Authentication with refresh token rotation

### Testing
- **Jest** - Unit and integration tests
- **Playwright** - End-to-end testing
- **Accessibility Testing** - WCAG 2.1 AA compliance

### Quality
- **ESLint + Prettier** - Code formatting
- **TypeScript Strict** - No `any` types allowed
- **Husky** - Pre-commit hooks
- **jscpd** - Duplication detection

## Architecture

```
app/
  api/
    bookings/        # Booking CRUD endpoints
    auth/            # JWT authentication
    availability/    # Calendar availability
  admin/             # Admin dashboard pages
  (public)/          # Public booking pages
  
lib/
  db/                # Prisma queries
  auth/              # JWT service
  validation/        # Zod schemas
  
components/
  booking/           # Booking UI components
  forms/             # Form components
  
tests/
  integration/       # API integration tests
  e2e/              # End-to-end flows

## Known Issues & Gotchas

See `.docs/investigations/index.md` for details.

**Common Issues:**
- Bookings <15min apart cause conflicts (by design)
- UTC conversion breaks on DST boundaries (documented fix)
- Prisma relations must use explicit `include` (not implicit)
- Jest mocks must use `jest.unstable_mockModule()` for ESM

## Patterns

See `.docs/patterns/index.md` for reusable code patterns.

**Core Patterns:**
- **Auth**: JWT service at `lib/auth/jwt-service.ts`
- **Validation**: Zod schemas at `lib/validation/schemas.ts`
- **Database**: Booking queries at `lib/db/booking-queries.ts`
- **Testing**: Integration test setup at `tests/integration/booking.test.ts`

## Performance Requirements

- API response time <500ms (p95)
- Lighthouse CI score >90 (all categories)
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

## Constraints

**Hard Limits (pre-commit enforced):**
- Function ≤ 50 lines
- File ≤ 300 lines
- Function params ≤ 3
- Code duplication ≤ 3%
- No `any` types in TypeScript

**Development Principles:**
- TDD when implementing new features
- Pattern-first (check `.docs/patterns/index.md`)
- YAGNI (no abstraction until 2nd use)
- Security-first (validate all inputs)