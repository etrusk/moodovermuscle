# MoodOverMuscle Implementation Roadmap

**Last Updated**: 2025-10-18  
**Status**: Strategic planning for post-MVP enhancements  
**Source**: Analysis of similar fitness booking platforms and best practices

---

## Overview

This roadmap prioritizes implementation based on business impact, technical feasibility, and pattern reuse opportunities. All recommendations respect the constraints of solo development + AI assistance, privacy-first approach, and appetite-based scoping.

**Current Foundation**: Production-ready booking system with transaction safety, real-time availability, admin dashboard, and comprehensive testing.

---

## Tier 1: High-Impact Business Value (Weeks 1-8)

### 1. **Automated Reminder System** ⭐ HIGHEST PRIORITY

**Business Impact**: 20-30% reduction in no-shows (industry standard)

**Implementation**:
- Email reminder 24 hours before session
- SMS option via Twilio (optional upgrade path)
- Fire-and-forget pattern (leverages existing Nodemailer setup)

**Technical Details**:
- **New Components**: 
  - Cron job or scheduled task (Vercel Cron or similar)
  - Reminder template (HTML/text email)
  - Database query for upcoming bookings
- **Pattern Reuse**: Fire-and-forget email architecture from [`architecture.md`](.docs/architecture.md:249-277)
- **Complexity**: Low (3/10)
- **Appetite**: 1 week

**Success Metrics**:
- Email delivery rate >95%
- No-show rate reduction of 20%+
- Zero impact on booking performance

**Files to Create**:
- `lib/email/reminder-templates.ts` - Reminder email templates
- `lib/cron/send-reminders.ts` - Scheduled reminder job
- `__tests__/lib/email/reminder.test.ts` - Reminder tests

---

### 2. **Booking Cancellation Self-Service**

**Business Impact**: 30-40% reduction in Emily's admin overhead

**Implementation**:
- Unique cancellation links in confirmation emails
- 24-hour cancellation window policy enforcement
- Automatic email notification to Emily on cancellations
- Audit trail via existing `BookingStatusChange` table

**Technical Details**:
- **New Components**:
  - `/api/booking/cancel` endpoint with token validation
  - Signed cancellation tokens (JWT pattern)
  - Email template with cancellation link
- **Pattern Reuse**: 
  - JWT authentication from [`architecture.md`](.docs/architecture.md:360-376)
  - Status transition pattern from Prisma schema
  - Transaction safety for cancellation logic
- **Complexity**: Medium (5/10)
- **Appetite**: 1 week

**Success Metrics**:
- 80%+ clients use self-service cancellation
- Zero accidental cancellations (token validation works)
- Emily admin time reduced by 30%+

**Schema Changes**:
```prisma
// Add to Booking model
cancellationToken String? @unique
cancellationDeadline DateTime?
```

**Files to Create**:
- `app/api/booking/cancel/route.ts` - Cancellation API
- `lib/auth/cancellation-tokens.ts` - Token generation/validation
- `lib/email/templates/cancellation-link.ts` - Email template
- `__tests__/api/booking-cancellation-self-service.test.ts` - Tests

---

### 3. **Client Portal (View Booking History)**

**Business Impact**: Reduces "when is my next session?" inquiries by 60%+

**Implementation**:
- Magic link authentication (email-based, no password)
- View upcoming bookings
- View past session history
- Mobile-responsive design

**Technical Details**:
- **New Components**:
  - `/client/bookings` page with authentication
  - Magic link generation and validation
  - Client booking list component
- **Pattern Reuse**:
  - JWT authentication pattern from admin dashboard
  - Edge middleware for route protection
  - Booking list UI patterns from admin dashboard
- **Complexity**: Medium (6/10)
- **Appetite**: 2 weeks

**Success Metrics**:
- 70%+ clients access portal within first month
- <5% support inquiries about booking status
- Zero unauthorized access incidents

**Schema Changes**:
```prisma
// Add to Booking model
clientAccessToken String? @unique
clientAccessExpiry DateTime?
```

**Files to Create**:
- `app/client/bookings/page.tsx` - Client booking list
- `app/api/client/auth/route.ts` - Magic link authentication
- `middleware-client.ts` - Client route protection
- `lib/email/templates/magic-link.ts` - Magic link email
- `__tests__/app/client/bookings.test.tsx` - Component tests
- `__tests__/integration/client-portal.test.ts` - Integration tests

---

## Tier 2: Operational Efficiency (Weeks 9-20)

### 4. **Recurring Booking Support**

**Business Impact**: Reduces repetitive booking work, locks in client commitment

**Implementation**:
- "Book recurring session" option (e.g., every Tuesday 9am for 6 weeks)
- Bulk availability checking for series
- Email confirmation with full series details
- Single cancellation affects only that session, not entire series

**Technical Details**:
- **New Components**:
  - Recurring booking wizard step
  - Bulk availability validation
  - Series management in admin dashboard
- **Pattern Reuse**:
  - Transaction safety for bulk booking creation
  - Existing availability checking with multi-slot validation
  - Multi-step wizard pattern
- **Complexity**: High (7/10)
- **Appetite**: 2 weeks

**Success Metrics**:
- 40%+ clients book recurring sessions
- Zero double-booking incidents in series
- Series completion rate >80%

**Schema Changes**:
```prisma
model RecurringSeries {
  id          String    @id @default(cuid())
  clientEmail String
  dayOfWeek   Int       // 0-6 (Sunday-Saturday)
  time        String
  service     String
  startDate   DateTime
  endDate     DateTime
  bookings    Booking[] @relation("SeriesBookings")
  createdAt   DateTime  @default(now())
  
  @@index([clientEmail])
}

// Add to Booking model
seriesId String?
series   RecurringSeries? @relation("SeriesBookings", fields: [seriesId], references: [id])
```

**Files to Create**:
- `app/api/booking/recurring/route.ts` - Recurring booking API
- `lib/booking/recurring-validation.ts` - Bulk availability checking
- `components/booking-form/RecurringStep.tsx` - Recurring wizard step
- `__tests__/api/recurring-booking.test.ts` - Tests

---

### 5. **Waitlist Management**

**Business Impact**: Maximizes booking utilization, captures lost revenue

**Implementation**:
- "Join waitlist" button when slot full
- Auto-notify waitlist on cancellations (FIFO order)
- 2-hour response window before moving to next person
- Admin view of waitlist in dashboard

**Technical Details**:
- **New Components**:
  - Waitlist table with priority queue
  - Automated notification system
  - Admin waitlist management UI
- **Pattern Reuse**:
  - Fire-and-forget email notifications
  - Admin dashboard CRUD patterns
  - Status transition tracking
- **Complexity**: Medium (6/10)
- **Appetite**: 1.5 weeks

**Success Metrics**:
- Booking utilization increases to 90%+
- Waitlist conversion rate >60%
- Zero manual waitlist management by Emily

**Schema Changes**:
```prisma
model Waitlist {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String?
  service     String
  date        DateTime
  time        String
  priority    Int      @default(0)
  notified    Boolean  @default(false)
  notifiedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  
  @@unique([email, date, time])
  @@index([date, time, notified])
}
```

**Files to Create**:
- `app/api/waitlist/route.ts` - Waitlist management API
- `app/admin/waitlist/page.tsx` - Admin waitlist view
- `lib/waitlist/notification-queue.ts` - FIFO notification logic
- `lib/cron/process-waitlist.ts` - Automated waitlist processing
- `__tests__/api/waitlist.test.ts` - Tests

---

### 6. **Session Notes & Progress Tracking**

**Business Impact**: Improves service quality, professionalism, client retention

**Implementation**:
- Admin dashboard: Add notes to completed sessions
- Track goals/achievements over time
- View client history across sessions
- Rich text support for detailed notes

**Technical Details**:
- **New Components**:
  - Session notes editor in admin dashboard
  - Client history timeline view
  - Rich text editor (TipTap or similar)
- **Pattern Reuse**:
  - Admin dashboard CRUD operations
  - Booking relationship queries
  - Form validation patterns
- **Complexity**: Medium (5/10)
- **Appetite**: 1.5 weeks

**Success Metrics**:
- Emily adds notes to 80%+ completed sessions
- Client retention improves by 15%+
- Zero data loss incidents

**Schema Changes**:
```prisma
model SessionNote {
  id          String   @id @default(cuid())
  booking     Booking  @relation(fields: [bookingId], references: [id])
  bookingId   String
  content     String   @db.Text
  goals       String?  @db.Text
  achievements String? @db.Text
  nextSteps   String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([bookingId])
}

// Add to Booking model
notes SessionNote[]
```

**Files to Create**:
- `app/admin/bookings/[id]/notes/page.tsx` - Session notes editor
- `app/api/admin/notes/route.ts` - Notes CRUD API
- `components/admin/SessionNotesEditor.tsx` - Rich text editor
- `__tests__/app/api/admin/notes.test.ts` - API tests

---

## Tier 3: Revenue & Growth (Weeks 21-35)

### 7. **Payment Integration (Stripe)**

**Business Impact**: Enables revenue from repeat clients, reduces no-shows

**Implementation**:
- Stripe Checkout integration for paid sessions
- Package pricing (5-session bundles at discount)
- Free first session logic preserved
- Stripe webhook handling for payment confirmation

**Technical Details**:
- **New Components**:
  - Stripe Checkout session creation
  - Webhook endpoint for payment events
  - Payment status tracking
  - Admin revenue dashboard
- **Pattern Reuse**:
  - Fire-and-forget webhook processing
  - Transaction safety for payment state changes
  - Admin dashboard patterns
- **Complexity**: High (8/10)
- **Appetite**: 2-3 weeks

**Success Metrics**:
- Payment conversion rate >60%
- Zero payment errors
- Package purchase rate >40%

**Schema Changes**:
```prisma
model Payment {
  id              String   @id @default(cuid())
  booking         Booking  @relation(fields: [bookingId], references: [id])
  bookingId       String   @unique
  stripeSessionId String   @unique
  amount          Int      // in cents
  currency        String   @default("AUD")
  status          PaymentStatus @default(PENDING)
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([status])
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

model Package {
  id          String   @id @default(cuid())
  name        String
  sessions    Int
  price       Int      // in cents
  description String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}

// Add to Booking model
payment     Payment?
packageId   String?
```

**Files to Create**:
- `app/api/payment/checkout/route.ts` - Stripe Checkout session
- `app/api/payment/webhook/route.ts` - Stripe webhook handler
- `lib/payment/stripe-client.ts` - Stripe SDK wrapper
- `app/admin/revenue/page.tsx` - Revenue dashboard
- `__tests__/api/payment.test.ts` - Payment tests

**Environment Variables**:
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

### 8. **Class/Group Session Support**

**Business Impact**: New revenue stream, community building

**Implementation**:
- Multi-participant bookings (capacity limits)
- Different pricing for group vs personal training
- Participant roster view in admin dashboard
- Group-specific email notifications

**Technical Details**:
- **New Components**:
  - Group session type selection
  - Capacity management
  - Participant list view
  - Group email templates
- **Pattern Reuse**:
  - Booking wizard with service type selection
  - Availability checking with capacity constraints
  - Transaction safety for concurrent bookings
- **Complexity**: High (7/10)
- **Appetite**: 2 weeks

**Success Metrics**:
- Group class fill rate >75%
- Revenue per hour increases 40%+
- Community engagement improves

**Schema Changes**:
```prisma
model GroupSession {
  id            String   @id @default(cuid())
  name          String
  description   String?
  maxCapacity   Int
  currentCount  Int      @default(0)
  date          DateTime
  time          String
  duration      Int      @default(60)
  price         Int      // in cents
  bookings      Booking[] @relation("GroupBookings")
  createdAt     DateTime @default(now())
  
  @@unique([date, time])
  @@index([date])
}

// Add to Booking model
groupSessionId String?
groupSession   GroupSession? @relation("GroupBookings", fields: [groupSessionId], references: [id])
isGroupSession Boolean @default(false)
```

**Files to Create**:
- `app/api/group-session/route.ts` - Group session API
- `app/admin/group-sessions/page.tsx` - Group session management
- `components/booking-form/GroupSessionStep.tsx` - Group booking UI
- `__tests__/api/group-session.test.ts` - Tests

---

### 9. **Client Communication Hub**

**Business Impact**: Professional communication, reduced email management

**Implementation**:
- In-app messaging between Emily and clients
- Broadcast announcements to all clients
- Push notifications for important updates
- Email fallback for offline clients

**Technical Details**:
- **New Components**:
  - Messaging UI in client portal and admin dashboard
  - Notification service
  - Message storage and retrieval
- **Pattern Reuse**:
  - Fire-and-forget email notifications as fallback
  - JWT authentication for message access
  - Real-time updates (optional WebSocket)
- **Complexity**: High (8/10)
- **Appetite**: 2-3 weeks

**Success Metrics**:
- 60%+ clients use messaging vs email
- Emily's email management time reduced 50%+
- Message delivery rate >95%

**Schema Changes**:
```prisma
model Message {
  id          String   @id @default(cuid())
  senderId    String   // adminId or client email
  senderType  SenderType
  recipientId String   // adminId or client email
  subject     String?
  content     String   @db.Text
  read        Boolean  @default(false)
  readAt      DateTime?
  createdAt   DateTime @default(now())
  
  @@index([recipientId, read])
  @@index([createdAt])
}

enum SenderType {
  ADMIN
  CLIENT
}

model Announcement {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  sentAt    DateTime @default(now())
  createdBy String   // adminId
  
  @@index([sentAt])
}
```

**Files to Create**:
- `app/api/messages/route.ts` - Messaging API
- `app/client/messages/page.tsx` - Client messaging UI
- `app/admin/messages/page.tsx` - Admin messaging UI
- `lib/notifications/push-service.ts` - Push notification service
- `__tests__/api/messages.test.ts` - Tests

---

## Tier 4: Analytics & Insights (Week 36+)

### 10. **Business Analytics Dashboard**

**Business Impact**: Data-driven scheduling decisions, growth tracking

**Implementation**:
- Booking trends (weekly/monthly charts)
- Popular time slots heatmap
- Client retention metrics
- Revenue tracking (post-payment integration)

**Technical Details**:
- **New Components**:
  - Analytics dashboard page
  - Chart components (Recharts or similar)
  - Data aggregation queries
  - Export functionality (CSV/PDF)
- **Pattern Reuse**:
  - Admin dashboard layout patterns
  - Read-only database queries
  - Existing Vercel Analytics integration
- **Complexity**: Medium (6/10)
- **Appetite**: 1.5 weeks

**Success Metrics**:
- Emily checks dashboard weekly
- Data-driven decisions increase revenue 15%+
- Zero performance impact from analytics queries

**Files to Create**:
- `app/admin/analytics/page.tsx` - Analytics dashboard
- `app/api/admin/analytics/route.ts` - Analytics data API
- `lib/analytics/aggregations.ts` - Data aggregation logic
- `components/admin/charts/` - Chart components
- `__tests__/app/api/admin/analytics.test.ts` - Tests

---

## Anti-Recommendations (Don't Build Yet)

❌ **Multi-trainer support** - Emily is solo; premature complexity (wait 6+ months for business growth)

❌ **Mobile app** - Progressive Web App sufficient; native apps = maintenance burden without clear ROI

❌ **AI workout planning** - Scope creep; Emily's expertise is the product, not automation

❌ **Social features** - Instagram handles community; don't rebuild social network

❌ **Custom CRM** - Overkill for current scale; spreadsheet + session notes sufficient

❌ **Video conferencing** - Use existing tools (Zoom/Meet); integration complexity not justified

❌ **Inventory management** - Not applicable to fitness coaching business model

❌ **Advanced reporting** - Analytics dashboard covers 80% of needs; complex reports can wait

---

## Implementation Strategy

### Recommended 3-Month Plan

**Month 1 (Weeks 1-4)**:
1. Week 1-2: Automated reminder system (Tier 1 #1)
2. Week 3-4: Booking cancellation self-service (Tier 1 #2)

**Month 2 (Weeks 5-8)**:
3. Week 5-8: Client portal for booking history (Tier 1 #3)

**Month 3 (Weeks 9-12)**:
4. Week 9-11: Recurring booking support (Tier 2 #4)
5. Week 12: Evaluate and plan Tier 2 continuation

### Evaluation Checkpoints

**After Month 1**:
- Review no-show rate reduction
- Measure Emily's admin time savings
- Gather client feedback on self-service features

**After Month 2**:
- Client portal adoption rate
- Support inquiry reduction
- User experience feedback

**After Month 3**:
- Recurring booking usage
- Revenue impact assessment
- Decide on payment integration timing

**After 3 Months, Evaluate**:
- Payment integration readiness (client demand for paid sessions)
- Group class viability (Emily's capacity and interest)
- Analytics needs (data-driven decision requirements)

---

## Pattern Reuse Opportunities

✅ **Email notifications** - Extend existing fire-and-forget Nodemailer setup from [`architecture.md`](.docs/architecture.md:249-277)

✅ **JWT authentication** - Reuse admin auth pattern for client portal from [`architecture.md`](.docs/architecture.md:360-376)

✅ **Transaction safety** - Apply existing Prisma transaction patterns to recurring bookings

✅ **Admin CRUD** - Copy admin booking management patterns for session notes

✅ **Status transitions** - Extend `BookingStatusChange` pattern for waitlist state machine

✅ **Multi-step wizard** - Reuse booking wizard architecture for recurring sessions

✅ **Real-time availability** - Extend existing availability API for capacity checking

---

## Success Metrics by Tier

**Tier 1 Goals**:
- 30% reduction in Emily's admin time
- 20% no-show reduction
- 70%+ client portal adoption

**Tier 2 Goals**:
- 80%+ booking slot utilization
- 40% clients using recurring bookings
- Zero manual waitlist management

**Tier 3 Goals**:
- Payment conversion rate >60%
- Group class fill rate >75%
- Revenue per hour increases 40%+

**Tier 4 Goals**:
- Data-driven scheduling increases weekly revenue by 15%
- Emily uses analytics dashboard weekly
- Business insights inform growth decisions

---

## Technical Constraints

All recommendations respect:
- Solo development + AI assistance workflow
- Privacy-first approach (minimal data collection)
- Proven technology stack (Next.js, Prisma, PostgreSQL)
- Appetite-based scoping (1-3 week increments)
- Pattern reuse from existing codebase
- Quality gates enforcement (tests, accessibility, security)

---

## Related Documentation

- **[System Architecture](.docs/architecture.md)** - Technical patterns and constraints
- **[Project Specification](.docs/spec.md)** - Business requirements and current status
- **[Pattern Library](.docs/patterns/index.md)** - Reusable implementation patterns
- **[Known Issues](.docs/investigations/index.md)** - Debugging reference
- **[Development Workflow](.docs/workflow.md)** - Quality gates and processes

---

**Next Steps**: Review this roadmap with Emily to prioritize based on immediate business needs. Start with Tier 1 features for maximum impact with minimal complexity.