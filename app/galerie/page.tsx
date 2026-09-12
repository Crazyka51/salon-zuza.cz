// Stránka galerie s obrázky ze salonu
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import SalonGalerie from '@/components/sections/SalonGalerie'

export default function GaleriePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero sekce pro galerii */}
      <section className="bg-linear-to-br from-[#B8A876] to-[#A39566] text-white py-24 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-wide">
            GALERIE
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-white/90">
            Podívejte se na naše práce a prostory salonu
          </p>
        </div>
      </section>

      {/* Galerie obrázků */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#333333] mb-4">NAŠE PRÁCE</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Prohlédněte si ukázky našich prací a prostory našeho moderního salonu. 
              Každý obrázek vypovídá o naší vášni pro krásu a kvalitu.
            </p>
          </div>
          
          <SalonGalerie />
        </div>
      </section>

      <Footer />
    </main>
  )
}