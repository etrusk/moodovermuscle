'use client'

import { Calendar, MapPin, Phone } from 'lucide-react'

export function ContactCards(): React.ReactElement {
  return (
    <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
      <LocationCard />
      <ContactCard />
      <HoursCard />
    </div>
  )
}

function LocationCard(): React.ReactElement {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
      <div className="text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-linear-to-r from-rose-100 to-pink-100">
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
  )
}

function ContactCard(): React.ReactElement {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
      <div className="text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-linear-to-r from-rose-100 to-pink-100">
          <Phone className="h-8 w-8 stroke-1 text-rose-600" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">Get In Touch</h3>
        <div className="text-stone-600 leading-relaxed space-y-2">
          <p>
            <a
              href="tel:0406846416"
              className="hover:text-rose-600 transition-colors"
            >
              0406 846 416
            </a>
          </p>
          <p>
            <a
              href="https://www.moodovermuscle.com.au"
              className="hover:text-rose-600 transition-colors"
            >
              www.moodovermuscle.com.au
            </a>
          </p>
          <p>
            <a
              href="mailto:moodovermuscle@gmail.com"
              className="hover:text-rose-600 transition-colors"
            >
              moodovermuscle@gmail.com
            </a>
          </p>
          <p>
            <a
              href="https://instagram.com/moodovermuscle"
              className="hover:text-rose-600 transition-colors"
            >
              IG: moodovermuscle
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function HoursCard(): React.ReactElement {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
      <div className="text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-linear-to-r from-rose-100 to-pink-100">
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
  )
}
