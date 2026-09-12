import { Fragment, useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { formatDisplayDate, isSameDay } from "../date"
import type { Reservation } from "../types"
import type { CalendarViewMode } from "../hooks/useMobileAdminApp"
import { ReservationRow } from "./ReservationRow"
import { SectionCard } from "./SectionCard"
import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface CalendarScreenProps {
  month: Date
  onMonthChange: (offset: number) => void
  onOpenReservation: (reservation: Reservation) => void
  reservations: Reservation[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onViewModeChange: (mode: CalendarViewMode) => void
  viewMode: CalendarViewMode
}

const WEEKDAYS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]

function startOfCalendarGrid(month: Date): Date {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const mondayOffset = (firstDay.getDay() + 6) % 7
  return new Date(month.getFullYear(), month.getMonth(), 1 - mondayOffset)
}

function getCalendarDays(month: Date): Date[] {
  const start = startOfCalendarGrid(month)
  return Array.from({ length: 42 }, (_, index) => {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
  })
}

function monthLabel(month: Date): string {
  return new Intl.DateTimeFormat("cs-CZ", { month: "long", year: "numeric" }).format(month)
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

function startOfWeek(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % 7))
}

function toDateValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function SelectedDayReservations({
  onOpenReservation,
  reservations,
  selectedDate,
  styles,
}: {
  onOpenReservation: (reservation: Reservation) => void
  reservations: Reservation[]
  selectedDate: Date
  styles: ReturnType<typeof createStyles>
}) {
  const selectedReservations = reservations.filter((reservation) =>
    isSameDay(reservation.datum, selectedDate)
  )

  return (
    <View style={styles.inlineDetails}>
      <Text style={styles.inlineDetailsTitle}>
        Rezervace {formatDisplayDate(toDateValue(selectedDate))} ({selectedReservations.length})
      </Text>
      {selectedReservations.length === 0 ? (
        <Text style={styles.emptyText}>Na tento den nejsou žádné rezervace.</Text>
      ) : (
        selectedReservations.map((reservation) => (
          <ReservationRow key={reservation.id} onPress={() => onOpenReservation(reservation)} reservation={reservation} />
        ))
      )}
    </View>
  )
}

export function CalendarScreen({
  month,
  onMonthChange,
  onOpenReservation,
  reservations,
  selectedDate,
  onDateChange,
  onViewModeChange,
  viewMode,
}: CalendarScreenProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const calendarDays = getCalendarDays(month)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(selectedDate), index))
  const moveCalendar = (offset: number) => {
    if (viewMode === "day") {
      onDateChange(addDays(selectedDate, offset))
      return
    }

    if (viewMode === "week") {
      onDateChange(addDays(selectedDate, offset * 7))
      return
    }

    onMonthChange(offset)
  }

  return (
    <>
      <SectionCard title="Kalendář rezervací">
        <View style={styles.viewModeRow}>
          {([
            ["month", "Měsíc"],
            ["week", "Týden"],
            ["day", "Den"],
          ] as const).map(([mode, label]) => (
            <Pressable
              key={mode}
              onPress={() => onViewModeChange(mode)}
              style={[styles.viewModeButton, viewMode === mode ? styles.viewModeButtonActive : undefined]}
            >
              <Text style={[styles.viewModeText, viewMode === mode ? styles.viewModeTextActive : undefined]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.monthHeader}>
          <Pressable accessibilityLabel="Předchozí období" onPress={() => moveCalendar(-1)} style={styles.arrow}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>
            {viewMode === "month" ? monthLabel(month) : viewMode === "week"
              ? `${formatDisplayDate(toDateValue(weekDays[0]))} – ${formatDisplayDate(toDateValue(weekDays[6]))}`
              : formatDisplayDate(toDateValue(selectedDate))}
          </Text>
          <Pressable accessibilityLabel="Další období" onPress={() => moveCalendar(1)} style={styles.arrow}>
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>

        {viewMode === "month" ? (
          <>
            <View style={styles.weekRow}>
              {WEEKDAYS.map((day) => (
                <Text key={day} style={styles.weekday}>{day}</Text>
              ))}
            </View>
            <View style={styles.grid}>
              {calendarDays.map((day) => {
            const dayReservations = reservations.filter((reservation) => isSameDay(reservation.datum, day))
            const isCurrentMonth = day.getMonth() === month.getMonth()
            const isSelected = isSameDay(
              `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`,
              day
            )

                return (
              <Pressable
                accessibilityLabel={`${day.getDate()}. ${day.getMonth() + 1}. ${day.getFullYear()}, ${dayReservations.length} rezervací`}
                key={dateKey(day)}
                onPress={() => onDateChange(day)}
                style={[styles.day, !isCurrentMonth ? styles.outsideDay : undefined, isSelected ? styles.selectedDay : undefined]}
              >
                <Text style={[styles.dayNumber, !isCurrentMonth ? styles.outsideText : undefined, isSelected ? styles.selectedText : undefined]}>
                  {day.getDate()}
                </Text>
                {dayReservations.length > 0 ? (
                  <View style={[styles.countBadge, isSelected ? styles.selectedCountBadge : undefined]}>
                    <Text style={[styles.countText, isSelected ? styles.selectedText : undefined]}>{dayReservations.length}</Text>
                  </View>
                ) : null}
              </Pressable>
                )
              })}
            </View>
            <SelectedDayReservations
              onOpenReservation={onOpenReservation}
              reservations={reservations}
              selectedDate={selectedDate}
              styles={styles}
            />
          </>
        ) : (
          <View style={styles.list}>
            {(viewMode === "week" ? weekDays : [selectedDate]).map((day) => {
              const dayReservations = reservations.filter((reservation) => isSameDay(reservation.datum, day))
              return (
                <Fragment key={dateKey(day)}>
                  <Pressable
                    onPress={() => onDateChange(day)}
                    style={[styles.listDay, isSameDay(toDateValue(day), selectedDate) ? styles.listDaySelected : undefined]}
                  >
                    <Text style={styles.listDayTitle}>{WEEKDAYS[(day.getDay() + 6) % 7]} {formatDisplayDate(toDateValue(day))}</Text>
                    <Text style={styles.listDayCount}>{dayReservations.length} rezervací</Text>
                  </Pressable>
                  {isSameDay(toDateValue(day), selectedDate) ? (
                    <SelectedDayReservations
                      onOpenReservation={onOpenReservation}
                      reservations={reservations}
                      selectedDate={selectedDate}
                      styles={styles}
                    />
                  ) : null}
                </Fragment>
              )
            })}
          </View>
        )}
      </SectionCard>
    </>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    viewModeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
    viewModeButton: { borderColor: colors.cardBorder, borderRadius: 10, borderWidth: 1, flex: 1, paddingVertical: 10 },
    viewModeButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    viewModeText: { color: colors.textMuted, fontSize: 13, fontWeight: "600", textAlign: "center" },
    viewModeTextActive: { color: colors.accentText },
    monthHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
    monthTitle: { color: colors.text, fontSize: 18, fontWeight: "700", textTransform: "capitalize" },
    arrow: { alignItems: "center", backgroundColor: colors.cardBorder, borderRadius: 20, height: 36, justifyContent: "center", width: 36 },
    arrowText: { color: colors.accent, fontSize: 28, lineHeight: 30 },
    weekRow: { flexDirection: "row", marginBottom: 8 },
    weekday: { color: colors.textMuted, flex: 1, fontSize: 12, fontWeight: "600", textAlign: "center" },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    day: { alignItems: "center", borderColor: colors.cardBorder, borderRadius: 10, borderWidth: 1, height: 48, justifyContent: "center", margin: 2, width: "13.5%" },
    selectedDay: { backgroundColor: colors.accent, borderColor: colors.accent },
    outsideDay: { opacity: 0.45 },
    dayNumber: { color: colors.text, fontSize: 14, fontWeight: "600" },
    outsideText: { color: colors.textMuted },
    selectedText: { color: colors.accentText },
    countBadge: { backgroundColor: colors.accent, borderRadius: 8, minWidth: 16, paddingHorizontal: 4 },
    selectedCountBadge: { backgroundColor: colors.accentText },
    countText: { color: colors.accentText, fontSize: 10, fontWeight: "700", textAlign: "center" },
    emptyText: { color: colors.textMuted, fontSize: 14 },
    list: { gap: 8 },
    listDay: { backgroundColor: colors.inputBackground, borderColor: colors.cardBorder, borderRadius: 10, borderWidth: 1, padding: 12 },
    listDaySelected: { backgroundColor: colors.warningBackground, borderColor: colors.accent },
    listDayTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
    listDayCount: { color: colors.accent, fontSize: 12, marginTop: 4 },
    inlineDetails: { backgroundColor: colors.card, borderColor: colors.accent, borderRadius: 10, borderWidth: 1, gap: 8, marginBottom: 8, padding: 10 },
    inlineDetailsTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  })
}
