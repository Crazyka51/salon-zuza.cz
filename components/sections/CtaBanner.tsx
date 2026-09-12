// CTA Banner sekce s obsahem z databáze
'use client'

import Link from 'next/link'
import { DatabaseText } from '@/components/DatabaseText'

interface CtaBannerProps {
  className?: string
  linkHref?: string
}

export function CtaBanner({ 
  className = '',
  linkHref = '/online-rezervace'
}: CtaBannerProps) {
  return (
    <section className={`bg-[#333333] text-white py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <DatabaseText
          klic="cta_nadpis"
          typ="nadpis"
          as="h2"
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-wide"
          placeholder="VAŠE VLASY, NAŠE PÉČE."
        />
        
        <DatabaseText
          klic="cta_podnadpis"
          typ="popis"
          as="h3"
          className="text-xl sm:text-2xl font-light mb-8 tracking-wider text-gray-300"
          placeholder="NAPLÁNUJTE SI NOVÝ ÚČES!"
        />
        
        <Link 
          href={linkHref}
          className="inline-block bg-[#B8A876] hover:bg-[#A39566] text-white font-bold py-4 px-8 text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <DatabaseText
            klic="cta_tlacitko"
            typ="tlacitko_text"
            as="span"
            placeholder="VYBERTE SI SVŮJ TERMÍN ONLINE"
          />
        </Link>
      </div>
    </section>
  )
}