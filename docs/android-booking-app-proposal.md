# Návrh Android aplikace pro správu rezervačního systému Salon Zuza

## Přehled

Tento dokument popisuje návrh mobilní Android aplikace určené pro interní správu rezervací v salonu Salon Zuza. Cílem je nabídnout personálu rychlý a přehledný nástroj pro práci s rezervacemi bez nutnosti používat desktopové administrační rozhraní.

## Hlavní cíl

Aplikace má zjednodušit každodenní provoz salonu:

- sledování dnešních a nadcházejících rezervací,
- potvrzování, úpravu a rušení termínů,
- správu volných a blokovaných časů,
- rychlý kontakt se zákazníkem,
- lepší přehled o vytížení zaměstnanců a provozu salonu.

## Cíloví uživatelé

### Majitelka salonu
- potřebuje dohled nad celým kalendářem,
- chce rychle reagovat na nové rezervace,
- sleduje vytížení zaměstnanců a denní provoz.

### Zaměstnanci / kadeřnice
- potřebují vidět vlastní pracovní kalendář,
- chtějí přehled potvrzených a čekajících rezervací,
- potřebují snadno kontaktovat zákazníka.

### Recepce / obsluha provozu
- spravuje příchozí rezervace,
- přesouvá a upravuje termíny,
- blokuje časové úseky a eviduje provozní omezení.

## Přínosy aplikace

- rychlá reakce na nové rezervace odkudkoliv,
- menší riziko chyb při plánování termínů,
- jednodušší komunikace se zákazníky,
- lepší využití kapacity salonu,
- pohodlnější správa provozu z mobilního zařízení.

## Hlavní funkce

### Kalendář a přehled rezervací
- denní, týdenní a měsíční přehled rezervací,
- filtrování podle data, zaměstnance a stavu,
- zvýraznění nových, čekajících a konfliktních rezervací,
- přepnutí na „dnešní provoz“ jako výchozí obrazovku.

### Správa rezervací
- vytvoření nové rezervace,
- úprava detailu rezervace,
- přesun na jiný termín,
- zrušení rezervace,
- potvrzení nebo zamítnutí nové rezervace,
- označení rezervace jako dokončené.

### Detail rezervace
- jméno a příjmení zákazníka,
- telefon a e-mail,
- vybrané služby,
- přiřazený zaměstnanec,
- datum a čas,
- poznámka,
- cena,
- stav rezervace.

### Dostupnost a provoz
- zobrazení dostupných termínů podle služby a zaměstnance,
- správa blokovaných termínů,
- evidence dovolených,
- nastavení provozní doby.

### Komunikace a notifikace
- push notifikace na nové rezervace a změny,
- rychlé zavolání zákazníkovi,
- rychlé otevření e-mailu,
- historie změn rezervace.

### Přehledy
- obsazenost zaměstnanců,
- denní a týdenní vytížení,
- orientační přehled tržeb.

## Doporučené obrazovky

### 1. Přihlášení
- bezpečné přihlášení do interní aplikace,
- zapamatování relace,
- odhlášení a správa zařízení.

### 2. Dashboard
- dnešní rezervace,
- počet čekajících potvrzení,
- nejbližší volné termíny,
- rychlé akce: potvrdit, zavolat, přesunout, zrušit.

### 3. Kalendář rezervací
- přepínání den / týden / měsíc,
- barevné rozlišení stavů,
- filtr podle zaměstnance,
- otevření detailu jedním kliknutím.

### 4. Detail rezervace
- kompletní informace o rezervaci,
- akce pro potvrzení, úpravu, přesun a zrušení,
- přímý kontakt na zákazníka.

### 5. Vytvoření / editace rezervace
- výběr služby,
- výběr zaměstnance,
- výběr termínu,
- doplnění kontaktních údajů a poznámky.

### 6. Zaměstnanci
- seznam zaměstnanců,
- dostupnost a rozvrh,
- přiřazené rezervace,
- pracovní omezení a dovolené.

### 7. Služby a ceny
- přehled nabízených služeb,
- orientační cena,
- délka trvání služby.

### 8. Blokované termíny a provozní hodiny
- správa uzavřených časů,
- svátky, dovolené a výjimky,
- základní provozní nastavení.

### 9. Notifikace a historie změn
- nové rezervace,
- přesuny a rušení,
- potvrzení o provedených změnách.

### 10. Nastavení a role
- nastavení oprávnění podle role,
- správa účtu,
- bezpečnostní volby.

## Klíčové workflow

### Nová rezervace od zákazníka
1. Zákazník odešle rezervaci přes webový formulář.
2. Personálu přijde push notifikace.
3. Obsluha otevře detail rezervace.
4. Zkontroluje službu, zaměstnance a termín.
5. Rezervaci potvrdí, upraví nebo zamítne.
6. Zákazník obdrží potvrzení.

### Provoz během dne
1. Zaměstnanec otevře dashboard s dnešními rezervacemi.
2. Sleduje pořadí klientů a časové mezery.
3. V případě změny termínu upraví rezervaci rovnou v mobilu.
4. Po návštěvě označí rezervaci jako dokončenou.

### Blokace času
1. Obsluha otevře kalendář nebo správu blokovaných termínů.
2. Vybere období dovolené nebo provozní výluky.
3. Uloží blokaci.
4. Systém zablokuje daný čas pro nové rezervace.

## Požadavky na mobilní použití

- ovládání jednou rukou,
- velká akční tlačítka,
- rychlé načítání hlavních obrazovek,
- tmavý i světlý režim,
- čitelné rozhraní pro použití během provozu,
- základní použití i při slabším připojení s následnou synchronizací.

## Role a oprávnění

### Administrátor
- plná správa rezervací,
- správa zaměstnanců, služeb a provozních hodin,
- přístup k reportům a nastavením.

### Zaměstnanec
- přístup k vlastním rezervacím a kalendáři,
- možnost sledovat a měnit přiřazené termíny podle oprávnění.

### Recepce
- správa rezervací a zákaznické komunikace,
- bez přístupu k citlivým systémovým nastavením.

## Integrace s existujícím systémem

Aplikace má být napojena na stávající rezervační backend a data salonu:

- rezervace,
- zaměstnanci,
- služby,
- provozní hodiny,
- blokované termíny,
- e-mailové notifikace.

Do další fáze lze doplnit:

- SMS notifikace,
- interní poznámky ke klientům,
- rozšířené reporty,
- export přehledů.

## Technické propojení Android aplikace s webem a administrací

Android aplikace nemá fungovat jako samostatný oddělený systém. Má být navržena jako další klient nad stejným backendem, který už dnes používá webová rezervace a administrace. V aktuální fázi ale funguje jako izolovaný prototyp: čte stejná data, ale změny provedené v aplikaci se zatím nikam neukládají.

### Základní princip

- web pro zákazníky, webová administrace i Android aplikace budou pracovat nad jednou databází,
- čtení dat má jít přes stejné API vrstvy,
- administrace zůstává hlavním místem správy služeb, zaměstnanců, provozní doby a rezervací,
- Android aplikace bude nad stejnými daty poskytovat rychlejší mobilní obsluhu pro personál,
- do doby nasazení samostatného bezpečného zápisového prostředí zůstane mobilní aplikace bez propsání změn do produkční administrace.

### Zdroj dat

Android aplikace má čerpat stejná data jako existující administrace:

- rezervace,
- zaměstnanci,
- služby,
- provozní hodiny,
- blokované termíny,
- stavy rezervací,
- notifikace a případnou historii změn.

To znamená, že pokud se rezervace upraví v administraci, změna se musí okamžitě projevit i v mobilní aplikaci. Opačný směr je zatím záměrně vypnutý: změna provedená v Android prototypu se pouze zobrazí lokálně v aplikaci a nepropíše se do webové administrace ani do databáze.

### Navržený tok dat

1. Zákazník vytvoří rezervaci přes web.
2. Web uloží rezervaci do stejné databáze, kterou používá administrace.
3. Backend odešle notifikaci nebo označí novou rezervaci jako čekající.
4. Android aplikace načte nové rezervace přes API.
5. Personál si může v aplikaci lokálně vyzkoušet změnu stavu nebo další akci.
6. Změna zůstane pouze v lokálním stavu Android prototypu.
7. Produkční webová administrace zůstane beze změny, dokud nebude připraven samostatný zápisový režim nebo testovací backend.

### Autentizace a přístup

Android aplikace má používat stejnou logiku oprávnění jako administrace:

- administrátor má plný přístup,
- zaměstnanec má přístup ke svému kalendáři a přiděleným rezervacím,
- recepce má přístup ke správě rezervací bez systémových zásahů.

Pro mobilní aplikaci je vhodné vystavit zabezpečené API pro interní uživatele, kde:

- přihlášení vrátí bezpečný token nebo session,
- každé volání API bude ověřeno,
- role uživatele určí, jaká data smí aplikace číst a v další fázi i měnit.

### Synchronizace dat

Aby aplikace pracovala se stejnými daty jako administrace, je vhodné dodržet tyto zásady:

- Android aplikace nesmí držet vlastní oddělenou databázi rezervací jako hlavní zdroj pravdy,
- lokální úložiště v mobilu má sloužit jen jako cache pro rychlejší načítání nebo krátkodobý offline režim,
- v aktuální fázi se lokální testovací změny nesynchronizují zpět na server,
- při konfliktu má mít prioritu serverová verze dat,
- seznamy rezervací, zaměstnanců a služeb mají být pravidelně obnovovány z API.

### Notifikace a aktualizace

Propojení s aktuálním workflow bude nejsilnější, pokud mobilní aplikace dostane:

- push notifikaci při nové rezervaci,
- push notifikaci při změně nebo zrušení rezervace,
- možnost otevřít detail konkrétní rezervace přímo z notifikace,
- možnost ručního obnovení dat i automatického načítání při otevření aplikace.

### Minimální API kontrakt pro mobilní aplikaci

Pro první verzi je vhodné, aby Android aplikace měla k dispozici minimálně tyto typy endpointů:

- přihlášení a ověření uživatele,
- seznam rezervací,
- detail rezervace,
- vytvoření rezervace,
- úprava rezervace,
- změna stavu rezervace,
- seznam zaměstnanců,
- seznam služeb,
- dostupné termíny,
- blokované termíny,
- provozní hodiny,
- notifikace nebo přehled posledních změn.

### Doporučený architektonický model

Nejvhodnější je tento model:

- web zůstane veřejným kanálem pro zákaznické rezervace,
- existující administrace zůstane hlavním správcem obsahu a provozních dat,
- Android aplikace bude interní provozní nástroj pro personál,
- všechny tři vrstvy budou používat společný backend a společná pravidla dostupnosti termínů.

Tím se zajistí, že:

- nevzniknou rozdíly mezi webem a mobilní aplikací,
- nebude potřeba spravovat dvě různé logiky rezervací,
- změny v kalendáři budou jednotné napříč systémem,
- personál bude pracovat s totožnými daty jako v administraci.

## Bezpečnost

- zabezpečené přihlášení,
- přístup podle rolí,
- ochrana osobních údajů zákazníků,
- audit změn rezervací,
- bezpečné ukládání relace a přístupových údajů.

## Rozsah první verze (MVP)

Pro první vydání se doporučuje zaměřit na:

- přihlášení,
- dashboard,
- kalendář rezervací,
- detail rezervace,
- potvrzení, úpravu a zrušení rezervace,
- správu blokovaných termínů,
- push notifikace.

## Aktuální stav dokončení mobilní aplikace

Aktuálně už nevzniká jen návrh. V repozitáři existuje první funkční Expo/React Native prototyp v adresáři `apps/mobile`, který slouží jako základ pro Android aplikaci.

### Co je už dokončeno

- založený mobilní projekt pro Expo,
- přihlašovací obrazovka napojená na existující `/api/admin/auth/login`,
- použití stejného tokenového přístupu jako ve webové administraci,
- načítání rezervací, zaměstnanců, služeb, blokovaných termínů a provozních hodin,
- dashboard se základními metrikami,
- seznam rezervací s filtry,
- detail rezervace s rychlými akcemi,
- lokální změna stavu rezervace pouze uvnitř prototypu,
- vytvoření nové rezervace jako lokální draft bez zápisu do systému,
- zachování lokálních draftů a lokálních změn i po restartu aplikace,
- webový bundling a základní Expo konfigurace pro další vývoj.

### Co zatím není dokončeno

- skutečný zápis rezervací zpět do systému,
- editace a mazání lokálních draftů,
- denní a týdenní kalendářové zobrazení,
- push notifikace,
- bezpečné produkční ukládání relace,
- staging nebo sandbox backend pro bezpečné zapisování,
- finální Android build workflow pro distribuci `.apk`.

### Aktuální omezení

- mobilní aplikace je zatím izolovaný preview klient,
- čte data ze stejného backendu jako web a administrace,
- změny provedené v mobilu se zatím nepropisují do produkční administrace ani databáze,
- pro Expo Go na fyzickém telefonu je nutné použít IP adresu počítače v lokální síti místo `10.0.2.2`.

## Doporučené rozšíření v další fázi

- reporty tržeb a vytížení,
- detailnější historie aktivit,
- SMS připomínky,
- offline režim s pokročilou synchronizací,
- víceúrovňové schvalování rezervací.

## Další pokyny pro dokončení aplikace

### 1. Stabilizace lokálního vývoje

- sjednotit lokální vývojové kroky pro Windows, Android emulátor a Expo Go,
- doplnit do dokumentace přesný postup spuštění backendu po síti,
- přidat do mobilní aplikace kontrolu spojení se serverem a srozumitelné síťové chyby.

### 2. Dokončení práce s rezervacemi v preview režimu

- doplnit editaci lokálního draftu rezervace,
- doplnit smazání lokálního draftu,
- doplnit lepší označení rozdílu mezi serverovou rezervací a lokální testovací změnou,
- dokončit denní pracovní workflow pro personál bez zápisu na server.

### 3. Připravení bezpečné zápisové vrstvy

- vytvořit samostatný staging nebo sandbox režim pro testovací zápisy,
- oddělit preview změny od produkčních dat,
- připravit bezpečné endpointy pro vytvoření, úpravu a změnu stavu rezervace,
- doplnit audit změn a jasná pravidla oprávnění podle role.

### 4. Rozšíření mobilního UX

- doplnit kalendář den / týden,
- doplnit rychlé akce pro zavolání a e-mail z hlavních seznamů,
- doplnit notifikační centrum a historii změn,
- upravit navigaci a tok obrazovek pro pohodlné ovládání jednou rukou.

### 5. Připravení produkčního Android vydání

- doplnit finální branding aplikace,
- připravit EAS / Expo build konfiguraci pro Android,
- otestovat přihlášení, načítání dat a lokální draft workflow na reálném zařízení,
- připravit postup distribuce `.apk` pro interní testování.

### 6. Doporučené pořadí dokončení

1. dokončit UX lokálních draftů a diagnostiku připojení,
2. přidat kalendářové zobrazení a pohodlnější práci s rezervacemi,
3. připravit sandbox zápisy mimo produkční administraci,
4. teprve poté zapnout skutečné zapisování změn z mobilní aplikace,
5. následně dokončit push notifikace a distribuční build.

## Návrh obsahu screenshotů

- `docs/images/android-login-placeholder.png` - Přihlašovací obrazovka aplikace
- `docs/images/android-dashboard-placeholder.png` - Dashboard s dnešními rezervacemi
- `docs/images/android-calendar-placeholder.png` - Týdenní kalendář rezervací
- `docs/images/android-reservation-detail-placeholder.png` - Detail rezervace s rychlými akcemi

## Shrnutí

Android aplikace pro správu rezervačního systému Salon Zuza má být praktický interní nástroj pro každodenní provoz. Největší hodnotu přinese v rychlosti práce s rezervacemi, okamžitém přehledu o kalendáři a pohodlné komunikaci se zákazníky přímo z mobilního zařízení.
