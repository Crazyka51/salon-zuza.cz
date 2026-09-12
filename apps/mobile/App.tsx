import { StatusBar } from "expo-status-bar"
import { useMemo } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

import { AuthScreen } from "./src/components/AuthScreen"
import { CalendarScreen } from "./src/components/CalendarScreen"
import { DashboardScreen } from "./src/components/DashboardScreen"
import { ReservationDetailSheet } from "./src/components/ReservationDetailSheet"
import { ReservationsScreen } from "./src/components/ReservationsScreen"
import { SettingsScreen } from "./src/components/SettingsScreen"
import { TabBar } from "./src/components/TabBar"
import { useMobileAdminApp } from "./src/hooks/useMobileAdminApp"
import { ThemeProvider, useTheme } from "./src/ThemeContext"
import type { ThemeColors } from "./src/theme"

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

function AppContent() {
  const app = useMobileAdminApp()
  const { colors, isDark } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const authScreenProps = {
    email: app.email,
    errorMessage: app.errorMessage,
    isLoggingIn: app.isLoggingIn,
    onEmailChange: app.setEmail,
    onLogin: app.handleLogin,
    onPasswordChange: app.setPassword,
    onRememberCredentialsChange: app.onRememberCredentialsChange,
    password: app.password,
    rememberCredentials: app.rememberCredentials,
  }

  if (!app.user) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <AuthScreen {...authScreenProps} />
          <StatusBar style={isDark ? "light" : "dark"} />
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Salon Zuza - rezervace</Text>
            <Text style={styles.headerTitle}>{app.user.name ?? app.user.email}</Text>
            
          </View>
        </View>

        <TabBar currentScreen={app.screen} onScreenChange={app.setScreen} />

        {app.errorMessage ? <Text style={styles.errorBanner}>{app.errorMessage}</Text> : null}

        <ScrollView contentContainerStyle={styles.content}>
          {app.screen === "dashboard" ? (
            <DashboardScreen
              blockedTerms={app.blockedTerms}
              dashboardMetrics={app.dashboardMetrics}
              openingHours={app.groupedOpeningHours}
              onOpenReservation={app.setSelectedReservation}
              onRefresh={() => void app.loadDashboardData()}
              pendingReservations={app.reservations.filter((reservation) => reservation.stav === "pending")}
              reservations={app.upcomingReservations}
              refreshing={app.isRefreshing}
            />
          ) : null}

          {app.screen === "calendar" ? (
            <CalendarScreen
              month={app.calendarMonth}
              onViewModeChange={app.setCalendarViewMode}
              onDateChange={app.selectCalendarDate}
              onMonthChange={app.changeCalendarMonth}
              onOpenReservation={app.setSelectedReservation}
              reservations={app.calendarReservations}
              selectedDate={app.calendarSelectedDate}
              viewMode={app.calendarViewMode}
            />
          ) : null}

          {app.screen === "reservations" ? (
            <ReservationsScreen
              employeeFilter={app.employeeFilter}
              employees={app.employees}
              onCreateDraft={app.createLocalDraft}
              onFetchAvailableTimes={app.loadAvailableTimeSlots}
              onEmployeeFilterChange={app.setEmployeeFilter}
              onOpenReservation={app.setSelectedReservation}
              onStatusFilterChange={app.setStatusFilter}
              reservations={app.filteredReservations}
              services={app.services}
              statusFilter={app.statusFilter}
            />
          ) : null}

          {app.screen === "settings" ? (
            <SettingsScreen
              onLogout={app.handleLogout}
              onRefresh={() => void app.loadDashboardData()}
              onSyncDrafts={() => void app.syncLocalDrafts()}
              pendingDrafts={app.pendingLocalDrafts}
              refreshing={app.isRefreshing}
              syncing={app.isSyncing}
              user={app.user}
            />
          ) : null}
        </ScrollView>

        {app.selectedReservation ? (
          <ReservationDetailSheet
            hasLocalChanges={app.localChangeSummary.changedReservationIds.includes(app.selectedReservation.id)}
            onChangeStatus={app.promptStatusChange}
            onClose={() => app.setSelectedReservation(null)}
            onDelete={app.promptDeleteReservation}
            onOpenEmail={app.openEmail}
            onOpenPhone={app.openPhone}
            reservation={app.selectedReservation}
            savingStatus={app.statusUpdateLoading}
          />
        ) : null}

        <StatusBar style={isDark ? "light" : "dark"} />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    eyebrow: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    headerTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
    },
    helperText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    errorBanner: {
      color: colors.dangerText,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    content: {
      gap: 16,
      padding: 16,
      paddingBottom: 180,
    },
  })
}
