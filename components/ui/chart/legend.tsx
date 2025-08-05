'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'
import { useChart } from './core'
import { ChartPayloadItem, getPayloadConfigFromPayload } from './utils'

export const ChartLegend = RechartsPrimitive.Legend

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    payload?: ChartPayloadItem[]
    verticalAlign?: 'top' | 'bottom' | 'middle'
    hideIcon?: boolean
    nameKey?: string
  }
>(
  (
    {
      className,
      hideIcon = false,
      payload = [],
      verticalAlign = 'bottom',
      nameKey,
    },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-4',
          verticalAlign === 'top' ? 'pb-3' : 'pt-3',
          className
        )}
      >
        {payload.map((item: ChartPayloadItem, index: number) => {
          const key = `${nameKey ?? item.dataKey ?? 'value'}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={(item.value as string) ?? `legend-${index}`}
              className={cn(
                'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground'
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <div />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color as string,
                  }}
                />
              )}
              {itemConfig?.label as React.ReactNode}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = 'ChartLegend'