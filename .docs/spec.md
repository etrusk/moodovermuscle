# MoodOverMuscle: LLM-Optimized Development Specification

## CORNERSTONE

**One-Line Purpose**: A reliable booking system that prevents double-bookings for a solo fitness trainer and her clients.

**Current Status**: Production-ready MVP with transaction-safe booking, real-time availability checking, and admin dashboard.

---

## USER REQUIREMENTS

### For Emily (Trainer)

- ✅ View all bookings in a clear calendar format
- ✅ Manage booking status (confirm, cancel, complete)
- ✅ Never worry about double-bookings
- ✅ Receive instant notification of new bookings
- ✅ Access booking system from any device

### For Clients

- ✅ See real-time availability without conflicts
- ✅ Book sessions with instant confirmation
- ✅ Receive professional booking confirmations
- 🔄 Easily manage their bookings (future enhancement)
- ✅ Access seamless mobile booking experience

### Core User Journeys

1. **Client books session**: ✅ Browse availability → Select time → Enter details → Receive confirmation
2. **Emily manages bookings**: ✅ View daily schedule → Update booking status → Communicate with clients
3. **System prevents conflicts**: ✅ Check availability → Block double-bookings → Update in real-time

## TECHNICAL CONSTRAINTS

### Architecture Decisions

- **Framework**: Next.js 15.4.7 with App Router for SSR and optimal performance
- **Database**: Neon PostgreSQL with Prisma ORM for type-safe data operations
- **Deployment**: Vercel with automatic preview deployments and GitHub Actions CI/CD
- **Email**: Fire-and-forget pattern with Nodemailer SMTP integration
- **Testing**: Vitest + React Testing Library + Playwright (98.8% pass rate, 634/642 tests passing)
- **Authentication**: JWT-based admin authentication with HTTP-only cookies

### Implementation Boundaries

- Single developer with agentic LLM assistance
- FLOSS preference for all technology choices
- Privacy-first approach with minimal data collection
- CachyOS development environment
- Navigator-Driver model: Human strategic direction + AI tactical implementation

### System Implementation Status

**✅ Database Transaction Safety (COMPLETED)**

Implementation:

```typescript
// Transaction-safe with real-time validation
const newBooking = await prisma.$transaction(async tx => {
  // Validate availability within transaction
  await validateRealTimeAvailability(date, time, tx)

  // Create booking within transaction after validation
  return tx.booking.create({
    data: validatedData.data,
  })
})
```

**✅ Real-Time Availability API (COMPLETED)**

Endpoint: `/api/availability?date=2024-08-15&time=10:00`

Response Contract:

```typescript
interface AvailabilityResponse {
  availableTimes: string[] // Real-time filtered slots
  bookedTimes: string[] // Already taken slots
  date: string // Requested date
  isAvailable?: boolean // For single slot checks
}
```

**✅ Enhanced Schema (IMPLEMENTED)**

Production Schema:

```prisma
model Booking {
  id              String        @id @default(cuid())
  name            String
  email           String
  phone           String?
  service         String
  date            DateTime
  time            String
  message         String?
  goals           String?
  experience      String?
  status          BookingStatus @default(PENDING)
  sessionDuration Int?          @default(60)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  statusChanges   BookingStatusChange[]

  @@unique([date, time])  // Prevent double bookings
  @@index([date])         // Optimize availability queries
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

model BookingStatusChange {
  id          String        @id @default(cuid())
  booking     Booking       @relation(fields: [bookingId], references: [id])
  bookingId   String
  fromStatus  BookingStatus
  toStatus    BookingStatus
  createdAt   DateTime      @default(now())

  @@index([bookingId])
}
```

## Current Development Status

**Achievement**: Production-ready booking system with transaction safety, real-time availability, admin dashboard, and comprehensive testing.

**Completed Phases**:
- ✅ Phase 1: Transaction Safety Foundation (Weeks 1-2)
- ✅ Phase 2: Real-Time Availability (Weeks 3-4)
- ✅ Phase 3: Admin Dashboard Foundation (Weeks 5-6)
- ✅ Testing Migration: Vitest migration complete (98.8% pass rate)

**Current Focus**: Production optimization and monitoring.

## Current State Analysis

### What's Working Exceptionally Well

- **Comprehensive Test Suite**: 98.8% pass rate (634/642 tests passing, 8 skipped)
  - Unit tests: Component logic, API endpoints, form validation
  - Integration tests: Real-time availability, booking transactions, admin workflows
  - E2E tests: Playwright accessibility and booking flows
- **Accessibility Excellence**: WCAG 2.1 AA compliant with 95% Lighthouse threshold
- **Transaction Safety**: 100% booking conflict prevention via Prisma transactions
- **Real-Time Availability**: Dynamic slot checking with <500ms response time
- **Admin Dashboard**: Full CRUD operations with JWT authentication
- **Email Integration**: Fire-and-forget notifications with Nodemailer
- **Performance Monitoring**: Vercel Analytics + SpeedInsights + GitHub Actions CI/CD
- **Quality Gates**: Automated lint, type-check, security scanning, accessibility checks

### Production Features (All Implemented)

- ✅ **Transaction-Safe Booking**: Prisma $transaction with conflict detection
- ✅ **Real-Time Availability API**: `/api/availability` with date/time validation
- ✅ **Database Constraints**: `@@unique([date, time])` prevents double bookings
- ✅ **Booking Status Workflow**: PENDING → CONFIRMED → CANCELLED → COMPLETED
- ✅ **Status Audit Trail**: BookingStatusChange table tracks all transitions
- ✅ **Admin Authentication**: JWT-based auth with 8-hour sessions
- ✅ **Admin Dashboard**: Stats, bookings list, calendar view, filtering
- ✅ **Enhanced UX**: Loading states, error handling, confirmation flows
- ✅ **Rate Limiting**: 5 requests per 15 minutes per IP for booking endpoint

### Known Technical Debt (Non-Critical)

- 8 skipped email validation tests (intentionally skipped - test environment constraints)
- Admin dashboard "Recent Activity" section shows mock data (enhancement opportunity)
- Client booking management portal (future enhancement)
- Multi-trainer support (future scope, 6+ months)

## Quality Gate Framework

### Critical Gates (Never Bypass)

- **Transaction Safety**: 100% booking conflict prevention
- **Type Safety**: Zero TypeScript errors
- **Accessibility**: 95% Lighthouse score, zero critical violations
- **Security**: Input validation, SQL injection prevention
- **Core Web Vitals**: LCP <2.5s, CLS <0.1

### Non-Critical Gates (Track in `.docs/debt.md`)

- **Performance**: Overall Lighthouse score ≥85%
- **Bundle Size**: <1MB total resource budget
- **Integration Tests**: Can bypass with resolution timeline
- **Advanced Features**: Skip links, advanced ARIA patterns

## Development Constraints

### Technical Constraints

- **Single Developer**: Solo development with agentic LLM assistance
- **FLOSS Preference**: Open-source tools prioritized
- **Privacy First**: No data collection beyond business requirements
- **CachyOS Environment**: Local development on CachyOS with privacy-hardened tooling

### Business Constraints

- **Single Client**: Emily's fitness coaching business
- **Functionality Over Complexity**: Simple solutions preferred
- **Zero Downtime**: Existing bookings must remain functional during migration
- **Budget Conscious**: Free/open-source solutions prioritized

### Time Constraints

- **4-6 Week Business Boundaries**: Focused development sprint with clear scope boundaries and quality gates
- **Daily Progress**: Visible progress with working increments
- **User Testing**: Emily can manually test features as they're completed

## Implementation Roadmap (COMPLETED)

### ✅ Phase 1: Transaction Safety Foundation (Week 1-2)

**Delivered**:

- ✅ Database transaction safety with Prisma $transaction
- ✅ Booking conflict detection via validateRealTimeAvailability()
- ✅ Enhanced error handling with BookingConflictError class
- ✅ Database constraints: `@@unique([date, time])` + `@@index([date])`
- ✅ BookingStatusChange audit trail table

**Success Metrics**: Zero double bookings in production, 100% conflict detection

### ✅ Phase 2: Real-Time Availability (Week 3-4)

**Delivered**:

- ✅ `/api/availability` endpoint with date and time validation
- ✅ Dynamic calendar integration with useAvailability hook
- ✅ Client-side availability state management
- ✅ Performance optimization: <500ms average response time
- ✅ Single slot checking for real-time validation

**Success Metrics**: Calendar shows only available slots, <500ms API response

### ✅ Phase 3: Admin Dashboard Foundation (Week 5-6)

**Delivered**:

- ✅ JWT-based admin authentication (8-hour sessions)
- ✅ Admin dashboard with real-time stats
- ✅ Booking list with filtering (status, search, date range)
- ✅ Calendar view showing all bookings
- ✅ Status management (PENDING → CONFIRMED → CANCELLED → COMPLETED)
- ✅ BookingStatusChange audit trail for all transitions

**Success Metrics**: Emily manages all bookings via web interface, zero email dependency

### ✅ Phase 4: Testing & Quality (Week 7-8)

**Delivered**:

- ✅ Vitest migration complete (98.8% pass rate)
- ✅ Comprehensive test coverage (634 tests)
- ✅ E2E accessibility tests with Playwright
- ✅ GitHub Actions CI/CD pipeline
- ✅ Quality gates: lint, type-check, security scan, build verification
- ✅ Pre-commit hooks with Husky

**Success Metrics**: 98.8% test pass rate, all quality gates passing

## Risk Management

### Technical Risks

- **Database Migration Complexity**: Mitigate with careful testing and rollback plan
- **Calendar Integration**: Use existing component architecture, incremental enhancement
- **Performance Impact**: Monitor with existing Lighthouse CI, optimize as needed

### Business Risks

- **Booking Disruption**: Phase rollout, maintain backward compatibility
- **User Experience**: Continuous testing with Emily, rapid iteration
- **Scope Creep**: Strict appetite boundaries, defer non-essential features

### Mitigation Strategies

- **Feature Flags**: Gradual rollout of new functionality
- **Comprehensive Testing**: Maintain 100% critical test pass rate
- **Regular Check-ins**: Weekly progress reviews with Emily
- **Rollback Capability**: Always maintain working system state

## Success Definition

### ✅ Minimum Viable Enhancement (ALL COMPLETED)

- [x] Stable test suite foundation (98.8% pass rate)
- [x] Transaction-safe booking creation (Prisma $transaction)
- [x] Real-time availability checking (/api/availability)
- [x] Database conflict prevention (@@unique constraint)
- [x] Enhanced error handling (BookingConflictError, AvailabilityConflictError)

### ✅ Delightful Experience (ALL COMPLETED)

- [x] Admin dashboard for Emily (dashboard, bookings, calendar)
- [x] Booking status workflow (PENDING → CONFIRMED → CANCELLED → COMPLETED)
- [x] Improved mobile experience (WCAG 2.1 AA compliant)
- [x] Performance optimizations (<500ms API, <2.5s LCP)

### 🔄 Future Growth (Planned Enhancements)

- [ ] Client booking portal (view/cancel own bookings)
- [ ] Multi-trainer support (6+ months)
- [ ] Payment integration (Stripe/similar)
- [ ] Advanced scheduling features (recurring appointments)
- [ ] Analytics and reporting dashboard
- [ ] Email notification templates (enhanced HTML/text)

## Measurement & Learning

### Key Metrics to Track

- **Booking Success Rate**: Target >95% completion
- **Conflict Prevention**: 100% effectiveness
- **Response Times**: <500ms for availability checks
- **User Satisfaction**: Emily's feedback on admin tools
- **System Reliability**: Zero booking data loss

### Learning Objectives

- **Transaction Pattern**: Optimal approach for booking conflict prevention
- **Calendar UX**: Best practices for real-time availability display
- **Admin Interface**: Minimal viable admin tools for solo trainer
- **Performance Impact**: Real-world effect of availability checking

## Dependencies & Integration Points

### Production Systems

- **Database**: Neon PostgreSQL with Prisma ORM (6.12.0)
- **Email**: Nodemailer 7.0.9 SMTP integration (fire-and-forget)
- **Deployment**: Vercel with GitHub Actions CI/CD
- **Monitoring**: Vercel Analytics + SpeedInsights
- **Testing**: Vitest 3.2.4 + Playwright 1.54.1 + Lighthouse CI

### External Dependencies

- **Calendar Component**: react-day-picker (latest)
- **Form Validation**: Zod 3.24.1 with TypeScript 5
- **UI Framework**: shadcn/ui (Radix UI) with Tailwind CSS 3.4.17
- **Authentication**: JWT via jose 6.0.12 (Edge Runtime compatible)
- **Password Hashing**: bcryptjs 3.0.2

### API Architecture (Production)

- ✅ `/api/book-session` - POST: Create booking with transaction safety
- ✅ `/api/availability` - GET: Check availability (date + optional time)
- ✅ `/api/admin/login` - POST: Admin authentication
- ✅ `/api/admin/session` - GET: Verify admin session
- ✅ `/api/admin/bookings` - GET/PATCH: Admin CRUD operations
- ✅ `/api/admin/stats` - GET: Dashboard statistics

## Quality Gates & Business Protection

### When to Stop and Re-evaluate

- Transaction implementation exceeds 2 weeks effort and quality cannot be maintained
- Availability API response times consistently >1 second without acceptable workarounds
- Admin dashboard requires authentication complexity beyond simple password affecting security
- Any feature requires breaking existing functionality

### Scope Boundaries

- **In Scope**: Booking system reliability and Emily's admin needs
- **Out of Scope**: Multi-user auth, payment processing, advanced analytics
- **Future Scope**: Multi-trainer support, customer portal, mobile app

### Business Boundary Expansion Triggers

- Core transaction safety completed ahead of schedule with quality maintained
- Emily requests specific admin features during testing within quality constraints
- Performance improvements show significant user benefit without compromising quality
- New business requirements emerge from usage patterns

---

**Last Updated**: 2025-10-15
**Current Status**: Production-ready MVP with all core features implemented
**Test Coverage**: 98.8% pass rate (634/642 tests passing)
**Quality Gates**: All passing (lint, type-check, security, accessibility, build)
**Next Focus**: Production optimization, monitoring, and client portal enhancements
