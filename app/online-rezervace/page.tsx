import { AlertTriangle, Mail, Phone } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DatabaseText } from '@/components/DatabaseText'
import BookingWizard from '@/components/booking/BookingWizard'

export default function OnlineRezervacePage() {
  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gray-50">
      <Navbar />

      {/* Hero sekce */}
      <section className="mt-16 w-full bg-linear-to-br from-[#B8A876] to-[#A39566] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8">
       { <div className="max-w-2xl mx-auto text-center">
          <DatabaseText
            klic="rezervace_nadpis_hero"
            typ="nadpis"
            as="h3"
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-wide text-white"
            placeholder="Online rezervace"
          />
          <DatabaseText
            klic="rezervace_podnadpis_hero"
            typ="popis"
            as="p"
            className="text-xl font-light opacity-90 leading-relaxed text-white"
            placeholder="Vyberte si požadované služby. Uvedené časy jsou orientační podle náročnosti."
          />
        </div> }
      </section>

      {/* Rezervační formulář */}
      <section className="w-full px-3 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="w-full rounded-lg bg-white p-4 shadow-xl sm:p-8">
           

            {/* <div className="mb-8 rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-white p-4 sm:p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-amber-900">
                    Online rezervační systém je aktuálně ve fázi testování
                  </h3>
                  <p className="mt-1 text-sm text-amber-800/90 leading-relaxed">
                    Pokud během rezervace narazíte na chybu, zavolejte nám prosím na číslo nebo napište e-mail. Rádi vám rezervaci dokončíme ručně. Rezervace po odeslání není automaticky schválena. Vyčkejte prosím na naše potvrzení e-mailem.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <a
                      href="tel:+420724311258"
                      className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      +420 724 311 258
                    </a>
                    <a
                      href="mailto:zuzka@salon-zuza.cz"
                      className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      zuzka@salon-zuza.cz
                    </a>
                  </div>
                </div>
              </div>
            </div> */}

            <BookingWizard />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}