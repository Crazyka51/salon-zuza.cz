export interface ProvozniHodiny {
  id: number;
  denTydne: number;
  casOtevrani: string;
  casZavreni: string;
  jeZavreno: boolean;
}

export interface BlockedTermItem {
  id: number;
  nazev: string;
  popis?: string;
  datumOd: string;
  datumDo: string;
  source?: 'manual' | 'employee-vacation';
}

export interface RawBlockedTermItem extends Partial<BlockedTermItem> {
  datum_od?: string;
  datum_do?: string;
}

export interface ReservationFilters {
  search: string;
  stav: string;
  datumOd: string;
  datumDo: string;
  obdobi: 'aktivni' | 'uplynule' | 'vse';
}

export interface ReservationDraft {
  jmeno: string;
  prijmeni: string;
  email: string;
  telefon: string;
  datum: string;
  casOd: string;
  casDo: string;
  zamestnanecId: string;
  sluzbaId: string;
  stav: string;
  cena: number;
  zpusobPlatby: string;
  poznamka: string;
  pocetOsob: number;
  pocetDeti: number;
}
