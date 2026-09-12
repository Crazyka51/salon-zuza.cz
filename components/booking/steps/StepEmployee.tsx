'use client'

import { cenaProUroven, popisekUrovne, type Sluzba, type Zamestnanec } from '@/components/booking/types'

interface StepEmployeeProps {
  zamestnanci: Zamestnanec[]
  vybraneSluzby: Sluzba[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  loading: boolean
}

// Krok 2: Výběr zaměstnance, "Bez preference" nebo konkrétní stylistka s odhadovanou cenou
export default function StepEmployee({ zamestnanci, vybraneSluzby, selectedId, onSelect, loading }: StepEmployeeProps) {
  const odhadovanaCena = (uroven?: string) =>
    vybraneSluzby.reduce((sum, s) => sum + cenaProUroven(s, uroven), 0)

  return (
    <div>
      <label className="block text-sm font-medium text-[#333333] mb-3">
        Vyberte si stylistku (nepovinné)
      </label>

      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Načítám zaměstnance…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`flex items-center gap-3 p-4 border rounded-lg text-left transition-all hover:shadow-sm ${
              selectedId === null ? 'ring-2 ring-[#B8A876] border-[#B8A876] bg-[#F8F4EA]' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl shrink-0">
              ✨
            </div>
            <div>
              <div className="font-medium text-[#333333]">Bez preference</div>
              <div className="text-xs text-gray-500">Přiřadíme vám volnou stylistku</div>
              {vybraneSluzby.length > 0 && (
                <div className="text-xs text-[#B8A876] font-medium mt-1">od {odhadovanaCena('junior_stylist')} Kč</div>
              )}
            </div>
          </button>

          {zamestnanci.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => onSelect(z.id)}
              className={`flex items-center gap-3 p-4 border rounded-lg text-left transition-all hover:shadow-sm ${
                selectedId === z.id ? 'ring-2 ring-[#B8A876] border-[#B8A876] bg-[#F8F4EA]' : 'border-gray-200 bg-white'
              }`}
            >
              {z.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={z.fotoUrl} alt={`${z.jmeno} ${z.prijmeni}`} className="w-12 h-12 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-semibold shrink-0">
                  {z.jmeno.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-medium text-[#333333]">{z.jmeno} {z.prijmeni}</div>
                <div className="text-xs text-gray-500">{popisekUrovne(z.uroven)}</div>
                {vybraneSluzby.length > 0 && (
                  <div className="text-xs text-[#B8A876] font-medium mt-1">{odhadovanaCena(z.uroven)} Kč</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
