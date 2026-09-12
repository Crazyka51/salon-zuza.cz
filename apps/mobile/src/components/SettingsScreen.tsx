import { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import type { AuthUser } from "../types"
import { SectionCard } from "./SectionCard"
import { useTheme } from "../ThemeContext"
import type { ThemeColors, ThemePreference } from "../theme"

interface SettingsScreenProps {
  onLogout: () => void
  onRefresh: () => void
  onSyncDrafts: () => void
  pendingDrafts: number
  refreshing: boolean
  syncing: boolean
  user: AuthUser
}

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "Systém" },
  { value: "light", label: "Světlý" },
  { value: "dark", label: "Tmavý" },
]

export function SettingsScreen({
  onLogout,
  onRefresh,
  onSyncDrafts,
  pendingDrafts,
  refreshing,
  syncing,
  user,
}: SettingsScreenProps) {
  const { colors, preference, setPreference } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <>
      <SectionCard title="Uživatel">
        <InfoRow label="E-mail" styles={styles} value={user.email} />
        <InfoRow label="Role" styles={styles} value={user.role ?? "neuvedeno"} />
      </SectionCard>

      <SectionCard title="Vzhled">
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((option) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: preference === option.value }}
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={[styles.themeButton, preference === option.value ? styles.themeButtonActive : undefined]}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  preference === option.value ? styles.themeButtonTextActive : undefined,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      <Pressable onPress={onRefresh} style={styles.refreshButton}>
        <Text style={styles.refreshButtonText}>{refreshing ? "Načítání…" : "Obnovit data"}</Text>
      </Pressable>

      {pendingDrafts > 0 ? (
        <Pressable
          disabled={syncing}
          onPress={onSyncDrafts}
          style={[styles.syncButton, syncing ? styles.disabledButton : undefined]}
        >
          <Text style={styles.syncButtonText}>
            {syncing ? "Synchronizuji…" : `Synchronizovat čekající rezervace (${pendingDrafts})`}
          </Text>
        </Pressable>
      ) : null}

      <Pressable onPress={onLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Odhlásit se</Text>
      </Pressable>
    </>
  )
}

interface InfoRowProps {
  label: string
  styles: ReturnType<typeof createStyles>
  value: string
}

function InfoRow({ label, styles, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    infoRow: {
      gap: 4,
    },
    label: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    value: {
      color: colors.textMuted,
      fontSize: 14,
    },
    themeRow: {
      flexDirection: "row",
      gap: 8,
    },
    themeButton: {
      alignItems: "center",
      borderColor: colors.cardBorder,
      borderRadius: 12,
      borderWidth: 1,
      flex: 1,
      paddingVertical: 10,
    },
    themeButtonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    themeButtonText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    themeButtonTextActive: {
      color: colors.accentText,
    },
    refreshButton: {
      alignItems: "center",
      borderColor: colors.cardBorder,
      borderRadius: 14,
      borderWidth: 1,
      paddingVertical: 14,
    },
    refreshButtonText: {
      color: colors.text,
      fontWeight: "700",
    },
    logoutButton: {
      alignItems: "center",
      borderColor: colors.danger,
      borderRadius: 14,
      borderWidth: 1,
      paddingVertical: 14,
    },
    syncButton: {
      alignItems: "center",
      backgroundColor: colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
    },
    syncButtonText: {
      color: colors.accentText,
      fontSize: 15,
      fontWeight: "700",
    },
    disabledButton: {
      opacity: 0.6,
    },
    logoutButtonText: {
      color: colors.dangerText,
      fontWeight: "700",
    },
  })
}
