'use client'

export function CtaBackground(): React.ReactElement {
  return (
    <>
      <div className="absolute inset-0 bg-linear-to-r from-black/10 to-transparent"></div>
      <div className="absolute top-20 right-10 w-64 md:w-80 h-64 md:h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-20 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </>
  )
}
