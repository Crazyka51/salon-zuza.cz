import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { formatDisplayDate } from "../date"
import type { BlockedTerm, Reservation } from "../types"
import type { DashboardMetrics, OpeningHoursDisplayItem } from "../hooks/useMobileAdminApp"
import { MetricCard } from "./MetricCard"
import { ReservationRow } from "./ReservationRow"
import { SectionCard } from "./SectionCard"
import { StatusChip } from "./StatusChip"
import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface DashboardScreenProps {
  blockedTerms: BlockedTerm[]
  dashboardMetrics: DashboardMetrics
  openingHours: OpeningHoursDisplayItem[]
  onOpenReservation: (reservation: Reservation) => void
  onRefresh: () => void
  refreshing: boolean
  pendingReservations: Reservation[]
  reservations: Reservation[]
}

export function DashboardScreen({
  blockedTerms,
  dashboardMetrics,
  openingHours,
  onOpenReservation,
  onRefresh,
  pendingReservations,
  refreshing,
  reservations,
}: DashboardScreenProps) {
  const [showPendingReservations, setShowPendingReservations] = useState(false)
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <>
      <View style={styles.refreshRow}>
        <Pressable onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>{refreshing ? "Načítání…" : "Obnovit data"}</Text>
        </Pressable>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard label="Dnes" value={dashboardMetrics.today} />
        <MetricCard
          accent="warning"
          label="Čeká potvrzení"
          onPress={
            pendingReservations.length > 0
              ? () => {
                  if (pendingReservations.length === 1) {
                    onOpenReservation(pendingReservations[0])
                    return
                  }
                  setShowPendingReservations((currentValue) => !currentValue)
                }
              : undefined
          }
          value={dashboardMetrics.pending}
        />
        <MetricCard label="Nadcházející" value={dashboardMetrics.upcoming} />
        
      </View>

      {showPendingReservations && pendingReservations.length > 1 ? (
        <SectionCard title="Čekající rezervace">
          {pendingReservations.map((reservation) => (
            <ReservationRow
              key={reservation.id}
              onPress={() => onOpenReservation(reservation)}
              reservation={reservation}
            />
          ))}
        </SectionCard>
      ) : null}

      <SectionCard title="Seznam rezervací">
        {reservations.map((reservation) => (
          <ReservationRow
            key={reservation.id}
            onPress={() => onOpenReservation(reservation)}
            reservation={reservation}
          />
        ))}
        {reservations.length === 0 ? <Text style={styles.emptyText}>Nejsou žádné další rezervace.</Text> : null}
      </SectionCard>

      <SectionCard title="Blokované termíny">
        {blockedTerms.slice(0, 4).map((item) => (
          <View key={item.id} style={styles.inlineRow}>
            <View style={styles.inlineRowContent}>
              <Text style={styles.cardTitle}>{item.nazev}</Text>
              <Text style={styles.cardSubtleText}>
                {formatDisplayDate(item.datumOd)} – {formatDisplayDate(item.datumDo)}
              </Text>
            </View>
            <StatusChip label={item.source === "employee-vacation" ? "Volno" : "Volné dny"} tone="danger" />
          </View>
        ))}
        {blockedTerms.length === 0 ? <Text style={styles.emptyText}>Nejsou nastavené žádné blokované termíny.</Text> : null}
      </SectionCard>

      <SectionCard title="Provozní hodiny">
        {openingHours.map((item) => (
          <View key={item.id} style={styles.inlineRow}>
            <Text style={styles.cardTitle}>{item.denLabel}</Text>
            <Text style={styles.cardSubtleText}>
              {item.jeZavreno ? "Zavřeno" : `${item.casOtevrani} – ${item.casZavreni}`}
            </Text>
          </View>
        ))}
      </SectionCard>
    </>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    refreshRow: {
      alignItems: "flex-end",
    },
    refreshButton: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    refreshButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    inlineRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
    },
    inlineRowContent: {
      flex: 1,
      gap: 4,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    cardSubtleText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
    },
  })
}
