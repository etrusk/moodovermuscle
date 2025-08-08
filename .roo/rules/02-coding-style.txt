# MoodOverMuscle Coding Style Guide

## TypeScript Standards

### Type System Requirements
- **ZERO `any` types allowed** - use proper typing or `unknown` with type guards
- All functions must have explicit return types for public APIs
- Strict TypeScript configuration compliance (`strict: true`)
- Interface segregation: prefer specific interfaces over large objects
- Use utility types (`Partial<T>`, `Pick<T>`, `Omit<T>`) appropriately

### TypeScript Best Practices
```typescript
// ✅ GOOD: Explicit return types
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ GOOD: Proper generic constraints
interface ApiResponse<T extends Record<string, unknown>> {
  data: T;
  status: number;
  message: string;
}

// ❌ BAD: Using any
function processData(data: any): any {
  return data.something;
}

// ✅ GOOD: Using unknown with type guards
function processData(data: unknown): ProcessedData | null {
  if (isValidData(data)) {
    return transformData(data);
  }
  return null;
}
```

### Interface Design
```typescript
// ✅ GOOD: Specific interfaces
interface BookingFormData {
  serviceId: string;
  datetime: Date;
  duration: number;
  clientName: string;
  clientEmail: string;
}

interface BookingValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// ❌ BAD: Large catch-all interface
interface BookingEverything {
  serviceId: string;
  datetime: Date;
  duration: number;
  clientName: string;
  clientEmail: string;
  isValid: boolean;
  errors: ValidationError[];
  // ... too many concerns
}
```

## Code Style Requirements

### ESLint & Prettier Compliance
- **ESLint compliance**: All code must pass `npm run lint` without warnings
- **Prettier formatting**: All code must pass `npm run lint` (includes Prettier)
- **Consistent naming**: camelCase for variables/functions, PascalCase for components/types
- **File naming**: kebab-case for files, PascalCase for React components

### Naming Conventions
```typescript
// ✅ GOOD: Consistent naming
const bookingService = new BookingService();
const calculateAvailability = (slots: TimeSlot[]): boolean => { /* */ };

interface UserProfile {
  firstName: string;
  lastName: string;
}

// Files
booking-service.ts           // kebab-case for utilities
BookingForm.tsx             // PascalCase for React components
user-profile.types.ts       // descriptive, kebab-case
```

## React/Next.js Standards

### Component Standards
```tsx
// ✅ GOOD: Function component with proper typing
interface BookingFormProps {
  initialData?: BookingFormData;
  onSubmit: (data: BookingFormData) => Promise<void>;
  disabled?: boolean;
}

export function BookingForm({ 
  initialData, 
  onSubmit, 
  disabled = false 
}: BookingFormProps): JSX.Element {
  const [formData, setFormData] = useState<BookingFormData>(
    initialData ?? getDefaultFormData()
  );

  const handleSubmit = useCallback(async (data: BookingFormData) => {
    await onSubmit(data);
  }, [onSubmit]);

  return (
    <form onSubmit={handleSubmit}>
      {/* component content */}
    </form>
  );
}
```

### Hook Usage
```tsx
// ✅ GOOD: Proper dependency arrays
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]); // Include all dependencies

const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]); // Include all dependencies

// ✅ GOOD: Custom hooks with proper return types
function useBookingForm(initialData?: BookingFormData): {
  formData: BookingFormData;
  updateField: (field: keyof BookingFormData, value: any) => void;
  isValid: boolean;
  submit: () => Promise<void>;
} {
  // hook implementation
}
```

### Next.js Patterns
```tsx
// ✅ GOOD: App Router page component
interface BookingPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function BookingPage({ params, searchParams }: BookingPageProps) {
  return (
    <div>
      {/* page content */}
    </div>
  );
}

// ✅ GOOD: API route with proper typing
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const validatedData = bookingSchema.parse(body);
    
    const result = await createBooking(validatedData);
    
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid request' }, 
      { status: 400 }
    );
  }
}
```

## File Management Principles

### Creation vs. Editing Policy
- **ALWAYS prefer editing existing files over creating new ones**
- Only create new files when absolutely necessary for functionality
- **NEVER proactively create documentation files** (*.md, README) unless explicitly requested
- Consolidate related functionality into existing modules when possible

### File Organization
```
app/
  admin/
    bookings/
      page.tsx              # Main booking page
      loading.tsx           # Loading component
      error.tsx             # Error boundary
  api/
    bookings/
      route.ts              # API endpoints
      validation.ts         # Request validation
      
components/
  booking-form/
    BookingForm.tsx         # Main component
    booking-form.types.ts   # Component-specific types
    booking-form.test.tsx   # Component tests
    
lib/
  booking/
    booking-service.ts      # Business logic
    booking.types.ts        # Shared types
    booking.utils.ts        # Utility functions
```

## Error Handling Standards

### API Error Handling
```typescript
// ✅ GOOD: Structured error handling
interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

function handleApiError(error: unknown): ApiError {
  if (error instanceof ValidationError) {
    return {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.details
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'GENERIC_ERROR'
    };
  }
  
  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR'
  };
}
```

### Component Error Handling
```tsx
// ✅ GOOD: Error boundaries and graceful degradation
function BookingForm({ onSubmit }: BookingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="error-message">
        <p>Error: {error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  // form rendering
}
```

## Performance Standards

### React Optimization
```tsx
// ✅ GOOD: Proper memoization
const ExpensiveComponent = React.memo(function ExpensiveComponent({ 
  data, 
  onUpdate 
}: ExpensiveComponentProps) {
  const processedData = useMemo(() => {
    return processLargeDataset(data);
  }, [data]);

  const handleUpdate = useCallback((id: string, updates: Partial<Item>) => {
    onUpdate(id, updates);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <ItemComponent 
          key={item.id}
          item={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
});
```

### Database Optimization
```typescript
// ✅ GOOD: Optimized Prisma queries
async function getBookingsWithDetails(userId: string): Promise<BookingWithDetails[]> {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          duration: true
        }
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: {
      datetime: 'desc'
    }
  });
}

// ❌ BAD: N+1 query problem
async function getBookingsWithDetailsBad(userId: string) {
  const bookings = await prisma.booking.findMany({ where: { userId } });
  
  for (const booking of bookings) {
    booking.service = await prisma.service.findUnique({ 
      where: { id: booking.serviceId } 
    });
  }
  
  return bookings;
}
```

## Import/Export Standards

### Import Organization
```typescript
// ✅ GOOD: Organized imports
// 1. Node modules
import React, { useState, useCallback } from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. Internal modules (absolute imports)
import { BookingService } from '@/lib/booking/booking-service';
import { validateBookingData } from '@/lib/validation/booking-validation';

// 3. Relative imports
import './booking-form.styles.css';
import { BookingFormProps } from './booking-form.types';

// 4. Type-only imports (grouped separately)
import type { BookingData } from '@/types/booking';
import type { ApiResponse } from '@/types/api';
```

### Export Patterns
```typescript
// ✅ GOOD: Named exports for utilities
export function calculateBookingTotal(items: BookingItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function validateBookingData(data: unknown): BookingData {
  return bookingSchema.parse(data);
}

// ✅ GOOD: Default export for React components
export default function BookingForm(props: BookingFormProps) {
  // component implementation
}

// ✅ GOOD: Barrel exports when beneficial
// booking/index.ts
export { BookingService } from './booking-service';
export { validateBookingData } from './booking-validation';
export type { BookingData, BookingFormData } from './booking.types';
```

## Testing Standards

### Test File Organization
```typescript
// booking-service.test.ts
describe('BookingService', () => {
  describe('createBooking', () => {
    it('should create a booking with valid data', async () => {
      // Arrange
      const mockData: BookingFormData = {
        serviceId: 'service-1',
        datetime: new Date('2024-01-01T10:00:00Z'),
        duration: 60,
        clientName: 'John Doe',
        clientEmail: 'john@example.com'
      };

      // Act
      const result = await bookingService.createBooking(mockData);

      // Assert
      expect(result).toMatchObject({
        id: expect.any(String),
        status: 'confirmed',
        serviceId: mockData.serviceId
      });
    });

    it('should throw error for invalid data', async () => {
      // Arrange
      const invalidData = { invalid: 'data' };

      // Act & Assert
      await expect(
        bookingService.createBooking(invalidData as any)
      ).rejects.toThrow('Invalid booking data');
    });
  });
});
```

## Anti-Patterns to Avoid

### TypeScript Anti-Patterns
❌ **Using `any` types**: Defeats the purpose of TypeScript
❌ **Ignoring TypeScript errors**: Use proper types instead of `@ts-ignore`
❌ **Overly complex types**: Keep interfaces focused and composable
❌ **Missing return types**: Always specify return types for public APIs

### React Anti-Patterns
❌ **Hooks in conditions**: Violates rules of hooks
❌ **Missing dependency arrays**: Causes stale closures and bugs
❌ **Unnecessary re-renders**: Use memoization appropriately
❌ **Prop drilling**: Use context or state management for deep props

### Performance Anti-Patterns
❌ **N+1 database queries**: Use proper joins and includes
❌ **Unnecessary API calls**: Implement proper caching strategies
❌ **Large bundle sizes**: Use dynamic imports for code splitting
❌ **Inefficient re-renders**: Use React.memo and useMemo appropriately

This coding style guide ensures consistency across the MoodOverMuscle codebase while maintaining high standards for type safety, performance, and maintainability.