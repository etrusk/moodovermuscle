# Pattern: UI Component Decomposition

**Complexity**: Medium (6-8 complexity units)
**Files Affected**: 4-6 files (main component + decomposed modules)
**Prerequisites**: Large monolithic UI component (>300 lines), complex component logic
**Use Cases**: Breaking down monolithic UI components into focused, single-responsibility modules

## Implementation Steps

### 1. Analyze Component Structure
- Identify distinct logical concerns within the component
- Map business logic vs presentation logic
- Identify reusable patterns and shared state

### 2. Create Provider/Context Module
**Target**: State management, context, and business logic
```typescript
// components/ui/[component]/provider.tsx
export const ComponentProvider = React.forwardRef<>(() => {
  // State management logic
  // Context value memoization
  // Business logic hooks
})

export const useComponent = (): ComponentContext => {
  // Context consumption logic
}
```

### 3. Create Core Component Module
**Target**: Main rendering logic and variants
```typescript
// components/ui/[component]/core.tsx
export const Component = React.forwardRef<>(() => {
  // Core rendering logic
  // Variant handling
  // Platform-specific rendering (mobile/desktop)
})

// Related core components
export const ComponentHeader = React.forwardRef<>(() => {})
export const ComponentContent = React.forwardRef<>(() => {})
export const ComponentFooter = React.forwardRef<>(() => {})
```

### 4. Create Feature Modules
**Target**: Specific feature sets with related components
```typescript
// components/ui/[component]/[feature].tsx
export const ComponentFeature = React.forwardRef<>(() => {})
export const ComponentFeatureItem = React.forwardRef<>(() => {})

// Use CVA for complex styling variants
const componentVariants = cva(baseClasses, {
  variants: { /* variant definitions */ }
})
```

### 5. Create Utility Module
**Target**: Supporting components and utilities
```typescript
// components/ui/[component]/utils.tsx
export const ComponentTrigger = React.forwardRef<>(() => {})
export const ComponentAction = React.forwardRef<>(() => {})
```

### 6. Update Main Component File
**Target**: Composed architecture with clean exports
```typescript
// components/ui/[component].tsx
// Re-export all decomposed modules
export { ComponentProvider, useComponent } from "./[component]/provider"
export { Component, ComponentContent } from "./[component]/core"
export { ComponentFeature } from "./[component]/[feature]"
export { ComponentTrigger } from "./[component]/utils"
```

## Decomposition Strategy

### By Responsibility (Single Responsibility Principle)
- **Provider Logic**: Context, state management, business logic
- **Core Components**: Main rendering, layout, variants
- **Feature Modules**: Specific functionality groups (menus, forms, etc.)
- **Utilities**: Supporting components, triggers, actions

### By Complexity (Function Size Limits)
- Extract functions >50 lines into separate modules
- Break down complex rendering logic into helper functions
- Separate business logic from presentation logic

### By Reusability
- Extract reusable patterns into shared modules
- Create composable components from monolithic structures
- Document component interfaces for consistent usage

## Testing Strategy

### Module-Level Testing
- Test each decomposed module independently
- Mock dependencies between modules
- Verify component interfaces remain stable

### Integration Testing
- Test composed component functionality
- Verify all exports work correctly
- Ensure backward compatibility maintained

### Interface Testing
- Validate public API unchanged
- Test all component variants and props
- Verify TypeScript types exported correctly

## Quality Gate Compliance

### ESLint Rules Addressed
- `max-lines-per-function`: Functions <50 lines
- `max-lines`: Files <300 lines  
- `complexity`: Cyclomatic complexity <10
- `max-params`: Function parameters <5

### TypeScript Requirements
- All exports properly typed
- No `any` types introduced
- Component prop interfaces maintained
- Context types properly exported

## Example: Sidebar Component Decomposition

### Before (738 lines monolithic)
```typescript
// components/ui/sidebar.tsx (738 lines)
export const Sidebar = () => {
  // Provider logic (120 lines)
  // Core rendering (200 lines) 
  // Menu components (300 lines)
  // Utility components (118 lines)
}
```

### After (Decomposed architecture)
```typescript
// components/ui/sidebar.tsx (35 lines - exports only)
export { SidebarProvider, useSidebar } from "./sidebar/provider"
export { Sidebar, SidebarContent } from "./sidebar/core"  
export { SidebarMenu, SidebarMenuItem } from "./sidebar/menu"
export { SidebarTrigger, SidebarRail } from "./sidebar/utils"

// components/ui/sidebar/provider.tsx (155 lines)
// components/ui/sidebar/core.tsx (175 lines)
// components/ui/sidebar/menu.tsx (260 lines)
// components/ui/sidebar/utils.tsx (66 lines)
```

### Benefits Achieved
- **Maintainability**: Each module has single responsibility
- **Testing**: Individual modules can be tested in isolation
- **Reusability**: Provider logic can be reused across variants
- **Developer Experience**: Smaller files easier to navigate
- **Quality Gates**: All files under 300 lines, functions under 50 lines

## Common Pitfalls

### Over-Decomposition
- Don't create modules for <30 lines of closely related code
- Avoid breaking logical cohesion for the sake of line limits
- Keep related helper functions within the same module

### Circular Dependencies
- Use clear dependency hierarchy: Provider → Core → Features → Utils
- Avoid bidirectional imports between modules
- Extract shared types to separate files if needed

### Interface Fragmentation
- Maintain consistent component APIs across modules
- Don't expose internal module details in main exports
- Keep backward compatibility when refactoring

### Context Overuse
- Only create context for truly shared state
- Don't use context for simple prop passing
- Consider component composition over context in many cases

## Related Patterns

- [Function Decomposition Pattern](./api-function-decomposition-pattern.md) - Applied to UI components
- [React Hook Pattern](./react-hook-pattern.md) - For extracting stateful logic
- [Component Composition Pattern](./component-composition-pattern.md) - For building flexible APIs

## Performance Considerations

### Bundle Size Impact
- Tree-shaking works better with decomposed exports
- Unused modules won't be included in final bundle
- Consider code-splitting for large feature modules

### Runtime Performance
- Context providers should memoize values appropriately
- Avoid creating new objects in render functions
- Use React.memo for expensive child components

### Development Performance
- Smaller files load faster in IDEs
- Better IntelliSense and autocomplete performance
- Easier to locate and modify specific functionality

## Migration Strategy

### Phase 1: Analysis
1. Identify component boundaries and responsibilities
2. Map dependencies between different sections
3. Plan module structure and naming conventions

### Phase 2: Decomposition
1. Create provider/context module first
2. Extract core rendering logic
3. Move feature-specific components to modules
4. Create utility components module

### Phase 3: Integration
1. Update main component file with exports
2. Run quality gates to ensure compliance
3. Update documentation and usage examples
4. Test backward compatibility

### Phase 4: Cleanup
1. Remove unused imports and dependencies
2. Update related components using the decomposed structure
3. Document new patterns for institutional memory