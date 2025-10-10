+++
[metadata]
type = "architecture_decision_record"
adr_number = "002"
title = "Database Schema Design - PostgreSQL + Prisma"
date = "2025-07-30"
status = "accepted"
category = "database_design"
complexity = "high"
impact = "high"

[decision_context]
domain = "data_storage"
problem_space = "database_architecture"
stakeholders = ["development_team", "infrastructure_team"]
related_adrs = ["010", "029", "033"]

[implementation_tracking]
implementation_status = "completed"
estimated_effort = "high"
breaking_changes = true
rollback_complexity = "high"
+++

# ADR-002: Database Schema Design - PostgreSQL + Prisma

**Date**: 2025-07-30
**Status**: Accepted
**Deciders**: Development Team

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

**Positive:**

- Type safety, excellent DX, serverless optimization

**Negative:**

- Learning curve, abstraction layer overhead

## Related Decisions

- [ADR-010: Database Technology](./database-technology.md) - Technology choice rationale
- [ADR-029: Connection Pooling](./connection-pooling.md) - Database connection management
- [ADR-033: Data Migration Strategy](./data-migration-strategy.md) - Schema evolution approach
