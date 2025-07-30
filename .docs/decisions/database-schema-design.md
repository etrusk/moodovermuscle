# ADR-005: Database Schema Design - PostgreSQL + Prisma

**Status**: Accepted  
**Date**: 2025-07-30  
**Deciders**: Development Team  
**Technical Story**: Booking system database architecture

## Context

The booking system requires persistent storage for customer booking data. We needed to design a database schema that would support the current booking flow while being flexible enough for future enhancements like user accounts, class scheduling, and payment tracking.

## Decision Drivers

- **Type Safety**: End-to-end type safety from database to frontend
- **Developer Experience**: Easy migrations and schema evolution
- **Performance**: Efficient queries for booking operations
- **Scalability**: Support for future feature additions
- **Data Integrity**: Reliable data storage with proper constraints
- **Production Readiness**: Suitable for Vercel deployment

## Considered Options

### Option 1: PostgreSQL + Prisma (Chosen)

- **Pros**:
  - Excellent TypeScript integration
  - Type-safe database access
  - Easy migrations and schema evolution
  - Great developer experience
  - Production-ready with connection pooling
  - Supports complex queries when needed
- **Cons**:
  - Learning curve for Prisma-specific patterns
  - Additional abstraction layer

### Option 2: PostgreSQL + Raw SQL

- **Pros**:
  - Direct database control
  - No ORM overhead
  - Maximum performance
- **Cons**:
  - No type safety
  - Manual migration management
  - More boilerplate code
  - Higher maintenance burden

### Option 3: SQLite + Prisma

- **Pros**:
  - Simple deployment
  - No external database required
  - Good for development
- **Cons**:
  - Limited scalability
  - Not suitable for production with multiple instances
  - Fewer advanced features

## Decision

We chose **PostgreSQL + Prisma** for the following reasons:

1. **Type Safety**: Prisma generates TypeScript types from schema
2. **Developer Experience**: Excellent tooling and migration system
3. **Production Ready**: Robust for Vercel deployment with connection pooling
4. **Future Flexibility**: Easy to add relations and complex queries
5. **Migration Management**: Automated migration generation and application

## Schema Design Decisions

### Booking Model Structure

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

### Key Design Choices

#### Primary Key: CUID vs UUID vs Auto-increment

- **Chosen**: CUID (`@default(cuid())`)
- **Rationale**:
  - Better for distributed systems than auto-increment
  - More readable than UUID
  - Collision-resistant
  - Sortable by creation time

#### Nullable vs Required Fields

- **Required**: Core booking data (name, email, service, date, time)
- **Nullable**: Optional user input (phone, message, goals, experience)
- **Rationale**: Flexible schema accommodates varying user input while ensuring essential data

#### Time Storage Strategy

- **Date**: DateTime field for precise date storage
- **Time**: String field for user-selected time slots
- **Rationale**: Separates date precision from time slot selection, easier for UI

#### Timestamp Strategy

- **createdAt**: Automatic timestamp on creation
- **updatedAt**: Automatic timestamp on modification
- **Rationale**: Audit trail and data tracking capabilities

## Implementation Details

### Prisma Configuration

```typescript
generator client {
  provider = "prisma-client-js"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Migration Strategy

- Development: `prisma migrate dev` for schema changes
- Production: `prisma migrate deploy` for deployment
- Client Generation: `prisma generate` after schema changes

### Connection Management

```typescript
// Global Prisma client with development caching
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // Query logging for debugging
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
```

## Consequences

### Positive

- **Type Safety**: Compile-time error detection for database operations
- **Developer Productivity**: Excellent tooling and auto-completion
- **Migration Safety**: Automated migration generation with rollback capability
- **Performance**: Connection pooling and optimized queries
- **Maintainability**: Clear schema definition and evolution tracking

### Negative

- **Learning Curve**: Team needs to learn Prisma-specific patterns
- **Abstraction**: Additional layer between application and database
- **Bundle Size**: Prisma client adds to application bundle

### Neutral

- **Vendor Lock-in**: Prisma-specific, but migration path exists
- **Query Flexibility**: Most use cases covered, raw SQL available when needed

## Schema Evolution

### Migration History

1. **Initial Migration** (`20250728050257_init`): Basic booking structure
2. **Enhancement Migration** (`20250728050543_add_goals_and_experience_to_booking`): Added customer profiling fields

### Future Considerations

```prisma
// Potential future enhancements
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

  // Payment tracking (future)
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

## Follow-up Actions

1. **Indexing Strategy**: Add indexes for common query patterns (email, date, createdAt)
2. **Data Validation**: Consider database-level constraints for critical fields
3. **Backup Strategy**: Implement automated database backups
4. **Performance Monitoring**: Add query performance monitoring
5. **Schema Documentation**: Maintain schema documentation as it evolves

## Notes

This schema design balances current needs with future flexibility. The nullable field strategy allows for graceful schema evolution while maintaining data integrity for essential booking information.
