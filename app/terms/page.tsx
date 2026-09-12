'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Obchodní podmínky</h1>
          
          <p className="text-gray-600 mb-8">
            Poslední aktualizace: {new Date().getFullYear()}
          </p>

          <div className="space-y-8 text-gray-700">
            {/* Úvod */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Úvod</h2>
              <p>
                Tyto obchodní podmínky (dále jen "Podmínky") upravují vztah mezi provozovatelem webové stránky salon-zuza.cz
                (dále jen "Salon Zuza", "my", "nás" nebo "Salon") a osobami, které naši služby využívají (dále jen "Klient").
              </p>
              <p className="mt-4">
                Použitím našich služeb, včetně online rezervace, souhlasíte s těmito Podmínkami. Pokud nesouhlasíte s některou 
                částí těchto Podmínek, nepoužívejte naše služby.
              </p>
            </section>

            {/* Definice */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Definice</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Salon:</strong> Salon Zuza, kadeřnictví v Dobříši</li>
                <li><strong>Webové stránky:</strong> salon-zuza.cz a všechny související stránky</li>
                <li><strong>Služby:</strong> Kadeřnické služby nabízené Salonem Zuza (střihy, barvení, melíry, apod.)</li>
                <li><strong>Rezervace:</strong> Rezervace služby prostřednictvím webových stránek</li>
                <li><strong>Klient:</strong> Osoba, která si rezervuje nebo využívá naše služby</li>
              </ul>
            </section>

            {/* Podmínky rezervace */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Podmínky rezervace</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Online rezervační systém</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Rezervace služby online je závazný návrh smlouvy</li>
                <li>Rezervace se stává závaznou po potvrzení ze strany Salonu</li>
                <li>Salon si vyhrazuje právo odmítnout rezervaci</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Potvrzení rezervace</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Potvrzení rezervace bude odesláno na váš e-mail</li>
                <li>Klient se zavazuje kontrolovat své e-mailové zprávy</li>
                <li>V případě nepotvrzení je rezervace neplatná</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.3 Změna a zrušení rezervace</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Změny a zrušení je možné provést minimálně 24 hodin před rezervovaným časem</li>
                <li>Zrušení lze provést prostřednictvím webu, telefonu nebo e-mailu</li>
                <li>Zrušení v kratší lhůtě než 24 hodin může být účtováno</li>
                <li>Salon si vyhrazuje právo zrušit rezervaci bez uvedení důvodu</li>
              </ul>
            </section>

            {/* Ceny a platby */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Ceny a platby</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Ceny služeb</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ceny jsou uvedeny na webu a v ceníku Salonu</li>
                <li>Ceny zahrnují DPH</li>
                <li>Salon si vyhrazuje právo změnit ceny bez předchozího upozornění</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Metody platby</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Platba se provádí v hotovosti přímo v Salonu</li>
                <li>Přijaté jsou také platby kartou (Visa, Mastercard apod.)</li>
                <li>Platba se provádí po poskytnutí služby</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.3 Vrácení peněz</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Vrácení peněz je možné pouze v případě, že služba nebyla poskytnuta</li>
                <li>Vrácení peněz musí být požádáno do 14 dnů od poskytnutí služby</li>
              </ul>
            </section>

            {/* Poskytování služeb */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Poskytování služeb</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Provozní doba</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Salon je otevřen pondělí až pátek: 08:30 - 17:00</li>
                <li>Sobota, neděle: Zavřeno</li>
                <li>Salon si vyhrazuje právo změnit provozní dobu</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Odpovědnost za poskytované služby</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Salon garantuje profesionální poskytování služeb vyškolenými kadeřníky</li>
                <li>V případě nespokojenosti s kvalitou služby, kontaktujte nás do 24 hodin</li>
                <li>Řešení problémů se provádí individuálně</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Podmínky pro Klienty</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Klient se zavazuje dodržovat slušné chování v Salonu</li>
                <li>Salon si vyhrazuje právo odmítnout službu osobě v nebezpečném stavu</li>
                <li>Klient je odpovědný za své osobní věci</li>
              </ul>
            </section>

            {/* Zdravotnické podmínky */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Zdravotnické podmínky a hygiena</h2>
              <p>
                Salon Zuza dodržuje všechny hygienické normy a předpisy:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
                <li>Všechny nástroje jsou sterilizovány a dezinfikovány</li>
                <li>Používáme pouze kvalitní a bezpečné produkty</li>
                <li>Персонал je pravidelně školen v oblasti hygieny a bezpečnosti</li>
              </ul>
              <p className="mt-4">
                <strong>Klient se zavazuje informovat Salon o:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 mt-4 ml-4">
                <li>Alergiích na produkty nebo látky</li>
                <li>Zdravotních problémech ovlivňujících poskytování služby</li>
                <li>Předchozích negativních zkušenostech s produkty</li>
              </ul>
            </section>

            {/* Vyloučení odpovědnosti */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Vyloučení odpovědnosti</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Salon nenese odpovědnost za škody způsobené nesprávným používáním produktů doma</li>
                <li>Salon nenese odpovědnost za alergické reakce na produkty, pokud nebyly dříve známy</li>
                <li>Salon nenese odpovědnost za ztrátu nebo poškození osobních věcí Klienta</li>
                <li>Webové stránky jsou poskytovány "tak jak jsou" bez záruk</li>
              </ul>
            </section>

            {/* Duševní vlastnictví */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Duševní vlastnictví</h2>
              <p>
                Veškerý obsah na webových stránkách salon-zuza.cz, včetně textů, obrázků, log, návrhů a dalších materiálů, 
                je chráněn autorskými právy. Reprodukce, distribuce nebo modifikace obsahu bez souhlasu je zakázána.
              </p>
            </section>

            {/* Foto a záznamy */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Fotografie a záznamy</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Salon si může fotografovat vybrané účesy pro portfolio a marketing</li>
                <li>Fotografie budou použity pouze se souhlasem Klienta</li>
                <li>Klient si může kdykoliv žádat odebrání fotek</li>
              </ul>
            </section>

            {/* Odpovědnost a limite */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Odpovědnost</h2>
              <p>
                Salon Zuza se snaží poskytovat nejlepší kvalitu služeb. V případě závažné chyby nebo nedostatečného plnění 
                se Salon zavazuje problém vyřešit. Maximální náhrада za chybu nemůže překročit cenu poskytnuté služby.
              </p>
            </section>

            {/* Povinnosti Salonu */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Povinnosti Salonu</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Poskytovat služby v souladu s objednaným termínem a typem</li>
                <li>Chovat se profesionálně a s respektem</li>
                <li>Chránit osobní údaje Klienta v souladu s GDPR</li>
                <li>Řešit reklamace v přiměřené lhůtě</li>
              </ul>
            </section>

            {/* Povinnosti Klienta */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Povinnosti Klienta</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Zaplatit smluvení cenu za poskytnuté služby</li>
                <li>Dostavit se v čase a místě rezervace</li>
                <li>Poskytnout správné kontaktní informace</li>
                <li>Informovat Salon o zdravotních problémech relevantních pro službu</li>
                <li>Chovat se slušně a s respektem vůči персоналу</li>
              </ul>
            </section>

            {/* Zákaz diskriminace */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Rovné zacházení</h2>
              <p>
                Salon Zuza poskytuje služby všem osobám bez ohledu na jejich pohlaví, věk, rasu, národnost, 
                náboženství nebo sexuální orientaci. Diskriminace je v Salonu zcela zakázána.
              </p>
            </section>

            {/* Změny podmínek */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Změny obchodních podmínek</h2>
              <p>
                Salon si vyhrazuje právo změnit tyto Obchodní podmínky. Změny budou zveřejněny na tomto webu. 
                Pokračováním v používání našich služeb po oznámení změn vyjadřujete souhlas s novými Podmínkami.
              </p>
            </section>

            {/* Právní řád */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Právní řád a řešení sporů</h2>
              <p>
                Tyto Obchodní podmínky se řídí zákony České republiky. V případě sporu se budeme snažit najít 
                smírné řešení. Pokud to není možné, bude spor projednaván příslušným soudem v České republice.
              </p>
            </section>

            {/* Kontakt */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Kontakt</h2>
              <p>
                V případě otázek nebo stížností ohledně těchto Obchodních podmínek nás prosím kontaktujte:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p><strong>Salon Zuza</strong></p>
                <p>Fričova 1240, Dobříš, 263 01</p>
                <p className="mt-2"><strong>Email:</strong> info@salon-zuza.cz</p>
                <p className="mt-2"><strong>Telefon:</strong> +420 724 311 258</p>
              </div>
            </section>

            {/* Závěr */}
            <section className="bg-linear-to-r from-[#B8A876] to-[#9d8d60] p-8 rounded-lg text-white mt-12">
              <h2 className="text-2xl font-semibold mb-4">Děkujeme za vaši důvěru</h2>
              <p>
                Děkujeme vám za to, že si vyberete Salon Zuza. Těšíme se na vás a budeme se snažit 
                poskytnout vám nejlepší kadeřnické služby v Dobříši.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
