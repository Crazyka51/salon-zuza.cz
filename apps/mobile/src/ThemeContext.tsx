import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useColorScheme } from "react-native"

import { mobileStorage } from "./storage"
import { darkColors, lightColors, type ThemeColors, type ThemePreference } from "./theme"

const THEME_PREFERENCE_STORAGE_KEY = "salonzuza.mobile.themePreference"

interface ThemeContextValue {
  colors: ThemeColors
  isDark: boolean
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const [preference, setPreferenceState] = useState<ThemePreference>("system")

  useEffect(() => {
    const hydratePreference = async () => {
      try {
        const stored = await mobileStorage.getItem(THEME_PREFERENCE_STORAGE_KEY)
        if (stored === "system" || stored === "light" || stored === "dark") {
          setPreferenceState(stored)
        }
      } catch (error) {
        console.error("Nepodařilo se načíst uložené téma:", error)
      }
    }

    void hydratePreference()
  }, [])

  const setPreference = (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference)
    void mobileStorage.setItem(THEME_PREFERENCE_STORAGE_KEY, nextPreference)
  }

  const isDark = preference === "system" ? systemScheme !== "light" : preference === "dark"

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      preference,
      setPreference,
    }),
    [isDark, preference]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme musí být použit uvnitř ThemeProvider")
  }

  return context
}
