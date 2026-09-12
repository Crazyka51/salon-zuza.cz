'use client'

// Stránka ceníku podle skutečného webu
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useEffect, useState } from 'react'
import { useObsahStranky } from '@/hooks/use-obsah-stranky'

interface Sluzba {
  id: number
  nazev: string
  popis: string | null
  cenaJuniorStylist: number
  cenaStylist: number
  cenaTopStylist: number
  dobaTrvaniMinuty: number
  poradi: number
}

interface Kategorie {
  id: number
  nazev: string
  popis: string | null
  sluzby: Sluzba[]
}

export default function CenikPage() {
  const [kategorie, setKategorie] = useState<Kategorie[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedSluzba, setDraggedSluzba] = useState<number | null>(null)
  const [dragOverSluzba, setDragOverSluzba] = useState<number | null>(null)
  const [draggedFromKategorie, setDraggedFromKategorie] = useState<number | null>(null)
  const { obsah } = useObsahStranky('cenik')

  // Pomocná funkce pro získání obsahu podle klíče
  const ziskatObsah = (klic: string, defaultValue: string = '') => {
    const item = obsah.find((o: any) => o.klic === klic)
    return item?.hodnota || defaultValue
  }

  useEffect(() => {
    fetch('/api/cenik')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setKategorie(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDragStart = (e: React.DragEvent, sluzbaId: number, kategorieId: number) => {
    setDraggedSluzba(sluzbaId)
    setDraggedFromKategorie(kategorieId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (sluzbaId: number) => {
    if (draggedSluzba && draggedSluzba !== sluzbaId) {
      setDragOverSluzba(sluzbaId)
    }
  }

  const handleDragLeave = () => {
    setDragOverSluzba(null)
  }

  const handleDrop = async (e: React.DragEvent, targetSluzbaId: number, kategorieId: number) => {
    e.preventDefault()
    setDragOverSluzba(null)

    if (!draggedSluzba || draggedSluzba === targetSluzbaId || draggedFromKategorie !== kategorieId) {
      setDraggedSluzba(null)
      setDraggedFromKategorie(null)
      return
    }

    // Reorder sluzby
    const targetKat = kategorie.find(k => k.id === kategorieId)
    if (!targetKat) return

    const reorderedSluzby = [...targetKat.sluzby]
    const draggedIndex = reorderedSluzby.findIndex(s => s.id === draggedSluzba)
    const targetIndex = reorderedSluzby.findIndex(s => s.id === targetSluzbaId)

    const [draggedItem] = reorderedSluzby.splice(draggedIndex, 1)
    reorderedSluzby.splice(targetIndex, 0, draggedItem)

    // Update local state
    setKategorie(prev => prev.map(k => 
      k.id === kategorieId ? { ...k, sluzby: reorderedSluzby } : k
    ))

    // Update server
    try {
      await fetch('/api/admin/cenik/sluzby/poradi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sluzby: reorderedSluzby.map(s => ({ id: s.id })),
          kategorieId
        })
      })
    } catch (error) {
      console.error('Chyba při aktualizaci pořadí:', error)
    }

    setDraggedSluzba(null)
    setDraggedFromKategorie(null)
  }

  const handleDragEnd = () => {
    setDraggedSluzba(null)
    setDraggedFromKategorie(null)
    setDragOverSluzba(null)
  }
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero sekce pro ceník */}
      <section className="bg-linear-to-br from-[#B8A876] to-[#A39566] text-white py-24 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-wide">
            {ziskatObsah('cenik_hero_nadpis', 'CENÍK SLUŽEB')}
          </h1>
          <p className="text-xl font-light opacity-90 leading-relaxed">
            {ziskatObsah('cenik_hero_popis', 'Transparentní ceny za profesionální služby')}
          </p>
        </div>
      </section>

      {/* Ceník tabulka */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8A876] mx-auto"></div>
              <p className="mt-4 text-gray-600">{ziskatObsah('cenik_loading_text', 'Načítání ceníku...')}</p>
            </div>
          ) : (
            kategorie.map(kat => (
              <div key={kat.id} className="mb-12 bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#B8A876] text-white p-6">
                  <h2 className="text-2xl font-bold">{kat.nazev}</h2>
                  {kat.popis && <p className="text-sm opacity-90 mt-1">{kat.popis}</p>}
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {kat.sluzby.map(sluzba => {
                      const ceny = [sluzba.cenaJuniorStylist, sluzba.cenaStylist, sluzba.cenaTopStylist]
                        .filter(c => c > 0)
                        .sort((a, b) => a - b)
                      const cenaText = ceny.length === 0
                        ? 'Cena na dotaz'
                        : ceny[0] === ceny[ceny.length - 1]
                          ? `${ceny[0].toLocaleString('cs-CZ')},- Kč`
                          : `${ceny[0].toLocaleString('cs-CZ')} - ${ceny[ceny.length - 1].toLocaleString('cs-CZ')},- Kč`
                      return (
                        <div 
                          key={sluzba.id} 
                          className={`flex justify-between border-b pb-2 px-3 py-2 rounded transition-all duration-200 cursor-move ${
                            draggedSluzba === sluzba.id 
                              ? 'opacity-50 scale-[0.99] bg-[#B8A876]/10' 
                              : dragOverSluzba === sluzba.id 
                                ? 'bg-[#B8A876]/5 transform scale-[1.01]' 
                                : 'hover:bg-gray-50'
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, sluzba.id, kat.id)}
                          onDragOver={handleDragOver}
                          onDragEnter={() => handleDragEnter(sluzba.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, sluzba.id, kat.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <span>{sluzba.nazev}</span>
                          <span className="font-semibold whitespace-nowrap ml-4">{cenaText}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))
          )}

        </div>
      </section>

      {/* Poznámka */}
      <section className="bg-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <p className="text-[#555555] text-lg mb-4">
              <strong>Poznámka:</strong> {ziskatObsah('cenik_poznamka_text', 'Ceny se mohou lišit v závislosti na délce a struktuře vlasů.')}
            </p>
            <p className="text-[#555555]">
              {ziskatObsah('cenik_poznamka_kontakt', 'Pro přesnou cenovou nabídku nás kontaktujte nebo si domluvte konzultaci zdarma.')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#333333] mb-6">
            {ziskatObsah('cenik_cta_nadpis', 'Chcete si rezervovat termín?')}
          </h2>
          <p className="text-lg text-[#555555] mb-8">
            {ziskatObsah('cenik_cta_popis', 'Využijte naši online rezervaci nebo nás kontaktujte přímo')}
          </p>
          <a href="/online-rezervace" className="inline-block bg-[#B8A876] hover:bg-[#A39566] text-white font-bold py-3 px-8 transition-colors">
            {ziskatObsah('cenik_cta_tlacitko', 'REZERVOVAT ONLINE')}
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}