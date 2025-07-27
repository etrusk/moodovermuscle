# Testing Documentation - MoodOverMuscle Project

## Overview

This document outlines the comprehensive testing strategy for the MoodOverMuscle project, emphasizing accessibility-first development, maintainable test patterns, and robust quality assurance. Our testing approach prioritizes user experience, WCAG 2.1 AA compliance, and sustainable code practices.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Enhanced Testing Stack](#enhanced-testing-stack)
3. [Test Constants & String Management](#test-constants--string-management)
4. [Accessibility Testing Framework](#accessibility-testing-framework)
5. [Mocking Strategies](#mocking-strategies)
6. [Testing Behavior vs Implementation](#testing-behavior-vs-implementation)
7. [Error Scenarios & Edge Cases](#error-scenarios--edge-cases)
8. [Migration Guidelines](#migration-guidelines)
9. [Code Examples: Correct vs Incorrect](#code-examples-correct-vs-incorrect)
10. [Running Tests](#running-tests)
11. [Project Structure Updates](#project-structure-updates)
12. [CI/CD Integration](#cicd-integration)
13. [Maintenance & Best Practices](#maintenance--best-practices)
14. [Resources & References](#resources--references)
15. [Summary](#summary)

---

**Document Information**
- **Last Updated**: 2025-07-27
- **Version**: 1.0
- **Owner**: QA Team
- **Review Schedule**: Quarterly

---

## Testing Philosophy

### Core Principles

1. **Accessibility First**: Every component must pass automated accessibility tests
2. **Behavior Over Implementation**: Test what users experience, not internal details
3. **Maintainable Tests**: Avoid brittle tests that break with styling changes
4. **Comprehensive Coverage**: Include happy paths, error scenarios, and edge cases
5. **Real-World Simulation**: Use realistic data and user interactions

### Quality Standards

- **WCAG 2.1 AA Compliance**: Automated accessibility testing required
- **User-Centric Testing**: Focus on user interactions and outcomes
- **Error Resilience**: Test failure scenarios and recovery paths
- **Performance Awareness**: Consider testing impact on build times

## Enhanced Testing Stack

### Core Testing Tools

- **Unit Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Accessibility Testing**: jest-axe (automated WCAG compliance)
- **API Mocking**: Mock Service Worker (MSW)
- **Test Data**: @faker-js/faker for realistic data generation
- **Coverage**: Jest built-in coverage reporting

### New Tool Additions

```bash
# Install additional testing dependencies
pnpm add -D jest-axe @faker-js/faker msw
```

### Tool Justifications

- **jest-axe**: Automated accessibility testing to ensure WCAG 2.1 AA compliance
- **MSW**: Realistic API mocking without coupling to implementation details
- **faker.js**: Generate realistic test data to catch edge cases

## Test Constants & String Management

### The Hardcoded Strings Problem

**❌ Problematic Pattern:**
```typescript
// Brittle test that breaks when copy changes
expect(screen.getByText(/book your free session/i)).toBeInTheDocument()
expect(screen.getByText("Click me")).toBeInTheDocument()
```

**✅ Improved Pattern:**
```typescript
// __tests__/constants/test-strings.ts
export const TEST_STRINGS = {
  BOOKING: {
    CTA_BUTTON: /book.*free.*session/i,
    FORM_TITLE: /let's get to know you/i,
    SUCCESS_MESSAGE: /booking confirmed/i,
  },
  BUTTONS: {
    SUBMIT: /submit/i,
    CANCEL: /cancel/i,
    CONTINUE: /continue/i,
  },
  VALIDATION: {
    REQUIRED_FIELD: /required/i,
    INVALID_EMAIL: /valid email/i,
  }
} as const

// Usage in tests
import { TEST_STRINGS } from '../constants/test-strings'

expect(screen.getByText(TEST_STRINGS.BOOKING.CTA_BUTTON)).toBeInTheDocument()
```

### Test Data Constants

```typescript
// __tests__/constants/test-data.ts
export const TEST_USER_DATA = {
  VALID_USER: {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    phone: '0412345678',
    goals: 'weight-loss',
  },
  INVALID_USER: {
    name: '',
    email: 'invalid-email',
    phone: '123',
    goals: '',
  },
} as const

export const TEST_BOOKING_DATA = {
  VALID_BOOKING: {
    service: '1-on-1-training',
    date: '2024-12-25',
    time: '09:00',
  },
  PAST_DATE_BOOKING: {
    service: '1-on-1-training',
    date: '2020-01-01',
    time: '09:00',
  },
} as const
```

### Internationalization Considerations

```typescript
// __tests__/utils/test-i18n.ts
export const createI18nTestStrings = (locale: string = 'en') => ({
  booking: {
    title: locale === 'en' ? /book.*session/i : /réserver.*séance/i,
    submit: locale === 'en' ? /submit/i : /soumettre/i,
  },
})
```

## Accessibility Testing Framework

### jest-axe Setup

```typescript
// jest.setup.js (add to existing setup)
import 'jest-axe/extend-expect'

// __tests__/utils/accessibility.ts
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

export const runAccessibilityTests = async (container: HTMLElement) => {
  const results = await axe(container, {
    rules: {
      // Configure specific WCAG 2.1 AA rules
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'focus-visible': { enabled: true },
    },
  })
  expect(results).toHaveNoViolations()
}
```

### Accessibility Test Patterns

```typescript
// __tests__/components/booking-form.accessibility.test.tsx
import { render } from '../setup/test-utils'
import { runAccessibilityTests } from '../utils/accessibility'
import { BookingForm } from '@/components/booking-form'

describe('BookingForm Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <BookingForm isOpen={true} onClose={jest.fn()} />
    )
    await runAccessibilityTests(container)
  })

  it('should support keyboard navigation', () => {
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    // Test tab order
    const firstInput = screen.getByLabelText(/name/i)
    const secondInput = screen.getByLabelText(/email/i)
    
    firstInput.focus()
    userEvent.tab()
    expect(secondInput).toHaveFocus()
  })

  it('should announce form errors to screen readers', async () => {
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    const submitButton = screen.getByRole('button', { name: /continue/i })
    userEvent.click(submitButton)
    
    await waitFor(() => {
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')
    })
  })

  it('should have proper focus management in modal', () => {
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    
    // Focus should be trapped within modal
    const focusableElements = within(modal).getAllByRole('button')
    expect(focusableElements.length).toBeGreaterThan(0)
  })
})
```

### Screen Reader Testing Guidelines

```typescript
// __tests__/utils/screen-reader.ts
export const testScreenReaderAnnouncements = {
  async expectAnnouncement(text: string | RegExp) {
    const announcement = await screen.findByRole('status', { name: text })
    expect(announcement).toBeInTheDocument()
  },

  async expectErrorAnnouncement(text: string | RegExp) {
    const alert = await screen.findByRole('alert', { name: text })
    expect(alert).toBeInTheDocument()
  },

  expectProperLabeling(input: HTMLElement, expectedLabel: string | RegExp) {
    expect(input).toHaveAccessibleName(expectedLabel)
  },
}
```

## Mocking Strategies

### Mock Service Worker (MSW) Setup

```typescript
// __tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import { createMockBooking } from './factories/booking-factory'

export const handlers = [
  // Booking API endpoints
  http.post('/api/bookings', async ({ request }) => {
    const booking = await request.json()
    
    // Simulate validation
    if (!booking.email) {
      return HttpResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    return HttpResponse.json(createMockBooking(booking))
  }),

  // Error scenarios
  http.post('/api/bookings/error', () => {
    return HttpResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }),

  // Network timeout simulation
  http.post('/api/bookings/timeout', () => {
    return new Promise(() => {}) // Never resolves
  }),
]

// __tests__/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// jest.setup.js (add to existing setup)
import { server } from './__tests__/mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Mock Data Factories

```typescript
// __tests__/mocks/factories/user-factory.ts
import { faker } from '@faker-js/faker'

export interface MockUser {
  id: string
  name: string
  email: string
  phone: string
  goals: string
}

export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number('04## ### ###'),
  goals: faker.helpers.arrayElement(['weight-loss', 'strength', 'flexibility']),
  ...overrides,
})

export const createMockUsers = (count: number): MockUser[] =>
  Array.from({ length: count }, () => createMockUser())

// __tests__/mocks/factories/booking-factory.ts
import { faker } from '@faker-js/faker'
import { createMockUser } from './user-factory'

export interface MockBooking {
  id: string
  user: MockUser
  service: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export const createMockBooking = (overrides: Partial<MockBooking> = {}): MockBooking => ({
  id: faker.string.uuid(),
  user: createMockUser(),
  service: faker.helpers.arrayElement(['1-on-1-training', 'group-class', 'online-session']),
  date: faker.date.future().toISOString().split('T')[0],
  time: faker.helpers.arrayElement(['09:00', '10:00', '11:00', '14:00', '15:00']),
  status: 'pending',
  ...overrides,
})
```

### Service Mocking Best Practices

```typescript
// __tests__/utils/mock-utils.ts
export const createMockApiResponse = <T>(
  data: T,
  options: { delay?: number; status?: number } = {}
) => {
  const { delay = 0, status = 200 } = options
  
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (status >= 400) {
        reject(new Error(`API Error: ${status}`))
      } else {
        resolve(data)
      }
    }, delay)
  })
}

// Usage in tests
const mockBookingService = {
  createBooking: jest.fn().mockImplementation((data) =>
    createMockApiResponse(createMockBooking(data))
  ),
  
  createBookingWithError: jest.fn().mockImplementation(() =>
    createMockApiResponse(null, { status: 500 })
  ),
}
```

## Testing Behavior vs Implementation

### Anti-Patterns to Avoid

```typescript
// ❌ DON'T: Test CSS classes (implementation detail)
expect(screen.getByRole('button')).toHaveClass('bg-primary')
expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')

// ❌ DON'T: Test internal component state
expect(component.state.isLoading).toBe(true)

// ❌ DON'T: Test component methods directly
expect(component.instance().handleSubmit).toHaveBeenCalled()

// ❌ DON'T: Test implementation details
expect(mockFunction).toHaveBeenCalledWith(
  expect.objectContaining({ internalProperty: 'value' })
)
```

### Correct Patterns: Test User Experience

```typescript
// ✅ DO: Test visual feedback users see
expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
expect(screen.getByRole('button')).toBeDisabled()

// ✅ DO: Test user interactions and outcomes
userEvent.click(screen.getByRole('button', { name: /submit/i }))
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument()
})

// ✅ DO: Test accessibility attributes
expect(screen.getByRole('button')).toHaveAccessibleName('Submit booking form')
expect(screen.getByRole('alert')).toHaveTextContent('Form submitted successfully')

// ✅ DO: Test semantic meaning
const submitButton = screen.getByRole('button', { name: /submit/i })
expect(submitButton).toHaveAttribute('type', 'submit')
```

### User-Centric Testing Approaches

```typescript
// __tests__/components/booking-form.behavior.test.tsx
import { render, screen, userEvent, waitFor } from '../setup/test-utils'
import { TEST_STRINGS, TEST_USER_DATA } from '../constants'

describe('BookingForm User Experience', () => {
  it('should guide user through booking process', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    // Step 1: User sees form and understands what to do
    expect(screen.getByRole('heading', { level: 2 }))
      .toHaveTextContent(TEST_STRINGS.BOOKING.FORM_TITLE)
    
    // Step 2: User fills out required information
    await user.type(
      screen.getByLabelText(/name/i),
      TEST_USER_DATA.VALID_USER.name
    )
    await user.type(
      screen.getByLabelText(/email/i),
      TEST_USER_DATA.VALID_USER.email
    )
    
    // Step 3: User receives feedback on their actions
    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toBeEnabled()
    
    // Step 4: User progresses through form
    await user.click(continueButton)
    
    await waitFor(() => {
      expect(screen.getByText(TEST_STRINGS.BOOKING.STEP_TWO_TITLE))
        .toBeInTheDocument()
    })
  })

  it('should provide clear error feedback', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    // User tries to submit without required fields
    const continueButton = screen.getByRole('button', { name: /continue/i })
    await user.click(continueButton)
    
    // User sees clear error messages
    await waitFor(() => {
      const errorAlert = screen.getByRole('alert')
      expect(errorAlert).toBeInTheDocument()
      expect(errorAlert).toHaveTextContent(TEST_STRINGS.VALIDATION.REQUIRED_FIELD)
    })
    
    // Error is associated with the problematic field
    const nameInput = screen.getByLabelText(/name/i)
    expect(nameInput).toHaveAttribute('aria-invalid', 'true')
    expect(nameInput).toHaveAccessibleDescription(TEST_STRINGS.VALIDATION.REQUIRED_FIELD)
  })
})
```

## Error Scenarios & Edge Cases

### Network Failure Testing

```typescript
// __tests__/components/booking-form.errors.test.tsx
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

describe('BookingForm Error Handling', () => {
  it('should handle network failures gracefully', async () => {
    // Simulate network error
    server.use(
      http.post('/api/bookings', () => {
        return HttpResponse.error()
      })
    )
    
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    // Fill form and submit
    await fillValidBookingForm(user)
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    // User sees error message
    await waitFor(() => {
      expect(screen.getByRole('alert'))
        .toHaveTextContent(/network error.*try again/i)
    })
    
    // Form remains in submittable state
    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled()
  })

  it('should handle server validation errors', async () => {
    server.use(
      http.post('/api/bookings', () => {
        return HttpResponse.json(
          { 
            error: 'Invalid email format',
            field: 'email'
          },
          { status: 400 }
        )
      })
    )
    
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    await fillValidBookingForm(user)
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAccessibleDescription(/invalid email format/i)
    })
  })

  it('should handle timeout scenarios', async () => {
    server.use(
      http.post('/api/bookings', () => {
        // Simulate timeout by never resolving
        return new Promise(() => {})
      })
    )
    
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    await fillValidBookingForm(user)
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    // User sees loading state
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
    
    // After timeout, user sees error
    await waitFor(() => {
      expect(screen.getByRole('alert'))
        .toHaveTextContent(/request timed out/i)
    }, { timeout: 10000 })
  })
})
```

### Validation Error Handling

```typescript
describe('BookingForm Validation', () => {
  it('should validate email format', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab() // Trigger blur validation
    
    await waitFor(() => {
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAccessibleDescription(/valid email/i)
    })
  })

  it('should validate phone number format', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    const phoneInput = screen.getByLabelText(/phone/i)
    await user.type(phoneInput, '123') // Too short
    await user.tab()
    
    await waitFor(() => {
      expect(phoneInput).toHaveAttribute('aria-invalid', 'true')
      expect(phoneInput).toHaveAccessibleDescription(/valid phone number/i)
    })
  })

  it('should prevent booking past dates', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    // Navigate to date selection step
    await fillValidUserInfo(user)
    await user.click(screen.getByRole('button', { name: /continue/i }))
    
    const dateInput = screen.getByLabelText(/date/i)
    await user.type(dateInput, '2020-01-01') // Past date
    
    await waitFor(() => {
      expect(dateInput).toHaveAttribute('aria-invalid', 'true')
      expect(dateInput).toHaveAccessibleDescription(/future date/i)
    })
  })
})
```

### Boundary Condition Testing

```typescript
describe('BookingForm Boundary Conditions', () => {
  it('should handle maximum name length', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    const longName = 'a'.repeat(101) // Assuming 100 char limit
    const nameInput = screen.getByLabelText(/name/i)
    
    await user.type(nameInput, longName)
    
    expect(nameInput).toHaveValue('a'.repeat(100)) // Truncated
    expect(screen.getByText(/100.*characters/i)).toBeInTheDocument()
  })

  it('should handle special characters in input', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    const nameInput = screen.getByLabelText(/name/i)
    await user.type(nameInput, "O'Connor-Smith")
    
    expect(nameInput).toHaveValue("O'Connor-Smith")
    expect(nameInput).toHaveAttribute('aria-invalid', 'false')
  })

  it('should handle rapid form submissions', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    await fillValidBookingForm(user)
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    // Rapid clicks should not cause multiple submissions
    await user.click(submitButton)
    await user.click(submitButton)
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    
    // Only one API call should be made
    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledTimes(1)
    })
  })
})
```

## Migration Guidelines

### Step-by-Step Fixing of Existing Tests

#### Phase 1: Remove Hardcoded Strings

```typescript
// Before: Hardcoded strings
expect(screen.getByText(/book your free session/i)).toBeInTheDocument()

// After: Use test constants
import { TEST_STRINGS } from '../constants/test-strings'
expect(screen.getByText(TEST_STRINGS.BOOKING.CTA_BUTTON)).toBeInTheDocument()
```

#### Phase 2: Replace CSS Class Testing

```typescript
// Before: Testing implementation details
expect(screen.getByRole('button')).toHaveClass('bg-primary')

// After: Test user-visible behavior
expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
expect(screen.getByRole('button')).not.toBeDisabled()
```

#### Phase 3: Add Accessibility Testing

```typescript
// Add to existing test files
import { runAccessibilityTests } from '../utils/accessibility'

describe('ComponentName', () => {
  // Existing tests...
  
  it('should have no accessibility violations', async () => {
    const { container } = render(<ComponentName />)
    await runAccessibilityTests(container)
  })
})
```

#### Phase 4: Implement Proper Mocking

```typescript
// Before: Basic Jest mocks
jest.mock('../api/booking-service')

// After: MSW with realistic responses
import { server } from '../mocks/server'
import { createMockBooking } from '../mocks/factories/booking-factory'

// Test uses MSW handlers automatically
```

### Refactoring Patterns

#### Pattern 1: Extract Test Utilities

```typescript
// __tests__/utils/form-helpers.ts
export const fillValidBookingForm = async (user: UserEvent) => {
  await user.type(screen.getByLabelText(/name/i), TEST_USER_DATA.VALID_USER.name)
  await user.type(screen.getByLabelText(/email/i), TEST_USER_DATA.VALID_USER.email)
  await user.type(screen.getByLabelText(/phone/i), TEST_USER_DATA.VALID_USER.phone)
  await user.selectOptions(screen.getByLabelText(/goals/i), TEST_USER_DATA.VALID_USER.goals)
}

export const expectFormValidationError = async (fieldName: string, errorMessage: RegExp) => {
  const field = screen.getByLabelText(new RegExp(fieldName, 'i'))
  await waitFor(() => {
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription(errorMessage)
  })
}
```

#### Pattern 2: Create Custom Render Functions

```typescript
// __tests__/utils/render-with-providers.tsx
export const renderWithBookingContext = (
  ui: ReactElement,
  options: { initialBookingState?: Partial<BookingState> } = {}
) => {
  const { initialBookingState = {} } = options
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BookingProvider initialState={initialBookingState}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </BookingProvider>
  )
  
  return render(ui, { wrapper: Wrapper })
}
```

### Gradual Improvement Strategy

1. **Week 1**: Add accessibility tests to all existing components
2. **Week 2**: Replace hardcoded strings with test constants
3. **Week 3**: Remove CSS class assertions, add behavior tests
4. **Week 4**: Implement MSW for API mocking
5. **Week 5**: Add comprehensive error scenario testing
6. **Week 6**: Create mock data factories and realistic test data

## Code Examples: Correct vs Incorrect

### Example 1: Button Component Testing

```typescript
// ❌ INCORRECT: Testing implementation details
describe('Button Component - WRONG APPROACH', () => {
  test('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
    expect(screen.getByRole('button')).toHaveClass('text-destructive-foreground')
  })
  
  test('renders button with text', () => {
    render(<Button>Click me</Button>) // Hardcoded string
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})

// ✅ CORRECT: Testing user experience and accessibility
describe('Button Component - CORRECT APPROACH', () => {
  test('should be accessible and interactive', async () => {
    const handleClick = jest.fn()
    const { container } = render(
      <Button onClick={handleClick} variant="destructive">
        {TEST_STRINGS.BUTTONS.DELETE}
      </Button>
    )
    
    // Accessibility testing
    await runAccessibilityTests(container)
    
    const button = screen.getByRole('button', { name: TEST_STRINGS.BUTTONS.DELETE })
    
    // Test user interaction
    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
    
    // Test semantic meaning for destructive actions
    expect(button).toHaveAttribute('aria-describedby')
    const description = screen.getByText(/this action cannot be undone/i)
    expect(description).toBeInTheDocument()
  })
  
  test('should support keyboard navigation', () => {
    render(<Button>{TEST_STRINGS.BUTTONS.SUBMIT}</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    
    expect(button).toHaveFocus()
    expect(button).toHaveAttribute('tabindex', '0')
  })
  
  test('should indicate disabled state to assistive technology', () => {
    render(<Button disabled>{TEST_STRINGS.BUTTONS.SUBMIT}</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })
})
```

### Example 2: Form Testing

```typescript
// ❌ INCORRECT: Fragile and incomplete testing
describe('BookingForm - WRONG APPROACH', () => {
  test('renders when isOpen is true', () => {
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    expect(screen.getByText('Book your free session')).toBeInTheDocument() // Hardcoded
  })
  
  test('closes when clicking outside', () => {
    const mockOnClose = jest.fn()
    render(<BookingForm isOpen={true} onClose={mockOnClose} />)
    
    const backdrop = screen.getByRole('dialog').parentElement
    fireEvent.click(backdrop!) // Using fireEvent instead of userEvent
    
    expect(mockOnClose).toHaveBeenCalled()
  })
})

// ✅ CORRECT: Comprehensive, accessible, and maintainable
describe('BookingForm - CORRECT APPROACH', () => {
  test('should provide accessible modal experience', async () => {
    const mockOnClose = jest.fn()
    const { container } = render(
      <BookingForm isOpen={true} onClose={mockOnClose} />
    )
    
    // Accessibility testing
    await runAccessibilityTests(container)
    
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveAttribute('aria-modal', 'true')
    expect(modal).toHaveAttribute('aria-labelledby')
    
    // Focus management
    expect(modal).toHaveFocus()
    
    // Screen reader announcements
    expect(screen.getByRole('heading', { level: 1 }))
      .toHaveTextContent(TEST_STRINGS.BOOKING.MODAL_TITLE)
  })
  
  test('should handle form submission with proper error handling', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    server.use(
      http.post('/api/bookings', () => {
        return HttpResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      })
    )
    
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    // Fill form with valid data
    await fillValidBookingForm(user)
    
    // Submit form
    await user.click(screen.getByRole('button', { name: TEST_STRINGS.BUTTONS.SUBMIT }))
    
    // Verify error handling
    await waitFor(() => {
      const errorAlert = screen.getByRole('alert')
      expect(errorAlert).toHaveTextContent(/email already exists/i)
      expect(errorAlert).toHaveAttribute('aria-live', 'polite')
    })
    
    // Form should remain in editable state for user to fix
    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    expect(emailInput).toHaveFocus() // Focus moves to problematic field
  })
  
  test('should support keyboard-only navigation', async () => {
    const user = userEvent.setup()
    render(<BookingForm isOpen={true} onClose={jest.fn()} />)
    
    // Tab through all form elements
    const formElements = [
      screen.getByLabelText(/name/i),
      screen.getByLabelText(/email/i),
      screen.getByLabelText(/phone/i),
      screen.getByLabelText(/goals/i),
      screen.getByRole('button', { name: TEST_STRINGS.BUTTONS.CONTINUE }),
    ]
    
    for (const element of formElements) {
      await user.tab()
      expect(element).toHaveFocus()
    }
  })
})
```

### Example 3: API Integration Testing

```typescript
// ❌ INCORRECT: Mocking implementation details
describe('BookingService - WRONG APPROACH', () => {
  test('calls API with correct parameters', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '123' })
    })
    global.fetch = mockFetch
    
    await bookingService.create({ name: 'John' })
    
    expect(mockFetch).toHaveBeenCalledWith('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John' })
    })
  })
})

// ✅ CORRECT: Testing user outcomes with realistic mocking
describe('BookingService - CORRECT APPROACH', () => {
  test('should create booking successfully', async () => {
    const bookingData = createMockBooking({
      user: createMockUser({ name: 'Sarah Wilson' })
    })
    
    server.use(
      http.post('/api/bookings', () => {
        return HttpResponse.json(bookingData)
      })
    )
    
    const result = await bookingService.create({
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      service: '1-on-1-training'
    })
    
    expect(result).toMatchObject({
      id: expect.any(String),
      user: expect.objectContaining({
        name: 'Sarah Wilson'
      }),
      status: 'pending'
    })
  })
  
  test('should handle network failures gracefully', async () => {
    server.use(
      http.post('/api/bookings', () => {
        return HttpResponse.error()
      })
    )
    
    await expect(
      bookingService.create({ name: 'John', email: 'john@example.com' })
    ).rejects.toThrow(/network error/i)
  })
  
  test('should retry failed requests', async () => {
    let attemptCount = 0
    
    server.use(
      http.post('/api/bookings', () => {
        attemptCount++
        if (attemptCount < 3) {
          return HttpResponse.error()
        }
        return HttpResponse.json(createMockBooking())
      })
    )
    
    const result = await bookingService.create({
      name: 'John',
      email: 'john@example.com'
    })
    
    expect(result).toBeDefined()
    expect(attemptCount).toBe(3) // Retried twice before success
  })
})
```

## Running Tests

### Updated Test Scripts

```bash
# Install new dependencies first
pnpm add -D jest-axe @faker-js/faker msw

# Unit tests with accessibility checking
pnpm test

# Unit tests with coverage (including accessibility coverage)
pnpm test:coverage

# Watch mode for development
pnpm test:watch

# Run only accessibility tests
pnpm test -- --testNamePattern="accessibility|a11y"

# Run tests with MSW debugging
pnpm test -- --verbose

# E2E tests
pnpm test:e2e

# E2E tests with accessibility audits
pnpm test:e2e -- --grep="accessibility"
```

### Updated Jest Configuration

```javascript
// jest.config.js - Enhanced configuration
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
    '!**/jest.setup.js',
    '!**/__tests__/mocks/**',
    '!**/__tests__/constants/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80, // Increased from 70%
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  // Separate test patterns for different types
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}'],
      testPathIgnorePatterns: ['<rootDir>/__tests__/**/*.accessibility.test.{js,jsx,ts,tsx}'],
    },
    {
      displayName: 'accessibility',
      testMatch: ['<rootDir>/__tests__/**/*.accessibility.test.{js,jsx,ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/__tests__/setup/accessibility.setup.js'],
    },
  ],
}

module.exports = createJestConfig(customJestConfig)
```

### Enhanced Jest Setup

```javascript
// jest.setup.js - Enhanced setup with new tools
import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'

// MSW setup
import { server } from './__tests__/mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock next/router (existing)
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock next/navigation (existing)
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
}))

// Enhanced window.matchMedia mock for accessibility testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: query.includes('prefers-reduced-motion: reduce') ? false : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver (existing)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver (existing)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock scrollIntoView (existing)
Element.prototype.scrollIntoView = jest.fn()

// Enhanced console mocking with accessibility warnings
const originalWarn = console.warn
global.console = {
  ...console,
  warn: jest.fn((message) => {
    // Allow accessibility-related warnings to show in tests
    if (message.includes('accessibility') || message.includes('a11y')) {
      originalWarn(message)
    }
  }),
  error: jest.fn((message) => {
    // Fail tests on accessibility errors
    if (message.includes('accessibility') || message.includes('a11y')) {
      throw new Error(`Accessibility error: ${message}`)
    }
  }),
}

// Global test timeout for async operations
jest.setTimeout(10000)
```

## Project Structure Updates

### Enhanced Test Directory Structure

```
__tests__/
├── components/
│   ├── booking-form.test.tsx
│   ├── booking-form.accessibility.test.tsx
│   ├── booking-form.errors.test.tsx
│   └── ui/
│       ├── button.test.tsx
│       ├── button.accessibility.test.tsx
│       └── form-field.test.tsx
├── setup/
│   ├── test-utils.tsx
│   └── accessibility.setup.js
├── constants/
│   ├── test-strings.ts
│   ├── test-data.ts
│   └── test-users.ts
├── mocks/
│   ├── server.ts
│   ├── handlers.ts
│   └── factories/
│       ├── user-factory.ts
│       ├── booking-factory.ts
│       └── service-factory.ts
├── utils/
│   ├── accessibility.ts
│   ├── form-helpers.ts
│   ├── mock-utils.ts
│   └── screen-reader.ts
└── fixtures/
    ├── booking-data.json
    ├── user-data.json
    └── error-responses.json
```

## CI/CD Integration

### Enhanced Pipeline Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test:ci
      
      - name: Run accessibility tests
        run: pnpm test -- --testNamePattern="accessibility"
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Accessibility audit
        run: pnpm lighthouse:ci
```

## Maintenance & Best Practices

### Regular Maintenance Tasks

1. **Weekly**: Review and update test constants for new copy changes
2. **Monthly**: Update mock data factories with new realistic scenarios
3. **Quarterly**: Review accessibility test coverage and add new patterns
4. **Per Release**: Run full accessibility audit and update documentation

### Code Review Checklist

- [ ] All new components have accessibility tests
- [ ] No hardcoded strings in test assertions
- [ ] Tests focus on user behavior, not implementation
- [ ] Error scenarios are covered
- [ ] Mock data uses factories, not hardcoded values
- [ ] Tests pass with screen readers enabled

### Performance Considerations

- Use `screen.getByRole()` over `screen.getByTestId()` for better semantics
- Prefer `userEvent` over `fireEvent` for realistic interactions
- Use `waitFor()` for async operations, avoid arbitrary timeouts
- Mock heavy dependencies to keep tests fast
- Use MSW instead of mocking fetch directly

## Resources & References

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [MSW Documentation](https://mswjs.io/docs/)
- [Faker.js Documentation](https://fakerjs.dev/)
- [Playwright Documentation](https://playwright.dev/docs/intro)

### Accessibility Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Testing Guide](https://webaim.org/articles/screenreader_testing/)
- [Inclusive Components](https://inclusive-components.design/)

### Testing Best Practices
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing Guide](https://web.dev/accessibility-testing/)

---

## Summary

This enhanced testing documentation addresses all critical issues identified in the current testing setup:

✅ **Hardcoded Strings**: Replaced with maintainable test constants
✅ **Accessibility Testing**: Comprehensive jest-axe integration and WCAG 2.1 AA compliance
✅ **Implementation Coupling**: Guidelines for testing behavior vs. presentation
✅ **Mocking Strategy**: MSW integration and realistic mock data factories
✅ **Error Scenarios**: Comprehensive error handling and edge case testing
✅ **Migration Path**: Step-by-step guidelines for improving existing tests

The documentation provides practical, actionable guidance that aligns with the project's high-quality standards and accessibility requirements, ensuring maintainable and robust test suites that support long-term project success.
