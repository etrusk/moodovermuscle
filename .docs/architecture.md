# Architecture

## System Overview

MoodOverMuscle is a Next.js-based web application for a personal training business, focusing on mums returning to fitness. Built as a JAMstack application with serverless functions.

## Core Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React + Tailwind CSS + shadcn/ui
- **Database**: Neon PostgreSQL with Prisma ORM
- **Deployment**: Vercel
- **Email**: Nodemailer (SMTP)
- **Testing**: Jest + React Testing Library + Playwright

## Application Architecture

### Frontend Structure

```
app/                    # Next.js App Router
├── layout.tsx         # Root layout with providers
├── page.tsx           # Homepage with all sections
├── classes/           # Classes page
└── api/               # API routes (serverless functions)

components/
├── sections/          # Page sections (Hero, About, etc.)
├── ui/               # Reusable UI components (shadcn/ui)
└── booking-form.tsx  # Main booking form component
```

### Key Components

- **Hero Section**: Value proposition and main CTA
- **About Section**: Personal story and credentials
- **How It Works**: Process explanation
- **Gallery**: Visual content showcase
- **Booking Form**: Session booking with validation
- **Footer**: Contact info and final CTA

### Data Flow

1. User fills booking form (3-step wizard with React Hook Form)
2. Client-side validation (Zod schema + real-time feedback)
3. Form submission to `/api/book-session` endpoint
4. Server-side validation (Zod schema safeParse)
5. Data stored in PostgreSQL via Prisma ORM
6. Non-blocking email notifications (fire-and-forget pattern)
   - Customer confirmation email
   - Admin notification email
7. Success response to client with booking data
8. Client shows success toast and resets form

## Database Design

### Core Entities

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

### Schema Evolution

- **Initial Migration** (`20250728050257_init`): Basic booking structure
- **Enhancement Migration** (`20250728050543_add_goals_and_experience_to_booking`): Added goals and experience fields for better customer profiling
- **Prisma Client Generation**: Custom output to `lib/generated/prisma` for organized code structure

## API Design

### Endpoints

- `POST /api/book-session`: Handle booking form submissions with email notifications
- Future: Authentication, user management, class scheduling

### Response Patterns

```typescript
// Success Response (201)
{
  message: "Booking submitted successfully!",
  data: {
    id: string,
    name: string,
    email: string,
    phone: string | null,
    service: string,
    date: string,
    time: string,
    message: string | null,
    goals: string | null,
    experience: string | null,
    createdAt: string,
    updatedAt: string
  }
}

// Validation Error Response (400)
{
  message: "Invalid form data.",
  errors: {
    [field: string]: string[]
  }
}

// Server Error Response (500)
{
  message: "Failed to submit booking.",
  error: string
}
```

### Email Service Architecture

#### SMTP Configuration

- **Provider**: Nodemailer with SMTP transport
- **Configuration**: Environment-based for production flexibility
- **Security**: Environment variable validation on startup
- **Error Handling**: Non-blocking fire-and-forget pattern

#### Email Templates

1. **Customer Confirmation**: Professional HTML/text email with booking details
2. **Admin Notification**: Action-oriented email with customer information and next steps

#### Implementation Pattern

```typescript
// Non-blocking email sending
sendCustomerConfirmation(bookingData)
  .then(res => {
    if (!res.success) {
      console.error('Email failed:', res.error)
    }
  })
  .catch(err => console.error('Email error:', err))
```

## Deployment Architecture

### Vercel Platform

- **Build**: Next.js static generation + serverless functions
- **CDN**: Global edge network for static assets
- **Database**: Neon PostgreSQL with serverless connection pooling
- **Environment**: Production, Preview, Development branches

### Key Constraints

- **Serverless Functions**: 10-second timeout limit
- **Database Connections**: Connection pooling required
- **Build Time**: Optimized for fast deployment cycles
- **Static Assets**: Optimized via Next.js Image component

## Evolution Tracking

### v1.0.0 (Current - Production Ready)

- Complete booking system with 3-step wizard UI
- PostgreSQL database with comprehensive schema
- SMTP email notification system (customer + admin)
- Comprehensive testing suite (unit + integration + e2e)
- Production deployment with performance optimization
- Accessibility compliance (WCAG 2.1 AA)
- Error handling and user feedback systems

### Implementation Insights

#### Email Service Design Decisions

- **Fire-and-forget pattern**: Prevents booking failures due to email issues
- **Dual notifications**: Customer confirmation + admin alerts
- **Environment flexibility**: SMTP configuration supports various providers
- **Error resilience**: Email failures logged but don't affect user experience

#### Form Architecture

- **Multi-step wizard**: Improves user experience and completion rates
- **Real-time validation**: Zod schemas provide immediate feedback
- **Loading states**: Visual feedback during submission with disabled controls
- **Error recovery**: Network failures handled gracefully with retry capability

#### Database Design

- **CUID primary keys**: Better for distributed systems than auto-increment
- **Nullable fields**: Flexible schema accommodates optional user input
- **Timestamp tracking**: Automatic createdAt/updatedAt for audit trails
- **Type safety**: Prisma generates TypeScript types for compile-time safety

### Planned Evolution

- User authentication system
- Class scheduling interface with availability management
- Payment integration (Stripe/PayPal)
- Admin dashboard for booking management
- Mobile app consideration
- Advanced email templates with branding

## Design Decisions

### Technology Choices

- **Next.js**: Full-stack React framework with excellent DX and App Router
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first styling for rapid development
- **PostgreSQL**: Reliable relational database for structured data
- **Prisma ORM**: Type-safe database access with excellent DX
- **Vercel**: Seamless Next.js deployment and scaling
- **Nodemailer**: SMTP email service for reliability and FLOSS compatibility

### Architecture Patterns

- **JAMstack**: Pre-built markup, APIs, and JavaScript
- **Component-Based**: Reusable UI components with shadcn/ui
- **Type-Safe**: End-to-end TypeScript coverage with Zod validation
- **Progressive Enhancement**: Works without JavaScript
- **Mobile-First**: Responsive design approach
- **Fire-and-Forget**: Non-blocking email service for optimal UX
- **Atomic Commits**: TDD workflow with frequent, small commits

### Key Architectural Decisions

#### Email Service Choice: Nodemailer + SMTP

- **Rationale**: FLOSS compatibility, production flexibility, reliability
- **Alternative Considered**: Resend, SendGrid (rejected due to vendor lock-in)
- **Implementation**: Environment-configurable SMTP with error resilience

#### Database Schema Design

- **Nullable vs Required**: Balanced approach - core fields required, optional fields nullable
- **CUID vs UUID**: CUID chosen for better readability and collision resistance
- **Timestamp Strategy**: Automatic Prisma timestamps for audit trails

#### Form UX Architecture

- **Multi-step vs Single Page**: Multi-step chosen for better completion rates
- **Validation Strategy**: Client + server validation with Zod for consistency
- **Error Handling**: Graceful degradation with clear user feedback

#### Testing Strategy

- **Unit + Integration + E2E**: Comprehensive coverage across all layers
- **MSW for Mocking**: Realistic API mocking for consistent test behavior
- **Accessibility Testing**: Automated WCAG compliance validation
