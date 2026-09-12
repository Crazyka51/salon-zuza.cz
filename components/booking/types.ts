export interface Sluzba {
  id: number
  nazev: string
  popis?: string | null
  dobaTrvaniMinuty: number
  cenaTopStylist: number
  cenaStylist: number
  cenaJuniorStylist: number
  kategorie?: { nazev: string }
}

export interface Zamestnanec {
  id: number
  jmeno: string
  prijmeni: string
  uroven: string
  fotoUrl?: string | null
}

export interface BlokovanyTermin {
  datumOd: string
  datumDo: string
  jeAktivni: boolean
  source?: 'manual' | 'employee-vacation'
}

export interface CasovySlot {
  time: string
  available: boolean
}

export interface KontaktniUdaje {
  jmeno: string
  prijmeni: string
  email: string
  telefon: string
  poznamka: string
  pocetOsob: number
  pocetDeti: number
}

export type Pohlavi = 'zena' | 'muz' | 'dite'

// Jediná kategorie, kde se nabídka služeb reálně liší podle pohlaví/věku zákazníka
function jeStrihKategorie(nazevKategorie: string): boolean {
  return nazevKategorie.trim().toUpperCase() === 'STŘIH'
}

// Rozhodne, zda služba patří do nabídky pro dané pohlaví (mimo kategorii STŘIH je nabídka pro všechny stejná)
export function patriSluzbaKPohlavi(sluzba: Sluzba, pohlavi: Pohlavi): boolean {
  if (!jeStrihKategorie(sluzba.kategorie?.nazev || '')) return true
  const nazev = sluzba.nazev.toLowerCase()
  const jePanska = nazev.includes('pánsk') || nazev.includes('pansk')
  const jeDetska = nazev.includes('dětsk') || nazev.includes('detsk')
  if (pohlavi === 'muz') return jePanska
  if (pohlavi === 'dite') return jeDetska
  return !jePanska && !jeDetska
}

// Vrátí cenu služby podle úrovně zaměstnance ('top_stylist' | 'stylist' | 'junior_stylist')
export function cenaProUroven(sluzba: Sluzba, uroven?: string): number {
  switch (uroven) {
    case 'top_stylist':
      return sluzba.cenaTopStylist
    case 'junior_stylist':
      return sluzba.cenaJuniorStylist
    default:
      return sluzba.cenaStylist
  }
}

export function popisekUrovne(uroven: string): string {
  switch (uroven) {
    case 'top_stylist':
      return 'Top stylistka'
    case 'junior_stylist':
      return 'Junior stylistka'
    default:
      return 'Stylistka'
  }
}
