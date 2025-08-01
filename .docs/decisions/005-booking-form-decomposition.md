# Decision: Booking Form Component Decomposition

**Date**: 2025-08-01
**Status**: Decided
**Context**: Large monolithic booking form component (557 lines) blocking loading states implementation and Code mode effectiveness

## Problem

The current [`booking-form.tsx`](../../components/booking-form.tsx:1) component has several critical issues:

- **Size**: 557 lines making it difficult for Code mode to work with effectively
- **Complexity**: Monolithic structure with mixed concerns (UI, state, validation, submission)
- **Testing**: Integration tests failing due to complex interactions and large surface area
- **Loading States**: Blocked implementation due to component complexity
- **Maintainability**: Single file contains wizard logic, form validation, UI rendering, and API integration

## Options Considered

### Option A: Minimal Split (Step Components Only)
- Split into 3 step components: `PersonalDetailsStep`, `ServiceSelectionStep`, `SchedulingStep`
- Keep wizard logic in main component
- **Pros**: Simple migration, minimal test changes
- **Cons**: Still large main component, limited loading state granularity

### Option B: Full Decomposition (Recommended)
- Separate wizard orchestration, step components, and shared logic
- Extract form state management and validation
- Create dedicated loading state management
- **Pros**: Clear separation of concerns, testable components, granular loading states
- **Cons**: More complex migration, requires test restructuring

### Option C: Gradual Refactoring
- Incrementally extract components over multiple iterations
- **Pros**: Lower risk, gradual test migration
- **Cons**: Prolonged complexity, delayed loading states implementation

## Decision

**Option B: Full Decomposition** - Complete component architecture redesign with clear separation of concerns.

## Implementation Architecture

### Component Hierarchy

```
BookingForm (Dialog Container - 80 lines)
├── BookingWizard (Orchestration - 120 lines)
│   ├── WizardHeader (Progress + Branding - 60 lines)
│   ├── WizardSteps (Step Router - 40 lines)
│   │   ├── PersonalDetailsStep (Step 1 - 100 lines)
│   │   ├── ServiceSelectionStep (Step 2 - 80 lines)
│   │   └── SchedulingStep (Step 3 - 120 lines)
│   └── WizardNavigation (Controls - 80 lines)
└── BookingFormProvider (State Management - 60 lines)
```

### State Management Strategy

**Context-Based State Management**:
- `BookingFormProvider`: Form data, validation, submission state
- `WizardProvider`: Step navigation, progress tracking, loading states
- React Hook Form: Field-level validation and form state
- Local component state: UI-specific state (calendar open, etc.)

### Loading States Integration Points

**Granular Loading States**:
- Step transition loading (wizard navigation)
- Field validation loading (async validation)
- Form submission loading (API call)
- Calendar loading (date selection)
- Service selection loading (if future API integration)

## Component Specifications

### 1. BookingForm (Main Container)
```typescript
interface BookingFormProps {
  isOpen: boolean
  onClose: () => void
}
// Responsibilities: Dialog management, provider setup
// Size: ~80 lines
```

### 2. BookingFormProvider (State Management)
```typescript
interface BookingFormContextValue {
  formData: BookingFormData
  updateFormData: (data: Partial<BookingFormData>) => void
  submitForm: () => Promise<void>
  isSubmitting: boolean
  validationErrors: Record<string, string[]>
}
// Responsibilities: Form state, validation, API integration
// Size: ~60 lines
```

### 3. BookingWizard (Orchestration)
```typescript
interface BookingWizardProps {
  onClose: () => void
}
// Responsibilities: Step orchestration, layout structure
// Size: ~120 lines
```

### 4. WizardHeader (Progress Display)
```typescript
interface WizardHeaderProps {
  currentStep: number
  totalSteps: number
  isLoading?: boolean
}
// Responsibilities: Progress bar, branding, step indicator
// Size: ~60 lines
```

### 5. Step Components (PersonalDetailsStep, ServiceSelectionStep, SchedulingStep)
```typescript
interface StepProps {
  onNext: () => void
  onPrevious?: () => void
  isLoading?: boolean
}
// Responsibilities: Step-specific form fields and validation
// Size: 80-120 lines each
```

### 6. WizardNavigation (Controls)
```typescript
interface WizardNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
  isNextLoading?: boolean
  isSubmitLoading?: boolean
  canProceed: boolean
}
// Responsibilities: Navigation buttons, loading states
// Size: ~80 lines
```

## Migration Strategy

### Phase 1: Extract State Management (Low Risk)
1. Create `BookingFormProvider` with existing form logic
2. Wrap existing component with provider
3. Verify tests still pass
4. **Estimated effort**: 2-3 hours

### Phase 2: Extract Step Components (Medium Risk)
1. Create individual step components
2. Replace inline step rendering with component calls
3. Update test selectors to match new structure
4. **Estimated effort**: 4-6 hours

### Phase 3: Extract Wizard Logic (Medium Risk)
1. Create `BookingWizard` orchestration component
2. Move step navigation logic
3. Implement loading state management
4. **Estimated effort**: 3-4 hours

### Phase 4: Extract UI Components (Low Risk)
1. Create `WizardHeader` and `WizardNavigation`
2. Implement granular loading states
3. Update integration tests
4. **Estimated effort**: 2-3 hours

**Total Migration Effort**: 11-16 hours over 4 phases

## Testing Strategy

### Test Migration Approach
1. **Preserve Integration Tests**: Keep existing integration test structure
2. **Add Unit Tests**: Test individual components in isolation
3. **Update Selectors**: Maintain existing test IDs for compatibility
4. **Gradual Migration**: Update tests incrementally with each phase

### New Testing Patterns
```typescript
// Component-specific unit tests
describe('PersonalDetailsStep', () => {
  it('validates required fields', () => {})
  it('calls onNext when valid', () => {})
})

// State management tests
describe('BookingFormProvider', () => {
  it('manages form state correctly', () => {})
  it('handles submission loading states', () => {})
})

// Integration tests (preserved structure)
describe('Booking Form Integration', () => {
  it('completes full booking flow', () => {}) // Existing test
})
```

## Loading States Implementation

### Granular Loading States
- **Step Navigation**: Loading indicator during step transitions
- **Field Validation**: Async validation feedback
- **Form Submission**: Submit button loading state
- **Calendar Interaction**: Date picker loading
- **Service Selection**: Future API integration ready

### Loading State Management
```typescript
interface LoadingStates {
  stepTransition: boolean
  formSubmission: boolean
  fieldValidation: Record<string, boolean>
  calendarLoading: boolean
}
```

## Benefits

### Immediate Benefits
- **Code Mode Effectiveness**: Components under 150 lines each
- **Loading States**: Granular implementation possible
- **Testability**: Isolated component testing
- **Maintainability**: Clear separation of concerns

### Long-term Benefits
- **Feature Development**: Easier to add new steps or fields
- **Performance**: Potential for lazy loading of steps
- **Reusability**: Step components reusable in other contexts
- **Debugging**: Isolated component debugging

## Implementation Notes

### File Structure
```
components/
├── booking-form.tsx (Main container)
├── booking-form/
│   ├── BookingFormProvider.tsx
│   ├── BookingWizard.tsx
│   ├── WizardHeader.tsx
│   ├── WizardNavigation.tsx
│   └── steps/
│       ├── PersonalDetailsStep.tsx
│       ├── ServiceSelectionStep.tsx
│       └── SchedulingStep.tsx
```

### Backward Compatibility
- Maintain existing `BookingForm` export
- Preserve all existing props and behavior
- Keep existing test IDs and accessibility attributes
- No breaking changes to parent components

## Related Docs

- [.docs/current-task.md](../current-task.md): UX enhancement priorities
- [.docs/components/booking-form.md](../components/booking-form.md): Current component specs
- [.docs/debt.md](../debt.md): Test failure tracking
- [.docs/architecture.md](../architecture.md): Component architecture patterns