# Architecture

## System Overview

MoodOverMuscle is a Next.js-based web application for a personal training business, focusing on mums returning to fitness. Built as a JAMstack application with serverless functions.

## Core Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel
- **Email**: Nodemailer
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

1. User fills booking form
2. Form validation (client + server)
3. Data stored in PostgreSQL via Prisma
4. Email notification sent via Nodemailer
5. Success confirmation to user

## Database Design

### Core Entities

```prisma
model Booking {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String
  goals       String
  experience  String
  createdAt   DateTime @default(now())
}
```

## API Design

### Endpoints

- `POST /api/book-session`: Handle booking form submissions
- Future: Authentication, user management, class scheduling

### Response Patterns

```typescript
// Success Response
{
  success: true,
  message: "Booking submitted successfully"
}

// Error Response
{
  success: false,
  error: "Validation failed",
  details: { field: "error message" }
}
```

## Deployment Architecture

### Vercel Platform

- **Build**: Next.js static generation + serverless functions
- **CDN**: Global edge network for static assets
- **Database**: PostgreSQL connection via connection pooling
- **Environment**: Production, Preview, Development branches

### Key Constraints

- **Serverless Functions**: 10-second timeout limit
- **Database Connections**: Connection pooling required
- **Build Time**: Optimized for fast deployment cycles
- **Static Assets**: Optimized via Next.js Image component

## Evolution Tracking

### v0.1.0 (Current)

- Basic booking system
- Single-page application
- PostgreSQL integration
- Email notifications

### Planned Evolution

- User authentication system
- Class scheduling interface
- Payment integration
- Admin dashboard
- Mobile app consideration

## Design Decisions

### Technology Choices

- **Next.js**: Full-stack React framework with excellent DX
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first styling for rapid development
- **PostgreSQL**: Reliable relational database for structured data
- **Vercel**: Seamless Next.js deployment and scaling

### Architecture Patterns

- **JAMstack**: Pre-built markup, APIs, and JavaScript
- **Component-Based**: Reusable UI components
- **Type-Safe**: End-to-end TypeScript coverage
- **Progressive Enhancement**: Works without JavaScript
- **Mobile-First**: Responsive design approach
