/**
 * Utilities pro kontrolu dostupnosti zaměstnanců
 * 
 * Zahrnuje:
 * - Mapování dne týdne (Date → DenVTydnu)
 * - Kontrola zda je den pracovní
 * - Kontrola zda je čas v rámci pracovní doby
 * - Kontrola dní volna
 * - Integraci s overlap detection
 * 
 * @module lib/reservations/availability
 */

import type { IRozvrh, DenVTydnu } from '@/types/booking';
import { hasOverlap, type TimeSlot } from './overlap';
import { prisma } from '@/lib/db';
import { BLOKUJICI_STAVY } from './stav';

// Export typů pro testy
export type { IRozvrh, DenVTydnu };

/**
 * Mapování JS Day to Czech weekday name
 * JS getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
 */
const dayOfWeekMap: Record<number, DenVTydnu> = {
  0: 'nedele',    // Sunday
  1: 'pondeli',   // Monday
  2: 'utery',     // Tuesday
  3: 'streda',    // Wednesday
  4: 'ctvrtek',   // Thursday
  5: 'patek',     // Friday
  6: 'sobota',    // Saturday
};

/**
 * Reverse map: Czech name to JS day number
 */
const czechDayToNumber: Record<DenVTydnu, number> = {
  nedele: 0,
  pondeli: 1,
  utery: 2,
  streda: 3,
  ctvrtek: 4,
  patek: 5,
  sobota: 6,
};

/**
 * Get Czech weekday name from Date
 * @param date - The date to check
 * @returns Czech weekday name (e.g., 'pondeli')
 */
export function getDayOfWeek(date: Date): DenVTydnu {
  return dayOfWeekMap[date.getDay()];
}

/**
 * Convert Czech date string (YYYY-MM-DD) to Date object at 00:00 UTC
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Parse as midnight UTC to avoid timezone issues
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Format Date to YYYY-MM-DD string
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if employee is on vacation that day
 * @param dnyVolna - Array of vacation days (YYYY-MM-DD format)
 * @param date - The date to check
 * @returns true if employee is OFF that day
 */
export function isOnVacation(dnyVolna: string[], date: Date): boolean {
  const dateStr = formatDate(date);
  return dnyVolna.includes(dateStr);
}

interface ParsedDayOffEntry {
  date: string;
  od?: string;
  do?: string;
}

function parseDayOffEntry(entry: string): ParsedDayOffEntry | null {
  if (!entry) {
    return null;
  }

  if (!entry.includes('|')) {
    return { date: entry };
  }

  const [date, range] = entry.split('|');
  const [od, doTime] = (range ?? '').split('-');

  if (!date || !od || !doTime) {
    return null;
  }

  return { date, od, do: doTime };
}

/**
 * Check if requested slot conflicts with day-off entries.
 * Supported formats in dnyVolna:
 * - YYYY-MM-DD (celý den volna)
 * - YYYY-MM-DD|HH:MM-HH:MM (jednorázové volno v části dne)
 */
export function hasDayOffConflict(
  dnyVolna: string[],
  date: Date,
  casOd: string,
  casDo: string
): boolean {
  const dateStr = formatDate(date);
  const requestedSlot: TimeSlot = { od: casOd, do: casDo };

  return dnyVolna.some((entry) => {
    const parsed = parseDayOffEntry(entry);
    if (!parsed || parsed.date !== dateStr) {
      return false;
    }

    if (!parsed.od || !parsed.do) {
      return true;
    }

    return hasOverlap({ od: parsed.od, do: parsed.do }, requestedSlot);
  });
}

/**
 * Get work schedule for specific weekday
 * @param rozvrh - Employee schedule array
 * @param dayOfWeek - Day of week to find
 * @returns Schedule entry or null if not found
 */
export function getScheduleForDay(
  rozvrh: IRozvrh[] | null,
  dayOfWeek: DenVTydnu
): IRozvrh | null {
  if (!rozvrh || !Array.isArray(rozvrh)) {
    return null;
  }
  return rozvrh.find((s) => s.den === dayOfWeek) || null;
}

/**
 * Check if time slot is within working hours
 * @param schedule - Schedule entry for the day
 * @param slotStart - Start time (HH:MM)
 * @param slotEnd - End time (HH:MM)
 * @returns true if slot fits entirely within working hours
 */
export function isWithinWorkingHours(
  schedule: IRozvrh | null,
  slotStart: string,
  slotEnd: string
): boolean {
  if (!schedule || !schedule.jePracovniDen) {
    return false;
  }

  return (
    slotStart >= schedule.od &&
    slotEnd <= schedule.do &&
    slotStart < slotEnd
  );
}

/**
 * Check for booking conflicts with existing reservations
 * @param zamestnanecId - Employee ID
 * @param datum - Date to check
 * @param casOd - Start time (HH:MM)
 * @param casDo - End time (HH:MM)
 * @returns true if there ARE conflicts, false if available
 */
export async function hasBookingConflicts(
  zamestnanecId: number,
  datum: Date,
  casOd: string,
  casDo: string
): Promise<boolean> {
  try {
    const existingReservations = await prisma.rezervace.findMany({
      where: {
        zamestnanecId,
        datum,
        stav: { 
          in: [...BLOKUJICI_STAVY]
        },
      },
      select: {
        id: true,
        casOd: true,
        casDo: true,
        stav: true,
      },
    });

    const requestedSlot: TimeSlot = { od: casOd, do: casDo };

    // Check if any existing reservation overlaps
    const hasConflict = existingReservations.some((res) => {
      const overlap = hasOverlap({ od: res.casOd, do: res.casDo }, requestedSlot);
      return overlap;
    });

    return hasConflict;
  } catch (error) {
    console.error('Chyba při kontrole konfiktů rezervací:', error);
    throw new Error('Nepodařilo se zkontrolovat dostupnost');
  }
}

/**
 * Main function: Check employee availability
 * 
 * Performs these checks in order:
 * 1. Employee exists and is active
 * 2. Date is not a day off
 * 3. Date is a work day (from schedule)
 * 4. Times are within working hours
 * 5. No booking conflicts
 * 
 * @param zamestnanecId - Employee ID
 * @param datum - Date (YYYY-MM-DD or Date object)
 * @param casOd - Start time (HH:MM)
 * @param casDo - End time (HH:MM)
 * @returns true if available, false if NOT available
 */
export async function zkontrolovatDostupnost(
  zamestnanecId: number,
  datum: string | Date,
  casOd: string,
  casDo: string
): Promise<boolean> {
  try {
    // 1. Get employee
    const zamestnanec = await prisma.zamestnanec.findUnique({
      where: { id: zamestnanecId },
      select: {
        id: true,
        jmeno: true,
        prijmeni: true,
        jeAktivni: true,
        rozvrh: true,
        dnyVolna: true,
      },
    });

    if (!zamestnanec || !zamestnanec.jeAktivni) {
      return false;
    }

    // Convert date string to Date if needed
    const dateObj: Date = typeof datum === 'string' ? parseDate(datum) : datum;
    // 2. Check if on day off (full-day or time-range exception)
    if (hasDayOffConflict(zamestnanec.dnyVolna, dateObj, casOd, casDo)) {
      return false;
    }

    // 3. Get schedule for that day
    const dayOfWeek = getDayOfWeek(dateObj);
    const schedule = getScheduleForDay(zamestnanec.rozvrh as IRozvrh[] | null, dayOfWeek);

    if (!schedule || !schedule.jePracovniDen) {
      return false;
    }

    // 4. Check if times are within working hours
    if (!isWithinWorkingHours(schedule, casOd, casDo)) {
      return false;
    }

    // 5. Check for booking conflicts
    const hasConflicts = await hasBookingConflicts(
      zamestnanecId,
      dateObj,
      casOd,
      casDo
    );

    if (hasConflicts) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Chyba při kontrole dostupnosti:', error);
    throw error;
  }
}
