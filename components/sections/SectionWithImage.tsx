// Sekce s textem a obrázkem (Kvalita, Péče)
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { DatabaseText } from '@/components/DatabaseText'

interface SectionWithImageProps {
  nadpisKlic: string
  podnadpisKlic: string
  textKlic?: string
  textKlic1?: string
  textKlic2?: string
  tlacitkoKlic: string
  obrazekUrl: string
  obrazekAlt?: string
  obrazekVpravo?: boolean
  className?: string
}

export function SectionWithImage({ 
  nadpisKlic,
  podnadpisKlic,
  textKlic,
  textKlic1,
  textKlic2,
  tlacitkoKlic,
  obrazekUrl,
  obrazekAlt = 'Obrázek sekce',
  obrazekVpravo = true,
  className = ''
}: SectionWithImageProps) {
  return (
    <section className={`py-20 lg:py-32 px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${obrazekVpravo ? '' : 'lg:grid-flow-dense'}`}>
          
          {/* Textový obsah */}
          <div className={`${obrazekVpravo ? '' : 'lg:col-start-2'} space-y-8`}>
            <DatabaseText
              klic={nadpisKlic}
              typ="nadpis"
              as="h2"
              className="text-6xl lg:text-7xl xl:text-8xl font-black text-[#212121] mb-6 tracking-tight uppercase leading-none"
              placeholder="KVALITA"
            />
            
            <DatabaseText
              klic={podnadpisKlic}
              typ="popis"
              as="h3"
              className="text-xl lg:text-2xl text-[#B8A876] mb-8 font-semibold tracking-widest uppercase"
              placeholder="PRVOTŘÍDNÍ PÉČE O VAŠE VLASY"
            />
            
            <div className="space-y-6 text-lg lg:text-xl text-[#212121] leading-relaxed">
              <DatabaseText
                klic={textKlic || textKlic1 || ''}
                typ="text"
                as="p"
                className=""
                placeholder="Vlasová péče je více než jen střih nebo barva - je to umění. Sledujeme nejnovější trendy a využíváme kvalitní přípravky, které chrání a vyživují vaše vlasy."
              />
              
              {textKlic2 && (
                <DatabaseText
                  klic={textKlic2}
                  typ="text"
                  as="p"
                  className=""
                  placeholder="Každý klient je jedinečný a my dbáme na individuální přístup. Společně najdeme styl, který vám bude dokonale slušet."
                />
              )}
            </div>
            
            <Link
              href="/sluzby"
              title="Více informací o službách"
              className="inline-block bg-[#B8A876] hover:bg-[#A39566] text-[#212121] font-black py-4 px-8 transition-all duration-200 uppercase tracking-widest text-sm mt-8 rounded-none hover:scale-[1.02]"
            >
              <DatabaseText
                klic={tlacitkoKlic}
                typ="tlacitko_text"
                as="span"
                placeholder="VÍCE INFORMACÍ"
              />
            </Link>
          </div>

          {/* Obrázek */}
          <div className={`relative ${obrazekVpravo ? '' : 'lg:col-start-1'}`}>
            <div className="aspect-4/3 relative overflow-hidden rounded-lg">
              <Image
                src={obrazekUrl}
                alt={obrazekAlt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}