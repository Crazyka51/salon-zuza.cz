import React from 'react'
import { Clock3, Scissors } from 'lucide-react'

interface Props {
  id: number
  nazev: string
  dobaTrvaniMinuty: number
  checked: boolean
  onToggle: (id: number) => void
  kategorie?: string
  cena?: number
}

// Funkce pro získání barvan podle kategorie služby
const getCategoryColors = (kategorie?: string) => {
  const categoryName = kategorie?.toUpperCase().trim() || ''
  
  // Přesné mapování kategorií na barvy podle skutečných názvů z DB
  switch (categoryName) {
    case 'STŘIH':
      return {
        border: 'border-blue-200/0',
        bg: 'bg-blue-50/0',
        accent: 'bg-blue-500',
        textAccent: 'text-blue-700'
      }
    
    case 'BARVENÍ':
      return {
        border: 'border-purple-200',
        bg: 'bg-purple-50', 
        accent: 'bg-purple-500',
        textAccent: 'text-purple-700'
      }
    
    case 'MELÍROVÁNÍ':
      return {
        border: 'border-indigo-200',
        bg: 'bg-indigo-50',
        accent: 'bg-indigo-500', 
        textAccent: 'text-indigo-700'
      }
    
    case 'ZESVĚTLOVÁNÍ':
      return {
        border: 'border-cyan-200',
        bg: 'bg-cyan-50',
        accent: 'bg-cyan-500',
        textAccent: 'text-cyan-700'
      }
    
    case 'DALŠÍ SLUŽBY':
      return {
        border: 'border-rose-200',
        bg: 'bg-rose-50',
        accent: 'bg-rose-500',
        textAccent: 'text-rose-700'
      }
    
    // Výchozí barva pro neznámé kategorie
    default:
      return {
        border: 'border-amber-200',
        bg: 'bg-amber-50',
        accent: 'bg-amber-500',
        textAccent: 'text-amber-700'
      }
  }
}

export default function ServiceCard({ id, nazev, dobaTrvaniMinuty, checked, onToggle, kategorie, cena }: Props) {
  const colors = getCategoryColors(kategorie)
  
  return (
    <label className={`flex items-center justify-between gap-3 rounded-lg border p-3.5 cursor-pointer transition-all hover:border-[#B8A876] hover:shadow-sm ${colors.border} ${colors.bg} ${checked ? 'ring-2 ring-[#B8A876] ring-offset-1' : ''}`}>
      <div className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(id)}
          className="h-4 w-4 accent-[#A39566]"
          aria-label={`select-service-${id}`}
        />
        <div className="min-w-0">
          <div className="truncate font-medium text-[#333333]">{nazev}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5"><Clock3 className="h-3 w-3" />{dobaTrvaniMinuty} min</span>
            {cena !== undefined && <span className="rounded-full bg-white/70 px-2 py-0.5 font-semibold">{cena} Kč</span>}
            {kategorie && <span className={`rounded-full bg-white/70 px-2 py-0.5 font-medium ${colors.textAccent}`}>{kategorie}</span>}
          </div>
        </div>
      </div>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors.accent} text-white`} title={kategorie || 'Služba'}>
        <Scissors className="h-4 w-4" />
      </div>
    </label>
  )
}
