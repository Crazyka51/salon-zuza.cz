import { useEffect, useMemo, useState } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"

import { formatApiDate } from "../date"
import type { Employee, LocalDraftInput, Service } from "../types"
import { FilterChip } from "./FilterChip"
import { SectionCard } from "./SectionCard"
import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface LocalDraftReservationFormProps {
  employees: Employee[]
  onCreateDraft: (input: LocalDraftInput) => void | Promise<void>
  onFetchAvailableTimes: (params: {
    datum: string
    sluzbaId: number
    zamestnanecId: number | null
  }) => Promise<string[]>
  services: Service[]
}

const DEFAULT_FORM_STATE: LocalDraftInput = {
  jmeno: "",
  prijmeni: "",
  telefon: "",
  email: "",
  datum: "",
  casOd: "",
  zamestnanecId: null,
  sluzbaId: null,
  poznamka: "",
}

function getCalendarDays(month: Date): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const mondayOffset = (firstDay.getDay() + 6) % 7
  return Array.from({ length: 42 }, (_, index) =>
    new Date(month.getFullYear(), month.getMonth(), index - mondayOffset + 1)
  )
}

export function LocalDraftReservationForm({
  employees,
  onCreateDraft,
  onFetchAvailableTimes,
  services,
}: LocalDraftReservationFormProps) {
  const [formState, setFormState] = useState<LocalDraftInput>(DEFAULT_FORM_STATE)
  const [isExpanded, setIsExpanded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [pickerDate, setPickerDate] = useState(new Date())
  const [pickerMonth, setPickerMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [pickerTime, setPickerTime] = useState(new Date())
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isLoadingTimes, setIsLoadingTimes] = useState(false)
  const [timeLoadError, setTimeLoadError] = useState<string | null>(null)
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  const selectedService = useMemo(
    () => services.find((service) => service.id === formState.sluzbaId) ?? null,
    [formState.sluzbaId, services]
  )

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === formState.zamestnanecId) ?? null,
    [employees, formState.zamestnanecId]
  )

  const servicesByCategory = useMemo(() => {
    const groups = new Map<string, Service[]>()
    for (const service of services) {
      const category = service.kategorie?.nazev?.trim() || "Ostatní"
      const categoryServices = groups.get(category) ?? []
      categoryServices.push(service)
      groups.set(category, categoryServices)
    }
    return Array.from(groups.entries())
  }, [services])

  useEffect(() => {
    if (!formState.datum || !formState.sluzbaId) {
      setAvailableTimes([])
      return
    }

    let isCurrentRequest = true
    setIsLoadingTimes(true)
    setTimeLoadError(null)

    void onFetchAvailableTimes({
      datum: formState.datum,
      sluzbaId: formState.sluzbaId,
      zamestnanecId: formState.zamestnanecId,
    })
      .then((times) => {
        if (!isCurrentRequest) return
        setAvailableTimes(times)
        setFormState((currentState) =>
          currentState.casOd && !times.includes(currentState.casOd)
            ? { ...currentState, casOd: "" }
            : currentState
        )
      })
      .catch(() => {
        if (isCurrentRequest) {
          setAvailableTimes([])
          setTimeLoadError("Volné časy se nepodařilo načíst. Zkontrolujte připojení k serveru.")
        }
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoadingTimes(false)
      })

    return () => {
      isCurrentRequest = false
    }
  }, [formState.datum, formState.sluzbaId, formState.zamestnanecId, onFetchAvailableTimes])

  const helperText = useMemo(() => {
    if (!selectedService) {
      return "Vyber službu, datum a zaměstnance pro vytvoření lokálního draftu."
    }

    const employeeName = selectedEmployee
      ? `${selectedEmployee.jmeno} ${selectedEmployee.prijmeni}`
      : "bez zaměstnance"

    return `Draft bude vytvořen pro službu „${selectedService.nazev}“ a ${employeeName}.`
  }, [selectedEmployee, selectedService])

  const updateField = <Key extends keyof LocalDraftInput>(field: Key, value: LocalDraftInput[Key]) => {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }))
  }

  const submitDraft = () => {
    if (!formState.jmeno.trim() || !formState.prijmeni.trim() || !formState.telefon.trim()) {
      setErrorMessage("Vyplň jméno, příjmení a telefon.")
      return
    }

    if (!formState.datum.trim()) {
      setErrorMessage("Vyber datum.")
      return
    }

    if (!formState.casOd.trim()) {
      setErrorMessage("Vyber čas začátku.")
      return
    }

    if (!formState.sluzbaId) {
      setErrorMessage("Vyber službu.")
      return
    }

    setErrorMessage(null)
    onCreateDraft(formState)
    setFormState(DEFAULT_FORM_STATE)
    setIsExpanded(false)
  }

  return (
    <SectionCard title="Nová rezervace">
      <Text style={styles.noticeText}>
        Rezervace se uloží přímo do databáze. Pokud dojde k výpadku připojení, zůstane bezpečně uložená v zařízení a po obnovení internetu ji bude možné synchronizovat
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        onPress={() => setIsExpanded((currentValue) => !currentValue)}
        style={styles.toggleButton}
      >
        <Text style={styles.toggleButtonText}>{isExpanded ? "Skrýt formulář" : "Otevřít formulář"}</Text>
      </Pressable>

      {isExpanded ? (
        <View style={styles.formBody}>
          <Text style={styles.inputLabel}>Jméno</Text>
          <TextInput
            onChangeText={(value) => updateField("jmeno", value)}
            placeholder="Jméno klienta"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
            value={formState.jmeno}
          />

          <Text style={styles.inputLabel}>Příjmení</Text>
          <TextInput
            onChangeText={(value) => updateField("prijmeni", value)}
            placeholder="Příjmení klienta"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
            value={formState.prijmeni}
          />

          <Text style={styles.inputLabel}>Telefon</Text>
          <TextInput
            keyboardType="phone-pad"
            onChangeText={(value) => updateField("telefon", value)}
            placeholder="+420..."
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
            value={formState.telefon}
          />

          <Text style={styles.inputLabel}>E-mail</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(value) => updateField("email", value)}
            placeholder="volitelný@email.cz"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
            value={formState.email}
          />

          <Text style={styles.inputLabel}>Služba</Text>
          {servicesByCategory.map(([category, categoryServices]) => (
           <View key={category} style={styles.serviceCategory}>
             <Text style={styles.categoryLabel}>{category}</Text>
             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
               {categoryServices.map((service) => (
                 <FilterChip
                   isActive={formState.sluzbaId === service.id}
                   key={service.id}
                   label={service.nazev}
                   onPress={() => updateField("sluzbaId", service.id)}
                 />
               ))}
             </ScrollView>
           </View>
          ))}

          <Text style={styles.inputLabel}>Datum</Text>
          <Pressable
            onPress={() => {
              setPickerMonth(new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1))
              setShowDatePicker(true)
            }}
            style={styles.input}
          >
            <Text style={formState.datum ? styles.inputText : styles.inputPlaceholder}>
              {formState.datum || "Klikni pro výběr datumu"}
            </Text>
          </Pressable>
          <Modal animationType="slide" onRequestClose={() => setShowDatePicker(false)} transparent visible={showDatePicker}>
            <View style={styles.modalBackdrop}>
              <View style={styles.pickerCard}>
                <Text style={styles.pickerTitle}>Vyberte datum</Text>
                <View style={styles.monthHeader}>
                  <Pressable
                    accessibilityLabel="Předchozí měsíc"
                    onPress={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1))}
                    style={styles.monthButton}
                  >
                    <Text style={styles.monthButtonText}>‹</Text>
                  </Pressable>
                  <Text style={styles.monthTitle}>
                    {pickerMonth.toLocaleDateString("cs-CZ", { month: "long", year: "numeric" })}
                  </Text>
                  <Pressable
                    accessibilityLabel="Následující měsíc"
                    onPress={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1))}
                    style={styles.monthButton}
                  >
                    <Text style={styles.monthButtonText}>›</Text>
                  </Pressable>
                </View>
                <View style={styles.weekRow}>
                  {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day) => (
                    <Text key={day} style={styles.weekDay}>{day}</Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {getCalendarDays(pickerMonth).map((date, index) => {
                    const isSelected = formatApiDate(date) === formatApiDate(pickerDate)
                    const isCurrentMonth = date.getMonth() === pickerMonth.getMonth()
                    return (
                      <Pressable
                        key={`${date.toISOString()}-${index}`}
                        disabled={!isCurrentMonth}
                        onPress={() => {
                          setPickerDate(date)
                          updateField("datum", formatApiDate(date))
                          setShowDatePicker(false)
                        }}
                        style={[styles.dayButton, isSelected && styles.selectedDayButton]}
                      >
                        <Text style={[styles.dayText, !isCurrentMonth && styles.mutedDayText, isSelected && styles.selectedDayText]}>
                          {date.getDate()}
                        </Text>
                      </Pressable>
                    )
                  })}
                </View>
                <Pressable onPress={() => setShowDatePicker(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Zrušit</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Text style={styles.inputLabel}>Začátek</Text>
          <Pressable
            onPress={() => setShowTimePicker(true)}
            style={styles.input}
          >
            <Text style={formState.casOd ? styles.inputText : styles.inputPlaceholder}>
              {formState.casOd || "Klikni pro výběr času"}
            </Text>
          </Pressable>
          <Modal animationType="slide" onRequestClose={() => setShowTimePicker(false)} transparent visible={showTimePicker}>
            <View style={styles.modalBackdrop}>
              <View style={styles.pickerCard}>
                <Text style={styles.pickerTitle}>Vyberte čas</Text>
                <View style={styles.timeGrid}>
                  {isLoadingTimes ? <Text style={styles.helperText}>Načítám volné časy…</Text> : null}
                  {!isLoadingTimes && availableTimes.length === 0 ? (
                    <Text style={styles.helperText}>
                      {timeLoadError ?? "Pro zvolené datum a službu nejsou volné časy."}
                    </Text>
                  ) : null}
                  {availableTimes.map((time) => (
                    <Pressable
                      key={time}
                      onPress={() => {
                        const [hours, minutes] = time.split(":").map(Number)
                        const nextTime = new Date(pickerTime)
                        nextTime.setHours(hours ?? 0, minutes ?? 0, 0, 0)
                        setPickerTime(nextTime)
                        updateField("casOd", time)
                        setShowTimePicker(false)
                      }}
                      style={[styles.timeButton, formState.casOd === time && styles.selectedTimeButton]}
                    >
                      <Text style={[styles.timeButtonText, formState.casOd === time && styles.selectedTimeButtonText]}>{time}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={() => setShowTimePicker(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Zrušit</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Text style={styles.inputLabel}>Zaměstnanec</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FilterChip
              isActive={formState.zamestnanecId === null}
              label="Bez přiřazení"
              onPress={() => updateField("zamestnanecId", null)}
            />
            {employees.map((employee) => (
              <FilterChip
                isActive={formState.zamestnanecId === employee.id}
                key={employee.id}
                label={`${employee.jmeno} ${employee.prijmeni}`}
                onPress={() => updateField("zamestnanecId", employee.id)}
              />
            ))}
          </ScrollView>

          <Text style={styles.inputLabel}>Poznámka</Text>
          <TextInput
            multiline
            onChangeText={(value) => updateField("poznamka", value)}
            placeholder="Volitelná poznámka k draftu"
            placeholderTextColor={colors.textPlaceholder}
            style={[styles.input, styles.textarea]}
            textAlignVertical="top"
            value={formState.poznamka}
          />

          <Text style={styles.helperText}>{helperText}</Text>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable accessibilityRole="button" onPress={submitDraft} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Uložit rezervaci</Text>
          </Pressable>
        </View>
      ) : null}
    </SectionCard>
  )
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  noticeText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  toggleButton: {
    alignItems: "center",
    borderColor: colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
  },
  toggleButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  formBody: {
    gap: 10,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  serviceCategory: {
    gap: 4,
  },
  categoryLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputText: {
    color: colors.text,
    fontSize: 16,
  },
  inputPlaceholder: {
    color: colors.textPlaceholder,
    fontSize: 16,
  },
  textarea: {
    minHeight: 90,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 13,
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
  },
  submitButtonText: {
    color: colors.accentText,
    fontSize: 15,
    fontWeight: "700",
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  pickerCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 420,
    padding: 20,
    width: "100%",
  },
  pickerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  monthButton: {
    alignItems: "center",
    borderColor: colors.cardBorder,
    borderRadius: 10,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  monthButtonText: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 28,
  },
  monthTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 6,
  },
  weekDay: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    width: "14.28%",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayButton: {
    alignItems: "center",
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    marginVertical: 2,
    width: "14.28%",
  },
  selectedDayButton: {
    backgroundColor: colors.accent,
  },
  dayText: {
    color: colors.text,
    fontSize: 14,
  },
  selectedDayText: {
    color: colors.accentText,
    fontWeight: "700",
  },
  mutedDayText: {
    color: colors.textPlaceholder,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    maxHeight: 280,
  },
  timeButton: {
    alignItems: "center",
    borderColor: colors.cardBorder,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  selectedTimeButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  timeButtonText: {
    color: colors.text,
    fontSize: 14,
  },
  selectedTimeButtonText: {
    color: colors.accentText,
    fontWeight: "700",
  },
  cancelButton: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
})
