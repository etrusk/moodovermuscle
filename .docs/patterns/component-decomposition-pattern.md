# Component Decomposition Pattern

## Pattern Name

Large Component Decomposition with Loading State Management

## Context & Problem

**When to Use**: Components exceeding 150 lines that need to be broken down for Code mode compatibility
**Problem Solved**: Managing complex component state across multiple smaller components while maintaining loading state granularity
**Appetite Scope**: 1-2 weeks for decomposition, testing, and integration verification

## Solution Overview

Systematic decomposition of large components into focused, sub-150-line components with centralized state management and granular loading states. Maintains functionality while improving testability and Code mode compatibility.

## Implementation Details

### Code Structure

```typescript
// Main Container Pattern
export function BookingForm({ isOpen, onClose }: BookingFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0">
        <BookingFormProvider onClose={onClose}>
          <BookingWizard onClose={onClose} />
        </BookingFormProvider>
      </DialogContent>
    </Dialog>
  )
}

// State Provider Pattern
export function BookingFormProvider({ children, onClose }: BookingFormProviderProps) {
  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: initialFormData
  })

  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    stepTransition: false,
    formSubmission: false,
    fieldValidation: {},
    calendarLoading: false
  })

  const contextValue = {
    // Form data
    formData: form.getValues(),
    updateFormData: form.setValue,

    // Form operations
    submitForm: async () => { /* API submission */ },
    resetForm: form.reset,

    // Loading states
    ...loadingStates,
    setLoadingState: (key: keyof LoadingStates, value: boolean) => {
      setLoadingStates(prev => ({ ...prev, [key]: value }))
    },

    // Validation
    validateStep: async (step: number) => { /* Step validation */ }
  }

  return (
    <BookingFormContext.Provider value={contextValue}>
      <Form {...form}>
        {children}
      </Form>
    </BookingFormContext.Provider>
  )
}
```

### Key Components

- **Main Container**: Dialog wrapper and provider orchestration (~80 lines)
- **State Provider**: Centralized state management (~60 lines)
- **Orchestrator**: Step navigation and layout coordination (~120 lines)
- **Step Components**: Individual form steps (~80-120 lines each)
- **Navigation Controls**: Button management and loading states (~80 lines)
- **Progress Display**: Visual progress indication (~60 lines)

### Dependencies

- React Hook Form: Form state management across components
- Context API: State sharing between decomposed components
- Zod: Validation schema consistency
- TypeScript: Interface contracts between components

## Testing Strategy

### Unit Tests

```typescript
// Component isolation testing
test('PersonalDetailsStep validates required fields', async () => {
  const mockContext = {
    formData: {},
    updateFormData: jest.fn(),
    validateStep: jest.fn(),
    isSubmitting: false
  }

  render(
    <BookingFormContext.Provider value={mockContext}>
      <PersonalDetailsStep />
    </BookingFormContext.Provider>
  )

  // Test component-specific logic
})
```

### Integration Tests

```typescript
// Cross-component interaction testing
test('wizard navigation updates context state correctly', async () => {
  render(<BookingForm isOpen={true} onClose={mockClose} />)

  // Test step progression with state updates
  await userEvent.click(screen.getByTestId('booking-form-continue-button'))
  expect(mockUpdateFormData).toHaveBeenCalled()
})
```

### E2E Validation

- Complete user journey testing with decomposed components
- Loading state verification across component boundaries
- Accessibility testing for component transitions

## Quality Gates

**Critical Gates** (Never bypass):

- Component size: All components <150 lines
- State consistency: Context state updates correctly across components
- Loading states: Granular loading feedback for all async operations
- Accessibility: WCAG 2.1 AA compliance maintained across decomposition
- Type safety: Full TypeScript coverage with interface contracts

**Warning Gates** (Track in .docs/debt.md):

- Performance optimizations: Component lazy loading, memoization
- Advanced state management: State persistence, undo/redo functionality
- Enhanced loading UX: Skeleton loaders, progressive disclosure

## Complexity Assessment

**Factors that Increase Complexity**:

- Number of components created (>7 significantly increases complexity)
- Complex state sharing requirements across components
- Nested loading states with interdependencies
- Multi-step validation with cross-component dependencies
- External API integrations requiring coordinated loading states

**Factors that Reduce Complexity**:

- Clear component boundaries with single responsibilities
- Simple state sharing through context (avoid prop drilling)
- Established component library (shadcn/ui) for consistency
- Existing testing patterns and utilities

**Typical Appetite Requirements**:

- Simple decomposition (2-3 components): 3-5 days
- Standard decomposition (4-6 components): 1-2 weeks
- Complex decomposition (7+ components): 2-3 weeks

## Success Metrics

- All components under 150 lines (100% compliance)
- Loading state coverage: Granular feedback for all async operations
- Test coverage maintained: No reduction in test coverage after decomposition
- Performance maintained: No regression in component render times
- Accessibility maintained: WCAG 2.1 AA compliance preserved

## Common Pitfalls

1. **Over-decomposition**: Creating too many tiny components that increase complexity without benefit
2. **State Fragmentation**: Not centralizing state properly, leading to synchronization issues
3. **Loading State Conflicts**: Multiple loading states interfering with each other
4. **Context Overuse**: Putting too much state in context, causing unnecessary re-renders
5. **Interface Gaps**: Missing TypeScript interfaces between decomposed components

## Variations

**Simple Decomposition**: Break large component into 2-3 focused components
**Wizard Decomposition**: Multi-step forms with step-based component separation
**Feature Decomposition**: Separate by feature areas (form, navigation, display)
**Layer Decomposition**: Separate by architectural layers (container, presentation, logic)

## Component Architecture

### Loading States Management

```typescript
interface LoadingStates {
  stepTransition: boolean      // During step navigation
  formSubmission: boolean      // During API submission
  fieldValidation: Record<string, boolean>  // Per-field async validation
  calendarLoading: boolean     // Calendar interactions
}

// Usage in components
export function WizardNavigation({ isNextLoading }: Props) {
  return (
    <Button disabled={isNextLoading} aria-busy={isNextLoading}>
      {isNextLoading ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Validating...
        </>
      ) : (
        'Continue'
      )}
    </Button>
  )
}
```

### Component Size Guidelines

- **Main Container**: <80 lines (dialog wrapper only)
- **State Provider**: <60 lines (context setup)
- **Orchestrator**: <120 lines (navigation logic)
- **Step Components**: <120 lines (form fields + validation)
- **Navigation**: <80 lines (button management)
- **Display Components**: <60 lines (progress, headers)

### State Sharing Pattern

```typescript
// Context pattern for state sharing
interface BookingFormContextValue {
  // Data
  formData: BookingFormData
  updateFormData: (data: Partial<BookingFormData>) => void

  // Operations
  submitForm: () => Promise<void>
  validateStep: (step: number) => Promise<boolean>

  // Loading states
  isSubmitting: boolean
  isStepLoading: boolean
  setLoadingState: (key: string, value: boolean) => void

  // Callbacks
  onClose: () => void
}
```

## Migration Strategy

### Step-by-Step Decomposition

1. **Identify Boundaries**: Analyze large component for natural separation points
2. **Extract State**: Move shared state to context provider
3. **Create Components**: Extract logical sections into separate components
4. **Add Loading States**: Implement granular loading feedback
5. **Update Tests**: Modify tests for new component structure
6. **Verify Integration**: Ensure decomposed components work together

### Verification Checklist

- [ ] All components under 150 lines
- [ ] State updates correctly across components
- [ ] Loading states provide clear feedback
- [ ] Tests updated and passing
- [ ] Accessibility maintained
- [ ] Performance not regressed

## Related Patterns

- [Multi-Step Form Pattern](.docs/patterns/multi-step-form-pattern.md): Wizard-specific decomposition strategies
- [Loading States Pattern](.docs/patterns/loading-states-pattern.md): Comprehensive loading state management
- [State Management Pattern](.docs/patterns/state-management-pattern.md): Context vs. prop drilling decisions

## References

- [React Component Composition](https://reactjs.org/docs/composition-vs-inheritance.html)
- [Context API Best Practices](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
- [Testing Library Component Testing](https://testing-library.com/docs/react-testing-library/intro/)

## History

- **Created**: 2025-08-03 (migrated from component documentation)
- **Last Updated**: 2025-08-03
- **Used In**: MoodOverMuscle booking form decomposition
- **Success Rate**: 100% - All components successfully decomposed under 150 lines

---

**Pattern Status**: Proven  
**Confidence Level**: High  
**Reuse Frequency**: Essential pattern for Code mode compatibility
