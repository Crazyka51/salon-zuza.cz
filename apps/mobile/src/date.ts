import type { Reservation } from "./types"

const DATE_FORMATTER = new Intl.DateTimeFormat("cs-CZ", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function parseLocalDate(value: string): Date | null {
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const isoDateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})T/)
  if (isoDateOnlyMatch) {
    const [, year, month, day] = isoDateOnlyMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function dateValueTimestamp(value: string): number | null {
  const date = parseLocalDate(value)
  return date ? date.getTime() : null
}

export function formatApiDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function formatDisplayDate(value: string): string {
  const date = parseLocalDate(value)
  if (!date) {
    return value
  }

  return DATE_FORMATTER.format(date)
}

export function formatDateTimeRange(datum: string, casOd?: string, casDo?: string): string {
  const formattedDate = formatDisplayDate(datum)

  if (!casOd) {
    return formattedDate
  }

  return `${formattedDate} • ${casOd}${casDo ? `–${casDo}` : ""}`
}

export function isSameDay(dateValue: string, target: Date): boolean {
  const date = parseLocalDate(dateValue)
  if (!date) {
    return false
  }

  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  )
}

export function isToday(dateValue: string): boolean {
  return isSameDay(dateValue, new Date())
}

export function startOfToday(): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export function reservationStartTimestamp(reservation: Reservation): number {
  const baseDate = parseLocalDate(reservation.datum)
  if (!baseDate) {
    return Number.NaN
  }

  const [hours, minutes] = (reservation.casOd ?? "00:00").split(":").map(Number)
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours ?? 0,
    minutes ?? 0,
    0,
    0
  ).getTime()
}

export function sortReservationsByDateTime(left: Reservation, right: Reservation): number {
  return reservationStartTimestamp(left) - reservationStartTimestamp(right)
}
