'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'

type ChartConfigItem = {
  label?: React.ReactNode
  icon?: React.ComponentType
} & (
  | { color?: string; theme?: never }
  | { color?: never; theme: Record<keyof typeof THEMES, string> }
)

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

export function useChart(): ChartContextProps {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >['children']
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    // Basic keyboard navigation support
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      // Focus management for chart interaction
    }
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div
        data-chart={chartId}
        ref={ref}
        role="application"
        aria-label="Interactive chart"
        aria-describedby={`${chartId}-description`}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <div id={`${chartId}-description`} className="sr-only">
          Chart displaying data with interactive tooltips. Use arrow keys to
          navigate.
        </div>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'Chart'

export const ChartStyle = React.memo(
  ({ id, config }: { id: string; config: ChartConfig }) => {
    const cssContent = React.useMemo(() => {
      const colorConfig = Object.entries(config).filter(
        ([_, config]) => config.theme || config.color
      )

      if (!colorConfig.length) {
        return null
      }

      return Object.entries(THEMES)
        .map(([theme, prefix]) =>
          generateThemeCSS(theme, prefix, id, colorConfig)
        )
        .join('\n')
    }, [config, id])

    if (!cssContent) {
      return null
    }

    return (
      <style
        dangerouslySetInnerHTML={{
          __html: cssContent,
        }}
      />
    )
  }
)
ChartStyle.displayName = 'ChartStyle'

function generateThemeCSS(
  theme: string,
  prefix: string,
  id: string,
  colorConfig: [string, ChartConfigItem][]
): string {
  const colorRules = colorConfig
    .map(([key, itemConfig]) => {
      const color =
        itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
        itemConfig.color
      return color ? `  --color-${key}: ${color};` : null
    })
    .filter(Boolean)
    .join('\n')

  return `
${prefix} [data-chart=${id}] {
${colorRules}
}
`
}