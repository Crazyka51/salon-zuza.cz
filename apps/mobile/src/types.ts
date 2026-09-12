export type ReservationStatus =
  | "pending"
  | "potvrzeno"
  | "dokonceno"
  | "zruseno_zakaznikem"
  | "zruseno_salonem"
  | "nedorazil"

export type ReservationSource = "server" | "local-draft"

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: string
  permissions?: string[]
  jeAdmin?: boolean
}

export interface AuthResponse {
  success: boolean
  data: AuthUser
  token: string
  message?: string
}

export interface Employee {
  id: number
  jmeno: string
  prijmeni: string
  uroven: string
  email: string
  telefon?: string | null
  fotoUrl?: string | null
  jeAktivni?: boolean
  jeAdmin?: boolean
}

export interface Service {
  id: number
  nazev: string
  popis?: string | null
  dobaTrvaniMinuty: number
  cenaTopStylist: number
  cenaStylist: number
  cenaJuniorStylist: number
  kategorie?: {
    nazev: string
  } | null
}

export interface ServiceResponse {
  sluzby: Service[]
}

export interface Reservation {
  id: number
  jmeno: string
  prijmeni: string
  email?: string | null
  telefon?: string | null
  datum: string
  casOd?: string
  casDo?: string
  zamestnanecId?: number | null
  kadernice?: string | null
  sluzby?: string | null
  poznamka?: string | null
  stav: ReservationStatus
  cena?: number
  sluzba?: {
    nazev: string
    kategorie?: {
      nazev: string
    }
  } | null
  zamestnanec?: {
    jmeno: string
    prijmeni: string
    uroven: string
  } | null
  source?: ReservationSource
  isDraft?: boolean
  draftInput?: LocalDraftInput
}

export interface ReservationResponse {
  rezervace: Reservation[]
}

export interface EmployeeResponse {
  zamestnanci: Employee[]
}

export interface BlockedTerm {
  id: number
  nazev: string
  popis?: string | null
  datumOd: string
  datumDo: string
  jeAktivni: boolean
  source?: "manual" | "employee-vacation"
}

export interface BlockedTermsResponse {
  success: boolean
  blokovaneTerminy: BlockedTerm[]
}

export interface OpeningHoursItem {
  id: number
  denTydne: number
  casOtevrani: string
  casZavreni: string
  jeZavreno: boolean
  jeAktivni?: boolean
}

export interface LocalDraftInput {
  jmeno: string
  prijmeni: string
  telefon: string
  email: string
  datum: string
  casOd: string
  zamestnanecId: number | null
  sluzbaId: number | null
  poznamka: string
}
