'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import WizardProgress from '@/components/booking/WizardProgress'
import StepServices from '@/components/booking/steps/StepServices'
import StepEmployee from '@/components/booking/steps/StepEmployee'
import StepDateTime from '@/components/booking/steps/StepDateTime'
import StepDetails from '@/components/booking/steps/StepDetails'
import StepSummary from '@/components/booking/steps/StepSummary'
import { cenaProUroven, type BlokovanyTermin, type CasovySlot, type KontaktniUdaje, type Sluzba, type Zamestnanec } from '@/components/booking/types'

const KROKY = ['Služby', 'Zaměstnanec', 'Termín', 'Kontakt', 'Souhrn']

export default function BookingWizard() {
  const router = useRouter()

  const [krok, setKrok] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data z API
  const [dbSluzby, setDbSluzby] = useState<Sluzba[]>([])
  const [zamestnanci, setZamestnanci] = useState<Zamestnanec[]>([])
  const [loadingZamestnanci, setLoadingZamestnanci] = useState(true)
  const [provozniHodinyData, setProvozniHodinyData] = useState<Record<number, boolean>>({})
  const [blokovaneTerminyData, setBlokovaneTerminyData] = useState<BlokovanyTermin[]>([])

  // Výběr uživatele
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [kalendarDatum, setKalendarDatum] = useState(() => new Date())
  const [sloty, setSloty] = useState<CasovySlot[]>([])
  const [loadingSloty, setLoadingSloty] = useState(false)
  const [formData, setFormData] = useState<KontaktniUdaje>({
    jmeno: '',
    prijmeni: '',
    email: '',
    telefon: '',
    poznamka: '',
    pocetOsob: 1,
    pocetDeti: 0,
  })
  const [datum, setDatum] = useState('')
  const [cas, setCas] = useState('')
  const [acknowledgedWaitForApproval, setAcknowledgedWaitForApproval] = useState(false)

  const toggleService = (id: number) => {
    setSelectedServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  useEffect(() => {
    const fetchSluzby = async () => {
      try {
        const response = await fetch('/api/admin/sluzby')
        if (response.ok) {
          const data = await response.json()
          setDbSluzby(data.sluzby || [])
        }
      } catch (error) {
        console.error('Chyba při načítání služeb:', error)
      }
    }

    const fetchZamestnanci = async () => {
      try {
        const res = await fetch('/api/admin/zamestnanci?mode=booking')
        if (res.ok) {
          const data = await res.json()
          setZamestnanci(data.zamestnanci || [])
        }
      } catch (error) {
        console.error('Chyba při načítání zaměstnanců:', error)
      } finally {
        setLoadingZamestnanci(false)
      }
    }

    const fetchProvozniHodiny = async () => {
      try {
        const res = await fetch('/api/admin/provozni-hodiny')
        if (res.ok) {
          const data: { denTydne: number; jeZavreno: boolean }[] = await res.json()
          const map: Record<number, boolean> = {}
          data.forEach((h) => { map[h.denTydne] = h.jeZavreno })
          setProvozniHodinyData(map)
        }
      } catch {}
    }

    const fetchBlokovane = async () => {
      try {
        const res = await fetch('/api/admin/rezervace/blokovane-terminy')
        if (res.ok) {
          const data = await res.json()
          setBlokovaneTerminyData(
            (data.blokovaneTerminy || []).filter(
              (b: BlokovanyTermin) => b.jeAktivni && b.source !== 'employee-vacation'
            )
          )
        }
      } catch {}
    }

    fetchSluzby()
    fetchZamestnanci()
    fetchProvozniHodiny()
    fetchBlokovane()
  }, [])

  const predchoziMesic = () => setKalendarDatum((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const dalsiMesic = () => setKalendarDatum((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const vybraneSluzby = useMemo(
    () => selectedServiceIds.map((id) => dbSluzby.find((s) => s.id === id)).filter((s): s is Sluzba => Boolean(s)),
    [selectedServiceIds, dbSluzby]
  )

  const vybranyZamestnanec = useMemo(
    () => zamestnanci.find((z) => z.id === selectedEmployeeId) || null,
    [zamestnanci, selectedEmployeeId]
  )

  const totalDuration = useMemo(
    () => vybraneSluzby.reduce((sum, s) => sum + s.dobaTrvaniMinuty, 0),
    [vybraneSluzby]
  )

  const totalPrice = useMemo(
    () => vybraneSluzby.reduce((sum, s) => sum + cenaProUroven(s, vybranyZamestnanec?.uroven), 0),
    [vybraneSluzby, vybranyZamestnanec]
  )

  const nacistSloty = async (vybranyDatum: string) => {
    setLoadingSloty(true)
    setSloty([])
    try {
      const params = new URLSearchParams({ datum: vybranyDatum })
      if (totalDuration > 0) {
        params.set('trvaniMinut', String(totalDuration))
      } else if (selectedServiceIds.length > 0) {
        params.set('sluzbaId', String(selectedServiceIds[0]))
      }
      if (selectedEmployeeId) {
        params.set('zamestnanecId', String(selectedEmployeeId))
      }
      const res = await fetch(`/api/rezervace/dostupne-terminy?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSloty(data.dostupneTerminy || [])
      }
    } catch (err) {
      console.error('Chyba při načítání slotů:', err)
    } finally {
      setLoadingSloty(false)
    }
  }

  useEffect(() => {
    if (datum) nacistSloty(datum)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceIds, selectedEmployeeId])

  const vybratDen = (novyDatum: string) => {
    setDatum(novyDatum)
    setCas('')
    nacistSloty(novyDatum)
  }

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }

  const jeKrokValidni = (kontrolovanyKrok: number): boolean => {
    switch (kontrolovanyKrok) {
      case 1:
        return selectedServiceIds.length > 0
      case 2:
        return true
      case 3:
        return Boolean(datum && cas)
      case 4:
        return Boolean(
          formData.jmeno && formData.prijmeni && formData.telefon && acknowledgedWaitForApproval
        )
      default:
        return true
    }
  }

  const dalsiKrok = () => {
    if (!jeKrokValidni(krok)) return
    setKrok((k) => Math.min(k + 1, KROKY.length))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const predchoziKrok = () => {
    setKrok((k) => Math.max(k - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!jeKrokValidni(4) || selectedServiceIds.length === 0 || !datum || !cas) return
    setIsSubmitting(true)

    try {
      const endTime = calculateEndTime(cas, totalDuration)

      const reservationData = {
        jmeno: formData.jmeno.trim(),
        prijmeni: formData.prijmeni.trim(),
        email: formData.email.trim() || null,
        telefon: formData.telefon.trim(),
        datum,
        casOd: cas,
        casDo: endTime,
        sluzbyIds: selectedServiceIds,
        zamestnanecId: selectedEmployeeId,
        poznamka: formData.poznamka || null,
        pocetOsob: formData.pocetOsob,
        pocetDeti: formData.pocetDeti,
        cena: totalPrice,
        zpusobPlatby: 'hotove',
        notifikaceEmail: true,
        notifikaceSms: false,
      }

      const response = await fetch('/api/rezervace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Nepodařilo se vytvořit rezervaci')
      }

      const result = await response.json()
      const rezervaceId = result?.rezervace?.id
      const targetUrl = typeof rezervaceId === 'number'
        ? `/online-rezervace/dekujeme?rezervace=${rezervaceId}`
        : '/online-rezervace/dekujeme'

      router.push(targetUrl)
    } catch (error) {
      console.error('Error:', error)
      alert(`Chyba při odesílání rezervace: ${error instanceof Error ? error.message : 'Neznámá chyba'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const jePosledniKrok = krok === KROKY.length

  return (
    <div className="pt-20 sm:pt-24">
      <WizardProgress krok={krok} celkemKroku={KROKY.length} labely={KROKY} />

      <div>
        {krok === 1 && (
          <StepServices
            sluzby={dbSluzby}
            selectedIds={selectedServiceIds}
            onToggle={toggleService}
          />
        )}
        {krok === 2 && (
          <StepEmployee
            zamestnanci={zamestnanci}
            vybraneSluzby={vybraneSluzby}
            selectedId={selectedEmployeeId}
            onSelect={setSelectedEmployeeId}
            loading={loadingZamestnanci}
          />
        )}
        {krok === 3 && (
          <StepDateTime
            kalendarDatum={kalendarDatum}
            onPredchoziMesic={predchoziMesic}
            onDalsiMesic={dalsiMesic}
            vybranyDatum={datum}
            vybranyCas={cas}
            onVybratDen={vybratDen}
            onVybratCas={setCas}
            sloty={sloty}
            loadingSloty={loadingSloty}
            provozniHodinyData={provozniHodinyData}
            blokovaneTerminyData={blokovaneTerminyData}
          />
        )}
        {krok === 4 && (
          <StepDetails
            formData={formData}
            onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
            acknowledgedWaitForApproval={acknowledgedWaitForApproval}
            onAcknowledgeChange={setAcknowledgedWaitForApproval}
          />
        )}
        {krok === 5 && (
          <StepSummary
            vybraneSluzby={vybraneSluzby}
            vybranyZamestnanec={vybranyZamestnanec}
            datum={datum}
            cas={cas}
            formData={formData}
            totalDuration={totalDuration}
            onBack={predchoziKrok}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {krok !== 5 && <div className="mx-auto mt-8 flex w-full items-center justify-between border-t border-gray-200 pt-6">
        <div className="min-w-0 text-sm text-[#555555]">
          {vybraneSluzby.length > 0 ? (
            <>
              <span className="block max-w-60 truncate font-medium text-[#333333]" title={vybraneSluzby.map((sluzba) => sluzba.nazev).join(', ')}>
                {vybraneSluzby.map((sluzba) => sluzba.nazev).join(', ')}
              </span>
              <span className="block max-w-60 truncate text-xs text-[#777777]" title={Array.from(new Set(vybraneSluzby.map((sluzba) => sluzba.kategorie?.nazev).filter(Boolean))).join(', ')}>
                {Array.from(new Set(vybraneSluzby.map((sluzba) => sluzba.kategorie?.nazev).filter(Boolean))).join(', ') || 'Bez kategorie'}
              </span>
              {krok >= 2 && (
                <span className="block max-w-60 truncate text-xs text-[#777777]" title={vybranyZamestnanec ? `${vybranyZamestnanec.jmeno} ${vybranyZamestnanec.prijmeni}` : 'Bez preference'}>
                  {vybranyZamestnanec ? `${vybranyZamestnanec.jmeno} ${vybranyZamestnanec.prijmeni}` : 'Bez preference'}
                </span>
              )}
              <span className="text-xs">{totalDuration} min</span>
            </>
          ) : <span className="text-sm text-gray-400">Vyberte alespoň jednu službu</span>}
        </div>
        <div className="flex items-center gap-3">
          {krok > 1 && (
            <button
              type="button"
              onClick={predchoziKrok}
              className="px-5 py-3 rounded-md border border-gray-300 text-[#333333] font-medium hover:bg-gray-50 transition-colors"
            >
              Zpět
            </button>
          )}
          {jePosledniKrok ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-[#A39566] px-6 py-3 font-bold text-white shadow-sm transition-colors hover:bg-[#8f7f4f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Odesílám…' : 'Odeslat rezervaci'}
            </button>
          ) : (
            <button
              type="button"
              onClick={dalsiKrok}
              disabled={!jeKrokValidni(krok)}
              className="inline-flex items-center gap-2 rounded-md bg-[#A39566] px-6 py-3 font-bold text-white shadow-sm transition-colors hover:bg-[#8f7f4f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Další krok
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>}
    </div>
  )
}
