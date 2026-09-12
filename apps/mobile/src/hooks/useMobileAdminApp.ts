import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, Linking, Platform } from "react-native"
import Constants, { ExecutionEnvironment } from "expo-constants"

import {
  fetchBlockedTerms,
  fetchAvailableTimeSlots,
  fetchEmployees,
  fetchOpeningHours,
  fetchReservations,
  fetchServices,
  createReservation,
  deleteReservation,
  login,
  normalizeBaseUrl,
  updateReservationStatus,
} from "../api"
import {
  dateValueTimestamp,
  formatApiDate,
  isToday,
  reservationStartTimestamp,
  sortReservationsByDateTime,
  startOfToday,
} from "../date"
import { addMinutesToTime, createLocalDraftReservation } from "../drafts"
import { mobileStorage, secureStorage } from "../storage"
import { statusLabel } from "../status"
import type {
  AuthUser,
  BlockedTerm,
  Employee,
  LocalDraftInput,
  OpeningHoursItem,
  Reservation,
  ReservationStatus,
  Service,
} from "../types"

const PRODUCTION_BASE_URL = "https://www.salon-zuza.cz"
const DEFAULT_BASE_URL = PRODUCTION_BASE_URL
const DAYS = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"]
const LOCAL_DRAFTS_STORAGE_KEY = "salonzuza.mobile.localDrafts"
const LOCAL_STATUS_OVERRIDES_STORAGE_KEY = "salonzuza.mobile.localStatusOverrides"
const SESSION_STORAGE_KEY = "salonzuza.mobile.session"
const CREDENTIALS_STORAGE_KEY = "salonzuza.mobile.credentials"
const REMEMBER_CREDENTIALS_STORAGE_KEY = "salonzuza.mobile.rememberCredentials"

interface StoredSession {
  baseUrl: string
  token: string
  user: AuthUser
}
export type ScreenKey = "dashboard" | "calendar" | "reservations" | "settings"
export type CalendarViewMode = "month" | "week" | "day"

export interface OpeningHoursDisplayItem extends OpeningHoursItem {
  denLabel: string
}

export interface DashboardMetrics {
  pending: number
  today: number
  upcoming: number
  activeBlockedTerms: number
}

export interface LocalChangeSummary {
  changedReservationIds: number[]
  count: number
  draftCount: number
}

type LocalStatusOverrides = Record<number, ReservationStatus>

function applyLocalStatusOverrides(
  reservations: Reservation[],
  overrides: LocalStatusOverrides
): Reservation[] {
  let hasChanges = false

  const nextReservations = reservations.map((reservation) => {
    const localStatus = overrides[reservation.id]
    if (!localStatus || reservation.stav === localStatus) {
      return reservation
    }

    hasChanges = true
    return { ...reservation, stav: localStatus }
  })

  return hasChanges ? nextReservations : reservations
}

export function useMobileAdminApp() {
  const [baseUrlInput, setBaseUrlInput] = useState(DEFAULT_BASE_URL)
  const [baseUrl, setBaseUrl] = useState(normalizeBaseUrl(DEFAULT_BASE_URL))
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState("")
  const [user, setUser] = useState<AuthUser | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [blockedTerms, setBlockedTerms] = useState<BlockedTerm[]>([])
  const [openingHours, setOpeningHours] = useState<OpeningHoursItem[]>([])
  const [localDrafts, setLocalDrafts] = useState<Reservation[]>([])
  const [screen, setScreen] = useState<ScreenKey>("dashboard")
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(() => new Date())
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>("month")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all")
  const [employeeFilter, setEmployeeFilter] = useState<number | "all">("all")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<ReservationStatus | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [localStatusOverrides, setLocalStatusOverrides] = useState<LocalStatusOverrides>({})
  const [hasHydratedLocalState, setHasHydratedLocalState] = useState(false)
  const [rememberCredentials, setRememberCredentials] = useState(true)

  useEffect(() => {
    // Push notifications were removed from Expo Go starting with SDK 53.
    // Importing/using `expo-notifications` there throws, so skip it entirely
    // when running inside Expo Go and only load the module in dev/prod builds.
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient

    if (Platform.OS === "web" || isExpoGo) return

    const requestPermissions = async () => {
      try {
        const Notifications = await import("expo-notifications")
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync()
          finalStatus = status
        }
        if (finalStatus !== "granted") {
          console.warn("Nepodařilo se získat oprávnění k oznámením!")
        }
      } catch (error) {
        console.warn("Notifikace nejsou v tomto prostředí dostupné:", error)
      }
    }
    void requestPermissions()
  }, [])

  const todayStart = startOfToday()
  const todayStartTimestamp = todayStart.getTime()

  const sortedReservations = useMemo(() => {
    return [...reservations, ...localDrafts].sort(sortReservationsByDateTime)
  }, [localDrafts, reservations])

  const filteredReservations = useMemo(() => {
    return sortedReservations.filter((reservation) => {
      if (statusFilter !== "all" && reservation.stav !== statusFilter) {
        return false
      }

      if (employeeFilter !== "all" && reservation.zamestnanecId !== employeeFilter) {
        return false
      }

      return true
    })
  }, [employeeFilter, sortedReservations, statusFilter])

  const upcomingReservations = useMemo(() => {
    return sortedReservations
      .filter((reservation) => reservationStartTimestamp(reservation) >= todayStartTimestamp)
      .slice(0, 5)
  }, [sortedReservations, todayStartTimestamp])

  const dashboardMetrics = useMemo<DashboardMetrics>(() => {
    const pending = reservations.filter((reservation) => reservation.stav === "pending").length
    const today = reservations.filter((reservation) => isToday(reservation.datum)).length
    const upcoming = reservations.filter(
      (reservation) => reservationStartTimestamp(reservation) >= todayStartTimestamp
    ).length
    const activeBlockedTerms = blockedTerms.filter((item) => {
      const timestamp = dateValueTimestamp(item.datumDo)
      return timestamp !== null && timestamp >= todayStartTimestamp
    }).length

    return {
      pending,
      today,
      upcoming,
      activeBlockedTerms,
    }
  }, [blockedTerms, reservations, todayStartTimestamp])

  const futureBlockedTerms = useMemo(() => {
    return blockedTerms.filter((item) => {
      const timestamp = dateValueTimestamp(item.datumDo)
      return timestamp !== null && timestamp >= todayStartTimestamp
    })
  }, [blockedTerms, todayStartTimestamp])

  const groupedOpeningHours = useMemo<OpeningHoursDisplayItem[]>(() => {
    return openingHours.map((item) => ({
      ...item,
      denLabel: DAYS[item.denTydne] ?? `Den ${item.denTydne}`,
    }))
  }, [openingHours])

  const localChangeSummary = useMemo<LocalChangeSummary>(() => {
    const changedReservationIds = Object.keys(localStatusOverrides).map((key) => Number(key))
    return {
      changedReservationIds,
      count: changedReservationIds.length + localDrafts.length,
      draftCount: localDrafts.length,
    }
  }, [localDrafts.length, localStatusOverrides])

  const changeCalendarMonth = (offset: number) => {
    setCalendarMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
      setCalendarSelectedDate(nextMonth)
      void loadDashboardData(baseUrl, token, nextMonth)
      return nextMonth
    })
  }

  const selectCalendarDate = (date: Date) => {
    setCalendarSelectedDate(date)
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  useEffect(() => {
    const hydrateLocalState = async () => {
      try {
        const [storedDrafts, storedOverrides] = await Promise.all([
          mobileStorage.getItem(LOCAL_DRAFTS_STORAGE_KEY),
          mobileStorage.getItem(LOCAL_STATUS_OVERRIDES_STORAGE_KEY),
        ])

        if (storedDrafts) {
          const parsedDrafts = JSON.parse(storedDrafts) as Reservation[]
          setLocalDrafts(Array.isArray(parsedDrafts) ? parsedDrafts : [])
        }

        if (storedOverrides) {
          const parsedOverrides = JSON.parse(storedOverrides) as LocalStatusOverrides
          setLocalStatusOverrides(parsedOverrides && typeof parsedOverrides === "object" ? parsedOverrides : {})
        }
      } catch (error) {
        console.error("Nepodařilo se načíst lokální mobilní drafty:", error)
      } finally {
        setHasHydratedLocalState(true)
      }
    }

    void hydrateLocalState()
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSession = await secureStorage.getItem(SESSION_STORAGE_KEY)
        if (!storedSession) {
          return
        }

        const parsedSession = JSON.parse(storedSession) as StoredSession
        if (!parsedSession.token || !parsedSession.baseUrl || !parsedSession.user?.email) {
          await secureStorage.removeItem(SESSION_STORAGE_KEY)
          return
        }

        setBaseUrl(parsedSession.baseUrl)
        setBaseUrlInput(parsedSession.baseUrl)
        setToken(parsedSession.token)
        setUser(parsedSession.user)
        await loadDashboardData(parsedSession.baseUrl, parsedSession.token)
      } catch (error) {
        console.error("Nepodařilo se obnovit mobilní relaci:", error)
        await secureStorage.removeItem(SESSION_STORAGE_KEY)
      }
    }

    const restoreCredentials = async () => {
      try {
        const storedRemember = await secureStorage.getItem(REMEMBER_CREDENTIALS_STORAGE_KEY)
        const shouldRemember = storedRemember === null ? true : storedRemember === "true"
        setRememberCredentials(shouldRemember)

        if (!shouldRemember) {
          return
        }

        const storedCredentials = await secureStorage.getItem(CREDENTIALS_STORAGE_KEY)
        if (storedCredentials) {
          const { email: storedEmail, password: storedPassword } = JSON.parse(storedCredentials)
          setEmail(storedEmail || "")
          setPassword(storedPassword || "")
        }
      } catch (e) {
        console.error("Nepodařilo se obnovit přihlašovací údaje:", e)
      }
    }

    void restoreSession()
    void restoreCredentials()
  }, [])

  useEffect(() => {
    if (!hasHydratedLocalState) {
      return
    }

    void mobileStorage.setItem(LOCAL_DRAFTS_STORAGE_KEY, JSON.stringify(localDrafts))
  }, [hasHydratedLocalState, localDrafts])

  useEffect(() => {
    if (!hasHydratedLocalState) {
      return
    }

    void mobileStorage.setItem(
      LOCAL_STATUS_OVERRIDES_STORAGE_KEY,
      JSON.stringify(localStatusOverrides)
    )
  }, [hasHydratedLocalState, localStatusOverrides])

  useEffect(() => {
    if (!hasHydratedLocalState || reservations.length === 0) {
      return
    }

    const reservationsWithOverrides = applyLocalStatusOverrides(reservations, localStatusOverrides)

    if (reservationsWithOverrides !== reservations) {
      setReservations(reservationsWithOverrides)
    }
  }, [hasHydratedLocalState, localStatusOverrides, reservations])

  const loadAvailableTimeSlots = useCallback(
    (params: { datum: string; sluzbaId: number; zamestnanecId: number | null }) =>
      fetchAvailableTimeSlots(baseUrl, token, params),
    [baseUrl, token]
  )

  const syncLocalDrafts = async (
    availableServices = services,
    notify = true
  ): Promise<number> => {
    if (!baseUrl || !token || localDrafts.length === 0 || isSyncing) {
      return 0
    }

    setIsSyncing(true)
    setErrorMessage(null)
    const syncedReservations: Reservation[] = []
    const syncedDraftIds: number[] = []
    let lastError: string | null = null

    try {
      for (const draft of localDrafts) {
        try {
          const input = draft.draftInput
          if (!input || !input.sluzbaId) {
            throw new Error("Lokální draft nemá uloženou službu a nelze jej synchronizovat.")
          }

          const service = availableServices.find((item) => item.id === input.sluzbaId)
          if (!service) {
            throw new Error(`Služba pro draft „${draft.jmeno} ${draft.prijmeni}“ už není dostupná.`)
          }

          const casDo = draft.casDo ?? addMinutesToTime(input.casOd, service.dobaTrvaniMinuty)
          const reservation = await createReservation(baseUrl, token, input, casDo)
          syncedReservations.push(reservation)
          syncedDraftIds.push(draft.id)
        } catch (error) {
          lastError = error instanceof Error ? error.message : "Synchronizace rezervace selhala"
        }
      }

      if (syncedDraftIds.length > 0) {
        setLocalDrafts((currentDrafts) =>
          currentDrafts.filter((draft) => !syncedDraftIds.includes(draft.id))
        )
        setReservations((currentReservations) => [...syncedReservations, ...currentReservations])
      }

      if (lastError) {
        setErrorMessage(lastError)
      }

      if (notify && syncedDraftIds.length > 0) {
        Alert.alert(
          "Synchronizace dokončena",
          `Úspěšně odesláno: ${syncedDraftIds.length}. Zbývající drafty: ${localDrafts.length - syncedDraftIds.length}.`
        )
      }

      return syncedDraftIds.length
    } finally {
      setIsSyncing(false)
    }
  }

  const loadDashboardData = async (
    currentBaseUrl = baseUrl,
    currentToken = token,
    targetMonth = new Date()
  ) => {
    if (!currentBaseUrl || !currentToken) {
      return
    }

    setIsRefreshing(true)
    setErrorMessage(null)

    try {
      const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1)
      const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0)

      const [
        reservationsResponse,
        pendingReservationsResponse,
        employeesResponse,
        blockedTermsResponse,
        openingHoursResponse,
        servicesResponse,
      ] =
        await Promise.all([
          fetchReservations(currentBaseUrl, currentToken, {
            datumOd: formatApiDate(monthStart),
            datumDo: formatApiDate(monthEnd),
          }),
          fetchReservations(currentBaseUrl, currentToken, { stav: "pending" }),
          fetchEmployees(currentBaseUrl, currentToken),
          fetchBlockedTerms(currentBaseUrl, currentToken),
          fetchOpeningHours(currentBaseUrl, currentToken),
          fetchServices(currentBaseUrl, currentToken),
        ])

      const reservationsById = new Map(
        [...reservationsResponse.rezervace, ...pendingReservationsResponse.rezervace].map((reservation) => [
          reservation.id,
          reservation,
        ])
      )
      setReservations(Array.from(reservationsById.values()))
      setEmployees(employeesResponse.zamestnanci)
      setBlockedTerms(blockedTermsResponse.blokovaneTerminy)
      setOpeningHours(openingHoursResponse)
      setServices(servicesResponse.sluzby)
      void syncLocalDrafts(servicesResponse.sluzby, false)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nepodařilo se načíst data")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogin = async () => {
    setIsLoggingIn(true)
    setErrorMessage(null)

    try {
      const normalizedBaseUrl = normalizeBaseUrl(baseUrlInput)
      const response = await login(normalizedBaseUrl, email.trim(), password)

      setBaseUrl(normalizedBaseUrl)
      setBaseUrlInput(normalizedBaseUrl)
      setToken(response.token)
      setUser(response.data)
      await secureStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ baseUrl: normalizedBaseUrl, token: response.token, user: response.data } satisfies StoredSession)
      )

      if (rememberCredentials) {
        await secureStorage.setItem(
          CREDENTIALS_STORAGE_KEY,
          JSON.stringify({ email: email.trim(), password })
        )
      } else {
        await secureStorage.removeItem(CREDENTIALS_STORAGE_KEY)
      }

      await loadDashboardData(normalizedBaseUrl, response.token)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Přihlášení selhalo")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    void Promise.all([
      mobileStorage.removeItem(LOCAL_DRAFTS_STORAGE_KEY),
      mobileStorage.removeItem(LOCAL_STATUS_OVERRIDES_STORAGE_KEY),
      secureStorage.removeItem(SESSION_STORAGE_KEY),
    ])
    setToken("")
    setUser(null)
    setReservations([])
    setEmployees([])
    setServices([])
    setBlockedTerms([])
    setOpeningHours([])
    setLocalDrafts([])
    setLocalStatusOverrides({})
    setSelectedReservation(null)
    setErrorMessage(null)
    setPassword(rememberCredentials ? password : "")
    setScreen("dashboard")
  }

  const handleRememberCredentialsChange = (value: boolean) => {
    setRememberCredentials(value)
    void secureStorage.setItem(REMEMBER_CREDENTIALS_STORAGE_KEY, value ? "true" : "false")

    if (!value) {
      void secureStorage.removeItem(CREDENTIALS_STORAGE_KEY)
    }
  }

  const handleStatusChange = async (nextStatus: ReservationStatus) => {
    if (!selectedReservation) {
      return
    }

    setStatusUpdateLoading(nextStatus)
    setErrorMessage(null)

    try {
      if (selectedReservation.source === "local-draft" || selectedReservation.isDraft) {
        const updated: Reservation = { ...selectedReservation, stav: nextStatus }
        setLocalDrafts((currentDrafts) =>
          currentDrafts.map((reservation) =>
            reservation.id === updated.id ? updated : reservation
          )
        )
      } else {
        const updated = await updateReservationStatus(baseUrl, token, selectedReservation.id, nextStatus)
        setReservations((currentReservations) =>
          currentReservations.map((reservation) => reservation.id === updated.id ? updated : reservation)
        )
        setSelectedReservation(updated)
      }
      Alert.alert(
        "Stav uložen",
        `Rezervace byla nastavena na „${statusLabel(nextStatus)}“ v administraci.`
      )
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nepodařilo se změnit stav rezervace")
    } finally {
      setStatusUpdateLoading(null)
    }
  }

  const promptStatusChange = (nextStatus: ReservationStatus) => {
    Alert.alert(
      "Změnit stav rezervace",
      `Opravdu chcete nastavit stav na „${statusLabel(nextStatus)}“?`,
      [
        { text: "Zrušit", style: "cancel" },
        { text: "Potvrdit", onPress: () => void handleStatusChange(nextStatus) },
      ]
    )
  }

  const promptDeleteReservation = () => {
    if (!selectedReservation || selectedReservation.isDraft) {
      return
    }

    Alert.alert("Smazat rezervaci", "Opravdu chcete tuto rezervaci smazat?", [
      { text: "Zrušit", style: "cancel" },
      {
        text: "Smazat",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await deleteReservation(baseUrl, token, selectedReservation.id)
              setReservations((currentReservations) =>
                currentReservations.filter((reservation) => reservation.id !== selectedReservation.id)
              )
              setSelectedReservation(null)
              Alert.alert("Rezervace smazána", "Rezervace byla úspěšně odstraněna.")
            } catch (error) {
              setErrorMessage(error instanceof Error ? error.message : "Nepodařilo se smazat rezervaci")
            }
          })()
        },
      },
    ])
  }

  const openContact = async (scheme: "tel" | "mailto", value?: string | null) => {
    if (!value) {
      Alert.alert("Kontakt chybí", "U této rezervace není dostupný kontakt.")
      return
    }

    const url = `${scheme}:${value}`
    const supported = await Linking.canOpenURL(url)

    if (!supported) {
      Alert.alert("Nelze otevřít", "Na tomto zařízení nejde otevřít požadovanou akci.")
      return
    }

    await Linking.openURL(url)
  }

  const createLocalDraft = async (input: LocalDraftInput) => {
    const selectedEmployee = employees.find((employee) => employee.id === input.zamestnanecId) ?? null
    const selectedService = services.find((service) => service.id === input.sluzbaId) ?? null
    const draftId = -Date.now()

    try {
      if (!selectedService) {
        throw new Error("Vyberte službu.")
      }

      const casDo = addMinutesToTime(input.casOd, selectedService.dobaTrvaniMinuty)
      const reservation = await createReservation(baseUrl, token, input, casDo)
      setReservations((currentReservations) => [reservation, ...currentReservations])
      setSelectedReservation(reservation)
      setScreen("reservations")
      Alert.alert("Rezervace vytvořena", "Rezervace byla úspěšně uložena.")
    } catch (error) {
      const draft = createLocalDraftReservation({ draftId, employee: selectedEmployee, input, service: selectedService })
      setLocalDrafts((currentDrafts) => [draft, ...currentDrafts])
      setErrorMessage(error instanceof Error ? error.message : "Nepodařilo se uložit rezervaci")
      Alert.alert("Rezervace uložena offline", "Rezervace byla uložena do paměti zařízení. Zkuste ji později synchronizovat, až budete mít lepší připojení.")
    }
  }

  return {
    baseUrl,
    baseUrlInput,
    calendarMonth,
    calendarReservations: sortedReservations,
    calendarSelectedDate,
    calendarViewMode,
    changeCalendarMonth,
    selectCalendarDate,
    blockedTerms: futureBlockedTerms,
    dashboardMetrics,
    email,
    employeeFilter,
    employees,
    errorMessage,
    filteredReservations,
    groupedOpeningHours,
    createLocalDraft,
    handleLogin,
    handleLogout,
    isLoggingIn,
    isRefreshing,
    isSyncing,
    loadAvailableTimeSlots,
    localChangeSummary,
    loadDashboardData,
    openEmail: (value?: string | null) => openContact("mailto", value),
    openingHours,
    openPhone: (value?: string | null) => openContact("tel", value),
    password,
    promptStatusChange,
    promptDeleteReservation,
    rememberCredentials,
    onRememberCredentialsChange: handleRememberCredentialsChange,
    reservations,
    screen,
    selectedReservation,
    services,
    syncLocalDrafts,
    pendingLocalDrafts: localDrafts.length,
    setBaseUrlInput,
    setCalendarSelectedDate,
    setCalendarViewMode,
    setEmail,
    setEmployeeFilter,
    setPassword,
    setScreen,
    setSelectedReservation,
    setStatusFilter,
    statusFilter,
    statusUpdateLoading,
    token,
    upcomingReservations,
    user,
  }
}
