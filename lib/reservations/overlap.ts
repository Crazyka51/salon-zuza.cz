/**
 * Reservation Time Overlap Detection
 * 
 * Core business logic for checking if two time slots overlap.
 * Used for preventing double-booking employee time slots.
 * 
 * @module lib/reservations/overlap
 */

export interface TimeSlot {
  od: string; // HH:MM format
  do: string; // HH:MM format
}

/**
 * Convert HH:MM time string to minutes since midnight
 * @param time - Time in HH:MM format
 * @returns Number of minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if two time slots overlap
 * 
 * Detects all three overlap scenarios:
 * 1. Existing slot starts before new slot, overlaps at start
 *    [----existing----]
 *              [-----new-----]
 * 
 * 2. Existing slot starts after new slot, overlaps at end
 *         [----new----]
 *              [-----existing-----]
 * 
 * 3. Existing slot is completely within new slot
 *         [-----new-----]
 *            [--existing--]
 * 
 * @param existingSlot - The already booked time slot
 * @param newSlot - The requested time slot
 * @returns true if slots overlap, false otherwise
 * 
 * @example
 * // Overlaps (case 1)
 * hasOverlap(
 *   { od: '09:00', do: '10:00' },
 *   { od: '09:30', do: '11:00' }
 * ) // true
 * 
 * @example
 * // No overlap
 * hasOverlap(
 *   { od: '09:00', do: '10:00' },
 *   { od: '10:00', do: '11:00' }
 * ) // false - they're back-to-back
 */
export function hasOverlap(existingSlot: TimeSlot, newSlot: TimeSlot): boolean {
  const existingStart = timeToMinutes(existingSlot.od);
  const existingEnd = timeToMinutes(existingSlot.do);
  const newStart = timeToMinutes(newSlot.od);
  const newEnd = timeToMinutes(newSlot.do);

  // Case 1: Existing starts before new, overlaps at start
  // [----existing----]
  //        [-----new-----]
  // Condition: existingStart <= newStart AND existingEnd > newStart
  const case1 = existingStart <= newStart && existingEnd > newStart;

  // Case 2: Existing starts after new, overlaps at end
  //      [----new----]
  //          [-----existing-----]
  // Condition: newStart <= existingStart AND newEnd > existingStart
  const case2 = newStart <= existingStart && newEnd > existingStart;

  // Case 3: Existing is completely within new
  //      [-----new-----]
  //         [--existing--]
  // Condition: newStart <= existingStart AND existingEnd <= newEnd
  const case3 = newStart <= existingStart && existingEnd <= newEnd;

  return case1 || case2 || case3;
}

/**
 * Check if any time slot in a list overlaps with a given slot
 * @param newSlot - The requested time slot
 * @param existingSlots - Array of already booked slots
 * @returns true if any existing slot overlaps with newSlot
 */
export function hasAnyOverlap(
  newSlot: TimeSlot,
  existingSlots: TimeSlot[]
): boolean {
  return existingSlots.some((slot) => hasOverlap(slot, newSlot));
}

/**
 * Get all overlapping slots from a list
 * Useful for debugging or providing detailed conflict information
 * @param newSlot - The requested time slot
 * @param existingSlots - Array of already booked slots
 * @returns Array of slots that overlap with newSlot
 */
export function getOverlappingSlots(
  newSlot: TimeSlot,
  existingSlots: TimeSlot[]
): TimeSlot[] {
  return existingSlots.filter((slot) => hasOverlap(slot, newSlot));
}
