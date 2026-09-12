import type { ReservationStatus } from "./types"

export const STATUS_OPTIONS: Array<{ value: ReservationStatus; label: string }> = [
  { value: "pending", label: "Čeká na potvrzení" },
  { value: "potvrzeno", label: "Potvrzeno" },
  { value: "dokonceno", label: "Dokončeno" },
  { value: "zruseno_zakaznikem", label: "Zrušeno zákazníkem" },
  { value: "zruseno_salonem", label: "Zrušeno salonem" },
  { value: "nedorazil", label: "Nedorazil" },
]

export function statusLabel(status: ReservationStatus): string {
  const match = STATUS_OPTIONS.find((option) => option.value === status)
  return match?.label ?? status
}
