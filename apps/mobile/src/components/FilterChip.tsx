import { useMemo } from "react"
import { Pressable, StyleSheet, Text } from "react-native"

import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface FilterChipProps {
  isActive: boolean
  label: string
  onPress: () => void
}

export function FilterChip({ isActive, label, onPress }: FilterChipProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={[styles.chip, isActive ? styles.chipActive : undefined]}
    >
      <Text style={[styles.chipText, isActive ? styles.chipTextActive : undefined]}>{label}</Text>
    </Pressable>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    chip: {
      backgroundColor: colors.inputBackground,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      marginRight: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    chipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    chipText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    chipTextActive: {
      color: colors.accentText,
    },
  })
}
