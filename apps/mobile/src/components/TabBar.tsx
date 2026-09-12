import { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import type { ScreenKey } from "../hooks/useMobileAdminApp"
import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface TabBarProps {
  currentScreen: ScreenKey
  onScreenChange: (screen: ScreenKey) => void
}

const SCREEN_OPTIONS: Array<{ key: ScreenKey; label: string }> = [
  { key: "dashboard", label: "Přehled" },
  { key: "calendar", label: "Kalendář" },
  { key: "reservations", label: "Rezervace" },
  { key: "settings", label: "Nastavení" },
]

export function TabBar({ currentScreen, onScreenChange }: TabBarProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={styles.row}>
      {SCREEN_OPTIONS.map((option) => (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: currentScreen === option.key }}
          key={option.key}
          onPress={() => onScreenChange(option.key)}
          style={[styles.button, currentScreen === option.key ? styles.buttonActive : undefined]}
        >
          <Text
            style={[
              styles.buttonText,
              currentScreen === option.key ? styles.buttonTextActive : undefined,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    button: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
      borderRadius: 999,
      borderWidth: 1,
      flex: 1,
      paddingVertical: 10,
    },
    buttonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    buttonText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
    buttonTextActive: {
      color: colors.accentText,
    },
  })
}
