'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { getPayloadConfigFromPayload } from './utils'
import { TooltipLabelConfig } from './tooltip-types'

/**
 * Custom hook to handle tooltip label rendering logic
 * Extracted to reduce complexity and improve reusability
 */
export function useTooltipLabel(config: TooltipLabelConfig): React.ReactNode {
  const {
    hideLabel,
    payload,
    label,
    labelFormatter,
    labelClassName,
    config: chartConfig,
    labelKey,
  } = config

  return React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey ?? item.dataKey ?? item.name ?? 'value'}`
    const itemConfig = getPayloadConfigFromPayload(chartConfig, item, key)
    const value = getLabelValue({
      labelKey,
      label,
      chartConfig,
      itemConfig,
    })

    return renderLabelContent({
      labelFormatter,
      labelClassName,
      value,
      payload,
    })
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    chartConfig,
    labelKey,
  ])
}

/**
 * Simplified tooltip label renderer (legacy compatibility)
 * Reduced complexity by extracting conditional logic
 */
export function renderTooltipLabel(config: TooltipLabelConfig): React.ReactNode {
  if (config.hideLabel || !config.payload?.length) {
    return null
  }

  const [item] = config.payload
  const key = `${config.labelKey ?? item.dataKey ?? item.name ?? 'value'}`
  const itemConfig = getPayloadConfigFromPayload(config.config, item, key)
  
  const value = getLabelValue({
    labelKey: config.labelKey,
    label: config.label,
    chartConfig: config.config,
    itemConfig,
  })
  
  if (config.labelFormatter) {
    return (
      <div className={cn('font-medium', config.labelClassName)}>
        {config.labelFormatter(value, config.payload)}
      </div>
    )
  }

  if (!value) {
    return null
  }

  return <div className={cn('font-medium', config.labelClassName)}>{value}</div>
}

/**
 * Helper function to extract label value logic
 * Reduces cyclomatic complexity of renderTooltipLabel
 */
function getLabelValue({
  labelKey,
  label,
  chartConfig,
  itemConfig,
}: {
  labelKey?: string
  label?: string | number
  chartConfig: TooltipLabelConfig['config']
  itemConfig: ReturnType<typeof getPayloadConfigFromPayload>
}): React.ReactNode {
  return !labelKey && typeof label === 'string'
    ? chartConfig[label as keyof typeof chartConfig]?.label ?? label
    : itemConfig?.label
}

function renderLabelContent({
  labelFormatter,
  labelClassName,
  value,
  payload,
}: {
  labelFormatter?: TooltipLabelConfig['labelFormatter']
  labelClassName?: string
  value: React.ReactNode
  payload: TooltipLabelConfig['payload']
}): React.ReactNode {
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