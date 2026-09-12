import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

interface OnlineRezervaceDekujemePageProps {
  searchParams?: Promise<{
    rezervace?: string
  }>
}

function formatReservationNumber(rawId?: string): string | null {
  if (!rawId) return null
  const parsed = Number.parseInt(rawId, 10)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return `#${parsed}`
}

export default async function OnlineRezervaceDekujemePage({ searchParams }: OnlineRezervaceDekujemePageProps) {
  const params = searchParams ? await searchParams : undefined
  const cisloRezervace = formatReservationNumber(params?.rezervace)

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#333333] mb-4">
              Děkujeme za rezervaci
            </h1>
            
            <p className="text-[#555555] text-lg leading-relaxed mb-6">
              Vaše žádost o rezervaci byla úspěšně odeslána. Jakmile ji zpracujeme, zašleme Vám e-mail s potvrzením. Teprve poté bude Váš termín závazně rezervován.
            </p>

            <div className="bg-[#F8F4EA] border-l-4 border-[#B8A876] p-4 mb-8 text-left rounded-r-md">
              <p className="text-sm text-[#555555]">
                <strong className="text-[#333333]">Nedostali jste e-mail?</strong><br />
                Odeslali jsme Vám shrnutí registrace termínu. Pokud zprávu do několika minut neuvidíte v doručené poště, zkontrolujte prosím i složku <strong>Spam</strong> nebo <strong>Hromadné</strong> zprávy.
              </p>
            </div>

            {cisloRezervace && (
              <div className="mb-8 inline-flex items-center justify-center rounded-md bg-[#F8F4EA] px-4 py-2 text-[#333333]">
                Číslo rezervace: <span className="ml-2 font-bold text-[#A39566]">{cisloRezervace}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#B8A876] hover:bg-[#A39566] text-white font-semibold transition-colors"
              >
                Zpět na úvod
              </Link>
              <Link
                href="/online-rezervace"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-gray-300 text-[#333333] hover:bg-gray-100 font-semibold transition-colors"
              >
                Vytvořit další rezervaci
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
