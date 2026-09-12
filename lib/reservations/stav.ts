/**
 * Jediný zdroj pravdy pro hodnoty pole `stav` u rezervace.
 *
 * Historicky se v kódu i v DB objevovaly různé varianty (anglicky "confirmed"/"completed"/
 * "cancelled", česky s velkým i malým písmenem "Potvrzeno"/"potvrzeno" atd.). Nový kód by měl
 * vždy zapisovat a porovnávat pouze kanonické hodnoty z `STAV` níže. Staré hodnoty už existující
 * v databázi se dají převést na kanonický tvar přes `normalizovatStav()`.
 */

export const STAV = {
  CEKA_NA_POTVRZENI: 'pending',
  POTVRZENO: 'potvrzeno',
  DOKONCENO: 'dokonceno',
  ZRUSENO_ZAKAZNIKEM: 'zruseno_zakaznikem',
  ZRUSENO_SALONEM: 'zruseno_salonem',
  NEDORAZIL: 'nedorazil',
} as const;

export type StavRezervace = (typeof STAV)[keyof typeof STAV];

export const STAV_LABELS: Record<StavRezervace, string> = {
  [STAV.CEKA_NA_POTVRZENI]: 'Čeká na potvrzení',
  [STAV.POTVRZENO]: 'Potvrzeno',
  [STAV.DOKONCENO]: 'Dokončeno',
  [STAV.ZRUSENO_ZAKAZNIKEM]: 'Zrušeno zákazníkem',
  [STAV.ZRUSENO_SALONEM]: 'Zrušeno salonem',
  [STAV.NEDORAZIL]: 'Nedorazil',
};

// Text pro zákaznický e-mail při změně stavu (celá věta, na rozdíl od krátkého STAV_LABELS)
export const STAV_EMAIL_ZPRAVA: Record<StavRezervace, string> = {
  [STAV.CEKA_NA_POTVRZENI]: 'Vaše rezervace čeká na potvrzení',
  [STAV.POTVRZENO]: 'Vaše rezervace byla potvrzena',
  [STAV.DOKONCENO]: 'Děkujeme za návštěvu',
  [STAV.ZRUSENO_ZAKAZNIKEM]: 'Vaše rezervace byla zrušena z vaší strany (zákazníkem)',
  [STAV.ZRUSENO_SALONEM]: 'Vaše rezervace byla zrušena salonem',
  [STAV.NEDORAZIL]: 'Byli jste evidováni jako nedostavivší se na rezervaci',
};

// Staré hodnoty použité v dřívějším kódu / starých záznamech v DB -> kanonický ekvivalent
const LEGACY_ALIASY: Record<string, StavRezervace> = {
  confirmed: STAV.POTVRZENO,
  Potvrzeno: STAV.POTVRZENO,
  completed: STAV.DOKONCENO,
  cancelled: STAV.ZRUSENO_ZAKAZNIKEM,
  ceka_na_potvrzeni: STAV.CEKA_NA_POTVRZENI,
};

const KANONICKE_HODNOTY: readonly string[] = Object.values(STAV);

/** Převede libovolnou (i starou/legacy) hodnotu `stav` na kanonický tvar. */
export function normalizovatStav(hodnota: string | null | undefined): StavRezervace {
  if (!hodnota) return STAV.CEKA_NA_POTVRZENI;
  if ((KANONICKE_HODNOTY as string[]).includes(hodnota)) return hodnota as StavRezervace;
  return LEGACY_ALIASY[hodnota] ?? STAV.CEKA_NA_POTVRZENI;
}

/**
 * Stavy, které v kalendáři blokují termín (zabraný slot pro dostupnost/kolize).
 * Zahrnuje i staré hodnoty, protože v DB mohou být uložené záznamy z dřívějška.
 */
export const BLOKUJICI_STAVY: readonly string[] = [
  STAV.POTVRZENO,
  'confirmed',
  'Potvrzeno',
];
