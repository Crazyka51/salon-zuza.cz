import { useMemo } from "react"
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

import { formatDateTimeRange } from "../date"
import { statusLabel, STATUS_OPTIONS } from "../status"
import type { Reservation, ReservationStatus } from "../types"
import { SectionCard } from "./SectionCard"
import { StatusChip, statusTone } from "./StatusChip"
import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface ReservationDetailSheetProps {
  hasLocalChanges: boolean
  onChangeStatus: (status: ReservationStatus) => void
  onClose: () => void
  onDelete: () => void
  onOpenEmail: (value?: string | null) => void
  onOpenPhone: (value?: string | null) => void
  reservation: Reservation
  savingStatus: ReservationStatus | null
}

export function ReservationDetailSheet({
  hasLocalChanges,
  onChangeStatus,
  onClose,
  onDelete,
  onOpenEmail,
  onOpenPhone,
  reservation,
  savingStatus,
}: ReservationDetailSheetProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <View style={styles.sheet}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              {reservation.jmeno} {reservation.prijmeni}
            </Text>
            <Text style={styles.subtleText}>
              {formatDateTimeRange(reservation.datum, reservation.casOd, reservation.casDo)}
            </Text>
          </View>
          <Pressable onPress={onClose}>
            <Text style={styles.closeText}>Zavřít</Text>
          </Pressable>
        </View>

        <StatusChip label={statusLabel(reservation.stav)} tone={statusTone(reservation.stav)} />
        {reservation.isDraft ? <StatusChip label="Lokální draft rezervace" tone="warning" /> : null}

        <Text style={styles.previewNotice}>
          {reservation.isDraft
            ? "Tato rezervace čeká na uložení do administrace."
            : hasLocalChanges
              ? "Rezervace obsahuje starší lokální změnu, která bude při další změně synchronizována."
              : "Změny stavu se ukládají přímo do administrace."}
        </Text>

        <SectionCard title="Detail rezervace">
          <DetailRow label="Služba" styles={styles} value={reservation.sluzba?.nazev ?? reservation.sluzby ?? "Neuvedeno"} />
          <DetailRow
            label="Zaměstnanec"
            styles={styles}
            value={
              reservation.zamestnanec
                ? `${reservation.zamestnanec.jmeno} ${reservation.zamestnanec.prijmeni}`
                : reservation.kadernice ?? "Bez přiřazení"
            }
          />
          <DetailRow label="Poznámka" styles={styles} value={reservation.poznamka || "Bez poznámky"} />
        </SectionCard>

        <View style={styles.actionRow}>
          <Pressable onPress={() => onOpenPhone(reservation.telefon)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Zavolat</Text>
          </Pressable>
          <Pressable onPress={() => onOpenEmail(reservation.email)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>E-mail</Text>
          </Pressable>
        </View>

        {!reservation.isDraft ? (
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Smazat rezervaci</Text>
          </Pressable>
        ) : null}

        <View style={styles.statusActionGrid}>
          {STATUS_OPTIONS.map((option) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: reservation.stav === option.value }}
              key={option.value}
              onPress={() => onChangeStatus(option.value)}
              style={[
                styles.statusButton,
                reservation.stav === option.value ? styles.statusButtonActive : undefined,
              ]}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  reservation.stav === option.value ? styles.statusButtonTextActive : undefined,
                ]}
              >
                {savingStatus === option.value ? "Ukládám…" : option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

interface DetailRowProps {
  label: string
  styles: ReturnType<typeof createStyles>
  value: string
}

function DetailRow({ label, styles, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.subtleText}>{value}</Text>
    </View>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    sheet: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 1,
      bottom: Platform.OS === "android" ? 28 : 0,
      gap: 12,
      left: 0,
      padding: 16,
      position: "absolute",
      right: 0,
      maxHeight: "85%",
      overflow: "hidden",
    },
    scrollContent: {
      gap: 12,
      paddingBottom: 8,
    },
    header: {
      alignItems: "flex-start",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
    subtleText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    previewNotice: {
      color: colors.accent,
      fontSize: 13,
      lineHeight: 18,
    },
    closeText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: "700",
    },
    actionRow: {
      flexDirection: "row",
      gap: 10,
    },
    secondaryButton: {
      borderColor: colors.cardBorder,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    statusActionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    statusButton: {
      borderColor: colors.cardBorder,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    statusButtonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    statusButtonText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    statusButtonTextActive: {
      color: colors.accentText,
    },
    detailRow: {
      gap: 4,
    },
    detailLabel: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    deleteButton: {
      alignItems: "center",
      borderColor: colors.danger,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 10,
    },
    deleteButtonText: {
      color: colors.dangerText,
      fontWeight: "700",
    },
  })
}
