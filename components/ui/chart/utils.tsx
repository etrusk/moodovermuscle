'use client'

import * as React from 'react'

// Improved type definitions for better type safety
export interface ChartPayloadItem {
  value: number | string | null | undefined
  name?: string
  dataKey?: string
  color?: string
  payload?: Record<string, unknown>
}

export interface ValidPayload {
  [key: string]: unknown
  payload?: Record<string, unknown>
}

export interface FormatterConfig {
  formatter: (value: unknown, name: string, item?: ChartPayloadItem, index?: number, payload?: ChartPayloadItem[]) => React.ReactNode
  value: unknown
  name: string
  item?: ChartPayloadItem
  index?: number
  payload?: ChartPayloadItem[]
}

// Type guard for safe payload validation
export function isValidPayload(payload: unknown): payload is ValidPayload {
  return typeof payload === 'object' && payload !== null
}

// Safe formatter wrapper to prevent crashes - Parameter Reduction Pattern Applied
export function safeFormatter(config: FormatterConfig): React.ReactNode {
  try {
    const { formatter, value, name, item, index, payload } = config
    if (item && index !== undefined && payload) {
      return formatter(value, name, item, index, payload)
    }
    return formatter(value, name)
  } catch (error) {
    console.warn('Chart formatter error:', error)
    return `${config.name}: ${config.value}`
  }
}

// Helper to extract item config from a payload with improved type safety
export function getPayloadConfigFromPayload(
  config: Record<string, unknown>,
  payload: unknown,
  key: string
): Record<string, unknown> | undefined {
  if (!isValidPayload(payload)) {
    return undefined
  }

  const typedPayload = payload as ValidPayload
  const payloadPayload = typedPayload.payload

  let configLabelKey: string = key

  // Safe property access with type guards
  if (key in typedPayload && typeof typedPayload[key] === 'string') {
    configLabelKey = typedPayload[key] as string
  } else if (
    payloadPayload &&
    typeof payloadPayload === 'object' &&
    payloadPayload !== null &&
    key in payloadPayload &&
    typeof payloadPayload[key] === 'string'
  ) {
    configLabelKey = payloadPayload[key] as string
  }

  return configLabelKey in config
    ? config[configLabelKey] as Record<string, unknown>
    : config[key as keyof typeof config] as Record<string, unknown>
}