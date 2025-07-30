# API Specification

## Overview

This document serves as the single source of truth for all API-related development and testing in the MoodOverMuscle application. It consolidates API contracts, data schemas, security patterns, and testing specifications to support lean TDD workflows.

## API Endpoints

### POST /api/book-session

**Purpose**: Create a new session booking

**Request Schema**:

```typescript
interface BookingRequest {
  name: string // Required, min 2 chars
  email: string // Required, valid email format
  phone: string // Required, min 10 chars
  service: string // Required, service type selection
  date: string // Required, ISO date string (coerced to Date)
  time: string // Required, time selection
  message?: string // Optional, max 500 chars
  goals: string // Required, fitness goals selection
  experience?: string // Optional, experience level
}
```

**Response Schema**:

```typescript
// Success Response (201)
interface BookingSuccessResponse {
  message: string // "Booking submitted successfully!"
  data: {
    id: string // CUID
    name: string
    email: string
    phone: string | null
    service: string
    date: string // ISO date string
    time: string
    message: string | null
    goals: string | null
    experience: string | null
    createdAt: string // ISO date string
    updatedAt: string // ISO date string
  }
}

// Validation Error Response (400)
interface BookingValidationErrorResponse {
  message: string // "Invalid form data."
  errors: {
    [field: string]: string[] // Field-specific error messages
  }
}

// Server Error Response (500)
interface BookingServerErrorResponse {
  message: string // "Failed to submit booking."
  error: string // Error details
}
```

**Validation Rules**:

- `name`: Required, minimum 2 characters
- `email`: Required, valid email format
- `phone`: Required, minimum 10 characters
- `service`: Required, must be selected from available options
- `date`: Required, valid date string (automatically coerced to Date object)
- `time`: Required, must be selected from available time slots
- `message`: Optional, maximum 500 characters
- `goals`: Required, must be selected from available goal options
- `experience`: Optional, experience level selection

**HTTP Status Codes**:

- `201`: Booking created successfully
- `400`: Validation error with detailed field errors
- `500`: Internal server error with error message

**Side Effects**:

- Sends customer confirmation email (non-blocking)
- Sends admin notification email (non-blocking)
- Email failures don't affect API response

## Data Models

### Booking Model

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

**Field Specifications**:

- `id`: CUID primary key, auto-generated
- `name`: Client's full name
- `email`: Client's email address for communication
- `phone`: Client's contact phone number (nullable in schema but required by validation)
- `service`: Type of fitness service requested
- `date`: Client's preferred session date (stored as DateTime)
- `time`: Client's preferred session time (stored as string)
- `message`: Optional additional message from client
- `goals`: Client's fitness goals (nullable in schema but required by validation)
- `experience`: Client's fitness experience level (optional)
- `createdAt`: Record creation timestamp
- `updatedAt`: Record last modification timestamp

## Security Specifications

### Input Validation

- All input fields validated using Zod schemas before database operations
- SQL injection prevention through Prisma ORM parameterized queries
- XSS prevention through React's automatic JSX escaping
- Input sanitization for all string fields

**Zod Validation Schema**:

```typescript
export const bookingSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  service: z.string({ required_error: 'Please select a service.' }),
  date: z
    .string()
    .pipe(z.coerce.date({ required_error: 'Please select a date.' })),
  time: z.string({ required_error: 'Please select a time.' }),
  message: z
    .string()
    .max(500, { message: 'Message must be less than 500 characters.' })
    .optional(),
  goals: z.string({ required_error: 'Please select a goal.' }),
  experience: z.string().optional(),
})
```

### Security Headers (from SECURITY.md)

- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `X-XSS-Protection`: 1; mode=block
- `Referrer-Policy`: strict-origin-when-cross-origin
- Content Security Policy configured

### API Security Patterns

```typescript
// Rate limiting implementation (recommended)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
})

// CORS handling for production
const allowedOrigins = ['https://moodovermuscle.com.au']
if (!allowedOrigins.includes(origin)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

### Data Protection

- Email addresses stored securely in PostgreSQL
- Phone numbers stored as strings (consider encryption for production)
- Personal data handling complies with privacy requirements
- No authentication currently required for booking endpoint

## Email Integration Specifications

### Email Service Configuration

```typescript
// SMTP Configuration (Nodemailer)
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}
```

### Email Templates

1. **Customer Confirmation Email**: Sent to booking requester
2. **Admin Notification Email**: Sent to Emily for new bookings

### Email Error Handling

- Email sending is non-blocking (fire-and-forget)
- Email failures don't affect API response success
- Email send results logged for monitoring
- Consider adding email retry logic for production

## Test Data Structures

### Valid Test Booking Data

```typescript
export const VALID_BOOKING_DATA = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '0412345678',
  service: 'Personal Training',
  date: '2024-08-15',
  time: '09:00',
  message: 'Looking forward to the session',
  goals: 'Weight Loss',
  experience: 'Beginner',
}
```

### Invalid Test Cases

```typescript
export const INVALID_BOOKING_CASES = {
  missingName: { ...VALID_BOOKING_DATA, name: '' },
  shortName: { ...VALID_BOOKING_DATA, name: 'J' },
  invalidEmail: { ...VALID_BOOKING_DATA, email: 'invalid-email' },
  shortPhone: { ...VALID_BOOKING_DATA, phone: '123' },
  missingService: { ...VALID_BOOKING_DATA, service: '' },
  invalidDate: { ...VALID_BOOKING_DATA, date: 'invalid-date' },
  missingTime: { ...VALID_BOOKING_DATA, time: '' },
  longMessage: { ...VALID_BOOKING_DATA, message: 'x'.repeat(501) },
  missingGoals: { ...VALID_BOOKING_DATA, goals: '' },
}
```

### Mock Response Data

```typescript
export const MOCK_BOOKING_RESPONSE = {
  message: 'Booking submitted successfully!',
  data: {
    id: 'clktest123456789',
    ...VALID_BOOKING_DATA,
    phone: VALID_BOOKING_DATA.phone,
    message: VALID_BOOKING_DATA.message,
    goals: VALID_BOOKING_DATA.goals,
    experience: VALID_BOOKING_DATA.experience,
    createdAt: '2024-08-01T10:00:00.000Z',
    updatedAt: '2024-08-01T10:00:00.000Z',
  },
}

export const MOCK_VALIDATION_ERROR = {
  message: 'Invalid form data.',
  errors: {
    name: ['Name must be at least 2 characters.'],
    email: ['Please enter a valid email address.'],
  },
}
```

## Error Handling Patterns

### Validation Errors (400)

```typescript
// Zod validation error response structure
{
  message: "Invalid form data.",
  errors: {
    [fieldName]: ["Error message 1", "Error message 2"]
  }
}
```

### Server Errors (500)

```typescript
// Internal server error response
{
  message: "Failed to submit booking.",
  error: "Database connection failed" // Specific error details
}
```

### Email Service Errors

- Email failures are logged but don't affect API response
- Customer receives successful booking confirmation from API
- Admin should monitor email service separately

## Database Integration

### Prisma Client Configuration

```typescript
// lib/prisma.ts
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // Query logging enabled
  })

// Development-only global caching
if (process.env.NODE_ENV !== 'production') global.prisma = prisma
```

### Database Connection

- PostgreSQL database via `DATABASE_URL` environment variable
- Prisma generates client in `lib/generated/prisma`
- Connection pooling handled by Prisma
- Query logging enabled for debugging

### Migration History

- `20250728050257_init`: Initial schema creation
- `20250728050543_add_goals_and_experience_to_booking`: Added goals and experience fields

## Testing Interface Contracts

### MSW Handlers for API Mocking

```typescript
// From docs/TESTING.md patterns
export const bookingHandlers = [
  // Successful booking
  http.post('/api/book-session', async ({ request }) => {
    const booking = await request.json()
    return HttpResponse.json(MOCK_BOOKING_RESPONSE, { status: 201 })
  }),

  // Validation error scenario
  http.post('/api/book-session/validation-error', () => {
    return HttpResponse.json(MOCK_VALIDATION_ERROR, { status: 400 })
  }),

  // Server error scenario
  http.post('/api/book-session/server-error', () => {
    return HttpResponse.json(
      { message: 'Failed to submit booking.', error: 'Database error' },
      { status: 500 }
    )
  }),

  // Network timeout simulation
  http.post('/api/book-session/timeout', () => {
    return new Promise(() => {}) // Never resolves
  }),
]
```

### Integration Test Patterns

```typescript
// End-to-end booking flow testing
interface BookingFlowTest {
  userInput: BookingRequest
  expectedDatabaseRecord: Partial<Booking>
  expectedEmailsSent: {
    customer: boolean
    admin: boolean
  }
  expectedResponse: BookingSuccessResponse
}
```

### Unit Test Contracts

```typescript
// API route testing interface
describe('POST /api/book-session', () => {
  it('should create booking with valid data', async () => {
    const response = await POST(mockRequest)
    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({
      message: 'Booking submitted successfully!',
      data: expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      }),
    })
  })
})
```

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/moodovermuscle"

# Email Service (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@moodovermuscle.com.au"
EMAIL_FROM_NAME="Mood Over Muscle"
ADMIN_EMAIL="emily@moodovermuscle.com.au"

# Optional Development
NODE_ENV="development" # or "production"
```

### Development vs Production

- **Development**: Local PostgreSQL or SQLite
- **Production**: Managed PostgreSQL service (e.g., Vercel Postgres)
- **Email**: Development uses SMTP, production may use service like Resend
- **Logging**: Query logging enabled in development

## Performance Specifications

### Response Time Targets

- Booking creation: < 500ms (95th percentile, excluding email)
- Database write: < 100ms (95th percentile)
- Email sending: < 2s (async, non-blocking)

### Async Operations

- Email sending is fire-and-forget to avoid blocking API response
- Consider implementing email queue for high-volume scenarios
- Email failures don't affect user experience

### Database Optimization

- Prisma connection pooling configured
- Indexed fields: `id` (primary key), `email`, `createdAt`
- Consider adding indexes on `date` and `service` for admin queries

## Migration Specifications

### Current Schema State

- Latest migration: `20250728050543_add_goals_and_experience_to_booking`
- Database provider: PostgreSQL
- Prisma client generation: `lib/generated/prisma`

### Migration Strategy

```bash
# Generate migration
npx prisma migrate dev --name description_of_change

# Apply migrations to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Future Schema Evolution

```prisma
// Potential enhancements
model Booking {
  // ... existing fields

  // Status tracking
  status        BookingStatus @default(PENDING)

  // Enhanced metadata
  sessionDuration Int?         // Minutes
  location        String?      // Session location
  notes           String?      // Admin notes

  // Relations (future)
  trainerId       String?
  trainer         Trainer?     @relation(fields: [trainerId], references: [id])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

## API Evolution & Versioning

### Current Version

- API Version: v1 (implicit, no versioning implemented)
- Endpoint: `/api/book-session`

### Future Versioning Strategy

- URL-based versioning: `/api/v1/book-session`, `/api/v2/book-session`
- Backwards compatibility maintained for 2 major versions
- Clear deprecation notices and migration guides

### Planned API Enhancements

```typescript
// Future endpoints
GET    /api/v2/bookings           // List bookings (admin)
PUT    /api/v2/bookings/:id       // Update booking status
DELETE /api/v2/bookings/:id       // Cancel booking
POST   /api/v2/auth/login         // Admin authentication
GET    /api/v2/availability       // Check trainer availability
POST   /api/v2/bookings/:id/confirm // Confirm booking
```

## Development Workflow Support

### TDD Test Patterns

1. **Red Phase**: Write failing test with expected API contract
2. **Green Phase**: Implement minimal API logic to pass test
3. **Refactor Phase**: Optimize while maintaining contract compliance

### Mock Data Generation

```typescript
// Factory function for test data generation
export function createBookingTestData(
  overrides?: Partial<BookingRequest>
): BookingRequest {
  return {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    phone: '0412345678',
    service: 'Personal Training',
    date: '2024-12-01',
    time: '09:00',
    message: 'Test booking message',
    goals: 'Weight Loss',
    experience: 'Beginner',
    ...overrides,
  }
}
```

### API Contract Validation

- Zod schemas for runtime validation
- TypeScript interfaces for compile-time checks
- MSW handlers for consistent mocking
- Integration tests for end-to-end validation

## Security Monitoring & Logging

### Security Event Logging

```typescript
// Security event patterns to monitor
export interface SecurityEvent {
  type: 'validation_error' | 'rate_limit_exceeded' | 'suspicious_activity'
  ip: string
  userAgent: string
  payload?: any
  timestamp: string
}

// Example logging in API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  try {
    const validatedData = bookingSchema.safeParse(formData)
    if (!validatedData.success) {
      // Log validation failures for monitoring
      console.warn('Booking validation failed', {
        ip,
        errors: validatedData.error.flatten().fieldErrors,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    // Log unexpected errors
    console.error('Booking API error', { ip, error: error.message })
  }
}
```

### Rate Limiting Implementation

```typescript
// Recommended rate limiting for booking endpoint
const bookingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 booking attempts per IP per window
  message: 'Too many booking attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: request => {
    return request.headers.get('x-forwarded-for') || 'anonymous'
  },
})
```

## Documentation Maintenance

This API specification should be updated whenever:

- New endpoints are added
- Request/response schemas change
- Validation rules are modified
- Database schema evolves
- Security requirements change
- Testing patterns are updated

**Last Updated**: 2025-07-30  
**Version**: 1.0  
**Next Review**: 2025-08-30

---

_This specification supports the lean TDD workflow by providing clear interface contracts, comprehensive test data, and structured migration specifications for continuous development and deployment._
