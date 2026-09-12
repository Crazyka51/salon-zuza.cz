import { useMemo } from "react"
import { ScrollView, StyleSheet, Text } from "react-native"

import { STATUS_OPTIONS } from "../status"
import type { Employee, LocalDraftInput, Reservation, ReservationStatus, Service } from "../types"
import { FilterChip } from "./FilterChip"
import { LocalDraftReservationForm } from "./LocalDraftReservationForm"
import { ReservationRow } from "./ReservationRow"
import { SectionCard } from "./SectionCard"
import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface ReservationsScreenProps {
  employeeFilter: number | "all"
  employees: Employee[]
  onCreateDraft: (input: LocalDraftInput) => void
  onFetchAvailableTimes: (params: {
    datum: string
    sluzbaId: number
    zamestnanecId: number | null
  }) => Promise<string[]>
  onEmployeeFilterChange: (value: number | "all") => void
  onOpenReservation: (reservation: Reservation) => void
  onStatusFilterChange: (value: ReservationStatus | "all") => void
  reservations: Reservation[]
  services: Service[]
  statusFilter: ReservationStatus | "all"
}

export function ReservationsScreen({
  employeeFilter,
  employees,
  onCreateDraft,
  onFetchAvailableTimes,
  onEmployeeFilterChange,
  onOpenReservation,
  onStatusFilterChange,
  reservations,
  services,
  statusFilter,
}: ReservationsScreenProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <>
      <LocalDraftReservationForm
        employees={employees}
        onCreateDraft={onCreateDraft}
        onFetchAvailableTimes={onFetchAvailableTimes}
        services={services}
      />

      <SectionCard title="Filtry">
        <Text style={styles.inputLabel}>Stav</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterChip isActive={statusFilter === "all"} label="Vše" onPress={() => onStatusFilterChange("all")} />
          {STATUS_OPTIONS.map((option) => (
            <FilterChip
              isActive={statusFilter === option.value}
              key={option.value}
              label={option.label}
              onPress={() => onStatusFilterChange(option.value)}
            />
          ))}
        </ScrollView>

        <Text style={styles.inputLabel}>Zaměstnanec</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterChip isActive={employeeFilter === "all"} label="Všichni" onPress={() => onEmployeeFilterChange("all")} />
          {employees.map((employee) => (
            <FilterChip
              isActive={employeeFilter === employee.id}
              key={employee.id}
              label={`${employee.jmeno} ${employee.prijmeni}`}
              onPress={() => onEmployeeFilterChange(employee.id)}
            />
          ))}
        </ScrollView>
      </SectionCard>

      <SectionCard title={`Rezervace (${reservations.length})`}>
        {reservations.map((reservation) => (
          <ReservationRow
            key={reservation.id}
            onPress={() => onOpenReservation(reservation)}
            reservation={reservation}
          />
        ))}
        {reservations.length === 0 ? <Text style={styles.emptyText}>Filtru neodpovídá žádná rezervace.</Text> : null}
      </SectionCard>
    </>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    inputLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
    },
  })
}
