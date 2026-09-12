Vytvořte kompletní rezervační systém jako modul pro existující Next.js 14+ (App Router) projekt postavený na TypeScriptu a Tailwind CSS. Systém bude sloužit pro kadeřnický a kosmetický "Salon Zuza". Databázi bude představovat MongoDB s Mongoose (nebo Prisma). Autentizace pro adminy již existuje, pro zákazníky je potřeba vytvořit novou (např. pomocí NextAuth.js).
Klíčové principy:
"Service-First" tok: Zákazník nejprve vybírá služby, poté systém nabídne kvalifikované stylisty s cenami, a nakonec dostupné termíny.
Dynamická cena: Cena se odvíjí od úrovně stylisty (TOP STYLIST, STYLIST).
Modularita: Veškerý kód související s bookingem musí být přehledně organizován ve své vlastní struktuře adresářů.
Úkol 1: Základní struktura a datové typy
Vytvořte soubor types/booking.d.ts a definujte v něm následující TypeScript rozhraní, která budou používána napříč celou aplikací:
IEmployee: _id, name, surname, level ('top_stylist' | 'stylist'), email, phone, photoUrl, schedule (pole objektů s day, from, to), daysOff (pole stringů 'YYYY-MM-DD'), isActive.
IService: _id, name, category, description, durationMinutes, price (objekt s klíči top_stylist, stylist).
IReservation: _id, customerId, employeeId, services (pole objektů s serviceId, name, durationMinutes, price jako snapshoty), startTime (Date), endTime (Date), totalDurationMinutes, estimatedTotalPrice, customerNote, status ('confirmed' | 'completed' | 'cancelled_by_customer' | 'cancelled_by_salon' | 'no_show').
ICustomer: _id, name, surname, email, phone, registrationDate, adminNotes, passwordHash.
ISalonSettings: _id ('global_settings'), openingHours, cancellationPolicyText, emailReminderEnabled, smsReminderEnabled, reminderHoursBefore.
Vytvořte databázové modely (Mongoose/Prisma) přesně podle těchto rozhraní v adresáři models/.
Úkol 2: Backend - API Routes (v /pages/api/booking/)
Implementujte následující API endpointy. Všechny admin endpointy musí být chráněny existující admin autentizací. Všechny zákaznické endpointy musí být chráněny zákaznickou autentizací.
Služby a Stylisté (Veřejné):
GET /services: Vrať všechny aktivní služby.
GET /employees: Vrať všechny aktivní stylisty.
Dostupnost (Veřejné):
GET /employees/[id]/availability?date=YYYY-MM-DD&duration=MINUTES: Implementuj logiku výpočtu dostupnosti, která zohlední pracovní dobu, dny volna a existující rezervace daného stylisty. Vrať pole dostupných časových slotů.
Rezervace (Veřejné a Zákaznické):
POST /reservations: Vytvoř novou rezervaci. Proveď validaci dat. Po úspěšném vytvoření spusť odeslání potvrzovacího e-mailu a SMS.
GET /customers/me/reservations: (Zákaznické) Vrať rezervace přihlášeného zákazníka.
PUT /reservations/[id]/cancel: (Zákaznické) Zruš rezervaci. Zkontroluj, zda neporušuje storno podmínky (< 24h).
Administrace (Admin-only):
Implementuj plné CRUD operace (GET list, GET one, POST, PUT, DELETE) pro:
/employees
/services
/customers
/reservations
Implementuj GET a PUT pro /settings.
Úkol 3: Frontend - Veřejný Booking Wizard (/book-appointment)
Vytvořte vícekrokovou komponentu BookingWizard.tsx podle "Service-First" toku.
Hlavní komponenta (BookingWizard.tsx):
Spravuje stav celé rezervace (objekt s selectedServices, totalDuration, selectedEmployee, selectedDateTime atd.).
Načítá data ze GET /api/booking/services a GET /api/booking/employees.
Renderuje aktuální krok a předává mu potřebná data a callback funkce.
Krok 1: Výběr služeb (Step1_SelectServices.tsx):
Zobrazí služby seskupené do kategorií (accordion).
Uživatel může vybrat více služeb.
Komponenta zobrazuje dynamický souhrn s celkovou dobou trvání.
Po výběru volá callback funkci onServicesSelected s polem vybraných služeb a celkovou dobou.
Krok 2: Výběr stylisty (Step2_SelectEmployee.tsx):
Přijímá jako prop seznam vybraných služeb.
Zobrazí pouze kvalifikované stylisty.
Pro každého stylistu vypočítá a zobrazí odhadovanou cenu "od" na základě vybraných služeb.
Volá onEmployeeSelected s vybraným stylistou.
Krok 3: Výběr data a času (Step3_SelectDateTime.tsx):
Přijímá jako prop vybraného stylistu a celkovou dobu.
Při změně měsíce volá GET /api/booking/employees/[id]/availability pro načtení volných slotů.
Zobrazí kalendář s dostupnými termíny.
Volá onDateTimeSelected s vybraným datem a časem.
Kroky 4-7: Implementuj zbývající kroky (Kontaktní údaje, Souhrn, Platba, Potvrzení) podle tree rozložení. Formulář v kroku 4 odešle data na POST /api/booking/reservations.
Úkol 4: Frontend - Administrační Rozhraní (/admin/provozovna/)
Vytvořte stránky a komponenty pro správu salonu. Každá stránka bude volat příslušné admin API endpointy pro načtení a modifikaci dat.
Kalendář (/kalendar): Použij knihovnu jako react-big-calendar nebo fullcalendar. Načti rezervace a zobraz je v týdenním/denním pohledu. Implementuj modální okna pro detail, úpravu a rychlé vytvoření rezervace.
Správa Služeb (/sluzby): Vytvoř tabulku služeb s akcemi. Implementuj formulář pro přidání/úpravu služby, který obsahuje pole pro ceny pro různé úrovně stylistů.
Správa Pracovníků (/pracovnici): Implementuj správu pracovníků, klíčový je formulář pro úpravu, kde se bude nastavovat týdenní pracovní doba a dny volna pomocí kalendáře.
Ostatní stránky: Implementuj zbývající stránky (Rezervace, Zákazníci, Reporty, Nastavení) podle tree rozložení, vždy s důrazem na přehledné zobrazení dat a intuitivní formuláře pro jejich správu.
Úkol 5: Automatizace a Notifikace
Vytvořte server-side skript (např. pomocí Vercel Cron Jobs nebo jiné metody plánování úloh), který se spustí jednou denně.
Logika skriptu:
Najde všechny rezervace, jejichž startTime je v rozmezí 24 až 25 hodin od aktuálního času.
Pro každou nalezenou rezervaci zavolá utility funkce sendEmailReminder a sendSmsReminder.
Vytvořte utility funkce v /lib/ pro odesílání e-mailů a SMS, které budou komunikovat s externími službami (např. Resend pro e-maily, GoSMS pro SMS).
38.8s
