// Důvody proč nás navštívit - rotující slider
'use client'

import { useState, useEffect } from 'react'

const features = [
  {
    icon: '✨',
    title: 'PROFESIONÁLNÍ PÉČE',
    description: 'Zkušený tým stylistů s individuálním přístupem'
  },
  {
    icon: '💎',
    title: 'PRÉMIOVÉ PRODUKTY',
    description: 'Používáme pouze značkovou profesionální kosmetiku'
  },
  {
    icon: '🏆',
    title: 'LETITÉ ZKUŠENOSTI',
    description: 'Více než 3 roky na trhu'
  },
  {
    icon: '🎨',
    title: 'MODERNÍ TRENDY',
    description: 'Sledujeme nejnovější světové trendy v kadeřnictví'
  }
]

export function PartnerLogos() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-12 bg-[#F5F5F5] border-b border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative h-32 flex items-center justify-center">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-700 ${
                index === currentIndex
                  ? 'opacity-100 translate-x-0 scale-100'
                  : index < currentIndex
                  ? 'opacity-0 -translate-x-full scale-95'
                  : 'opacity-0 translate-x-full scale-95'
              }`}
            >
              <div className={`text-4xl mb-3 transition-transform duration-500 ${
                index === currentIndex ? 'scale-110' : 'scale-100'
              }`}>
                {feature.icon}
              </div>
              <h3 className={`text-xl sm:text-2xl font-black mb-2 tracking-wide transition-all duration-500 ${
                index === currentIndex 
                  ? 'text-[#B8A876]' 
                  : 'text-[#212121]'
              }`}>
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-[#555555] max-w-md">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Indikátory */}
        <div className="flex justify-center gap-2 mt-6">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-[#B8A876] w-8' : 'bg-gray-300'
              }`}
              aria-label={`Přejít na slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}