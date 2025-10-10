# Behavior-Focused Testing Pattern

## Core Principle
Test functionality and behavior, not implementation details like exact text strings.

## Anti-Patterns to Avoid

```typescript
// ❌ BAD: Brittle, text-dependent tests
expect(screen.getByText('Start FREE Session')).toBeInTheDocument()
expect(screen.getByText('$80 per session')).toBeInTheDocument()
expect(screen.getByText('1-on-1 Personal Training')).toBeInTheDocument()
```

## Recommended Patterns

### 1. Test User Actions, Not Labels

```typescript
// ✅ GOOD: Test that booking action exists and works
const bookingAction = container.querySelector('[data-action="book"]')
expect(bookingAction).toBeEnabled()
fireEvent.click(bookingAction)
expect(mockBookingHandler).toHaveBeenCalled()
```

### 2. Use Semantic Queries

```typescript
// ✅ GOOD: Use roles and structure
expect(screen.getByRole('button')).toBeEnabled()
expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
```

### 3. Test Data, Not Display

```typescript
// ✅ GOOD: Verify data attributes
const priceElement = container.querySelector('[data-price]')
expect(priceElement?.getAttribute('data-price')).toMatch(/\d+/)
```

### 4. Minimal Assertions

```typescript
// ✅ GOOD: One assertion per concept
it('enables booking when available', () => {
  const { container } = render(<ServiceCard available={true} />)
  expect(container.querySelector('[data-action="book"]')).not.toBeDisabled()
})

it('disables booking when unavailable', () => {
  const { container } = render(<ServiceCard available={false} />)
  expect(container.querySelector('[data-action="book"]')).toBeDisabled()
})
```

## Benefits
- Marketing can update copy without breaking tests
- Tests are smaller and more focused
- Less maintenance burden
- Tests document behavior, not current UI text

## Implementation Strategy
1. Add minimal data attributes to components (data-action, data-state, data-value)
2. Use container.querySelector for simple selections
3. Use semantic roles where appropriate
4. Keep tests focused on single behaviors