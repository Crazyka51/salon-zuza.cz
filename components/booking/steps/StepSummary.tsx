'use client'

import { AlertCircle, Calendar, Check, Mail, Phone, Scissors, User, ChevronLeft } from 'lucide-react'
import { cenaProUroven, popisekUrovne, type KontaktniUdaje, type Sluzba, type Zamestnanec } from '@/components/booking/types'

interface StepSummaryProps {
  vybraneSluzby: Sluzba[]
  vybranyZamestnanec: Zamestnanec | null
  datum: string
  cas: string
  formData: KontaktniUdaje
  totalDuration: number
  onBack: () => void
  onSubmit: () => void
  isSubmitting?: boolean
}

function formatCena(sluzby: Sluzba[], uroven?: string): number {
  return sluzby.reduce((sum, s) => sum + cenaProUroven(s, uroven), 0)
}

// Krok 5: Souhrn rezervace před odesláním
export default function StepSummary({ vybraneSluzby, vybranyZamestnanec, datum, cas, formData, totalDuration, onBack, onSubmit, isSubmitting = false }: StepSummaryProps) {
  const cena = formatCena(vybraneSluzby, vybranyZamestnanec?.uroven)

  return (
    <div className="space-y-6 scroll-mt-24">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">Zkontrolujte údaje před odesláním</h3>
          <p className="mt-1 text-sm text-neutral-500">Ujistěte se, že všechny zadané informace odpovídají vašim požadavkům.</p>
        </div>

        <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-5">
          <div className="flex items-start justify-between gap-4 border-b border-neutral-200/60 pb-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-[#b59a5b]/10 p-2.5 text-[#b59a5b]"><Scissors className="h-5 w-5" /></div>
              <div>
                {vybraneSluzby.map((s) => <h4 key={s.id} className="font-semibold text-neutral-900">{s.nazev}</h4>)}
                <p className="text-xs text-neutral-500">{totalDuration} min</p>
              </div>
            </div>
            <span className="text-lg font-bold text-neutral-900">{cena} Kč</span>
          </div>

          <div className="grid gap-4 border-b border-neutral-200/60 py-2 text-sm md:grid-cols-2">
            <div className="flex items-start gap-3"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" /><div><span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">Termín</span><span className="font-medium capitalize text-neutral-800">{datum && new Date(`${datum}T12:00:00`).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} v {cas}</span></div></div>
            <div className="flex items-start gap-3"><User className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" /><div><span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">Kadeřnice</span><span className="font-medium text-neutral-800">{vybranyZamestnanec ? `${vybranyZamestnanec.jmeno} ${vybranyZamestnanec.prijmeni} (${popisekUrovne(vybranyZamestnanec.uroven)})` : 'Bez preference'}</span></div></div>
          </div>

          <div className="space-y-2 text-sm">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Kontaktní údaje</span>
            <div className="grid gap-2 text-xs md:grid-cols-3">
              <div><span className="block text-neutral-400">Jméno:</span><span className="font-medium text-neutral-700">{formData.jmeno} {formData.prijmeni}</span></div>
              <div><span className="block text-neutral-400">Telefon:</span><span className="font-medium text-neutral-700">{formData.telefon}</span></div>
              <div><span className="block text-neutral-400">E-mail:</span><span className="block truncate font-medium text-neutral-700">{formData.email || 'Neuveden'}</span></div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3.5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="space-y-1.5 text-xs leading-relaxed text-amber-900">
            <p className="font-semibold text-amber-950">Důležité informace k rezervaci:</p>
            <p>Vybraný termín slouží jako <strong>nezávazná žádost</strong>. Potvrzení obdržíte, jakmile termín schválí obsluha salonu.</p>
            <div className="flex flex-wrap gap-4 pt-1 font-medium text-amber-800"><span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />+420 724 311 258</span><span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />zuzka@salon-zuza.cz</span></div>
          </div>
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-neutral-100 pt-2 sm:flex-row">
          <p className="text-xs text-neutral-500">{formData.pocetOsob} {formData.pocetOsob === 1 ? 'osoba' : 'osoby'}</p>
          <div className="flex w-full gap-3 sm:w-auto">
            <button type="button" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:flex-none" onClick={onBack}><ChevronLeft className="h-4 w-4" />Zpět na kontakty</button>
            <button type="button" onClick={onSubmit} disabled={isSubmitting} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#b59a5b] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#a38849] active:bg-[#8f763c] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">{isSubmitting ? 'Odesílám...' : <><Check className="h-4 w-4" />Odeslat rezervaci</>}</button>
          </div>
        </div>
    </div>
  )
}
