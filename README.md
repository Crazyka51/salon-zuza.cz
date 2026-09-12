# Salon Zuza

Kompletní digitální platforma pro kadeřnický salon: veřejný web, online rezervace, webová administrace a mobilní aplikace pro Android.


## Přehled

Projekt propojuje prezentaci salonu s každodenní správou rezervací. Zákazník si vybere službu, zaměstnance, datum a dostupný čas. Administrace následně umožňuje spravovat rezervace, zaměstnance, rozvrhy, ceník, obsah webu a média.

Databáze PostgreSQL je společným zdrojem pravdy pro veřejný web, administraci i mobilní aplikaci.

## Hlavní části

### Veřejný web

- prezentace salonu a týmu,
- služby, kategorie a ceník,
- galerie a kontaktní informace,
- online rezervace,
- responzivní zobrazení pro mobil, tablet i desktop.

### Webová administrace

- dashboard s přehledem provozu,
- seznam rezervací a kalendář,
- detail rezervace a změna jejího stavu,
- filtrování, vyhledávání a hromadná správa,
- správa zaměstnanců, pracovních rozvrhů a dovolených,
- blokované termíny a provozní hodiny,
- správa ceníku, kategorií a pořadí služeb,
- úprava textů webu s živým náhledem,
- správa médií a analytika návštěvnosti,
- role a oprávnění administrátorů.

### Mobilní administrace

Mobilní aplikace v `apps/mobile/` sdílí stejné API jako webová administrace.

- přehled, kalendář a seznam rezervací,
- detail zákazníka s rychlým kontaktem,
- změna stavu rezervace,
- výběr služeb podle kategorií,
- zobrazení skutečně volných termínů z databáze,
- zapamatování přihlášení a volitelných přihlašovacích údajů,
- světlý, tmavý a systémový motiv,
- offline uložení nové rezervace a následná synchronizace.

## Dostupnost termínů

Volné termíny se počítají na serveru podle:

- provozních hodin,
- délky vybrané služby,
- pracovního rozvrhu zaměstnance,
- dovolených a dnů volna,
- blokovaných termínů,
- existujících rezervací a jejich stavů.

Mobilní i webový klient proto zobrazují pouze termíny, které jsou aktuálně dostupné.

## Screenshoty

### Veřejný web

![Veřejná prezentace Salon Zuza](./public/logo_salon.png)

### Mobilní aplikace

Ukázky mobilní aplikace jsou v detailu projektu na [matejhrabak.cz](https:/www.matejhrabak.cz/projekty/salon-zuza)

- [Přihlášení](./public/screenyapk_salonzuza/login_page_apk_light_theme.png)
- [Dashboard](./public/screenyapk_salonzuza/main_page_apk_light_theme.png)
- [Kalendář](./public/screenyapk_salonzuza/calendar_apk_light_theme.png)
- [Nová rezervace](./public/screenyapk_salonzuza/reservation_add__apk_light_theme.png)
- [Nastavení](./public/screenyapk_salonzuza/settings_app_light_theme.png)

## Technologie

### Web a server

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui a Radix UI
- Prisma ORM
- PostgreSQL / Neon
- Zod a React Hook Form
- Recharts
- Vercel Analytics a Speed Insights

### Mobilní aplikace

- React Native
- Expo SDK 57
- Expo SecureStore
- AsyncStorage
- Expo Notifications

## Struktura repozitáře

```text
app/                 Next.js stránky, layouty a API routes
components/          Sdílené a veřejné UI komponenty
features/            Funkční moduly nové administrace
admin-kit/            Admin shell, autentizace, routing a UI
adminfunctions/       Legacy admin komponenty a kompatibilní API
lib/                 Databáze, autentizace a doménová logika
models/              Mapování Prisma dat
prisma/              Databázové schéma
scripts/             Interní seed a utility skripty (lokálně, nejsou publikované)
apps/mobile/         React Native / Expo aplikace
public/              Obrázky a statická média
```

Podrobnější technický popis je v [ARCHITECTURE.md](./ARCHITECTURE.md).

Vizuální diagram architektury je v [docs/architecture-diagram.md](./docs/architecture-diagram.md).



## Offline režim

Pokud se novou rezervaci nepodaří odeslat, aplikace ji uloží jako lokální draft. Draft zůstane v zařízení a aplikace se ho pokusí odeslat při dalším načtení dat. Ruční synchronizace se zobrazí pouze tehdy, pokud existují neodeslané rezervace.

Lokální data nejsou náhradou databáze. Po úspěšné synchronizaci se draft odstraní z lokální fronty.

## CI/CD

GitHub Actions obsahuje:

- [`build-apk.yml`](./.github/workflows/build-apk.yml) — Android release APK,




## Konfigurace a bezpečnost

- Přihlašovací údaje, tokeny a connection stringy patří pouze do environment variables.
- `.env.local` a soubory s credentials nesmí být commitnuté.
- API endpointy administrace vyžadují autentizaci.
- Oprávnění se musí ověřovat na serveru; skrytí prvku v UI není bezpečnostní mechanismus.

## Přispívání

1. Vytvořte vlastní branch.
2. Zachovejte TypeScript strict režim a existující projektové konvence.
3. Před odesláním změn spusťte relevantní typecheck nebo build.
4. U změn veřejného chování aktualizujte dokumentaci.

## Licence

Licence projektu zatím není v repozitáři specifikována. Zdrojový kód a média používejte pouze v souladu s právy vlastníka projektu a příslušných poskytovatelů.

## Kontakt

- Web: [salon-zuza.cz](https://www.salon-zuza.cz)
- Repozitář: [github.com/Crazyka51/salon-zuza.cz](https://github.com/Crazyka51/salon-zuza.cz)
