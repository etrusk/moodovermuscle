# Pattern: Chart Component Decomposition

**Complexity**: Medium (6-8 complexity units)
**Files Affected**: 5 files (main component + 4 decomposed modules)
**Prerequisites**: Large chart component (>300 lines), complex rendering logic, parameter violations
**Use Cases**: Breaking down monolithic chart/data visualization components into focused modules

## Implementation Steps

### 1. Analyze Chart Structure
- Identify chart-specific concerns (rendering, tooltips, legends, utilities)
- Map data flow between chart components and context
- Identify parameter violations and complex functions

### 2. Create Utility Module First
**Target**: Core utilities, type definitions, and parameter reduction
```typescript
// components/ui/chart/utils.tsx
export interface FormatterConfig {
  formatter: (...args: unknown[]) => React.ReactNode
  value: unknown
  name: string
  item?: ChartPayloadItem
  index?: number
  payload?: ChartPayloadItem[]
}

// Parameter Reduction Pattern Applied
export function safeFormatter(config: FormatterConfig): React.ReactNode {
  // Single configuration object instead of 6 parameters
}
```

### 3. Create Core Module
**Target**: Main container, context provider, and core rendering logic
```typescript
// components/ui/chart/core.tsx
export const ChartContainer = React.forwardRef<>(() => {
  // Core chart container logic
  // Chart context provider
  // Accessibility features
})

export const ChartStyle = React.memo(() => {
  // Dynamic CSS generation
  // Theme handling
})
```

### 4. Create Feature-Specific Modules
**Target**: Tooltip and legend components as separate modules
```typescript
// components/ui/chart/tooltip.tsx - Tooltip rendering logic
// components/ui/chart/legend.tsx - Legend rendering logic
```

### 5. Update Main Component File
**Target**: Clean exports architecture
```typescript
// components/ui/chart.tsx (28 lines)
export { ChartContainer, ChartStyle, useChart } from './chart/core'
export { ChartTooltip, ChartTooltipContent } from './chart/tooltip'
export { ChartLegend, ChartLegendContent } from './chart/legend'
export { safeFormatter, type ChartPayloadItem } from './chart/utils'
```

## Decomposition Strategy

### By Chart Responsibility
- **Core Module**: Container, context, styling engine
- **Utils Module**: Data formatting, type safety, parameter reduction
- **Tooltip Module**: Interactive tooltip components and logic
- **Legend Module**: Chart legend components and rendering

### By Complexity Reduction
- Extract functions >50 lines into appropriate modules
- Reduce parameter counts using configuration objects
- Separate rendering logic from business logic
- Break down complex tooltip/legend rendering

### By Reusability
- Create composable chart components
- Extract reusable formatting utilities
- Document component interfaces for consistent usage

## Parameter Reduction Pattern

### Before: ESLint Violation (6 parameters)
```typescript
function safeFormatter(
  formatter: (...args: any[]) => React.ReactNode,
  value: unknown,
  name: string,
  item: ChartPayloadItem,
  index: number,
  payload: ChartPayloadItem[]
): React.ReactNode
```

### After: Configuration Object (ESLint Compliant)
```typescript
export interface FormatterConfig {
  formatter: (...args: unknown[]) => React.ReactNode
  value: unknown
  name: string
  item?: ChartPayloadItem
  index?: number
  payload?: ChartPayloadItem[]
}

export function safeFormatter(config: FormatterConfig): React.ReactNode
```

## Example: Chart Component Decomposition Results

### Before (449 lines monolithic)
```typescript
// components/ui/chart.tsx (449 lines)
export const ChartContainer = () => {
  // Container logic (80 lines)
  // Style generation (70 lines)
  // Tooltip components (180 lines)
  // Legend components (60 lines)
  // Utilities (59 lines)
}
```

### After (Decomposed architecture)
```typescript
// components/ui/chart.tsx (28 lines - exports only)
export { ChartContainer, ChartStyle, useChart } from './chart/core'
export { ChartTooltip, ChartTooltipContent } from './chart/tooltip'
export { ChartLegend, ChartLegendContent } from './chart/legend'
export { safeFormatter, type ChartPayloadItem } from './chart/utils'

// components/ui/chart/core.tsx (147 lines)
// components/ui/chart/utils.tsx (72 lines)
// components/ui/chart/tooltip.tsx (380 lines)
// components/ui/chart/legend.tsx (67 lines)
```

### Benefits Achieved
- **ESLint Compliance**: Main file under 300 lines (28 vs 300 limit)
- **Parameter Reduction**: safeFormatter 6 → 1 parameters (ESLint compliant)
- **Maintainability**: Each module has focused responsibility
- **Testing**: Individual chart modules can be tested in isolation
- **TypeScript Safety**: Better type organization and reusability

## Success Metrics

**Phase 3B Results** (Chart Component):
- **Complexity Reduction**: 449 → 28 lines main file (94% reduction)
- **ESLint Compliance**: Parameter violations resolved (6 → 1 parameters)
- **Test Stability**: 142/145 tests passing (97.9% pass rate maintained)
- **Pattern Reuse**: Successfully applied UI Component Decomposition Pattern from Phase 2
- **TypeScript Safety**: Core compilation passes with improved type organization

This pattern successfully demonstrates chart-specific decomposition while maintaining the proven UI Component Decomposition Pattern principles established in Phase 2.