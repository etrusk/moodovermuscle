'use client'

import type React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { bookingSchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Heart,
  CalendarIcon,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookingFormProps {
  isOpen: boolean
  onClose: () => void
}

export function BookingForm({ isOpen, onClose }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      service: '',
      date: undefined,
      time: '',
      message: '',
      goals: '',
      experience: '',
    },
  })

  const { formState: { isSubmitting } } = form
  
  const totalSteps = 3

  const services = [
    {
      name: '1-on-1 Personal Training',
      price: 'FREE First Session',
      popular: true,
      description: 'Personalized attention just for you',
    },
    {
      name: 'Double Trouble & Tiny Toots',
      price: 'FREE First Session',
      popular: false,
      description: 'Training for two mums - chaos is more fun when shared!',
    },
    {
      name: 'Small Mums & Bubs Classes',
      price: 'FREE First Session',
      popular: false,
      description: 'Coming soon in parks (small groups up to 10)',
    },
  ]

  const timeSlots = [
    '6:00 AM',
    '6:30 AM',
    '7:00 AM',
    '7:30 AM',
    '8:00 AM',
    '8:30 AM',
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '1:00 PM',
    '1:30 PM',
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
    '4:00 PM',
    '4:30 PM',
    '5:00 PM',
    '5:30 PM',
  ]

  async function onSubmit(data: z.infer<typeof bookingSchema>) {
    try {
      const response = await fetch('/api/book-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast({
        title: 'Booking Confirmed!',
        description:
          "Your FREE session has been booked. We'll be in touch shortly.",
      })
      onClose()
      form.reset()
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('')
      console.error('Error submitting booking:', error)
      const isNetworkError = error instanceof TypeError
      toast({
        title: isNetworkError ? 'Network Error' : 'Booking Failed',
        description: isNetworkError
          ? 'Network error occurred. Check your connection and try again.'
          : err.message && err.message !== ''
          ? err.message
          : 'Server error. Please try again later.',
        variant: 'destructive',
      })
    }
  }

  const nextStep = async () => {
    const fieldsToValidate =
      currentStep === 1 ? ['name', 'email', 'phone', 'goals'] : ['service']
    const isValid = await form.trigger(
      fieldsToValidate as ('name' | 'email' | 'phone' | 'goals' | 'service')[]
    )
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white rounded-t-3xl overflow-hidden p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-4 left-4 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3 stroke-1" />
            100% FREE Session
          </div>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20 bg-black/20 rounded-full w-10 h-10 p-0 backdrop-blur-sm z-50 flex items-center justify-center"
              aria-label="Close"
            >
              <X className="h-5 w-5 stroke-2" />
            </Button>
          </DialogClose>
          <div className="relative z-10 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="h-6 w-6 stroke-1" />
              </div>
              <div>
                <DialogTitle className="text-2xl md:text-3xl font-bold">
                  Book Your FREE Session
                </DialogTitle>
                <DialogDescription className="text-green-100 text-sm">
                  No payment required • No commitment • Just come and try!
                </DialogDescription>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-green-100 mb-2">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <span>
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 p-8"
          >
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Heart className="h-4 w-4 stroke-1 text-rose-500" />
                          What should we call you? *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Your beautiful name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Your phone number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          What&apos;s your main fitness goal? *
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-4 border-2 border-stone-200 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white text-lg"
                          >
                            <option value="">Choose your goal...</option>
                            <option value="weight-loss">
                              Lose weight & feel confident
                            </option>
                            <option value="strength">
                              Build strength & energy
                            </option>
                            <option value="postnatal">
                              Postnatal recovery
                            </option>
                            <option value="community">Find my mum tribe</option>
                            <option value="mental-health">
                              Improve mental wellbeing
                            </option>
                            <option value="other">
                              Something else amazing
                            </option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in-up">
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
                            <div
                              key={service.name}
                              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${field.value === service.name ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg' : 'border-stone-200 bg-white hover:border-green-300 hover:shadow-md'}`}
                              onClick={() => field.onChange(service.name)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ')
                                  field.onChange(service.name)
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              {service.popular && (
                                <div className="absolute -top-3 left-6 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                                  Most Popular ⭐
                                </div>
                              )}
                              <div className="flex items-center justify-between">
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
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${field.value === service.name ? 'border-green-500 bg-green-500' : 'border-stone-300'}`}
                                >
                                  {field.value === service.name && (
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Preferred Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal min-h-[3.5rem] h-auto',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={date => {
                                const tomorrow = new Date()
                                tomorrow.setDate(tomorrow.getDate() + 1)
                                tomorrow.setHours(0, 0, 0, 0)
                                return date < tomorrow
                              }}
                              initialFocus
                              className="rounded-md border"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time *</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full p-4 border-2 border-stone-200 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white"
                          >
                            <option value="">Select time...</option>
                            {timeSlots.map(time => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Anything else you&apos;d like me to know? (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any questions, concerns, or things you're excited about? I'd love to hear from you! 💕"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <DialogFooter className="flex gap-4 pt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep} className="flex-1">
                  Continue <ArrowRight className="ml-2 h-5 w-5 stroke-1" />
                </Button>
              ) : (
                <Button type="submit" className="flex-1" disabled={isSubmitting} aria-busy={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Booking...
                    </>
                  ) : (
                    'Book My FREE Session! 🎉'
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
