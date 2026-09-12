'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Palette, Scissors, Sparkles } from 'lucide-react'
import ServiceCard from '@/components/booking/ServiceCard'
import { cenaProUroven, type Sluzba } from '@/components/booking/types'

interface StepServicesProps {
  sluzby: Sluzba[]
  selectedIds: number[]
  onToggle: (id: number) => void
}

// Krok 2: Výběr služeb v rozbalovacích kategoriích
export default function StepServices({ sluzby, selectedIds, onToggle }: StepServicesProps) {
  const [otevreneKategorie, setOtevreneKategorie] = useState<Set<string>>(new Set())

  const filtrovaneSluzby = useMemo(() => {
    return sluzby
  }, [sluzby])

  const kategorie = useMemo(() => {
    const map = new Map<string, Sluzba[]>()
    for (const s of filtrovaneSluzby) {
      const nazev = s.kategorie?.nazev || 'Ostatní'
      if (!map.has(nazev)) map.set(nazev, [])
      map.get(nazev)!.push(s)
    }
    return Array.from(map.entries())
  }, [filtrovaneSluzby])

  const prepnoutKategorii = (nazev: string) => {
    setOtevreneKategorie((prev) => {
      const next = new Set(prev)
      if (next.has(nazev)) next.delete(nazev)
      else next.add(nazev)
      return next
    })
  }

  const ikonaKategorie = (nazev: string) => {
    const normalizedName = nazev.toLowerCase()
    if (normalizedName.includes('barv') || normalizedName.includes('melír') || normalizedName.includes('zesvětl')) return Palette
    if (normalizedName.includes('další')) return Sparkles
    return Scissors
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#333333] mb-3">
        Jaké služby si přejete rezervovat? Rozbalte kategorii a vyberte jednu nebo více možností.
      </label>

      <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
        {kategorie.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Žádné služby neodpovídají hledání.</div>
        ) : (
          kategorie.map(([nazevKategorie, sluzbyVKategorii]) => {
            const jeOtevrena = otevreneKategorie.has(nazevKategorie)
            const pocetVybranych = sluzbyVKategorii.filter((s) => selectedIds.includes(s.id)).length
            return (
              <div key={nazevKategorie} className="border-b border-gray-200 bg-white last:border-b-0">
                <button
                  type="button"
                  onClick={() => prepnoutKategorii(nazevKategorie)}
                  className="flex w-full items-center justify-between gap-3 bg-gray-50 px-4 py-3.5 text-left transition-colors hover:bg-gray-100"
                  aria-expanded={jeOtevrena}
                >
                  <span className="flex items-center gap-2 font-semibold text-[#333333] text-sm uppercase tracking-wide">
                    {(() => { const CategoryIcon = ikonaKategorie(nazevKategorie); return <CategoryIcon className="h-4 w-4 text-[#A39566]" /> })()}
                    <span>{nazevKategorie}</span>
                    {pocetVybranych > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center rounded-full bg-[#B8A876] text-white text-xs w-5 h-5">
                        {pocetVybranych}
                      </span>
                    )}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${jeOtevrena ? 'rotate-180' : ''}`} />
                </button>
                {jeOtevrena && (
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sluzbyVKategorii.map((sluzba) => (
                      <ServiceCard
                        key={sluzba.id}
                        id={sluzba.id}
                        nazev={sluzba.nazev}
                        dobaTrvaniMinuty={sluzba.dobaTrvaniMinuty}
                        checked={selectedIds.includes(sluzba.id)}
                        onToggle={onToggle}
                        kategorie={sluzba.kategorie?.nazev}
                        cena={cenaProUroven(sluzba)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
