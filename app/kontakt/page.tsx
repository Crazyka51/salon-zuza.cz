'use client'

// Stránka kontaktu podle skutečného webu
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamicky načíst SalonMapa komponentu (kvůli SSR problémům s Leaflet)
const SalonMapa = dynamic(() => import('@/components/layout/SalonMapa').then(mod => mod.default), { 
  ssr: false,
  loading: () => (
    <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8A876] mx-auto mb-2"></div>
        <p className="text-gray-600">Načítání mapy...</p>
      </div>
    </div>
  )
})

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    jmeno: '',
    email: '',
    telefon: '',
    zprava: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formDataToSend = {
        ...formData,
        _to: 'salonzuza@gmail.com',
        _subject: `Nová zpráva z webu od ${formData.jmeno}`
      };

      const response = await fetch('https://formspree.io/f/mgolrkpv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataToSend),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ jmeno: '', email: '', telefon: '', zprava: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero sekce pro kontakt */}
      <section className="bg-linear-to-br from-[#B8A876] to-[#A39566] text-white py-24 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-wide">
            KONTAKT
          </h1>
          <p className="text-xl font-light opacity-90 leading-relaxed">
            Najdete nás v centru města, jsme tu pro vás
          </p>
        </div>
      </section>

      {/* Kontaktní informace */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Kontaktní údaje */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[#333333] mb-8">Kontaktní údaje</h2>
                
                <div className="space-y-6">
                  {/* Adresa */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#B8A876] text-white p-3 rounded-full">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Ikona adresy">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#333333]">Adresa</h3>
                      <p className="text-[#555555]">
                        Salon Zuza<br/>
                        Fričova 1240<br/>
                        Dobříš, 263 01
                      </p>
                    </div>
                  </div>

                  {/* Telefon */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#B8A876] text-white p-3 rounded-full">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Ikona telefonu">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#333333]">Telefon</h3>
                      <a href="tel:+420724311258" className="text-[#B8A876] hover:text-[#A39566]">
                        +420 724 311 258
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#B8A876] text-white p-3 rounded-full">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Ikona emailu">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#333333]">Email</h3>
                      <a href="mailto:zuzka@salon-zuza.cz" className="text-[#B8A876] hover:text-[#A39566]">
                        zuzka@salon-zuza.cz
                      </a>
                    </div>
                  </div>

                  {/* Web */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-[#B8A876] text-white p-3 rounded-full">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-label="Ikona webu">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#333333]">Website</h3>
                      <a href="https://salon-zuza.cz" className="text-[#B8A876] hover:text-[#A39566]">
                        www.salon-zuza.cz
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Otevírací hodiny */}
              <div>
                <h3 className="text-2xl font-bold text-[#333333] mb-6">Otevírací hodiny</h3>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="space-y-3" role="list">
                    <div className="flex justify-between" role="listitem">
                      <span className="font-medium">Pondělí</span>
                      <span className="text-[#555555]">8:30 - 17:00</span>
                    </div>
                    <div className="flex justify-between" role="listitem">
                      <span className="font-medium">Úterý</span>
                      <span className="text-[#555555]">8:30 - 17:00</span>
                    </div>
                    <div className="flex justify-between" role="listitem">
                      <span className="font-medium">Středa</span>
                      <span className="text-[#555555]">8:30 - 17:00</span>
                    </div>
                    <div className="flex justify-between" role="listitem">
                      <span className="font-medium">Čtvrtek</span>
                      <span className="text-[#555555]">8:30 - 17:00</span>
                    </div>
                    <div className="flex justify-between" role="listitem">
                      <span className="font-medium">Pátek</span>
                      <span className="text-[#555555]">8:30 - 17:00</span>
                    </div>
                    <div className="flex justify-between" role="listitem">
                      <span className="font-medium text-red-600">Sobota</span>
                      <span className="text-red-600">ZAVŘENO</span>
                    </div>
                    <div className="flex justify-between" role="listitem">
                      <span className="font-medium text-red-600">Neděle</span>
                      <span className="text-red-600">ZAVŘENO</span>
                    </div>
                    
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa a kontaktní formulář */}
            <div className="space-y-8">
              {/* Interaktivní mapa */}
              <div>
                <h3 className="text-2xl font-bold text-[#333333] mb-6">Kde nás najdete</h3>
                <SalonMapa height="400px" className="border border-gray-300" />
              </div>

              {/* Kontaktní formulář */}
              <div>
                <h3 className="text-2xl font-bold text-[#333333] mb-6">Napište nám</h3>
                {submitStatus === 'success' && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    Zpráva byla úspěšně odeslána! Ozveme se vám co nejdříve.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    Chyba při odesílání zprávy. Zkuste to prosím znovu nebo nás kontaktujte přímo.
                  </div>
                )}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="kontakt-jmeno" className="block text-sm font-medium text-[#333333] mb-2">
                        Jméno *
                      </label>
                      <input 
                        id="kontakt-jmeno"
                        name="jmeno"
                        type="text" 
                        required
                        value={formData.jmeno}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876] disabled:opacity-50"
                        placeholder="Vaše jméno"
                        title="Vaše jméno"
                      />
                    </div>
                    <div>
                      <label htmlFor="kontakt-email" className="block text-sm font-medium text-[#333333] mb-2">
                        Email *
                      </label>
                      <input 
                        id="kontakt-email"
                        name="email"
                        type="email" 
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876] disabled:opacity-50"
                        placeholder="vas@email.cz"
                        title="Váš email"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="kontakt-telefon" className="block text-sm font-medium text-[#333333] mb-2">
                      Telefon
                    </label>
                    <input 
                      id="kontakt-telefon"
                      name="telefon"
                      type="tel"
                      value={formData.telefon}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876] disabled:opacity-50"
                      placeholder="+420 123 456 789"
                      title="Váš telefon"
                    />
                  </div>
                  <div>
                    <label htmlFor="kontakt-zprava" className="block text-sm font-medium text-[#333333] mb-2">
                      Zpráva *
                    </label>
                    <textarea 
                      id="kontakt-zprava"
                      name="zprava"
                      required
                      rows={5}
                      value={formData.zprava}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B8A876] disabled:opacity-50"
                      placeholder="Vaše zpráva..."
                      title="Vaše zpráva"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#B8A876] hover:bg-[#A39566] disabled:opacity-50 text-white font-bold py-3 px-6 transition-colors"
                  >
                    {isSubmitting ? 'ODESÍLÁM...' : 'ODESLAT ZPRÁVU'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#F5F5F5] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#333333] mb-6">
            Raději si rezervujete online?
          </h2>
          <p className="text-lg text-[#555555] mb-8">
            Využijte náš rezervační systém a vyberte si čas, který vám vyhovuje
          </p>
          <button className="bg-[#B8A876] hover:bg-[#A39566] text-white font-bold py-3 px-8 transition-colors">
            ONLINE REZERVACE
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}