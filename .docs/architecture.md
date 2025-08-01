# System Architecture

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **Email**: Nodemailer with Gmail SMTP
- **Testing**: Jest + React Testing Library + Playwright + MSW
- **Performance**: Vercel Analytics + SpeedInsights
- **Deployment**: Vercel with GitHub integration
- **Security**: Built-in Next.js security + rate limiting

## Database Design

### Schema Architecture

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

### Key Design Decisions

- **CUID Primary Keys**: Better for distributed systems, sortable by creation time
- **Nullable Fields**: Flexible schema for optional user input (phone, message, goals, experience)
- **Time Storage**: DateTime for precise dates, String for user-selected time slots
- **Audit Trail**: Automatic createdAt/updatedAt timestamps

## Core Components

### Booking System

- **Multi-step Wizard**: Progressive form with validation at each step
- **Calendar Integration**: Date/time selection with availability checking
- **Email Notifications**: Automated confirmations via Nodemailer + SMTP
- **Rate Limiting**: In-memory IP-based protection (5 requests/minute)

### Email Architecture

- **Fire-and-forget Pattern**: Non-blocking email sending
- **Provider Flexibility**: SMTP-agnostic (Gmail dev, professional SMTP production)
- **Error Resilience**: Email failures don't break booking flow
- **Template Management**: HTML/text templates in code

### Performance Monitoring

- **Vercel Analytics**: Zero-maintenance user behavior tracking
- **SpeedInsights**: Real-time Core Web Vitals monitoring (LCP, FID, CLS)
- **Automated Alerts**: Built-in performance regression notifications

## Security Architecture

### Input Validation

- **Zod Schemas**: Server-side validation with TypeScript integration
- **Sanitization**: Automatic React JSX escaping + DOMPurify for rich content
- **SQL Injection Prevention**: Prisma ORM parameterized queries

### Security Headers

```typescript
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; ..." },
]
```

### Rate Limiting Strategy

- **Implementation**: In-memory per-IP tracking
- **Limits**: 5 requests per minute per IP address
- **Rationale**: Simple, sufficient for current scale, cost-effective

## Testing Architecture

### Test Pyramid

- **Unit Tests**: Jest + React Testing Library (80% coverage minimum)
- **Integration Tests**: MSW for realistic API mocking
- **E2E Tests**: Playwright with accessibility validation
- **Performance Tests**: Lighthouse CI integration

### Testing Tools Integration

- **Jest**: Excellent Next.js integration, fast feedback loops
- **MSW**: Network-level mocking for realistic test scenarios
- **Playwright**: Superior browser automation with WCAG compliance testing

## System Constraints

- Single client business (Emily's fitness coaching)
- Solo developer with agentic LLM assistance
- FLOSS/free tools preferred
- Privacy-conscious solution choices
- Functionality over complexity
- Zero accessibility violations requirement

## Deployment Architecture

### Environment Strategy

- **Production**: Vercel deployment triggered by main branch
- **Preview**: Automatic preview deployments for all pull requests
- **Database**: Neon serverless PostgreSQL with connection pooling

### CI/CD Pipeline

- **GitHub Actions**: Lint, test, build, size-check, lighthouse audits
- **Quality Gates**: Critical tests must pass, non-critical tracked in debt
- **Vercel Integration**: Automatic deployments with rollback capability

## Future Considerations

### Scalability Enhancements

```prisma
// Potential future schema additions
model Booking {
  // ... existing fields
  status        BookingStatus @default(PENDING)
  sessionDuration Int?         // Minutes
  location        String?      // Session location
  trainerId       String?
  trainer         Trainer?     @relation(fields: [trainerId], references: [id])
  paymentId       String?
  payment         Payment?     @relation(fields: [paymentId], references: [id])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

### Performance Optimizations

- Image optimization strategy
- Database indexing for common queries
- Caching strategy for static content
- Bundle size optimization

## Key Architectural Decisions

1. **Next.js App Router**: Modern React patterns with SSR capabilities
2. **Prisma + Neon**: Type-safe database with serverless optimization
3. **Vercel Platform**: Zero-maintenance monitoring and deployment
4. **Mobile-First Design**: WCAG 2.1 AA compliance requirement
5. **Lean Development**: Functionality over unnecessary complexity
