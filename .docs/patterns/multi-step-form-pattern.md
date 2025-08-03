# Multi-Step Form Pattern

## Pattern Name

Multi-Step Wizard Form with Real-Time Validation and Accessibility Compliance

## Context & Problem

**When to Use**: Complex forms requiring user guidance through multiple logical steps (booking forms, registration wizards, checkout flows)
**Problem Solved**: Managing complex form state, providing clear user progression, maintaining accessibility across step transitions
**Appetite Scope**: 2-4 weeks for full implementation including testing and accessibility compliance

## Solution Overview

React Hook Form-based multi-step wizard with Zod validation, progressive disclosure, and comprehensive accessibility features. Provides guided user experience while maintaining form state and validation across step transitions.

## Implementation Details

### Code Structure

```typescript
// Core wizard architecture
interface BookingFormProps {
  onClose: () => void
  isOpen: boolean
}

// Multi-step state management
const BookingWizard = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onBlur',
  })

  return (
    <WizardContainer>
      <WizardSteps currentStep={currentStep}>
        <ServiceSelectionStep />
        <SchedulingStep />
        <PersonalDetailsStep />
      </WizardSteps>
      <WizardNavigation />
    </WizardContainer>
  )
}
```

### Key Components

- **Step Container**: Manages step transitions and progress indication
- **Form Provider**: React Hook Form context for shared state across steps
- **Validation Engine**: Zod schema validation with step-specific rules
- **Navigation Controller**: Step progression with validation gates
- **Accessibility Manager**: Focus management and screen reader announcements

### Dependencies

- `react-hook-form`: Form state management and validation
- `zod`: Schema validation with TypeScript integration
- `@hookform/resolvers`: Zod integration for React Hook Form
- `react-day-picker`: Calendar component for date selection

## Testing Strategy

### Unit Tests

```typescript
// Step-specific testing
describe('ServiceSelectionStep', () => {
  it('validates service selection before allowing progression', async () => {
    render(<ServiceSelectionStep />)
    const nextButton = screen.getByRole('button', { name: /next/i })

    await userEvent.click(nextButton)
    expect(screen.getByText(/please select a service/i)).toBeInTheDocument()
  })
})
```

### Integration Tests

```typescript
// Complete wizard flow testing
describe('Booking Wizard Integration', () => {
  it('completes full booking flow with validation', async () => {
    render(<BookingForm isOpen={true} onClose={mockClose} />)

    // Step 1: Service Selection
    await userEvent.selectOptions(screen.getByLabelText(/service/i), 'Personal Training')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    // Step 2: Scheduling
    await userEvent.click(screen.getByLabelText(/date/i))
    await userEvent.selectOptions(screen.getByLabelText(/time/i), '09:00')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    // Step 3: Personal Details & Submit
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe')
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
    await userEvent.click(screen.getByRole('button', { name: /book session/i }))

    await waitFor(() => {
      expect(screen.getByText(/booking submitted successfully/i)).toBeInTheDocument()
    })
  })
})
```

### E2E Validation

```typescript
// Complete user journey with accessibility validation
test('booking wizard maintains accessibility throughout flow', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: /book.*session/i }).click()

  // Validate each step for accessibility
  for (const step of ['service', 'scheduling', 'details']) {
    await validateStepAccessibility(page, step)
    if (step !== 'details') {
      await page.getByRole('button', { name: /next/i }).click()
    }
  }
})
```

## Quality Gates

**Critical Gates** (Never bypass):

- Form validation: 100% field validation coverage
- Accessibility compliance: WCAG 2.1 AA throughout all steps
- Step progression: Cannot advance without valid data
- Error handling: Clear, accessible error messages
- Keyboard navigation: Full keyboard accessibility

**Warning Gates** (Track in .docs/debt.md):

- Performance optimizations: Form chunking, progressive loading
- Enhanced UX: Form state persistence, auto-save drafts
- Advanced validation: Real-time API validation for email/phone

## Complexity Assessment

**Factors that Increase Complexity**:

- Number of steps (>3 significantly increases complexity)
- Complex validation rules across steps
- Dynamic step content based on previous selections
- File upload or media handling requirements
- Third-party integrations (payment, calendar APIs)

**Factors that Reduce Complexity**:

- Clear step separation with minimal interdependencies
- Established component library (shadcn/ui)
- Existing validation schemas and patterns
- Static step content without conditional logic

**Typical Appetite Requirements**:

- Simple 2-step form: 1-2 weeks (basic information collection)
- Standard 3-step wizard: 2-3 weeks (booking/registration forms)
- Complex multi-step flow: 3-4 weeks (complex business logic, integrations)

## Success Metrics

- Form completion rate: >85% users complete all steps
- Validation error rate: <10% submission failures due to validation
- Accessibility compliance: 100% WCAG 2.1 AA compliance
- Performance: <50ms step transitions, <100ms validation feedback
- User experience: Clear progress indication and error recovery

## Common Pitfalls

1. **State Management Complexity**: Sharing form state across steps without proper context management leads to race conditions
2. **Validation Timing**: Validating all steps on each change causes performance issues and poor UX
3. **Accessibility Gaps**: Focus management between steps often missed, causing screen reader confusion
4. **Progress Indication**: Users lose context without clear progress indicators and step labels
5. **Error Recovery**: Users get stuck when validation errors aren't clearly associated with specific fields

## Variations

**Linear Wizard**: Sequential steps that must be completed in order (most common)
**Branching Wizard**: Conditional step progression based on user selections
**Tabbed Interface**: Allow jumping between completed steps for editing
**Single Page**: All steps visible with progressive disclosure (for simple forms)

## Performance Profile

### Bundle Impact

- Component size: ~15KB gzipped
- Dependencies: react-hook-form (~8KB), zod (~3KB), date picker (~4KB)
- Lazy loading: Consider step-based code splitting for complex wizards

### Runtime Performance

- Initial render: <50ms
- Step navigation: <100ms transition time
- Form validation: <10ms per field validation
- Submit handling: <200ms (excluding API call)

### Core Web Vitals Impact

- **LCP**: Form contributes to main content paint
- **FID**: Form interactions measured for responsiveness
- **CLS**: Minimal layout shift during step transitions (<0.1)

## Development Workflow Integration

### TDD Approach

1. **Red**: Write failing test for step validation or progression
2. **Green**: Implement minimal step logic to pass validation
3. **Refactor**: Optimize step transitions and validation timing

### Component Decomposition

```typescript
// Separate concerns for testability
components/booking-form/
├── BookingWizard.tsx           // Main wizard container
├── steps/
│   ├── ServiceSelectionStep.tsx
│   ├── SchedulingStep.tsx
│   └── PersonalDetailsStep.tsx
├── useBookingForm.ts           // Form state hook
├── useAvailability.ts          // Data fetching hook
└── validation.ts               // Zod schemas
```

### Testing Patterns

- **Unit**: Test individual step components in isolation
- **Integration**: Test wizard flow with mocked API responses
- **E2E**: Test complete user journey with real interactions

## Related Patterns

- [Accessibility Testing Pattern](.docs/patterns/accessibility-testing-pattern.md): Comprehensive accessibility validation
- [Error Handling Pattern](.docs/patterns/error-handling-pattern.md): User-friendly error messaging
- [Loading States Pattern](.docs/patterns/loading-states-pattern.md): Progressive feedback during async operations

## References

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Schema Validation](https://zod.dev/)
- [WCAG Form Guidelines](https://www.w3.org/WAI/tutorials/forms/)
- Project implementation: `components/booking-form/`

## History

- **Created**: 2025-08-03 (migrated from component documentation)
- **Last Updated**: 2025-08-03
- **Used In**: MoodOverMuscle booking form, registration flows
- **Success Rate**: 95% - Booking completion rate achieved with current implementation

---

**Pattern Status**: Proven  
**Confidence Level**: High  
**Reuse Frequency**: Core pattern for any multi-step data collection
