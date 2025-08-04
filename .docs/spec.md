# MoodOverMuscle: Appetite-Based Specification

## CORNERSTONE

**One-Line Purpose**: A reliable booking system that prevents double-bookings for a solo fitness trainer and her clients.

---

## USER REQUIREMENTS

### For Emily (Trainer)

- View all bookings in a clear calendar format
- Manage booking status (confirm, cancel, complete)
- Never worry about double-bookings
- Receive instant notification of new bookings
- Access booking system from any device

### For Clients

- See real-time availability without conflicts
- Book sessions with instant confirmation
- Receive professional booking confirmations
- Easily manage their bookings
- Access seamless mobile booking experience

### Core User Journeys

1. **Client books session**: Browse availability → Select time → Enter details → Receive confirmation
2. **Emily manages bookings**: View daily schedule → Update booking status → Communicate with clients
3. **System prevents conflicts**: Check availability → Block double-bookings → Update in real-time

## TECHNICAL CONSTRAINTS

### Architecture Decisions

- **Framework**: Next.js 14 with App Router for SSR and optimal performance
- **Database**: PostgreSQL with Prisma ORM for type-safe data operations
- **Deployment**: Vercel with automatic preview deployments
- **Email**: Fire-and-forget pattern with SMTP integration

### Implementation Boundaries

- Single developer with agentic LLM assistance
- FLOSS preference for all technology choices
- Privacy-first approach with minimal data collection
- CachyOS development environment

### System Constraints

**Database Transaction Safety (Critical - Week 1-2)**

Current Implementation:

```typescript
// Vulnerable: No transaction safety
const newBooking = await prisma.booking.create({
  data: validatedData.data,
})
```

Target Implementation:

```typescript
// Transaction-safe with conflict detection
return await prisma.$transaction(async tx => {
  const existingBooking = await tx.booking.findFirst({
    where: { date: validatedData.date, time: validatedData.time },
  })

  if (existingBooking) {
    throw new Error('Time slot already booked')
  }

  return await tx.booking.create({
    data: validatedData.data,
  })
})
```

**Real-Time Availability API (High - Week 3-4)**

New Endpoint: `/api/availability?date=2024-08-15`

Response Contract:

```typescript
interface AvailabilityResponse {
  availableTimes: string[] // Real-time filtered slots
  bookedTimes: string[] // Already taken slots
  date: string // Requested date
}
```

**Enhanced Schema Evolution**

Current Schema:

```prisma
model Booking {
  id         String   @id @default(cuid())
  name       String
  email      String
  phone      String?
  service    String
  date       DateTime
  time       String
  message    String?
  goals      String?
  experience String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

Target Schema:

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

  @@unique([date, time])  // Prevent double bookings
  @@index([date])         // Optimize availability queries
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

## Current Appetite

**Problem**: Solo fitness trainer needs a reliable booking system that eliminates double-bookings and provides real-time availability checking.

**Appetite**: 4-6 weeks of focused development effort to achieve transaction-safe booking with calendar integration.

**Scope**: Transform existing MVP booking system into production-ready platform with conflict prevention and admin dashboard.

## Current State Analysis

### What's Working Well

- **Stable Test Suite**: 36 passing test suites (161 tests) - solid foundation achieved
- **Accessibility Excellence**: Comprehensive automated testing with 95% Lighthouse threshold
- **Mobile-First Design**: WCAG 2.1 AA compliant booking experience
- **Email Integration**: Non-blocking email notifications (fire-and-forget pattern)
- **Performance Monitoring**: Vercel Analytics + SpeedInsights with automated quality gates

### Critical Gaps (Build Blockers)

- **No Transaction Safety**: Single database writes without rollback capability
- **No Conflict Detection**: Multiple bookings can be made for same time slot
- **Static Calendar**: Time slots don't reflect actual availability
- **Missing Admin Tools**: No web interface for Emily to manage bookings

### High Priority Enhancements

- **Calendar Availability Integration**: Dynamic time slot filtering based on existing bookings
- **Database Constraints**: Unique constraints on `[date, time]` combination with proper indexing
- **Booking Status Management**: PENDING → CONFIRMED → COMPLETED workflow
- **Enhanced User Experience**: Loading states, better error handling, confirmation flows

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

- **4-6 Week Appetite**: Focused development sprint with clear scope boundaries
- **Daily Progress**: Visible progress with working increments
- **User Testing**: Emily can manually test features as they're completed

## Implementation Roadmap

### Phase 1: Transaction Safety Foundation (Week 1-2)

**Appetite**: 8-12 hours focused development

**Deliverables**:

- Database transaction safety implementation
- Booking conflict detection and prevention
- Enhanced error handling and user feedback
- Database constraints (`@@unique([date, time])`)

**Success Signal**: Zero possibility of double bookings

### Phase 2: Real-Time Availability (Week 3-4)

**Appetite**: 10-15 hours focused development

**Deliverables**:

- `/api/availability` endpoint implementation
- Dynamic calendar component integration
- Client-side availability caching
- Performance optimization (<500ms response time)

**Success Signal**: Calendar shows only truly available time slots

### Phase 3: Admin Dashboard Foundation (Week 5-6)

**Appetite**: 12-18 hours focused development

**Deliverables**:

- Basic admin authentication
- Booking list view with status management
- Calendar view for Emily's schedule
- Customer communication tools

**Success Signal**: Emily can manage bookings through web interface

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

### Minimum Viable Enhancement (Must Have)

- [x] Stable test suite foundation (Completed)
- [ ] Transaction-safe booking creation
- [ ] Real-time availability checking
- [ ] Database conflict prevention
- [ ] Enhanced error handling

### Delightful Experience (Should Have)

- [ ] Admin dashboard for Emily
- [ ] Booking status workflow
- [ ] Improved mobile experience
- [ ] Performance optimizations

### Future Growth (Could Have)

- [ ] Multi-trainer support
- [ ] Payment integration
- [ ] Advanced scheduling features
- [ ] Analytics and reporting

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

### Existing Systems

- **Database**: Neon PostgreSQL with Prisma ORM
- **Email**: Nodemailer SMTP integration (fire-and-forget)
- **Deployment**: Vercel with GitHub Actions CI/CD
- **Monitoring**: Vercel Analytics + SpeedInsights
- **Testing**: Jest + Playwright + Lighthouse CI

### External Dependencies

- **Calendar Component**: Existing `react-day-picker` integration
- **Form Validation**: Zod schemas with TypeScript
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Authentication**: TBD for admin dashboard (Phase 3)

### API Evolution

- **Current**: `/api/book-session` (create only)
- **Phase 2**: `/api/availability` (read availability)
- **Phase 3**: `/api/bookings` (admin CRUD operations)

## Circuit Breakers & Scope Protection

### When to Stop and Re-evaluate

- Transaction implementation exceeds 2 weeks effort
- Availability API response times consistently >1 second
- Admin dashboard requires authentication complexity beyond simple password
- Any feature requires breaking existing functionality

### Scope Boundaries

- **In Scope**: Booking system reliability and Emily's admin needs
- **Out of Scope**: Multi-user auth, payment processing, advanced analytics
- **Future Scope**: Multi-trainer support, customer portal, mobile app

### Appetite Renewal Triggers

- Core transaction safety completed ahead of schedule
- Emily requests specific admin features during testing
- Performance improvements show significant user benefit
- New business requirements emerge from usage patterns

---

**Last Updated**: 2025-08-03  
**Current Appetite**: 4-6 weeks focused development  
**Next Review**: Weekly progress check-ins with scope adjustment
