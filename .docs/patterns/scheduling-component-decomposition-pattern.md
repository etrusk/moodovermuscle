# Scheduling Component Decomposition Pattern

**Pattern Type**: Component Architecture  
**Complexity**: Medium  
**Prerequisites**: React hooks, TypeScript interfaces  
**Applied In**: SchedulingStep component ESLint resolution

## Problem

Complex scheduling components (date/time selection with form validation) become unmaintainable when they exceed ~300 lines, leading to:
- Mixed UI and business logic concerns
- Difficult testing and debugging
- TypeScript `any` types from complex state management
- ESLint violations from large component size

## Solution

Decompose scheduling components into focused subcomponents with clear responsibilities:

### Core Decomposition Structure

```typescript
// Main scheduling component (orchestrator)
SchedulingStep.tsx (63 lines) - coordinates subcomponents

// UI subcomponents (focused responsibilities)
├── DateSelector.tsx - date selection UI only
├── TimeSelector.tsx - time slot selection UI only  
├── MessageInput.tsx - message input UI only
└── useSlotLocking.ts - slot locking business logic hook
```

### Implementation Approach

1. **Extract Date Selection Logic**:
```typescript
// DateSelector.tsx - focused on date UI
interface DateSelectorProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  availableDates: string[];
}
```

2. **Extract Time Selection Logic**:
```typescript
// TimeSelector.tsx - focused on time slot UI
interface TimeSelectorProps {
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  availableSlots: TimeSlot[];
}
```

3. **Extract Business Logic Hooks**:
```typescript
// useSlotLocking.ts - pure business logic
export const useSlotLocking = (selectedDate: string | null, selectedTime: string | null) => {
  // Slot locking logic without UI concerns
};
```

4. **Maintain Coordination in Parent**:
```typescript
// SchedulingStep.tsx - lightweight orchestrator
export const SchedulingStep = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  return (
    <div>
      <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      <TimeSelector selectedTime={selectedTime} onTimeSelect={setSelectedTime} />
      <MessageInput />
    </div>
  );
};
```

## Results Achieved

**SchedulingStep Component Size Reduction**: 337 → 63 lines (81% reduction)
**TypeScript Safety**: Eliminated all `any` types through focused interfaces
**Maintainability**: Clear separation of concerns enables targeted testing
**Reusability**: Subcomponents can be reused in other scheduling contexts

## Usage Guidelines

**Apply this pattern when**:
- Scheduling components exceed 200 lines
- Multiple date/time selection concerns are mixed
- TypeScript types become complex due to mixed responsibilities
- Testing becomes difficult due to component size

**Component Size Targets**:
- Main scheduling component: < 100 lines (orchestration only)
- Date/time selectors: < 80 lines each (focused UI)
- Business logic hooks: < 50 lines (pure logic)

## Related Patterns

- **UI Component Decomposition Pattern**: General decomposition approach
- **Logic Layer Separation Pattern**: Business logic extraction principles
- **Form State Management Separation Pattern**: State management extraction

## Quality Gates

- Each subcomponent has single responsibility
- Business logic extracted to custom hooks
- TypeScript interfaces are focused and type-safe
- No component exceeds 100 lines after decomposition
- All components individually testable

---
*Applied successfully in SchedulingStep ESLint resolution (Aug 2025)*