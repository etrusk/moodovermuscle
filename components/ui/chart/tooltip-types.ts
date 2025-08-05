'use client'

import * as React from 'react'
import { ChartPayloadItem } from './utils'

// Improved type definitions eliminating 'any' types
export interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: {
      light?: string
      dark?: string
    }
  }
}

export interface ChartTooltipContentProps
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

export interface TooltipLabelConfig {
  hideLabel: boolean
  payload: ChartPayloadItem[]
  label?: string | number
  labelFormatter?: (value: unknown, payload: ChartPayloadItem[]) => React.ReactNode
  labelClassName?: string
  config: ChartConfig
  labelKey?: string
}

export interface TooltipRowProps {
  item: ChartPayloadItem
  formatter?: (
    value: unknown,
    name: string,
    item: ChartPayloadItem,
    index: number,
    payload: ChartPayloadItem[]
  ) => React.ReactNode
  itemConfig: ChartConfig[string] | undefined
  indicatorColor: string
  indicator: 'line' | 'dot' | 'dashed'
  hideIndicator: boolean
  nestLabel: boolean
  tooltipLabel: React.ReactNode
  index: number
  payload: ChartPayloadItem[]
}

export interface TooltipRowContentProps {
  item: ChartPayloadItem
  itemConfig: ChartConfig[string] | undefined
  indicatorColor: string
  indicator: 'line' | 'dot' | 'dashed'
  hideIndicator: boolean
  nestLabel: boolean
  tooltipLabel: React.ReactNode
}