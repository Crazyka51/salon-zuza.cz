import React from 'react'

interface WizardProgressProps {
  krok: number
  celkemKroku: number
  labely: string[]
}

export default function WizardProgress({ krok, celkemKroku, labely }: WizardProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-[#555555] mb-2">
        <span>Krok {krok}/{celkemKroku}</span>
        <span className="text-[#B8A876] font-semibold">{labely[krok - 1]}</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#B8A876] transition-all duration-300"
          style={{ width: `${(krok / celkemKroku) * 100}%` }}
        />
      </div>
      <div className="mt-3 hidden sm:flex justify-between text-[11px] text-gray-400">
        {labely.map((l, i) => (
          <span key={l} className={i + 1 <= krok ? 'text-[#B8A876] font-semibold' : ''}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}
