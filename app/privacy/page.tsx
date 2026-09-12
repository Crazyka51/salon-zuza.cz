'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Zásady ochrany osobních údajů</h1>
          
          <p className="text-gray-600 mb-8">
            Poslední aktualizace: {new Date().getFullYear()}
          </p>

          <div className="space-y-8 text-gray-700">
            {/* Úvod */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Úvod</h2>
              <p>
                Salon Zuza (dále jen "my", "nás", "naše" nebo "Salon") je provozovatel webové stránky salon-zuza.cz 
                a je odpovědný za zpracování vašich osobních údajů. Tyto zásady ochrany osobních údajů vysvětlují, 
                jak sbíráme, používáme, zveřejňujeme a jinak zpracováváme vaše osobní údaje.
              </p>
            </section>

            {/* Právní základ */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Právní základ</h2>
              <p>
                Zpracování osobních údajů provádíme v souladu s:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Nařízením Evropského parlamentu a Rady (EU) 2016/679 (GDPR)</li>
                <li>Zákonem č. 101/2000 Sb., o ochraně osobních údajů</li>
                <li>Dalšími platnými právními předpisy České republiky</li>
              </ul>
            </section>

            {/* Informace o správci */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Informace o správci a jeho zástupci</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="mb-2"><strong>Správce osobních údajů:</strong></p>
                <p>Salon Zuza</p>
                <p>Adresa: Dobříš, Česká republika</p>
                <p className="mt-4"><strong>Email:</strong> info@salon-zuza.cz</p>
              </div>
            </section>

            {/* Kategorie osobních údajů */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Jaké osobní údaje sbíráme?</h2>
              <p>Sbíráme a zpracováváme následující kategorie osobních údajů:</p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Údaje poskytnuté přímo vámi:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Kontaktní údaje:</strong> jméno, telefonní číslo, e-mail, adresa</li>
                <li><strong>Informace o rezervaci:</strong> datum a čas služby, typ služby</li>
                <li><strong>Komunikační obsah:</strong> zprávy odesílané prostřednictvím kontaktního formuláře</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Údaje shromážděné automaticky:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Cookies a technologie pro sledování:</strong> informace o zařízení, typ prohlížeče, IP adresa</li>
                <li><strong>Analytics data:</strong> údaje o vaší interakci s webem (Google Analytics)</li>
              </ul>
            </section>

            {/* Účely zpracování */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Účely zpracování</h2>
              <p>Vaše osobní údaje zpracováváme pro následující účely:</p>
              <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
                <li>Realizace a správa online rezervací služeb</li>
                <li>Komunikace s vami ohledně vaší rezervace nebo služby</li>
                <li>Odpověď na vaše dotazy a požadavky</li>
                <li>Zlepšení našeho webu a služeb (analytika)</li>
                <li>Splnění právních povinností</li>
                <li>Prevence podvodů a bezpečnost</li>
                <li>Marketing a Newsletter (pouze se vaším souhlasem)</li>
              </ul>
            </section>

            {/* Právní základ zpracování */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Právní základ pro zpracování</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Smlouva:</strong> zpracování je nezbytné pro plnění smlouvy o poskytování služeb</li>
                <li><strong>Právní povinnost:</strong> zpracování je vyžadováno zákony (daňové zákony apod.)</li>
                <li><strong>Váš souhlas:</strong> pro newsletter a marketingové komunikace</li>
                <li><strong>Oprávněný zájem:</strong> analýza a zlepšování služeb</li>
              </ul>
            </section>

            {/* Delka uchování */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Doba uchování údajů</h2>
              <p>Vaše osobní údaje uchováváme po dobu nezbytnou pro dosažení účelu zpracování:</p>
              <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
                <li><strong>Údaje o rezervacích:</strong> po dobu 5 let (archivace z důvodu daňových povinností)</li>
                <li><strong>Kontaktní údaje:</strong> do zrušení účtu nebo od vás požádaného odstranění</li>
                <li><strong>Cookies:</strong> podle typu (obvykle 12-24 měsíců)</li>
                <li><strong>Newsletter:</strong> do vašeho odhlášení</li>
              </ul>
            </section>

            {/* Sdílení údajů */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Sdílení osobních údajů</h2>
              <p>Vaše osobní údaje nesdílíme s třetími stranami, s výjimkou:</p>
              <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
                <li><strong>Poskytovatelé služeb:</strong> hostingový a emailový servis (pouze s nezbytnými údaji)</li>
                <li><strong>Analytika:</strong> Google Analytics (anonymizované údaje)</li>
                <li><strong>Právní požadavek:</strong> pokud je to vyžadováno zákonem</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies a technologie pro sledování</h2>
              <p>
                Naš web používá cookies pro zlepšení uživatelského prostředí a analytiku. Existují čtyři kategorie cookies:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
                <li><strong>Nezbytné cookies:</strong> zajišťují funkčnost webu (bez souboru cookie zprávy)</li>
                <li><strong>Analytické cookies:</strong> pomáhají nám pochopit, jak se web používá</li>
                <li><strong>Funkční cookies:</strong> pamatují si vaše preference</li>
                <li><strong>Marketingové cookies:</strong> používáme s vaším souhlasem</li>
              </ul>
              <p className="mt-4">
                Cookies můžete spravovat nebo odmítnout prostřednictvím svého prohlížeče. Více informací naleznete v přijímačích cookies.
              </p>
            </section>

            {/* Vaše práva */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Vaše práva</h2>
              <p>V souladu s GDPR máte následující práva:</p>
              <ul className="list-disc list-inside space-y-3 mt-4 ml-4">
                <li><strong>Právo na přístup:</strong> můžete si vyžádat kopii svých osobních údajů</li>
                <li><strong>Právo na opravy:</strong> můžete nás požádat o opravu nepřesných údajů</li>
                <li><strong>Právo na vymazání ("právo být zapomenut"):</strong> pod určitými podmínkami</li>
                <li><strong>Právo na omezení zpracování:</strong> můžete požádat o omezení zpracování</li>
                <li><strong>Právo na přenositelnost:</strong> získat vaše údaje v strukturovaném formátu</li>
                <li><strong>Právo vznést námitku:</strong> proti zpracování vašich údajů</li>
                <li><strong>Právo na automatizované rozhodování:</strong> nejsme jej podrobeni</li>
              </ul>
              <p className="mt-4">
                Chcete-li uplatnit některé z těchto práv, kontaktujte nás na e-mail: <strong>info@salon-zuza.cz</strong>
              </p>
            </section>

            {/* Bezpečnost */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Bezpečnost údajů</h2>
              <p>
                Implementujeme vhodná technická a organizační opatření k ochraně vašich osobních údajů před neoprávněným 
                přístupem, změnou, zveřejněním nebo zničením. Informace jsou přenášeny prostřednictvím zabezpečeného 
                SSL/TLS spojení.
              </p>
            </section>

            {/* Kontakt na DPO */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Kontakt a práva subjektu údajů</h2>
              <p>
                Máte-li otázky o zpracování vašich osobních údajů nebo si chcete uplatnit svá práva, kontaktujte nás:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p><strong>Email:</strong> info@salon-zuza.cz</p>
              </div>
              <p className="mt-4">
                Máte také právo podat stížnost u příslušného orgánu pro ochranu osobních údajů.
              </p>
            </section>

            {/* Změny zásad */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Změny těchto zásad</h2>
              <p>
                Tyto zásady ochrany osobních údajů si vyhrazujeme právo změnit. Změny budou zveřejněny na tomto webu. 
                Doporučujeme vám pravidelně si tyto zásady prohlížet, abyste byli informováni o tom, jak chráníme vaše 
                osobní údaje.
              </p>
            </section>

            {/* Kontakt */}
            <section className="bg-linear-to-r from-[#B8A876] to-[#9d8d60] p-8 rounded-lg text-white mt-12">
              <h2 className="text-2xl font-semibold mb-4">Máte otázky?</h2>
              <p className="mb-4">
                Pokud máte otázky ohledně těchto zásad ochrany osobních údajů nebo zpracování vašich osobních údajů, 
                neváhejte nás kontaktovat.
              </p>
              <p><strong>Email:</strong> info@salon-zuza.cz</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
