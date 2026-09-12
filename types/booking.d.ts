/**
 * TypeScript rozhraní pro rezervační systém Salon Zuza
 * Obsahuje všechny datové typy používané napříč aplikací
 */

/**
 * Úrovně stylisti/zaměstnanců
 */
export type UroveňStylisty = 'top_stylist' | 'stylist' | 'junior_stylist';

/**
 * Dny v týdnu pro rozvrh
 */
export type DenVTydnu = 'pondeli' | 'utery' | 'streda' | 'ctvrtek' | 'patek' | 'sobota' | 'nedele';

/**
 * Stavy rezervace - jediný zdroj pravdy viz lib/reservations/stav.ts
 */
export type { StavRezervace } from '../lib/reservations/stav';

/**
 * Rozhraní pro zaměstnance/stylisty
 */
export interface IZamestnanec {
  _id: string;
  jmeno: string;
  prijmeni: string;
  uroveň: UroveňStylisty;
  email: string;
  telefon: string;
  fotoUrl?: string;
  rozvrh: IRozvrh[];
  dnyVolna: string[]; // YYYY-MM-DD nebo YYYY-MM-DD|HH:MM-HH:MM
  jeAktivni: boolean;
  vytvořeno: Date;
  upraveno: Date;
}

/**
 * Rozhraní pro pracovní rozvrh zaměstnance
 */
export interface IRozvrh {
  den: DenVTydnu;
  od: string; // HH:MM formát (např. "09:00")
  do: string; // HH:MM formát (např. "17:00")
  jePracovniDen: boolean;
}

/**
 * Rozhraní pro služby
 */
export interface ISluzba {
  _id: string;
  nazev: string;
  kategorie: string;
  kategorieId: string;
  popis: string;
  dobaTrvaniMinuty: number;
  cena: {
    top_stylist: number;
    stylist: number;
    junior_stylist?: number;
  };
  jeAktivni: boolean;
  vytvořeno: Date;
  upraveno: Date;
}

/**
 * Rozhraní pro kategorie služeb
 */
export interface IKategorieSluzeb {
  _id: string;
  nazev: string;
  popis?: string;
  poradi: number;
  jeAktivni: boolean;
  vytvořeno: Date;
  upraveno: Date;
}

/**
 * Rozhraní pro rezervaci
 */
export interface IRezervace {
  _id: string;
  zakaznikId: string;
  zamestnanecId: string;
  sluzby: ISluzbaVRezervaci[];
  casZacatku: Date;
  casKonce: Date;
  celkovaDobaTrvaniMinuty: number;
  odhadovanaCelkovaCena: number;
  poznamkaZakaznika?: string;
  poznamkaAdmina?: string;
  stav: StavRezervace;
  vytvořeno: Date;
  upraveno: Date;
}

/**
 * Rozhraní pro službu v rezervaci (snapshot)
 */
export interface ISluzbaVRezervaci {
  sluzbaId: string;
  nazev: string;
  dobaTrvaniMinuty: number;
  cena: number;
}

/**
 * Rozhraní pro zákazníka
 */
export interface IZakaznik {
  _id: string;
  jmeno: string;
  prijmeni: string;
  email: string;
  telefon: string;
  datumRegistrace: Date;
  poznamkyAdmina?: string;
  hesloHash?: string;
  jeAktivni: boolean;
  vytvořeno: Date;
  upraveno: Date;
}

/**
 * Rozhraní pro nastavení salonu
 */
export interface INastaveniSalonu {
  _id: 'globalni_nastaveni';
  oteviraciDoba: IOteviraciDoba[];
  textStornoConditions: string;
  emailPripominkiPovoleny: boolean;
  smsPripominkiPovoleny: boolean;
  pripominkaNHodinDopredu: number;
  nazevSalonu: string;
  adresa: string;
  telefon: string;
  email: string;
  vytvořeno: Date;
  upraveno: Date;
}

/**
 * Rozhraní pro otevírací dobu
 */
export interface IOteviraciDoba {
  den: DenVTydnu;
  od: string; // HH:MM
  do: string; // HH:MM
  jeOtevreno: boolean;
}

/**
 * NOVÉ - Rozhraní pro editovatelný obsah stránek
 */
export interface IObsahStranky {
  _id: string;
  klic: string; // např. "hero_nadpis", "kvalita_text", "recenze_1"
  nazev: string; // Lidské jméno pro admin ("Hero nadpis", "Text sekce Kvalita")
  hodnota: string; // Samotný obsah
  typ: TypObsahu;
  stranka: string; // "uvodni_stranka", "o_nas", atd.
  poradi?: number;
  jeAktivni: boolean;
  vytvořeno: Date;
  upraveno: Date;
}

/**
 * Typy obsahu pro CMS
 */
export type TypObsahu = 
  | 'text' 
  | 'html' 
  | 'nadpis' 
  | 'popis' 
  | 'tlacitko_text' 
  | 'tlacitko_odkaz' 
  | 'obrazek_url' 
  | 'obrazek_alt'
  | 'recenze_text'
  | 'recenze_autor'
  | 'recenze_hodnoceni';

/**
 * FRONTEND - Rozhraní pro booking wizard stav
 */
export interface IBookingStav {
  aktualniKrok: number;
  vybraneSluzby: ISluzba[];
  celkovaDobaTrvani: number;
  vybranyZamestnanec?: IZamestnanec;
  vybranyDatumCas?: Date;
  kontaktniUdaje?: IKontaktniUdaje;
  poznamka?: string;
  odhadovanaCena?: number;
}

/**
 * Rozhraní pro kontaktní údaje v booking wizard
 */
export interface IKontaktniUdaje {
  jmeno: string;
  prijmeni: string;
  email: string;
  telefon: string;
  poznamka?: string;
}

/**
 * API Response typy
 */
export interface IApiResponse<T> {
  uspech: boolean;
  data?: T;
  chyba?: string;
  zprava?: string;
}

/**
 * Rozhraní pro dostupné časové sloty
 */
export interface ICasovySlot {
  cas: string; // "09:00"
  jeVolny: boolean;
  zaměstnanecId?: string;
}

/**
 * Rozhraní pro availabilitu zaměstnance
 */
export interface IAvailabilita {
  datum: string; // YYYY-MM-DD
  sloty: ICasovySlot[];
}

/**
 * Frontend komponenty props
 */
export interface IBookingWizardProps {
  onDokonceni: (rezervace: Partial<IRezervace>) => void;
  pocatecniStav?: Partial<IBookingStav>;
}

export interface IStep1Props {
  vybraneSluzby: ISluzba[];
  onSluzbyVybracy: (sluzby: ISluzba[]) => void;
  dostupneSluzby: ISluzba[];
  kategorie: IKategorieSluzeb[];
}

export interface IStep2Props {
  vybraneSluzby: ISluzba[];
  vybranyZamestnanec?: IZamestnanec;
  onZamestnanecVybran: (zamestnanec: IZamestnanec | null) => void;
  dostupniZamestnanci: IZamestnanec[];
}

export interface IStep3Props {
  vybranyZamestnanec?: IZamestnanec;
  celkovaDobaTrvani: number;
  vybranyDatumCas?: Date;
  onDatumCasVybran: (datumCas: Date) => void;
}

/**
 * Admin panel typy
 */
export interface IAdminDashboardStats {
  celkoveRezervace: number;
  rezervaceVTomtoMesici: number;
  aktivniZamestnanci: number;
  aktivniSluzby: number;
}

export interface IAdminFiltery {
  datumOd?: string;
  datumDo?: string;
  zamestnanecId?: string;
  stav?: StavRezervace;
  hledatText?: string;
}