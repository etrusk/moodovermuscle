# API Specification & Contract Management

Comprehensive API documentation for MoodOverMuscle booking system, defining interface contracts and integration points for reliable system integration.

## API Overview

### Base Configuration

- **Base URL**: `https://moodovermuscle.vercel.app/api`
- **Authentication**: JWT tokens for admin endpoints
- **Content Type**: `application/json`
- **Rate Limiting**: 5 requests per 15 minutes per IP for booking endpoints
- **Versioning**: URL path versioning (`/api/v1/`) when needed

### Response Format Standards

```typescript
// Success Response
interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
  timestamp: string
}

// Error Response
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}
```

## Core Endpoints

### Booking Management

#### Create Booking

```http
POST /api/book-session
```

**Request Body**:

```typescript
interface BookingRequest {
  name: string // min 2 chars
  email: string // valid email format
  phone?: string // min 10 chars if provided
  service: string // required selection
  date: string // ISO date string
  time: string // 24-hour format "HH:MM"
  message?: string // max 500 chars
  goals: string // required selection
  experience?: string // optional selection
}
```

**Success Response** (201):

```typescript
interface BookingResponse {
  success: true
  data: {
    id: string
    name: string
    email: string
    phone?: string
    service: string
    date: string
    time: string
    message?: string
    goals: string
    experience?: string
    status: 'PENDING'
    createdAt: string
    updatedAt: string
  }
  message: 'Booking submitted successfully!'
}
```

**Error Responses**:

- `400`: Validation errors, missing required fields
- `409`: Time slot already booked (conflict)
- `429`: Rate limit exceeded
- `500`: Internal server error

#### Get Availability

```http
GET /api/availability?date=YYYY-MM-DD
```

**Success Response** (200):

```typescript
interface AvailabilityResponse {
  success: true
  data: {
    date: string
    availableTimes: string[] // Available time slots
    bookedTimes: string[] // Already booked slots
    businessHours: {
      start: string // "09:00"
      end: string // "17:00"
      timeSlots: string[] // All possible slots
    }
  }
}
```

**Error Responses**:

- `400`: Invalid date format
- `500`: Internal server error

### Admin Endpoints (Future Implementation)

#### List Bookings

```http
GET /api/admin/bookings
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `date`: Filter by specific date (YYYY-MM-DD)
- `status`: Filter by booking status
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset

**Success Response** (200):

```typescript
interface BookingListResponse {
  success: true
  data: {
    bookings: Booking[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}
```

#### Update Booking Status

```http
PATCH /api/admin/bookings/:id/status
Authorization: Bearer <jwt_token>
```

**Request Body**:

```typescript
interface StatusUpdateRequest {
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes?: string
}
```

**Success Response** (200):

```typescript
interface StatusUpdateResponse {
  success: true
  data: Booking
  message: 'Booking status updated successfully'
}
```

## Data Models

### Booking Model

```typescript
interface Booking {
  id: string // CUID
  name: string
  email: string
  phone?: string
  service: string
  date: string // ISO date
  time: string // 24-hour format
  message?: string
  goals: string
  experience?: string
  status: BookingStatus
  sessionDuration?: number // minutes, default 60
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
}

enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
```

### Service Options

```typescript
interface ServiceOption {
  id: string
  name: string
  duration: number // minutes
  description: string
  price?: number // future implementation
}

// Current Services
const SERVICES = [
  'Personal Training Session',
  'Nutrition Consultation',
  'Fitness Assessment',
  'Group Training Session',
] as const
```

### Goal Options

```typescript
const GOALS = [
  'Weight Loss',
  'Muscle Building',
  'Improved Fitness',
  'Sport-Specific Training',
  'Injury Recovery',
  'General Health',
] as const
```

### Experience Levels

```typescript
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const
```

## Validation Rules

### Input Validation

```typescript
// Zod schema for booking validation
const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  service: z.string({ required_error: 'Please select a service' }),
  date: z
    .string()
    .pipe(z.coerce.date({ required_error: 'Please select a date' })),
  time: z.string({ required_error: 'Please select a time' }),
  message: z
    .string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
  goals: z.string({ required_error: 'Please select a goal' }),
  experience: z.string().optional(),
})
```

### Business Rules

- **Booking Window**: 24 hours minimum advance booking
- **Cancellation**: 24 hours minimum notice required
- **Session Duration**: Default 60 minutes, configurable per service
- **Time Slots**: 30-minute intervals during business hours
- **Conflict Prevention**: Unique constraint on `[date, time]` combination

## Error Handling

### Error Codes

```typescript
enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BOOKING_CONFLICT = 'BOOKING_CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

### Error Response Examples

```typescript
// Validation Error (400)
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: {
      field: 'email',
      message: 'Please enter a valid email address'
    }
  },
  timestamp: '2025-08-04T22:52:00.000Z'
}

// Booking Conflict (409)
{
  success: false,
  error: {
    code: 'BOOKING_CONFLICT',
    message: 'Time slot already booked',
    details: {
      date: '2025-08-15',
      time: '14:00',
      suggestedTimes: ['14:30', '15:00', '15:30']
    }
  },
  timestamp: '2025-08-04T22:52:00.000Z'
}
```

## Security Considerations

### Rate Limiting

- **Booking Endpoints**: 5 requests per 15 minutes per IP
- **Availability Checks**: 30 requests per minute per IP
- **Admin Endpoints**: 100 requests per hour per authenticated user

### Input Sanitization

- All string inputs sanitized to prevent XSS
- SQL injection prevention through Prisma ORM
- File upload validation (future implementation)

### Authentication (Admin Endpoints)

```typescript
// JWT Token Structure
interface JwtPayload {
  userId: string
  role: 'admin' | 'trainer'
  email: string
  iat: number
  exp: number
}
```

## Integration Points

### Email Service Integration

```typescript
interface EmailNotification {
  type: 'booking_confirmation' | 'booking_reminder' | 'booking_cancellation'
  recipient: string
  bookingData: Booking
  templateVariables: Record<string, any>
}
```

### Calendar Integration (Future)

```typescript
interface CalendarEvent {
  id: string
  title: string
  start: string // ISO timestamp
  end: string // ISO timestamp
  attendees: string[]
  location?: string
  description?: string
}
```

### Payment Integration (Future)

```typescript
interface PaymentIntent {
  id: string
  amount: number // cents
  currency: string // 'aud'
  bookingId: string
  status: 'pending' | 'succeeded' | 'failed'
  paymentMethod: string
}
```

## Testing Contracts

### Test Data Examples

```typescript
// Valid booking request
const validBookingRequest: BookingRequest = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '0412345678',
  service: 'Personal Training Session',
  date: '2025-08-15',
  time: '14:00',
  message: 'Looking forward to getting fit!',
  goals: 'Weight Loss',
  experience: 'Beginner',
}

// Conflict scenario
const conflictBookingRequest: BookingRequest = {
  // Same date/time as existing booking
  date: '2025-08-15',
  time: '14:00',
  // ... other valid fields
}
```

### Mock Responses

```typescript
// MSW handlers for testing
export const bookingHandlers = [
  http.post('/api/book-session', async ({ request }) => {
    const body = (await request.json()) as BookingRequest

    if (body.email === 'conflict@example.com') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'BOOKING_CONFLICT',
            message: 'Time slot already booked',
          },
        },
        { status: 409 }
      )
    }

    return HttpResponse.json(
      {
        success: true,
        data: mockBooking,
        message: 'Booking submitted successfully!',
      },
      { status: 201 }
    )
  }),
]
```

## Performance Requirements

### Response Time Targets

- **Booking Creation**: < 500ms (95th percentile)
- **Availability Check**: < 200ms (95th percentile)
- **Admin Queries**: < 1000ms (95th percentile)

### Scalability Considerations

- Database connection pooling via Neon
- Caching strategy for availability data
- Rate limiting to prevent abuse
- Horizontal scaling via Vercel serverless functions

---

**Last Updated**: 2025-08-04  
**API Version**: v1.0  
**Next Review**: After admin dashboard implementation  
**Contract Status**: Core booking endpoints stable, admin endpoints planned
