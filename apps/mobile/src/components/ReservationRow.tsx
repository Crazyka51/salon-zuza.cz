import { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { formatDateTimeRange } from "../date"
import { statusLabel } from "../status"
import type { Reservation } from "../types"
import { StatusChip, statusTone } from "./StatusChip"
import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface ReservationRowProps {
  onPress: () => void
  reservation: Reservation
}

export function ReservationRow({ onPress, reservation }: ReservationRowProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.main}>
        <Text style={styles.title}>
          {reservation.jmeno} {reservation.prijmeni}
        </Text>
        <Text style={styles.subtleText}>
          {formatDateTimeRange(reservation.datum, reservation.casOd, reservation.casDo)}
        </Text>
        <Text style={styles.subtleText}>
          {reservation.sluzba?.nazev ?? reservation.sluzby ?? "Bez služby"}
        </Text>
      </View>
      <View style={styles.badges}>
        {reservation.isDraft ? <StatusChip label="Lokální draft" tone="warning" /> : null}
        <StatusChip label={statusLabel(reservation.stav)} tone={statusTone(reservation.stav)} />
      </View>
    </Pressable>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      alignItems: "center",
      borderColor: colors.cardBorder,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
      padding: 14,
    },
    main: {
      flex: 1,
      gap: 4,
    },
    title: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    subtleText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    badges: {
      alignItems: "flex-end",
      gap: 6,
    },
  })
}
