import type { Employee, LocalDraftInput, Reservation, Service } from "./types"

function priceForEmployeeLevel(service: Service, employee?: Employee | null): number {
  switch (employee?.uroven) {
    case "top_stylist":
      return service.cenaTopStylist
    case "junior_stylist":
      return service.cenaJuniorStylist
    default:
      return service.cenaStylist
  }
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hours, minutes] = time.split(":").map(Number)
  const totalMinutesInDay = 24 * 60
  const totalMinutes = (hours * 60 + minutes + minutesToAdd) % totalMinutesInDay
  const normalizedMinutes = totalMinutes < 0 ? totalMinutes + totalMinutesInDay : totalMinutes
  const endHours = Math.floor(normalizedMinutes / 60)
  const endMinutes = normalizedMinutes % 60

  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`
}

export function createLocalDraftReservation(args: {
  draftId: number
  input: LocalDraftInput
  employee?: Employee | null
  service?: Service | null
}): Reservation {
  const { draftId, employee, input, service } = args
  const duration = service?.dobaTrvaniMinuty ?? 60

  return {
    id: draftId,
    jmeno: input.jmeno.trim(),
    prijmeni: input.prijmeni.trim(),
    email: input.email.trim() || null,
    telefon: input.telefon.trim() || null,
    datum: input.datum,
    casOd: input.casOd,
    casDo: addMinutesToTime(input.casOd, duration),
    zamestnanecId: employee?.id ?? input.zamestnanecId,
    kadernice: employee ? `${employee.jmeno} ${employee.prijmeni}` : null,
    poznamka: input.poznamka.trim() || null,
    sluzby: service?.nazev ?? "Lokální draft služby",
    stav: "pending",
    cena: service ? priceForEmployeeLevel(service, employee) : 0,
    sluzba: service
      ? {
          nazev: service.nazev,
          kategorie: service.kategorie ?? undefined,
        }
      : null,
    zamestnanec: employee
      ? {
          jmeno: employee.jmeno,
          prijmeni: employee.prijmeni,
          uroven: employee.uroven,
        }
      : null,
    source: "local-draft",
    isDraft: true,
    draftInput: input,
  }
}
