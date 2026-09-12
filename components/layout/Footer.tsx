// Footer s kontakty a mapou
'use client'

import dynamic from 'next/dynamic'
import { Facebook } from 'lucide-react'
import { DatabaseText } from '@/components/DatabaseText'
import { useCmsObsah } from '@/hooks/use-obsah-stranky'

// Dynamicky načíst SalonMapa komponentu (kvůli SSR problémům s Leaflet)
const SalonMapa = dynamic(() => import('./SalonMapa').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-gray-600 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8A876] mx-auto mb-2"></div>
        <p className="text-sm">Načítání mapy...</p>
      </div>
    </div>
  )
})

export function Footer() {
  const { obsah: facebookObsah } = useCmsObsah({
    stranka: 'footer',
    klic: 'footer_facebook_url'
  })
  const facebookUrl = facebookObsah?.hodnota ?? 'https://www.facebook.com/profile.php?id=61563587069772'

  return (
    <footer className="bg-[#333333] text-white">
      {/* Hlavní obsah footeru */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Grid pro rozložení sloupců */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Kontakt */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#B8A876] tracking-wide uppercase"> {/* Přidáno uppercase */}
                KONTAKT
              </h3>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center gap-1">
                  <span>📍</span><DatabaseText stranka="footer" klic="footer_kontakt_ulice" as="span" placeholder="Fričova 1240" />
                </p>
                <p className="flex items-center gap-1">
                  <span>📍</span><DatabaseText stranka="footer" klic="footer_kontakt_mesto" as="span" placeholder="Dobříš, 263 01" />
                </p>
                <p className="flex items-center gap-1">
                  <span>📞</span><DatabaseText stranka="footer" klic="footer_kontakt_telefon" as="span" placeholder="+420 724 311 258" />
                </p>
                <p className="flex items-center gap-1">
                  <span>📧</span><DatabaseText stranka="footer" klic="footer_kontakt_email" as="span" placeholder="zuzka@salon-zuza.cz" />
                </p>
              </div>
            </div>

            {/* Otevírací doba */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#B8A876] tracking-wide uppercase"> {/* Přidáno uppercase */}
                OTEVÍRACÍ DOBA
              </h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-medium">Po-Pá:</span> <DatabaseText stranka="footer" klic="footer_oteviraci_popa" as="span" placeholder="08:30 - 17:00" /></p>
                <p><span className="font-medium">So:</span> <DatabaseText stranka="footer" klic="footer_oteviraci_so" as="span" placeholder="Zavřeno" /></p>
                <p><span className="font-medium">Ne:</span> <DatabaseText stranka="footer" klic="footer_oteviraci_ne" as="span" placeholder="Zavřeno" /></p>
              </div>
            </div>

            {/* Služby */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#B8A876] tracking-wide uppercase"> {/* Přidáno uppercase */}
                SLUŽBY
              </h3>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center gap-1"><span>✂️</span> <DatabaseText stranka="footer" klic="footer_sluzby_1" as="span" placeholder="Dámské kadeřnictví" /></p>
                <p className="flex items-center gap-1"><span>✂️</span> <DatabaseText stranka="footer" klic="footer_sluzby_2" as="span" placeholder="Pánské kadeřnictví" /></p>
                <p className="flex items-center gap-1"><span>🎨</span> <DatabaseText stranka="footer" klic="footer_sluzby_3" as="span" placeholder="Barvení a melíry" /></p>
              </div>
            </div>

            {/* Sledujte nás */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#B8A876] tracking-wide uppercase"> {/* Přidáno uppercase */}
                SLEDUJTE NÁS
              </h3>
              <div className="flex gap-4 mb-4">
                <a
                  href={facebookUrl}
                  className="text-2xl hover:text-[#B8A876] transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                
                  
                
              </div>
              <DatabaseText stranka="footer" klic="footer_sledujte_popis" as="p" className="text-sm text-gray-400" placeholder="Sledujte naše nejnovější práce a trendy" />
            </div>
          </div>
        </div>
      </div>

      {/* Mapa sekce */}
      <div className="bg-[#2a2a2a] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Grid pro mapu a info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* Informace o lokalitě */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-[#B8A876] uppercase"> {/* Přidáno uppercase */}
                NAJDĚTE NÁS
              </h4>
              <DatabaseText stranka="footer" klic="footer_najdete_popis" as="p" className="text-gray-300 mb-4" placeholder="Náš salon se nachází v srdci Dobříše, snadno dostupný MHD. Parkování je možné v okolních ulicích nebo na parkovišti u zámku." />
              <div className="space-y-2 text-sm text-gray-400">
                <p className="flex items-center gap-1">
                  <span>🚇</span> Autobus: <DatabaseText stranka="footer" klic="footer_mhd_spoje" as="span" placeholder="317, 360, 392, 395, 420, 517" />
                </p>
                <p className="flex items-center gap-1">
                  <span>🚗</span> Parkování: <DatabaseText stranka="footer" klic="footer_parkovani" as="span" placeholder="Okolní ulice, Parkoviště u zámku Dobříš" />
                </p>
              </div>
            </div>

            {/* Interaktivní mapa */}
            <SalonMapa height="300px" className="aspect-video rounded-lg" /> {/* Přidáno rounded-lg */}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-600 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-400 text-sm">
            <p>
              &copy; {new Date().getFullYear()} <DatabaseText stranka="footer" klic="footer_copyright" as="span" placeholder="Salon Zuza. Všechna práva vyhrazena." />
              <span className="mx-2">|</span>
              <a href="/privacy" className="hover:text-[#B8A876] transition-colors">
                Ochrana osobních údajů
              </a>
              <span className="mx-2">|</span>
              <a href="/terms" className="hover:text-[#B8A876] transition-colors">
                Obchodní podmínky
              </a>
            </p>
            <p className="text-xs text-gray-400 mt-3">
              Webové stránky vytvořil{' '}
              <a 
                href="https://www.matejhrabak.cz/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#B8A876] underline transition-colors"
              >
                Matěj Hrabák
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}