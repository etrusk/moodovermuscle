'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'
import { useChart } from './core'
import { ChartPayloadItem, safeFormatter, getPayloadConfigFromPayload, FormatterConfig } from './utils'

export const ChartTooltip = RechartsPrimitive.Tooltip

interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: ChartPayloadItem[]
  label?: string | number
  labelFormatter?: (
    value: unknown,
    payload: ChartPayloadItem[]
  ) => React.ReactNode
  labelClassName?: string
  formatter?: (
    value: unknown,
    name: string,
    item: ChartPayloadItem,
    index: number,
    payload: ChartPayloadItem[]
  ) => React.ReactNode
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: 'line' | 'dot' | 'dashed'
  nameKey?: string
  labelKey?: string
  color?: string
}

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

    const renderTooltipLabel = () => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey ?? item.dataKey ?? item.name ?? 'value'}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === 'string'
          ? config[label as keyof typeof config]?.label ?? label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn('font-medium', labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn('font-medium', labelClassName)}>{value}</div>
    }
    const tooltipLabel = React.useMemo(renderTooltipLabel, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== 'dot'

    return (
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
  }
)
ChartTooltipContent.displayName = 'ChartTooltip'

const ChartTooltipContentInner = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>((props, ref) => {
  const { config } = useChart()
  const {
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
  } = props

  const tooltipLabel = useTooltipLabel({
    hideLabel,
    payload,
    label,
    labelFormatter,
    labelClassName,
    config,
    labelKey,
  })

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
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
})
ChartTooltipContentInner.displayName = 'ChartTooltipContentInner'

function useTooltipLabel({
  hideLabel,
  payload,
  label,
  labelFormatter,
  labelClassName,
  config,
  labelKey,
}: {
  hideLabel: boolean
  payload: ChartPayloadItem[]
  label?: string | number
  labelFormatter?: (value: unknown, payload: ChartPayloadItem[]) => React.ReactNode
  labelClassName?: string
  config: Record<string, any>
  labelKey?: string
}): React.ReactNode {
  return React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey ?? item.dataKey ?? item.name ?? 'value'}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === 'string'
        ? config[label as keyof typeof config]?.label ?? label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])
}

interface TooltipRowProps {
  item: ChartPayloadItem
  formatter?: (
    value: unknown,
    name: string,
    item: ChartPayloadItem,
    index: number,
    payload: ChartPayloadItem[]
  ) => React.ReactNode
  itemConfig: Record<string, any> | undefined
  indicatorColor: string
  indicator: 'line' | 'dot' | 'dashed'
  hideIndicator: boolean
  nestLabel: boolean
  tooltipLabel: React.ReactNode
  index: number
  payload: ChartPayloadItem[]
}

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

  const hasFormattedContent = formatter &&
    item?.value !== undefined &&
    item.name !== undefined &&
    typeof item.name === 'string'

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
}: {
  item: ChartPayloadItem
  itemConfig: Record<string, any> | undefined
  indicatorColor: string
  indicator: 'line' | 'dot' | 'dashed'
  hideIndicator: boolean
  nestLabel: boolean
  tooltipLabel: React.ReactNode
}): React.ReactElement {
  return (
    <>
      {itemConfig?.icon ? (
        <itemConfig.icon />
      ) : (
        !hideIndicator && (
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
      )}
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
        {item.value !== null &&
          item.value !== undefined &&
          typeof item.value === 'number' && (
            <span className="font-mono font-medium tabular-nums text-foreground">
              {item.value.toLocaleString()}
            </span>
          )}
      </div>
    </>
  )
}