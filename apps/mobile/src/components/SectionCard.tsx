import type { ReactNode } from "react"
import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"

import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface SectionCardProps {
  children: ReactNode
  title: string
}

export function SectionCard({ children, title }: SectionCardProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    body: {
      gap: 12,
      marginTop: 14,
    },
  })
}
