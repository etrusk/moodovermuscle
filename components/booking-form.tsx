"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, User, X, Sparkles, CheckCircle2, ArrowRight, Heart } from "lucide-react"

interface BookingFormProps {
  isOpen: boolean
  onClose: () => void
}

export function BookingForm({ isOpen, onClose }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    message: "",
    goals: "",
    experience: "",
  })

  const totalSteps = 3

  const services = [
    {
      name: "1-on-1 Personal Training",
      price: "FREE First Session",
      popular: true,
      description: "Personalized attention just for you",
    },
    {
      name: "Double Trouble & Tiny Toots",
      price: "FREE First Session",
      popular: false,
      description: "Training for two mums - chaos is more fun when shared!",
    },
    {
      name: "Small Mums & Bubs Classes",
      price: "FREE First Session",
      popular: false,
      description: "Coming soon in parks (small groups up to 10)",
    },
  ]

  const timeSlots = [
    "6:00 AM",
    "6:30 AM",
    "7:00 AM",
    "7:30 AM",
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("FREE session booking submitted:", formData)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-white/95 backdrop-blur-2xl border-0 shadow-2xl rounded-3xl">
        {/* Header with FREE Session */}
        <CardHeader className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-4 left-4 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Sparkles className="h-3 w-3 stroke-1" />
            100% FREE Session
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            className="absolute top-4 right-4 text-white hover:bg-white/20 bg-black/20 rounded-full w-10 h-10 p-0 backdrop-blur-sm z-50 flex items-center justify-center"
            type="button"
          >
            <X className="h-5 w-5 stroke-2" />
          </Button>

          <div className="relative z-10 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 rounded-full p-2">
                <Sparkles className="h-6 w-6 stroke-1" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Book Your FREE Session</CardTitle>
                <p className="text-green-100 text-sm">No payment required • No commitment • Just come and try!</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-green-100 mb-2">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-4 py-2 text-green-700 text-sm font-medium">
                    <User className="h-4 w-4 stroke-1" />
                    Let's Get to Know You
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900">Tell Us About Yourself</h3>
                  <p className="text-stone-600">We'll create a personalized FREE session just for you</p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-stone-700 font-semibold flex items-center gap-2">
                      <Heart className="h-4 w-4 stroke-1 text-rose-500" />
                      What should we call you? *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="border-2 border-stone-200 focus:border-green-500 focus:ring-green-500 rounded-xl h-12 text-lg"
                      placeholder="Your beautiful name"
                      required
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-stone-700 font-semibold">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="border-2 border-stone-200 focus:border-green-500 focus:ring-green-500 rounded-xl h-12"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-stone-700 font-semibold">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="border-2 border-stone-200 focus:border-green-500 focus:ring-green-500 rounded-xl h-12"
                        placeholder="Your phone number"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="goals" className="text-stone-700 font-semibold">
                      What's your main fitness goal? *
                    </Label>
                    <select
                      id="goals"
                      value={formData.goals}
                      onChange={(e) => handleInputChange("goals", e.target.value)}
                      className="w-full p-4 border-2 border-stone-200 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white text-lg"
                      required
                    >
                      <option value="">Choose your goal...</option>
                      <option value="weight-loss">Lose weight & feel confident</option>
                      <option value="strength">Build strength & energy</option>
                      <option value="postnatal">Postnatal recovery</option>
                      <option value="community">Find my mum tribe</option>
                      <option value="mental-health">Improve mental wellbeing</option>
                      <option value="other">Something else amazing</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 text-green-800">
                    <Sparkles className="h-5 w-5 stroke-1" />
                    <span className="font-semibold">Your first session is completely FREE - no payment required!</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Service Selection */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-4 py-2 text-green-700 text-sm font-medium">
                    <Sparkles className="h-4 w-4 stroke-1" />
                    Choose Your FREE Session
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900">What Would You Like to Try?</h3>
                  <p className="text-stone-600">All options are completely FREE for your first session</p>
                </div>

                <div className="grid gap-4">
                  {services.map((service) => (
                    <div
                      key={service.name}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        formData.service === service.name
                          ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg"
                          : "border-stone-200 bg-white hover:border-green-300 hover:shadow-md"
                      }`}
                      onClick={() => handleInputChange("service", service.name)}
                    >
                      {service.popular && (
                        <div className="absolute -top-3 left-6 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
                          Most Popular ⭐
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-stone-900">{service.name}</h4>
                          <p className="text-stone-600 text-sm mt-1">{service.description}</p>
                          <div className="text-green-600 font-bold text-lg mt-2">{service.price}</div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            formData.service === service.name ? "border-green-500 bg-green-500" : "border-stone-300"
                          }`}
                        >
                          {formData.service === service.name && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 stroke-1 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-stone-800">Why mums love their FREE session:</p>
                      <ul className="text-sm text-stone-600 mt-2 space-y-1">
                        <li>• "No pressure, just support and encouragement!" - Sarah M.</li>
                        <li>• "I felt so welcomed and understood" - Lisa K.</li>
                        <li>• "The perfect way to see if it's right for me" - Emma R.</li>
                        <li>• "The perfect way to see if it's right for me" - Emma R.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Schedule & Final Details */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-4 py-2 text-green-700 text-sm font-medium">
                    <Calendar className="h-4 w-4 stroke-1" />
                    Almost There!
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900">When Should We Meet?</h3>
                  <p className="text-stone-600">Pick a time that works for your busy mum life</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-stone-700 font-semibold">
                      Preferred Date *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="border-2 border-stone-200 focus:border-green-500 focus:ring-green-500 rounded-xl h-12"
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="time" className="text-stone-700 font-semibold">
                      Preferred Time *
                    </Label>
                    <select
                      id="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange("time", e.target.value)}
                      className="w-full p-4 border-2 border-stone-200 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white"
                      required
                    >
                      <option value="">Select time...</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="message" className="text-stone-700 font-semibold">
                    Anything else you'd like me to know? (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    className="border-2 border-stone-200 focus:border-green-500 focus:ring-green-500 min-h-[100px] rounded-xl"
                    placeholder="Any questions, concerns, or things you're excited about? I'd love to hear from you! 💕"
                  />
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 text-green-800">
                    <CheckCircle2 className="h-5 w-5 stroke-1" />
                    <div>
                      <p className="font-semibold">You're about to join an amazing community!</p>
                      <p className="text-sm mt-1">
                        I'll personally reach out within 24 hours to confirm your FREE session.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 border-2 border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl py-6 text-lg font-medium"
                >
                  Back
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!formData.name || !formData.email || !formData.phone || !formData.goals)) ||
                    (currentStep === 2 && !formData.service)
                  }
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5 stroke-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!formData.date || !formData.time}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book My FREE Session! 🎉
                </Button>
              )}
            </div>

            {currentStep === totalSteps && (
              <p className="text-center text-sm text-stone-500 mt-4">
                🔒 Your information is safe and secure. No payment required, just support!
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-rose-500 hover:text-rose-700 font-medium bg-transparent border-none cursor-pointer"
            >
              ← Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
