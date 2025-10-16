'use client'

import React from 'react'
import { useBookingForm } from '../BookingFormProvider'
import { ControllerRenderProps } from 'react-hook-form'
import { BookingFormData } from '../bookingFormLogic'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { CheckCircle2 } from 'lucide-react'

interface Service {
  name: string
  price: string
  popular: boolean
  description: string
}

const services: Service[] = [
  {
    name: '1-on-1 Personal Training',
    price: 'FREE First Session',
    popular: true,
    description: 'Personalized attention just for you',
  },
]

interface ServiceSelectionStepProps {
  isLoading?: boolean
}

const ServiceCard = ({
  service,
  field,
  loading,
}: {
  service: Service
  field: ControllerRenderProps<BookingFormData, 'service'>
  loading: boolean
}): React.ReactElement => {
  const isSelected = field.value === service.name
  
  return (
    <div
      key={service.name}
      className={getServiceCardClassName(loading, isSelected)}
      onClick={() => !loading && field.onChange(service.name)}
      onKeyDown={e => handleServiceKeyDown(e, loading, field, service.name)}
      role="button"
      tabIndex={0}
      data-testid={`service-option-${service.name.replace(/\s+/g, '-')}`}
    >
      <ServicePopularBadge service={service} />
      <div className="flex items-center justify-between">
        <ServiceContent service={service} />
        <ServiceSelector isSelected={isSelected} />
      </div>
    </div>
  )
}

// Helper functions to reduce ServiceCard complexity
function getServiceCardClassName(loading: boolean, isSelected: boolean): string {
  const baseClasses = 'relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105'
  const loadingClasses = loading ? 'opacity-50 pointer-events-none ' : ''
  const selectionClasses = isSelected
    ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
    : 'border-stone-200 bg-white hover:border-green-300 hover:shadow-md'
  
  return `${loadingClasses}${baseClasses} ${selectionClasses}`
}

function handleServiceKeyDown(
  e: React.KeyboardEvent,
  loading: boolean,
  field: ControllerRenderProps<BookingFormData, 'service'>,
  serviceName: string
): void {
  if (!loading && (e.key === 'Enter' || e.key === ' ')) {
    field.onChange(serviceName)
  }
}

function ServicePopularBadge({ service }: { service: Service }): React.JSX.Element | null {
  if (!service.popular) return null
  
  return (
    <div className="absolute -top-3 left-6 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
      Most Popular ⭐
    </div>
  )
}

function ServiceContent({ service }: { service: Service }): React.JSX.Element {
  return (
    <div className="flex-1">
      <h4 className="font-bold text-lg text-stone-900">
        {service.name}
      </h4>
      <p className="text-stone-600 text-sm mt-1">
        {service.description}
      </p>
      <div className="text-green-600 font-bold text-lg mt-2">
        {service.price}
      </div>
    </div>
  )
}

function ServiceSelector({ isSelected }: { isSelected: boolean }): React.JSX.Element {
  return (
    <div
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        isSelected
          ? 'border-green-500 bg-green-500'
          : 'border-stone-300'
      }`}
    >
      {isSelected && (
        <CheckCircle2 className="h-4 w-4 text-white" />
      )}
    </div>
  )
}

export function ServiceSelectionStep({
  isLoading = false,
}: ServiceSelectionStepProps): React.ReactElement {
  const { isSubmitting, form } = useBookingForm()
  const loading = isLoading || isSubmitting

  return (
    <div className="space-y-6 animate-fade-in-up" data-testid="booking-form-step-2">
      <FormField
        control={form.control}
        name="service"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormLabel className="text-center block text-2xl font-bold text-stone-900">
              What Would You Like to Try?
            </FormLabel>
            <FormControl>
              <div className="grid gap-4">
                {services.map(service => (
                  <ServiceCard service={service} field={field} loading={loading} key={service.name} />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
