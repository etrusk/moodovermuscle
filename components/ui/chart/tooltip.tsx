'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'
import { useChart } from './core'
import {
  ChartPayloadItem,
  safeFormatter,
  getPayloadConfigFromPayload,
  FormatterConfig,
} from './utils'
import { useTooltipLogic } from './tooltip-logic'
import {
  ChartTooltipContentProps,
  TooltipRowProps,
  TooltipRowContentProps,
  ChartConfig,
} from './tooltip-types'

export const ChartTooltip = RechartsPrimitive.Tooltip

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload = [],
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const { tooltipLabel, isVisible, nestLabel } = useTooltipLogic({
      active,
      payload,
      hideLabel,
      label,
      labelFormatter,
      labelClassName,
      config: config as ChartConfig,
      labelKey,
      indicator,
    })

    if (!isVisible) {
      return null
    }

    return (
      <ChartTooltipContainer
        ref={ref}
        className={className}
        nestLabel={nestLabel}
        tooltipLabel={tooltipLabel}
        payload={payload}
        formatter={formatter}
        config={config}
        color={color}
        nameKey={nameKey}
        indicator={indicator}
        hideIndicator={hideIndicator}
      />
    )
  }
)
ChartTooltipContent.displayName = 'ChartTooltip'

// Extracted container component to reduce main function size
const ChartTooltipContainer = React.forwardRef<
  HTMLDivElement,
  {
    className?: string
    nestLabel: boolean
    tooltipLabel: React.ReactNode
    payload: ChartTooltipContentProps['payload']
    formatter?: ChartTooltipContentProps['formatter']
    config: ChartConfig
    color?: string
    nameKey?: string
    indicator: ChartTooltipContentProps['indicator']
    hideIndicator: boolean
  }
>(
  (
    {
      className,
      nestLabel,
      tooltipLabel,
      payload = [],
      formatter,
      config,
      color,
      nameKey,
      indicator = 'dot',
      hideIndicator,
    },
    ref
  ) => (
    <div
      ref={ref}
      role="tooltip"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => (
          <ChartTooltipRow
            key={`item-${index}`}
            item={item}
            formatter={formatter}
            itemConfig={getPayloadConfigFromPayload(
              config,
              item,
              `${nameKey ?? item.name ?? item.dataKey ?? 'value'}`
            )}
            indicatorColor={color ?? (item.color as string)}
            indicator={indicator}
            hideIndicator={hideIndicator}
            nestLabel={nestLabel}
            tooltipLabel={tooltipLabel}
            index={index}
            payload={payload}
          />
        ))}
      </div>
    </div>
  )
)
ChartTooltipContainer.displayName = 'ChartTooltipContainer'

function ChartTooltipRow(props: TooltipRowProps): React.ReactElement {
  const {
    item,
    formatter,
    itemConfig,
    indicatorColor,
    indicator,
    hideIndicator,
    nestLabel,
    tooltipLabel,
    index,
    payload,
  } = props

  const hasFormattedContent = useFormattedContentCheck({
    formatter,
    item,
  })

  return (
    <div
      key={(item.dataKey as string) ?? `item-${index}`}
      className={cn(
        'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
        indicator === 'dot' && 'items-center'
      )}
    >
      {hasFormattedContent ? (
        safeFormatter({
          formatter,
          value: item.value,
          name: item.name,
          item,
          index,
          payload,
        } as FormatterConfig)
      ) : (
        <TooltipRowContent
          item={item}
          itemConfig={itemConfig}
          indicatorColor={indicatorColor}
          indicator={indicator}
          hideIndicator={hideIndicator}
          nestLabel={nestLabel}
          tooltipLabel={tooltipLabel}
        />
      )}
    </div>
  )
}

function TooltipRowContent({
  item,
  itemConfig,
  indicatorColor,
  indicator,
  hideIndicator,
  nestLabel,
  tooltipLabel,
}: TooltipRowContentProps): React.ReactElement {
  return (
    <>
      <TooltipIndicator
        itemConfig={itemConfig}
        hideIndicator={hideIndicator}
        indicator={indicator}
        indicatorColor={indicatorColor}
        nestLabel={nestLabel}
      />
      <TooltipContent
        item={item}
        itemConfig={itemConfig}
        nestLabel={nestLabel}
        tooltipLabel={tooltipLabel}
      />
    </>
  )
}

// Extracted components to reduce complexity
function TooltipIndicator({
  itemConfig,
  hideIndicator,
  indicator,
  indicatorColor,
  nestLabel,
}: {
  itemConfig: ChartConfig[string] | undefined
  hideIndicator: boolean
  indicator: 'line' | 'dot' | 'dashed'
  indicatorColor: string
  nestLabel: boolean
}): React.ReactElement | null {
  if (itemConfig?.icon) {
    const IconComponent = itemConfig.icon
    return <IconComponent />
  }

  if (hideIndicator) {
    return null
  }

  return (
    <div
      className={cn(
        'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
        {
          'h-2.5 w-2.5': indicator === 'dot',
          'w-1': indicator === 'line',
          'w-0 border-[1.5px] border-dashed bg-transparent':
            indicator === 'dashed',
          'my-0.5': nestLabel && indicator === 'dashed',
        }
      )}
      style={
        {
          '--color-bg': indicatorColor,
          '--color-border': indicatorColor,
        } as React.CSSProperties
      }
    />
  )
}

function TooltipContent({
  item,
  itemConfig,
  nestLabel,
  tooltipLabel,
}: {
  item: ChartPayloadItem
  itemConfig: ChartConfig[string] | undefined
  nestLabel: boolean
  tooltipLabel: React.ReactNode
}): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-1 justify-between leading-none',
        nestLabel ? 'items-end' : 'items-center'
      )}
    >
      <div className="grid gap-1.5">
        {nestLabel ? tooltipLabel : null}
        <span className="text-muted-foreground">
          {(itemConfig?.label as React.ReactNode) ??
            (item.name as React.ReactNode)}
        </span>
      </div>
      {renderValue(item)}
    </div>
  )
}

function renderValue(item: ChartPayloadItem): React.ReactElement | null {
  if (
    item.value !== null &&
    item.value !== undefined &&
    typeof item.value === 'number'
  ) {
    return (
      <span className="font-mono font-medium tabular-nums text-foreground">
        {item.value.toLocaleString()}
      </span>
    )
  }
  return null
}

// Helper hook to reduce complexity
function useFormattedContentCheck({
  formatter,
  item,
}: {
  formatter?: TooltipRowProps['formatter']
  item: ChartPayloadItem
}): boolean {
  return !!(
    formatter &&
    item?.value !== undefined &&
    item.name !== undefined &&
    typeof item.name === 'string'
  )
}
