// Sdílené typy pro rezervační systém
import type { StavRezervace } from '@/lib/reservations/stav';

export interface Rezervace {
  id: number;
  jmeno: string;
  prijmeni: string;
  email: string;
  telefon: string;
  datum: string;
  sluzbaId?: number | null;
  zamestnanecId?: number | null;
  // Podpora obou formátů pro kompatibilitu
  casOd?: string;
  casDo?: string;
  cas_od?: string;
  cas_do?: string;
  pocetOsob?: number;
  pocetDeti?: number;
  sluzba?: {
    nazev: string;
    kategorie: {
      nazev: string;
    };
  };
  // Nová pole z CSV
  sluzby?: string; // Služby jako string (pro více služeb najednou)
  kadernice?: string; // Jméno kadeřnice/zaměstnance
  zamestnanec?: {
    jmeno: string;
    prijmeni: string;
    uroven: string;
  };
  poznamka?: string;
  // Kanonické hodnoty viz lib/reservations/stav.ts; staré řetězce ("confirmed" apod.)
  // se mohou objevit u historických záznamů/API odpovědí před normalizací.
  stav: StavRezervace | 'confirmed' | 'completed' | 'cancelled';
  cena: number;
  zpusobPlatby?: string;
  // Podpora obou formátů pro kompatibilitu
  createdAt?: string;
  created_at?: string;
}

export interface BlockedTerm {
  id: number;
  nazev: string;
  popis?: string;
  datumOd: string;
  datumDo: string;
  source?: 'manual' | 'employee-vacation';
}

export interface CalendarViewProps {
  onDateSelect?: (date: Date) => void;
  onReservationClick?: (rezervace: Rezervace) => void;
  onCreateReservation?: (date: Date, time: string) => void;
  onEditReservation?: (rezervace: Rezervace) => void | Promise<void>;
  onDeleteReservation?: (rezervace: Rezervace) => void | Promise<void>;
  selectedDate?: Date;
  blockedTerms?: BlockedTerm[];
}