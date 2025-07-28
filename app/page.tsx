"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  Heart,
  Users,
  Calendar,
  Sparkles,
  MapPin,
  Instagram,
  Mail,
  CheckCircle,
  Phone,
} from "lucide-react"

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section
          className="section-height section-white w-full overflow-hidden relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/mom-group.jpeg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70"></div>
          <div className="container relative z-10 px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
            <div className="grid gap-8 md:gap-12 items-center">
              <div className="space-y-6 md:space-y-10 text-center max-w-5xl mx-auto">
                {/* Free Badge */}
                <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 text-green-900 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold shadow-xl border border-green-300 animate-pulse">
                  <Sparkles className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
                  <span className="text-xs md:text-sm">Your First Session is 100% FREE!</span>
                </div>

                <div className="space-y-4 md:space-y-8">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight pb-2">
                    <span className="text-white block animate-fade-in-up drop-shadow-2xl">Welcome to</span>
                    <span className="text-white block animate-fade-in-up delay-200 drop-shadow-2xl">
                      MoodOverMuscle 💗
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl lg:text-3xl text-white leading-relaxed max-w-3xl mx-auto font-light animate-fade-in-up delay-400 drop-shadow-lg">
                    Because strength isn't just about muscles – it's about mood, too.
                  </p>
                </div>

                <div className="space-y-4 animate-fade-in-up delay-500">
                  <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                    Hi lovely! If you're a mama (or just a woman with a lot on her plate), you're in the right place.
                  </p>

                  <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                    We know getting back to exercise after baby, burnout or "just life" is no small feat.
                  </p>

                  <ul className="space-y-3 text-lg md:text-xl text-white max-w-3xl mx-auto">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 stroke-2 text-green-400 mt-1 flex-shrink-0 drop-shadow-lg" />
                      <span className="drop-shadow-lg">
                        We rebuild from the inside out – pelvic floor, core, confidence, and calm.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 stroke-2 text-green-400 mt-1 flex-shrink-0 drop-shadow-lg" />
                      <span className="drop-shadow-lg">
                        We check for abdominal separation (diastasis recti) and tailor your training safely.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 stroke-2 text-green-400 mt-1 flex-shrink-0 drop-shadow-lg" />
                      <span className="drop-shadow-lg">
                        Bring your baby, your messy bun, your tired legs – all welcome here.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 stroke-2 text-green-400 mt-1 flex-shrink-0 drop-shadow-lg" />
                      <span className="drop-shadow-lg">
                        We take our training seriously… but not ourselves. Laughter is part of the program.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3 md:gap-4 max-w-sm mx-auto lg:max-w-none lg:mx-0 animate-fade-in-up delay-600">
                  <Button
                    onClick={() => setIsBookingOpen(true)}
                    size="lg"
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-6 md:px-10 py-5 md:py-7 text-lg md:text-xl font-bold hover:scale-105 w-full group pulse-glow"
                  >
                    Book Your FREE Session
                    <ChevronRight className="ml-2 md:ml-3 h-4 md:h-5 w-4 md:w-5 stroke-1 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {/* Risk Reversal */}
                  <div className="text-center text-sm md:text-base text-white/90 drop-shadow-lg">
                    💯 No commitment required • 100% risk-free • No credit card needed
                  </div>
                </div>

                <div className="text-center text-lg md:text-xl text-white font-semibold animate-fade-in-up delay-800 drop-shadow-lg">
                  Let's lift the mood, one muscle at a time.
                  <br />
                  Join M.O.M.unity - we are stronger together.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="section-height section-white w-full">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
            <div className="grid gap-12 md:gap-16 lg:grid-cols-2 lg:gap-24 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="absolute -inset-6 md:-inset-8 bg-gradient-to-r from-rose-200/40 to-pink-200/40 rounded-3xl blur-3xl"></div>
                <Image
                  src="/images/emily-portrait.jpeg"
                  width={600}
                  height={700}
                  alt="Emily, founder of MoodOverMuscle"
                  className="relative rounded-3xl object-cover shadow-3xl w-full aspect-[4/5] hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="space-y-8 md:space-y-10 order-1 lg:order-2">
                <div className="space-y-4 md:space-y-6 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-rose-700 shadow-lg hover:scale-105 transition-transform">
                    <Sparkles className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
                    Meet Your Trainer
                  </div>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-stone-900 to-rose-600 bg-clip-text text-transparent leading-tight pb-2">
                    Hi mama, I'm Emily
                  </h2>
                </div>

                <div className="space-y-6 md:space-y-8 text-stone-600 leading-relaxed">
                  <p className="text-lg md:text-xl lg:text-2xl font-light">
                    I'm a proud mum of a little tornado named Max and a Certified Safe Return to Exercise trainer.
                  </p>

                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <Image
                      src="/images/sre-accredited-circle-rgb.png"
                      width={96}
                      height={96}
                      alt="Safe Return to Exercise Certified"
                      className="w-24 h-24 object-contain"
                    />
                    <Image
                      src="/images/ausactive-logo.jpeg"
                      width={96}
                      height={96}
                      alt="AUSactive Trainer"
                      className="w-24 h-24 object-contain"
                    />
                  </div>

                  <p className="text-base md:text-lg">
                    With a background in yoga, Pilates, and fitness training, I help women feel strong, supported, and
                    seen.
                  </p>

                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-rose-100 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="space-y-3 md:space-y-4">
                      <h3 className="font-bold text-stone-800 text-lg md:text-xl">Why Mums Choose Me:</h3>
                      <div className="space-y-2 md:space-y-3">
                        <p className="font-semibold text-stone-700 text-sm md:text-base flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 stroke-1 text-rose-500" />
                          Experienced Personal Trainer, Cert III and IV in Fitness
                        </p>
                        <p className="font-semibold text-stone-700 text-sm md:text-base flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 stroke-1 text-rose-500" />
                          Certified Postnatal Exercise Specialist
                        </p>
                        <p className="font-semibold text-stone-700 text-sm md:text-base flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 stroke-1 text-rose-500" />
                          Pelvic floor & core restoration expert
                        </p>
                        <p className="font-semibold text-stone-700 text-sm md:text-base flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 stroke-1 text-rose-500" />
                          I'm a mum too - I get it!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-amber-100 shadow-lg hover:shadow-xl transition-shadow">
                    <p className="text-base md:text-lg text-stone-700 font-medium">
                      💕 "I created MoodOverMuscle because I know how isolating motherhood can feel. Let's lift the
                      mood, one squat (or stretch) at a time. You don't have to do it alone – M.O.M.unity got your back
                      (and your core)."
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:gap-6 max-w-sm mx-auto lg:max-w-none lg:mx-0">
                  <Button
                    onClick={() => setIsBookingOpen(true)}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full group"
                  >
                    Start Your FREE Session
                    <ChevronRight className="ml-2 h-3 md:h-4 w-3 md:w-4 stroke-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section-height section-pink w-full">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
            <div className="text-center space-y-6 md:space-y-8 mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-white/80 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-rose-700 shadow-xl hover:scale-105 transition-transform">
                <Calendar className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
                How It Works
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-stone-900 to-rose-600 bg-clip-text text-transparent pb-2">
                Your Journey to Transformation
              </h2>
            </div>

            <div className="text-center mb-12">
              <p className="text-lg md:text-xl text-stone-700 max-w-3xl mx-auto">
                Bringing feel-good fitness to your doorstep—from Maroochydore and Mudjimba to Buderim and Coolum—Mood
                Over Muscle is your local Sunshine Coast M.O.M.unity.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {[
                {
                  step: "1",
                  title: "FREE Discovery Session",
                  description:
                    "We chat about your goals, challenges, and what you want to achieve. No pressure, just understanding.",
                },
                {
                  step: "2",
                  title: "Personalized Plan",
                  description:
                    "I create a program specifically for you - your fitness level, schedule, and life circumstances.",
                },
                {
                  step: "3",
                  title: "Start Your Journey",
                  description:
                    "Begin with supportive guidance, whether 1-on-1, in small groups, or online. You're never alone!",
                },
                {
                  step: "4",
                  title: "Transform & Thrive",
                  description:
                    "Watch as you become stronger, more confident, and connected with an amazing community of mums.",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                      {step.step}
                    </div>
                    {index < 3 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-rose-200 to-transparent"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-3">{step.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Button
                onClick={() => setIsBookingOpen(true)}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-8 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Start Step 1: Book Your FREE Session
              </Button>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="section-height section-white w-full">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
            <div className="text-center space-y-6 md:space-y-8 mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-rose-700 shadow-lg hover:scale-105 transition-transform">
                <Instagram className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
                Gallery
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-stone-900 to-rose-600 bg-clip-text text-transparent pb-2">
                M.O.M.unity in Action
              </h2>
            </div>

            <div className="max-w-4xl mx-auto mb-12 text-center">
              <p className="text-lg text-stone-700 leading-relaxed">
                Hi Mama! I see you..Between the nappies, meetings, bedtime chaos and reheated coffee, we know carving
                out time for yourself feels like a luxury. But here's a little secret: moving your body isn't just about
                squats or stretchy pants – it's your daily dose of sanity, strength and self-care.
              </p>
              <p className="text-lg text-stone-700 leading-relaxed mt-4">
                At MoodOverMuscle, we believe movement is medicine – for your physical body and your mental health.
                This is your space to rebuild from the inside out, safely and sustainably. No "bouncing back", no
                six-pack pressure. Just real support for real women. Whether you're postpartum, peri-menopausal, or just
                overdue for "you-time" – you're in the right place.
              </p>
            </div>

            {/* Mobile Gallery - 2 columns */}
            <div className="grid gap-4 grid-cols-2 md:hidden">
              {[
                { src: "/images/gallery-1.jpeg", alt: "M.O.M.unity group celebrating" },
                { src: "/images/gallery-5.jpeg", alt: "Outdoor fitness class" },
                { src: "/images/gallery-9.jpeg", alt: "Mums and bubs group" },
                { src: "/images/gallery-4.jpeg", alt: "High five celebration" },
                { src: "/images/gallery-2.jpeg", alt: "Sunset workout" },
                { src: "/images/gallery-10.jpeg", alt: "Energetic workout" },
              ].map((image, index) => (
                <div
                  key={index}
                  className="relative group overflow-hidden rounded-2xl hover:scale-105 transition-transform duration-500"
                >
                  <Image
                    src={image.src || "/placeholder.svg"}
                    width={200}
                    height={200}
                    alt={image.alt}
                    className="w-full aspect-square object-cover transition-all duration-700 group-hover:scale-110 shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Instagram className="h-4 w-4 stroke-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Gallery */}
            <div className="hidden md:grid gap-6 md:gap-8 grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto">
              {[
                { src: "/images/gallery-1.jpeg", alt: "M.O.M.unity group celebrating", span: "md:col-span-2" },
                { src: "/images/gallery-5.jpeg", alt: "Outdoor fitness class" },
                { src: "/images/gallery-9.jpeg", alt: "Mums and bubs group" },
                { src: "/images/gallery-4.jpeg", alt: "High five celebration" },
                { src: "/images/gallery-2.jpeg", alt: "Sunset workout", span: "md:col-span-2" },
                { src: "/images/gallery-10.jpeg", alt: "Energetic workout" },
                { src: "/images/gallery-6.jpeg", alt: "Emilia portrait" },
                { src: "/images/gallery-7.jpeg", alt: "Workout in progress" },
              ].map((image, index) => (
                <div
                  key={index}
                  className={`relative group overflow-hidden rounded-3xl hover:scale-105 transition-transform duration-500 ${image.span || ""}`}
                >
                  <Image
                    src={image.src || "/placeholder.svg"}
                    width={400}
                    height={300}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 shadow-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Instagram className="h-5 w-5 stroke-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location & Contact Section */}
        <section id="contact" className="section-height section-pink w-full">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto section-inner mobile-px">
            <div className="text-center space-y-6 md:space-y-8 mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 md:gap-3 rounded-full bg-white/80 backdrop-blur-sm px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-rose-700 shadow-xl hover:scale-105 transition-transform">
                <MapPin className="h-3 md:h-4 w-3 md:w-4 stroke-1" />
                Location & Contact
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-stone-900 to-rose-600 bg-clip-text text-transparent pb-2">
                Find Us on the Sunshine Coast
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="text-center space-y-6">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-rose-100 to-pink-100">
                    <MapPin className="h-8 w-8 stroke-1 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Studio Location</h3>
                  <div className="text-stone-600 leading-relaxed">
                    <a
                      href="https://maps.google.com/?q=17+Nungo+Street,+Pacific+Paradise,+Queensland"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-rose-600 transition-colors"
                    >
                      17 Nungo Street
                      <br />
                      Pacific Paradise, Queensland
                    </a>
                    <br />
                    <br />
                    Multiple locations available
                    <br />
                    Home visits also offered
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="text-center space-y-6">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-rose-100 to-pink-100">
                    <Phone className="h-8 w-8 stroke-1 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Get In Touch</h3>
                  <div className="text-stone-600 leading-relaxed space-y-2">
                    <p>
                      <a href="tel:0406846416" className="hover:text-rose-600 transition-colors">
                        0406 846 416
                      </a>
                    </p>
                    <p>
                      <a href="https://www.moodovermuscle.com.au" className="hover:text-rose-600 transition-colors">
                        www.moodovermuscle.com.au
                      </a>
                    </p>
                    <p>
                      <a href="mailto:moodovermuscle@gmail.com" className="hover:text-rose-600 transition-colors">
                        moodovermuscle@gmail.com
                      </a>
                    </p>
                    <p>
                      <a href="https://instagram.com/moodovermuscle" className="hover:text-rose-600 transition-colors">
                        IG: moodovermuscle
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="text-center space-y-6">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-rose-100 to-pink-100">
                    <Calendar className="h-8 w-8 stroke-1 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">Flexible Hours</h3>
                  <p className="text-stone-600 leading-relaxed">
                    Early morning sessions
                    <br />
                    School hours available
                    <br />
                    Weekend options too
                    <br />
                    <br />
                    Quick response guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="section-height section-white w-full bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
          <div className="absolute top-20 right-10 w-64 md:w-80 h-64 md:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

          <div className="container relative z-10 px-4 md:px-6 text-center max-w-7xl mx-auto section-inner mobile-px">
            <div className="space-y-8 md:space-y-12 max-w-5xl mx-auto">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight pb-2">
                  Ready to Transform Your Life?
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl text-rose-100 leading-relaxed font-light max-w-3xl mx-auto">
                  Join our amazing M.O.M.unity who've already started their transformation. Your first session is
                  completely FREE with no strings attached!
                </p>
              </div>

              {/* Enhanced Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 justify-center mb-3">
                    <Sparkles className="h-5 w-5 stroke-1 text-rose-200" />
                    <span className="font-bold text-rose-100">100% FREE First Session</span>
                  </div>
                  <p className="text-rose-200 text-sm">
                    No payment, no commitment, just come and see what we're about!
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 justify-center mb-3">
                    <Heart className="h-5 w-5 stroke-1 text-rose-200" />
                    <span className="font-bold text-rose-100">Supportive Community</span>
                  </div>
                  <p className="text-rose-200 text-sm">Connect with amazing mums who understand your journey.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 justify-center mb-3">
                    <Users className="h-5 w-5 stroke-1 text-rose-200" />
                    <span className="font-bold text-rose-100">Expert Guidance</span>
                  </div>
                  <p className="text-rose-200 text-sm">Certified trainer with specialized postnatal expertise.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 md:gap-6 justify-center pt-4 max-w-sm mx-auto md:max-w-none">
                <Button
                  onClick={() => setIsBookingOpen(true)}
                  size="lg"
                  className="bg-white text-rose-600 hover:bg-rose-50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold hover:scale-105 w-full md:w-auto group pulse-glow"
                >
                  Book Your FREE Session Now
                  <ChevronRight className="ml-2 md:ml-3 h-4 md:h-5 w-4 md:w-5 stroke-1 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-rose-100 text-sm">⚡ Quick booking • 📞 Instant confirmation • 💯 No pressure</p>
              </div>

              <div className="flex flex-col gap-4 md:flex-row justify-center md:gap-8 pt-8 md:pt-12 border-t border-white/20">
                <div className="flex items-center gap-3 justify-center text-rose-100">
                  <MapPin className="h-4 md:h-5 w-4 md:w-5 stroke-1 flex-shrink-0" />
                  <span className="text-base md:text-lg">Sunshine Coast, QLD</span>
                </div>
                <div className="flex items-center gap-3 justify-center text-rose-100">
                  <Mail className="h-4 md:h-5 w-4 md:w-5 stroke-1 flex-shrink-0" />
                  <span className="text-base md:text-lg">moodovermuscle@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 md:py-16 bg-stone-900 text-white relative z-10">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid gap-8 md:gap-12 md:grid-cols-3">
            <div className="space-y-4 md:space-y-6 text-center md:text-left">
              <Image
                src="/images/logo.png"
                width={48}
                height={48}
                alt="MoodOverMuscle"
                className="rounded-full shadow-lg mx-auto md:mx-0 hover:scale-110 transition-transform"
              />
              <p className="text-stone-400 leading-relaxed text-base md:text-lg">
                Building a supportive community for mums on the Sunshine Coast through fitness, wellness, and
                connection.
              </p>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <p className="text-stone-400 text-sm">
                  Certificate 3&4 in Personal Training
                  <br />
                  Certified Safe Return To Exercise Trainer
                  <br />
                  AUSactive Trainer
                </p>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6 text-center md:text-left">
              <h3 className="font-bold text-lg md:text-xl">Quick Links</h3>
              <div className="space-y-2 md:space-y-3 text-stone-400">
                <Link
                  href="#about"
                  className="block hover:text-white transition-colors text-base md:text-lg hover:translate-x-1 transition-transform"
                >
                  About Emily
                </Link>
                <Link
                  href="/classes"
                  className="block hover:text-white transition-colors text-base md:text-lg hover:translate-x-1 transition-transform"
                >
                  Classes
                </Link>
                <Link
                  href="#contact"
                  className="block hover:text-white transition-colors text-base md:text-lg hover:translate-x-1 transition-transform"
                >
                  Contact
                </Link>
                <Link
                  href="#gallery"
                  className="block hover:text-white transition-colors text-base md:text-lg hover:translate-x-1 transition-transform"
                >
                  Gallery
                </Link>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6 text-center md:text-left">
              <h3 className="font-bold text-lg md:text-xl">Follow Us</h3>
              <div className="flex gap-4 justify-center md:justify-start">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-stone-400 hover:text-white hover:bg-white/10 rounded-full p-3 hover:scale-110 transition-all"
                >
                  <Instagram className="h-4 md:h-5 w-4 md:w-5 stroke-1" />
                </Button>
              </div>
              <p className="text-stone-400 text-base md:text-lg">© 2025 MoodOverMuscle. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
