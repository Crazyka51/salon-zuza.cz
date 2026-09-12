// Hero sekce s obsahem z databáze
'use client'

import { DatabaseText } from '@/components/DatabaseText'
import Image from 'next/image'

interface HeroSectionProps {
  className?: string
  backgroundImage?: string
}

export function HeroSection({ 
  className = '', 
  backgroundImage = '/logo_salon.png' 
}: HeroSectionProps) {
  return (
    <section 
      className={`relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center ${className}`}
      style={{ 
        backgroundImage: backgroundImage.startsWith('/') 
          ? `url(${backgroundImage})`
          : `url('/hero-placeholder.jpg')`
      }}
    >
      {/* Gradient overlay zleva doprava */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      
      {/* Obsah - vlevo zarovnaný */}
      <div className="relative z-10 text-left text-white px-8 sm:px-12 lg:px-20 max-w-7xl w-full">
        <div className="max-w-2xl">
          {/* Úvodní zlatavý text */}
          <p className="text-[#D4AF7A] text-xs sm:text-sm font-bold tracking-[0.3em] mb-6 uppercase border-l-4 border-[#D4AF7A] pl-4">
            VÍTEJTE V SALONU ZUZA
          </p>
          
          <DatabaseText
            klic="hero_nadpis"
            typ="nadpis"
            as="h1"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight uppercase leading-none text-white"
            placeholder="SALON ZUZA"
          />
          
          <DatabaseText
            klic="hero_podnadpis"
            typ="popis"
            as="h2"
            className="text-xl sm:text-2xl md:text-3xl font-light mb-8 tracking-wide border-l-2 border-white/50 pl-4 text-white"
            placeholder="PROFESIONÁLNÍ KADEŘNICTVÍ & KOSMETIKA"
          />
          
          {/* Dekorativní zlatá čára */}
          <div className="w-32 h-0.5 bg-gradient-to-r from-[#D4AF7A] to-transparent mb-8" />
          
          {/* Popis */}
          <DatabaseText
            klic="hero_popis"
            typ="text"
            as="p"
            className="text-base sm:text-lg font-normal leading-relaxed max-w-xl mb-10 text-white"
            placeholder="Moderní salon krásy v srdci města s tradicí kvality a individuálního přístupu k péči o vlasy a pleť."
          />
          
          {/* Loga produktů - horizontálně */}
          <div className="flex items-center space-x-8 mb-6">
            <Image
              src="/FRAMESI.png"
              alt="FRAMESI"
              width={180}
              height={50}
              className="h-10 w-auto"
            />
            <div className="w-px h-8 bg-white/60"></div>
            <Image
              src="/labeli.png"
              alt="LABEL.M"
              width={180}
              height={50}
              className="h-10 w-auto"
            />
          </div>
        </div>
      </div>
      
      
    </section>
  )
}