"use client"

import { Header } from "@/components/header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Users, Heart, Calendar, ArrowRight, CheckCircle, Sparkles, MapPin } from "lucide-react"

export default function ClassesPage() {

  const services = [
    {
      icon: Users,
      title: "1-on-1 Personal Training",
      description: "Completely personalized program designed just for you and your goals.",
      price: "$80",
      gradient: "from-rose-500 to-pink-500",
      popular: true,
      features: [
        "Fully customized workout plans",
        "Flexible location (home, park, studio)",
        "Postnatal recovery focus",
        "One-on-one guidance & support",
      ],
    },
    {
      icon: Heart,
      title: "Double Trouble & Tiny Toots",
      description:
        "Personalised private training for two mums – because chaos is more fun when shared (and so is fitness!) at yours or mine place",
      price: "$40",
      gradient: "from-pink-500 to-rose-500",
      popular: false,
      features: [
        "Training for two mums together",
        "Share the cost and the fun",
        "Flexible location options",
        "Baby-friendly environment",
      ],
    },
    {
      icon: Calendar,
      title: "Small Mums & Bubs Classes",
      description: "Coming soon in parks - small groups up to 10 people for community support",
      price: "$20",
      gradient: "from-rose-400 to-pink-400",
      popular: false,
      comingSoon: true,
      features: [
        "Small group support (max 10 mums)",
        "Baby-friendly park sessions",
        "Build lasting friendships",
        "Affordable community option",
      ],
    },
  ]

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="section-height section-pink w-full overflow-hidden">
          <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
            <div className="text-center space-y-8 md:space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 text-green-900 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold shadow-xl border border-green-300 animate-pulse">
                  <Sparkles className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
                  <span className="text-xs md:text-sm">Your First Session is 100% FREE!</span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-stone-900 via-rose-600 to-rose-500 bg-clip-text text-transparent block animate-fade-in-up">
                    Choose Your Perfect
                  </span>
                  <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent block animate-fade-in-up delay-200">
                    Training Option
                  </span>
                </h1>

                <p className="text-lg md:text-xl lg:text-2xl text-stone-600 leading-relaxed max-w-3xl mx-auto font-light animate-fade-in-up delay-400">
                  Every option includes our supportive M.O.M.unity and your first session is completely FREE!
                </p>
              </div>

              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-rose-100 shadow-lg max-w-4xl mx-auto animate-fade-in-up delay-600">
                <div className="flex items-center gap-3 justify-center mb-4">
                  <MapPin className="h-5 w-5 stroke-1 text-rose-600" />
                  <h3 className="font-bold text-stone-800 text-lg md:text-xl">Service Areas</h3>
                </div>
                <p className="text-stone-700 text-base md:text-lg">
                  Bringing feel-good fitness to your doorstep—from Maroochydore and Mudjimba to Buderim and Coolum—Mood
                  Over Muscle is your local Sunshine Coast M.O.M.unity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="section-height section-white w-full">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
            <div className="grid gap-8 max-w-6xl mx-auto">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className={`group border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white/90 backdrop-blur-sm overflow-hidden hover:scale-105 relative ${
                    service.comingSoon ? "opacity-75" : ""
                  }`}
                >
                  {service.popular && (
                    <div className="absolute -top-1 left-6 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 px-4 py-2 rounded-full text-sm font-bold z-10 shadow-lg">
                      Most Popular ⭐
                    </div>
                  )}
                  {service.comingSoon && (
                    <div className="absolute -top-1 right-6 bg-gradient-to-r from-blue-400 to-cyan-400 text-blue-900 px-4 py-2 rounded-full text-sm font-bold z-10 shadow-lg">
                      Coming Soon 🚀
                    </div>
                  )}

                  <CardContent className="p-10 space-y-8 pt-12">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
                      <div className="inline-flex p-6 rounded-3xl bg-gradient-to-r from-rose-500 to-pink-500 shadow-xl group-hover:scale-110 transition-transform">
                        <service.icon className="h-8 w-8 stroke-1 text-white" />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <h3 className="text-2xl md:text-3xl font-bold text-stone-900">{service.title}</h3>
                          <div className="flex items-center gap-3">
                            <div className="text-3xl font-bold text-rose-600">{service.price}</div>
                            <div className="text-lg text-stone-500">per session</div>
                          </div>
                        </div>

                        <p className="text-stone-600 leading-relaxed text-lg">{service.description}</p>

                        <div className="grid gap-4 md:grid-cols-2">
                          {service.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-3 text-stone-600">
                              <CheckCircle className="h-4 w-4 stroke-1 text-rose-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 pt-6 border-t border-stone-100">
                      <Button
                        disabled={service.comingSoon}
                        className={`flex-1 lg:flex-none lg:px-8 bg-gradient-to-r ${service.gradient} hover:shadow-xl text-white rounded-full transition-all duration-300 py-6 text-lg font-medium group disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {service.comingSoon ? "Coming Soon" : "Start FREE Session"}
                        {!service.comingSoon && (
                          <ArrowRight className="ml-2 h-4 w-4 stroke-1 group-hover:translate-x-1 transition-transform" />
                        )}
                      </Button>

                      {!service.comingSoon && (
                        <div className="text-center lg:text-left text-sm text-stone-500 flex items-center justify-center lg:justify-start">
                          💯 First session completely FREE • No commitment required
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-height section-pink w-full bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
          <div className="absolute top-20 right-10 w-64 md:w-80 h-64 md:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

          <div className="container relative z-10 px-4 md:px-6 text-center max-w-7xl mx-auto section-inner mobile-px">
            <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl text-rose-100 leading-relaxed font-light max-w-3xl mx-auto">
                  Book your FREE session today and discover why mums across the Sunshine Coast choose M.O.M.unity!
                </p>
              </div>

              <div className="flex flex-col gap-4 md:gap-6 justify-center pt-4 max-w-sm mx-auto md:max-w-none">
                <Button
                  size="lg"
                  className="bg-white text-rose-600 hover:bg-rose-50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold hover:scale-105 w-full md:w-auto group pulse-glow"
                >
                  Book Your FREE Session Now
                  <ChevronRight className="ml-2 md:ml-3 h-4 md:h-5 w-4 md:w-5 stroke-1 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-rose-100 text-sm">⚡ Quick booking • 📞 Instant confirmation • 💯 No pressure</p>
              </div>

              <div className="text-center pt-8 md:pt-12 border-t border-white/20">
                <Link href="/" className="text-rose-100 hover:text-white font-medium text-lg">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  )
}
