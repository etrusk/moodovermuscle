import { useTooltipLabel } from './tooltip-label'
import { ChartConfig, ChartTooltipContentProps } from './tooltip-types'

export const useTooltipLogic = ({
  active,
  payload = [],
  hideLabel = false,
  label,
  labelFormatter,
  labelClassName,
  config,
  labelKey,
  indicator,
}: Pick<
  ChartTooltipContentProps,
  | 'active'
  | 'payload'
  | 'hideLabel'
  | 'label'
  | 'labelFormatter'
  | 'labelClassName'
  | 'labelKey'
  | 'indicator'
> & {
  config: ChartConfig
}): {
  tooltipLabel: React.ReactNode
  isVisible: boolean
  nestLabel: boolean
} => {
  const tooltipLabel = useTooltipLabel({
    hideLabel,
    payload,
    label,
    labelFormatter,
    labelClassName,
    config,
    labelKey,
  })

  const isVisible = Boolean(active && payload?.length)
  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return {
    tooltipLabel,
    isVisible,
    nestLabel,
  }
}
