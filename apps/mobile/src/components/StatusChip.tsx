import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"

import type { ReservationStatus } from "../types"
import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface StatusChipProps {
  label: string
  tone: "default" | "warning" | "success" | "danger"
}

export function StatusChip({ label, tone }: StatusChipProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View
      style={[
        styles.chip,
        tone === "warning" ? styles.warningChip : undefined,
        tone === "success" ? styles.successChip : undefined,
        tone === "danger" ? styles.dangerChip : undefined,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          tone === "warning" ? styles.warningChipText : undefined,
          tone === "success" ? styles.successChipText : undefined,
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

export function statusTone(status: ReservationStatus): "default" | "warning" | "success" | "danger" {
  switch (status) {
    case "pending":
      return "warning"
    case "potvrzeno":
    case "dokonceno":
      return "success"
    case "zruseno_salonem":
    case "zruseno_zakaznikem":
    case "nedorazil":
      return "danger"
    default:
      return "default"
  }
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    chip: {
      alignSelf: "flex-start",
      backgroundColor: colors.chipBackground,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    warningChip: {
      backgroundColor: colors.warningBackground,
    },
    successChip: {
      backgroundColor: colors.successBackground,
    },
    dangerChip: {
      backgroundColor: colors.danger,
    },
    chipText: {
      color: colors.chipText,
      fontSize: 12,
      fontWeight: "700",
    },
    warningChipText: {
      color: colors.warningText,
    },
    successChipText: {
      color: colors.successText,
    },
  })
}
