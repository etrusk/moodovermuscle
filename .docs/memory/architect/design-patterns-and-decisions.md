# Architect Memory: Design Patterns and Decisions

Institutional memory for architectural patterns, design decisions, and system design approaches that have proven effective in the MoodOverMuscle project.

## Successful Design Patterns

### Appetite-Based Architecture

- **Pattern**: Break complex features into appetite-sized components
- **Success**: Transaction safety implementation completed within 2-week appetite
- **Application**: Use for admin dashboard and real-time availability features
- **Truck Number**: Document in architecture.md, share with Code mode

### Constraint-Driven Design

- **Pattern**: Define technical constraints before implementation
- **Success**: Privacy-first approach guided technology choices effectively
- **Application**: Apply to all new integrations and third-party services
- **Truck Number**: Constraints documented in architecture.md

### Navigator-Driver Integration

- **Pattern**: Human strategic decisions, AI tactical implementation
- **Success**: Maintains quality while maximizing automation
- **Application**: Use for all complex feature development
- **Truck Number**: Workflow documented in workflows.md

## Design Decision Patterns

### Database Schema Evolution

- **Approach**: Incremental schema changes with rollback capability
- **Success**: Transaction safety added without breaking existing functionality
- **Lessons**: Always include migration rollback scripts
- **Truck Number**: Migration patterns documented in patterns/index.md

### API Design Consistency

- **Approach**: RESTful conventions with standardized error responses
- **Success**: Booking API follows consistent patterns
- **Lessons**: Define response formats early and stick to them
- **Truck Number**: API contracts documented in api/specification.md

### Security-First Design

- **Approach**: Security considerations integrated from design phase
- **Success**: Rate limiting and input validation built into API design
- **Lessons**: Security is easier to build in than bolt on
- **Truck Number**: Security patterns documented in patterns/index.md

## Architecture Review Insights

### Component Decomposition

- **Effective**: Breaking booking form into wizard steps
- **Reason**: Improved testability and maintainability
- **Application**: Use step-based patterns for complex user flows
- **Truck Number**: Component patterns in patterns/index.md

### State Management Strategy

- **Effective**: Custom hooks for data fetching (useAvailability)
- **Reason**: Separates concerns and enables better testing
- **Application**: Extract custom hooks for all async operations
- **Truck Number**: Hook patterns documented in patterns/index.md

### Error Handling Architecture

- **Effective**: Fire-and-forget email pattern
- **Reason**: Prevents email failures from blocking user workflows
- **Application**: Use for all non-critical async operations
- **Truck Number**: Error handling patterns in patterns/index.md

## Design Review Learnings

### Complexity Estimation Accuracy

- **Observation**: Initial estimates often 25% under actual complexity
- **Improvement**: Add 30% buffer for new technology integration
- **Application**: Use for appetite planning and circuit breaker setting
- **Truck Number**: Estimation guidelines in memory/index.md

### Integration Design Patterns

- **Effective**: Platform-native solutions over containerized approaches
- **Example**: Local Chromium vs Docker for Lighthouse CI
- **Reason**: Reduces environmental complexity and maintenance overhead
- **Application**: Prefer platform-native solutions when available

### Performance Design Considerations

- **Effective**: Design for current scale, plan for future scale
- **Example**: Simple rate limiting sufficient for current user volume
- **Reason**: Avoids premature optimization while maintaining upgrade path
- **Application**: Use for all performance-related design decisions

## Anti-Patterns to Avoid

### Over-Engineering

- **Problem**: Designing for hypothetical future requirements
- **Example**: Complex multi-tenant architecture for single-client system
- **Solution**: Design for current appetite, document evolution path
- **Prevention**: Regular appetite boundary reviews

### Technology Complexity

- **Problem**: Choosing complex solutions for simple problems
- **Example**: Microservices for monolithic use case
- **Solution**: Choose simplest solution that meets requirements
- **Prevention**: Constraint-driven design approach

### Documentation Drift

- **Problem**: Design decisions not captured in institutional memory
- **Example**: Undocumented architectural choices causing confusion
- **Solution**: Mandatory design documentation for complex features
- **Prevention**: Design review process with documentation requirements

## Knowledge Distribution (Truck Number Tracking)

### Critical Architectural Knowledge

- **Database Schema**: Documented in architecture.md and API specification
- **Security Patterns**: Documented in patterns/index.md
- **Integration Approaches**: Documented in decisions/index.md
- **Performance Constraints**: Documented in architecture.md

### Knowledge Gaps Identified

- **Admin Authentication**: Design needed before implementation
- **Real-time Updates**: Architecture pattern needed for availability system
- **Payment Integration**: Security and compliance design required
- **Multi-trainer Support**: Future architecture evolution planning needed

### Knowledge Transfer Mechanisms

- **Design Reviews**: Mandatory for complex features
- **Pattern Documentation**: Capture reusable design approaches
- **Decision Records**: Document architectural choices and rationale
- **Memory Updates**: Regular capture of design insights and lessons learned

---

**Last Updated**: 2025-08-04  
**Memory Status**: Foundational patterns established  
**Next Review**: After admin dashboard design completion  
**Truck Number Status**: Critical knowledge distributed across documentation
