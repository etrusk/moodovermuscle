# ADR-004: Email Service Architecture - Nodemailer + SMTP

**Status**: Accepted  
**Date**: 2025-07-30  
**Deciders**: Development Team  
**Technical Story**: Booking system email notification implementation

## Context

The booking system requires email notifications for both customers (confirmation) and admin (new booking alerts). We needed to choose an email service that would be reliable, cost-effective, and align with our FLOSS preferences while providing production flexibility.

## Decision Drivers

- **FLOSS Compatibility**: Preference for open-source solutions
- **Production Flexibility**: Ability to use different SMTP providers
- **Reliability**: Consistent email delivery
- **Cost Effectiveness**: Minimal ongoing costs for small business
- **Development Experience**: Easy to implement and test
- **Error Resilience**: Email failures shouldn't break booking flow

## Considered Options

### Option 1: Nodemailer + SMTP (Chosen)

- **Pros**:
  - FLOSS compatible
  - Provider agnostic (Gmail, SendGrid, Mailgun, etc.)
  - Excellent TypeScript support
  - Mature and well-documented
  - Easy to test with mocking
  - No vendor lock-in
- **Cons**:
  - Requires SMTP configuration
  - Manual template management

### Option 2: Resend

- **Pros**:
  - Modern API design
  - Built-in template management
  - Good developer experience
- **Cons**:
  - Vendor lock-in
  - Subscription costs
  - Less flexibility for SMTP provider choice

### Option 3: SendGrid

- **Pros**:
  - Robust delivery infrastructure
  - Advanced analytics
  - Template management
- **Cons**:
  - Vendor lock-in
  - Higher costs
  - Complex API for simple use case

## Decision

We chose **Nodemailer + SMTP** for the following reasons:

1. **FLOSS Alignment**: Nodemailer is open-source and aligns with project preferences
2. **Provider Flexibility**: Can use Gmail for development, professional SMTP for production
3. **Cost Control**: No per-email charges, only SMTP provider costs
4. **Implementation Simplicity**: Straightforward integration with existing codebase
5. **Testing Ease**: Easy to mock for unit tests

## Implementation Details

### Architecture Pattern

```typescript
// Fire-and-forget pattern for non-blocking email
sendCustomerConfirmation(bookingData)
  .then(res => {
    if (!res.success) {
      console.error('Email failed:', res.error)
    }
  })
  .catch(err => console.error('Email error:', err))
```

### Configuration

- Environment-based SMTP configuration
- Required environment variables validation on startup
- Transporter verification available for health checks

### Error Handling

- Non-blocking email sending (fire-and-forget)
- Comprehensive error logging
- Email failures don't affect booking success

## Consequences

### Positive

- **Flexibility**: Easy to switch SMTP providers
- **Reliability**: Proven email delivery mechanism
- **Cost Effective**: No per-email charges
- **Maintainable**: Simple codebase with clear patterns
- **Testable**: Easy to mock and test email functionality

### Negative

- **Manual Templates**: HTML/text templates managed in code
- **SMTP Setup**: Requires SMTP provider configuration
- **Limited Analytics**: No built-in email analytics

### Neutral

- **Template Management**: Custom HTML/text templates provide full control
- **Provider Choice**: Flexibility requires decision-making for production

## Follow-up Actions

1. **Production SMTP**: Evaluate professional SMTP providers for production
2. **Template Enhancement**: Consider template engine for complex emails
3. **Monitoring**: Implement email delivery monitoring and alerting
4. **Analytics**: Consider adding email open/click tracking if needed

## Notes

This decision supports the lean development approach by choosing a simple, flexible solution that can evolve with business needs. The fire-and-forget pattern ensures excellent user experience while maintaining email functionality.
