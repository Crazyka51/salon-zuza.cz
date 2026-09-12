import { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface MetricCardProps {
  accent?: "default" | "warning" | "danger"
  label: string
  onPress?: () => void
  value: number
}

export function MetricCard({ accent = "default", label, onPress, value }: MetricCardProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.card,
        accent === "warning" ? styles.warningCard : undefined,
        accent === "danger" ? styles.dangerCard : undefined,
      ]}
    >
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
      borderRadius: 18,
      borderWidth: 1,
      minWidth: "47%",
      padding: 16,
    },
    warningCard: {
      backgroundColor: colors.warningBackground,
      borderColor: colors.accent,
    },
    dangerCard: {
      backgroundColor: colors.dangerBackground,
      borderColor: colors.danger,
    },
    value: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "700",
    },
    label: {
      color: colors.textMuted,
      fontSize: 13,
      marginTop: 4,
    },
  })
}
