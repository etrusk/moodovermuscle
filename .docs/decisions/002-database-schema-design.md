# ADR-002: Database Schema Design - PostgreSQL + Prisma

## Status

Accepted

## Context

The booking system requires persistent storage with type safety, easy migrations, and serverless optimization.

## Decision

Use Neon PostgreSQL + Prisma for database architecture.

## Rationale

- **Type Safety**: End-to-end TypeScript integration
- **Serverless Optimized**: Neon's connection pooling eliminates cold starts
- **Developer Experience**: Excellent tooling and migration system
- **Vercel Integration**: Native serverless function integration
- **Future Flexibility**: Easy schema evolution and complex queries

## Implementation

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

## Key Decisions

- **CUID Primary Keys**: Better for distributed systems, sortable
- **Nullable Fields**: Flexible schema for optional user input
- **Time Storage**: DateTime for dates, String for time slots

## Consequences

- **Positive**: Type safety, excellent DX, serverless optimization
- **Negative**: Learning curve, abstraction layer overhead

## Date

2025-07-30
