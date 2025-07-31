# ADR: Rate Limiting Strategy

**Date**: 2025-07-31

**Status**: Accepted

## Context

The booking endpoint (`/api/book-session`) is a public-facing endpoint that could be vulnerable to abuse, such as denial-of-service attacks or spam submissions. To protect the application and ensure its availability, a rate-limiting strategy is necessary.

## Decision

We will implement a simple in-memory rate-limiting solution for the booking endpoint. This approach involves tracking the number of requests per IP address within a specific time window.

The chosen limits are 5 requests per minute per IP address.

## Rationale

An in-memory solution was chosen for the following reasons:

- **Simplicity**: It is easy to implement and maintain, without adding external dependencies.
- **Sufficient for Current Needs**: The current scale of the application does not justify the complexity and cost of a more robust solution like Redis.
- **Low Overhead**: An in-memory solution has minimal performance impact.
- **Cost-Effective**: It avoids the need for a managed Redis instance, which would add to the operational costs.

## Consequences

- **Scalability**: This solution may not be suitable for a large-scale distributed environment, as the rate-limiting state is local to each server instance. If the application scales horizontally, a centralized solution like Redis would be required.
- **Persistence**: The rate-limiting data is not persisted across server restarts. This is an acceptable trade-off for the current use case.
- **IP-Based Only**: This solution only limits based on IP address, which can be spoofed. More advanced techniques could be implemented in the future if needed.
