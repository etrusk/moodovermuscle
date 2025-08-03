# Decomposed Booking Form Components

## Architecture Overview

The booking form has been decomposed into 7 focused components, each under 150 lines, with clear separation of concerns and granular loading state management.

## Component Specifications

### 1. BookingForm (Main Container)

**File**: `components/booking-form.tsx`
**Size**: ~80 lines
**Purpose**: Dialog container and provider orchestration

```typescript
interface BookingFormProps {
  isOpen: boolean
  onClose: () => void
}

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
```

**Responsibilities**:

- Dialog state management
- Provider setup and teardown
- Modal accessibility and styling

**Testing Strategy**:

- Dialog open/close behavior
- Provider integration
- Accessibility compliance

---

### 2. BookingFormProvider (State Management)

**File**: `components/booking-form/BookingFormProvider.tsx`
**Size**: ~60 lines
**Purpose**: Centralized form state and API integration

```typescript
interface BookingFormData {
  name: string
  email: string
  phone: string
  service: string
  date: Date | undefined
  time: string
  message: string
  goals: string
  experience: string
}

interface BookingFormContextValue {
  // Form data
  formData: BookingFormData
  updateFormData: (data: Partial<BookingFormData>) => void

  // Form operations
  submitForm: () => Promise<void>
  resetForm: () => void

  // Loading states
  isSubmitting: boolean

  // Validation
  validationErrors: Record<string, string[]>
  validateStep: (step: number) => Promise<boolean>

  // Callbacks
  onClose: () => void
}

export function BookingFormProvider({ children, onClose }: BookingFormProviderProps) {
  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: initialFormData
  })

  const submitForm = async () => {
    // API submission logic
  }

  const validateStep = async (step: number) => {
    // Step-specific validation
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

**Responsibilities**:

- Form state management with React Hook Form
- API submission and error handling
- Cross-step validation logic
- Loading state coordination

**Testing Strategy**:

- Form state updates
- Validation logic
- API integration
- Error handling

---

### 3. BookingWizard (Orchestration)

**File**: `components/booking-form/BookingWizard.tsx`
**Size**: ~120 lines
**Purpose**: Step orchestration and layout management

```typescript
interface BookingWizardProps {
  onClose: () => void
}

export function BookingWizard({ onClose }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isStepLoading, setIsStepLoading] = useState(false)
  const { validateStep } = useBookingForm()

  const handleNext = async () => {
    setIsStepLoading(true)
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
    setIsStepLoading(false)
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <>
      <WizardHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        isLoading={isStepLoading}
      />
      <div className="p-8">
        <WizardSteps currentStep={currentStep} />
        <WizardNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isNextLoading={isStepLoading}
        />
      </div>
    </>
  )
}
```

**Responsibilities**:

- Step navigation logic
- Step transition loading states
- Layout coordination
- Progress tracking

**Testing Strategy**:

- Step navigation
- Loading state management
- Validation integration
- Progress tracking

---

### 4. WizardHeader (Progress Display)

**File**: `components/booking-form/WizardHeader.tsx`
**Size**: ~60 lines
**Purpose**: Progress indication and branding

```typescript
interface WizardHeaderProps {
  currentStep: number
  totalSteps: number
  isLoading?: boolean
}

export function WizardHeader({ currentStep, totalSteps, isLoading }: WizardHeaderProps) {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <DialogHeader className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white">
      <div className="relative p-8">
        {/* Free session badge */}
        <div className="absolute top-4 left-4 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Sparkles className="h-3 w-3 stroke-1" />
          100% FREE Session
        </div>

        {/* Title and description */}
        <div className="relative z-10 pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 rounded-full p-2">
              <Sparkles className="h-6 w-6 stroke-1" />
            </div>
            <div>
              <DialogTitle className="text-2xl md:text-3xl font-bold">
                Book Your FREE Session
              </DialogTitle>
              <DialogDescription className="text-green-100 text-sm">
                No payment required • No commitment • Just come and try!
              </DialogDescription>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-green-100 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className={cn(
                  "bg-gradient-to-r from-amber-400 to-yellow-300 h-2 rounded-full transition-all duration-500 ease-out",
                  isLoading && "animate-pulse"
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </DialogHeader>
  )
}
```

**Responsibilities**:

- Progress bar visualization
- Step indicator
- Branding and messaging
- Loading state indication

**Testing Strategy**:

- Progress calculation
- Loading state display
- Accessibility compliance
- Visual regression testing

---

### 5. Step Components

#### PersonalDetailsStep

**File**: `components/booking-form/steps/PersonalDetailsStep.tsx`
**Size**: ~100 lines
**Purpose**: Personal information collection

```typescript
interface PersonalDetailsStepProps {
  onNext: () => void
  isLoading?: boolean
}

export function PersonalDetailsStep({ onNext, isLoading }: PersonalDetailsStepProps) {
  const { formData, updateFormData } = useBookingForm()

  return (
    <div className="space-y-6 animate-fade-in-up" data-testid="booking-form-step-1">
      <div className="grid gap-6">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Heart className="h-4 w-4 stroke-1 text-rose-500" />
                What should we call you? *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Your beautiful name"
                  {...field}
                  data-testid="name-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email and phone fields */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Email field */}
          {/* Phone field */}
        </div>

        {/* Goals selection */}
        <FormField
          name="goals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What's your main fitness goal? *</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full p-4 border-2 border-stone-200 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white text-lg"
                  data-testid="goals-select"
                >
                  <option value="">Choose your goal...</option>
                  <option value="weight-loss">Lose weight & feel confident</option>
                  <option value="strength">Build strength & energy</option>
                  <option value="postnatal">Postnatal recovery</option>
                  <option value="community">Find my mum tribe</option>
                  <option value="mental-health">Improve mental wellbeing</option>
                  <option value="other">Something else amazing</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
```

#### ServiceSelectionStep

**File**: `components/booking-form/steps/ServiceSelectionStep.tsx`
**Size**: ~80 lines
**Purpose**: Service type selection

```typescript
interface ServiceSelectionStepProps {
  onNext: () => void
  onPrevious: () => void
  isLoading?: boolean
}

export function ServiceSelectionStep({ onNext, onPrevious, isLoading }: ServiceSelectionStepProps) {
  const services = [
    {
      name: '1-on-1 Personal Training',
      price: 'FREE First Session',
      popular: true,
      description: 'Personalized attention just for you',
    },
    // ... other services
  ]

  return (
    <div className="space-y-6 animate-fade-in-up" data-testid="booking-form-step-2">
      <FormField
        name="service"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="text-center block text-2xl font-bold text-stone-900">
              What Would You Like to Try?
            </FormLabel>
            <FormControl>
              <div className="grid gap-4">
                {services.map(service => (
                  <ServiceOption
                    key={service.name}
                    service={service}
                    isSelected={field.value === service.name}
                    onSelect={() => field.onChange(service.name)}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
```

#### SchedulingStep

**File**: `components/booking-form/steps/SchedulingStep.tsx`
**Size**: ~120 lines
**Purpose**: Date, time, and message collection

```typescript
interface SchedulingStepProps {
  onPrevious: () => void
  onSubmit: () => void
  isSubmitting?: boolean
}

export function SchedulingStep({ onPrevious, onSubmit, isSubmitting }: SchedulingStepProps) {
  const [isCalendarOpen, setCalendarOpen] = useState(false)

  return (
    <div className="space-y-6 animate-fade-in-up" data-testid="booking-form-step-3">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Date picker */}
        <FormField
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Preferred Date *</FormLabel>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                isOpen={isCalendarOpen}
                onOpenChange={setCalendarOpen}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time selection */}
        <FormField
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Time *</FormLabel>
              <TimeSelect
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Message field */}
      <FormField
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Anything else you'd like me to know? (Optional)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any questions, concerns, or things you're excited about? I'd love to hear from you! 💕"
                {...field}
                data-testid="message-textarea"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
```

**Responsibilities**:

- Step-specific form fields
- Field validation
- User interaction handling
- Loading state display

**Testing Strategy**:

- Field validation
- User interactions
- Loading state handling
- Accessibility compliance

---

### 6. WizardNavigation (Controls)

**File**: `components/booking-form/WizardNavigation.tsx`
**Size**: ~80 lines
**Purpose**: Navigation controls and loading states

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

export function WizardNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSubmit,
  isNextLoading,
  isSubmitLoading,
  canProceed
}: WizardNavigationProps) {
  return (
    <DialogFooter className="flex gap-4 pt-6">
      {currentStep > 1 && (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="flex-1"
          disabled={isNextLoading || isSubmitLoading}
          data-testid="booking-form-back-button"
        >
          Back
        </Button>
      )}

      {currentStep < totalSteps ? (
        <Button
          type="button"
          onClick={onNext}
          className="flex-1"
          disabled={!canProceed || isNextLoading}
          aria-busy={isNextLoading}
          data-testid="booking-form-continue-button"
        >
          {isNextLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Validating...
            </>
          ) : (
            <>
              Continue <ArrowRight className="ml-2 h-5 w-5 stroke-1" />
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          className="flex-1"
          disabled={!canProceed || isSubmitLoading}
          aria-busy={isSubmitLoading}
          data-testid="booking-form-submit-button"
        >
          {isSubmitLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Booking...
            </>
          ) : (
            'Book My FREE Session! 🎉'
          )}
        </Button>
      )}
    </DialogFooter>
  )
}
```

**Responsibilities**:

- Navigation button management
- Loading state visualization
- Button state coordination
- Accessibility attributes

**Testing Strategy**:

- Button state management
- Loading state display
- Navigation flow
- Accessibility compliance

---

### 7. WizardSteps (Step Router)

**File**: `components/booking-form/WizardSteps.tsx`
**Size**: ~40 lines
**Purpose**: Step component routing

```typescript
interface WizardStepsProps {
  currentStep: number
}

export function WizardSteps({ currentStep }: WizardStepsProps) {
  switch (currentStep) {
    case 1:
      return <PersonalDetailsStep />
    case 2:
      return <ServiceSelectionStep />
    case 3:
      return <SchedulingStep />
    default:
      return null
  }
}
```

**Responsibilities**:

- Step component routing
- Step transition management

**Testing Strategy**:

- Step routing logic
- Component mounting/unmounting

## Loading States Architecture

### Loading State Types

1. **Step Transition Loading**: During step navigation and validation
2. **Form Submission Loading**: During API submission
3. **Field Validation Loading**: For async field validation (future)
4. **Calendar Loading**: During date picker interactions
5. **Service Loading**: For future API-driven service options

### Loading State Management

```typescript
interface LoadingStates {
  stepTransition: boolean
  formSubmission: boolean
  fieldValidation: Record<string, boolean>
  calendarLoading: boolean
}

// Context provider manages all loading states
const LoadingContext = createContext<LoadingStates>()
```

## Migration Benefits

### Immediate Benefits

- **Code Mode Compatibility**: All components under 150 lines
- **Loading States**: Granular implementation across all interactions
- **Testability**: Isolated component testing with clear interfaces
- **Maintainability**: Clear separation of concerns

### Long-term Benefits

- **Feature Development**: Easy to add new steps or modify existing ones
- **Performance**: Potential for lazy loading and code splitting
- **Reusability**: Step components can be reused in other contexts
- **Debugging**: Isolated component debugging and error tracking

## Testing Strategy

### Unit Testing

- Each component tested in isolation
- Mock providers for dependencies
- Focus on component-specific logic

### Integration Testing

- Preserve existing integration test structure
- Update selectors to match new component structure
- Test cross-component interactions

### E2E Testing

- Maintain existing Playwright tests
- Add loading state verification
- Test complete user journeys

---

**Last Updated**: 2025-08-01
**Implementation Status**: Architecture Complete - Ready for Code Mode
**Next Review**: After implementation completion
