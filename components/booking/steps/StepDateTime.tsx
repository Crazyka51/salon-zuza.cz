'use client'

import type { BlokovanyTermin, CasovySlot } from '@/components/booking/types'

interface StepDateTimeProps {
  kalendarDatum: Date
  onPredchoziMesic: () => void
  onDalsiMesic: () => void
  vybranyDatum: string
  vybranyCas: string
  onVybratDen: (datum: string) => void
  onVybratCas: (cas: string) => void
  sloty: CasovySlot[]
  loadingSloty: boolean
  provozniHodinyData: Record<number, boolean>
  blokovaneTerminyData: BlokovanyTermin[]
}

// Krok 3: Výběr data a času, vizuální kalendář a dostupné časové sloty
export default function StepDateTime({
  kalendarDatum,
  onPredchoziMesic,
  onDalsiMesic,
  vybranyDatum,
  vybranyCas,
  onVybratDen,
  onVybratCas,
  sloty,
  loadingSloty,
  provozniHodinyData,
  blokovaneTerminyData,
}: StepDateTimeProps) {
  const isDenUzavren = (date: Date): boolean => provozniHodinyData[date.getDay()] === true

  const isDenBlokovany = (date: Date): boolean => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`
    return blokovaneTerminyData.some((bt) => {
      const od = bt.datumOd.split('T')[0]
      const do_ = bt.datumDo.split('T')[0]
      return dateStr >= od && dateStr <= do_
    })
  }

  const generateKalendarDny = () => {
    const year = kalendarDatum.getFullYear()
    const month = kalendarDatum.getMonth()
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startOffset = firstDow === 0 ? 6 : firstDow - 1
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cells = []
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`e${i}`} />)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const mo = String(month + 1).padStart(2, '0')
      const da = String(day).padStart(2, '0')
      const dateStr = `${year}-${mo}-${da}`
      const isPast = date < today
      const isClosed = isDenUzavren(date)
      const isBlocked = isDenBlokovany(date)
      const isSelected = vybranyDatum === dateStr
      const isToday = date.getTime() === today.getTime()
      const isDisabled = isPast || isClosed || isBlocked
      let cls = 'relative w-full h-10 flex flex-col items-center justify-center rounded text-sm font-medium transition-colors '
      if (isSelected) cls += 'bg-[#B8A876] text-white shadow-md'
      else if (isBlocked) cls += 'bg-red-50/60 text-red-300 cursor-not-allowed line-through'
      else if (isPast || isClosed) cls += 'bg-gray-100/70 text-gray-300 cursor-not-allowed'
      else cls += 'text-[#333333] hover:bg-[#B8A876]/20 cursor-pointer'
      if (isToday && !isSelected) cls += ' ring-2 ring-[#B8A876]'
      cells.push(
        <div key={day} className="p-0.5">
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => onVybratDen(dateStr)}
            className={cls}
            title={isBlocked ? 'Zavřeno (blokovaný termín)' : isClosed ? 'Salon má zavřeno' : isPast ? 'Minulý den' : ''}
          >
            <span>{day}</span>
          </button>
        </div>
      )
    }
    return cells
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#333333] mb-3">Datum a čas *</label>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-[#B8A876]/40 bg-white px-4 py-3 text-[#333333]">
          <button
            type="button"
            onClick={onPredchoziMesic}
            className="flex h-8 w-8 items-center justify-center rounded text-xl font-bold text-[#A39566] transition-colors hover:bg-[#B8A876]/10"
            aria-label="Předchozí měsíc"
          >
            ‹
          </button>
          <span className="font-semibold capitalize">
            {kalendarDatum.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={onDalsiMesic}
            className="flex h-8 w-8 items-center justify-center rounded text-xl font-bold text-[#A39566] transition-colors hover:bg-[#B8A876]/10"
            aria-label="Další měsíc"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 p-2 gap-0.5">{generateKalendarDny()}</div>
        <div className="flex flex-wrap gap-4 px-3 pb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#B8A876] inline-block" />
            Vybraný den
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded ring-2 ring-[#B8A876] inline-block" />
            Dnes
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-gray-100" />
            Zavřeno / nedostupné
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-100 inline-block" />
            Nedostupné
          </span>
        </div>
      </div>

      {vybranyDatum && (
        <div className="mt-4 rounded-lg border border-[#B8A876]/40 bg-white p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-[#333333]">
            Dostupné časy: {' '}
            <span className="text-[#B8A876]">
              {new Date(vybranyDatum + 'T12:00:00').toLocaleDateString('cs-CZ', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
          {loadingSloty ? (
            <div className="text-center py-6 text-gray-400 text-sm">Načítám dostupné časy…</div>
          ) : sloty.length === 0 ? (
            <div className="text-center py-6 text-red-500 text-sm">Pro tento den nejsou žádné volné časy.</div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {sloty.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onVybratCas(slot.time)}
                  className={[
                    'flex h-11 items-center justify-center rounded-2xl text-xs font-bold transition-all duration-150 outline-none focus:outline-none',
                    !slot.available
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : vybranyCas === slot.time
                        ? 'border-2 border-[#b59a5b] bg-[#b59a5b] text-white shadow-sm'
                          : 'border border-neutral-200 bg-white text-neutral-800 hover:border-[#b59a5b] hover:bg-[#b59a5b]/5',
                  ].join(' ')}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
