export interface ThemeColors {
  background: string
  card: string
  cardBorder: string
  text: string
  textMuted: string
  textPlaceholder: string
  accent: string
  accentText: string
  inputBackground: string
  danger: string
  dangerBackground: string
  dangerText: string
  warningBackground: string
  warningText: string
  successBackground: string
  successText: string
  chipBackground: string
  chipText: string
}

export const darkColors: ThemeColors = {
  background: "#1a1d24",
  card: "#171717",
  cardBorder: "#2e2e2e",
  text: "#f5f5f5",
  textMuted: "#c0c0c0",
  textPlaceholder: "#c0c0c0",
  accent: "#f7b91c",
  accentText: "#1e1e1e",
  inputBackground: "#252525",
  danger: "#7f1d1d",
  dangerBackground: "#1f1315",
  dangerText: "#fecaca",
  warningBackground: "#713f12",
  warningText: "#f5f5f5",
  successBackground: "#14532d",
  successText: "#f5f5f5",
  chipBackground: "#2e2e2e",
  chipText: "#f5f5f5",
}

export const lightColors: ThemeColors = {
  background: "#f2f3f5",
  card: "#ffffff",
  cardBorder: "#dcdfe4",
  text: "#1c1e21",
  textMuted: "#5b6169",
  textPlaceholder: "#8a8f98",
  accent: "#c98a0f",
  accentText: "#1e1e1e",
  inputBackground: "#eef0f3",
  danger: "#b91c1c",
  dangerBackground: "#fde8e8",
  dangerText: "#7f1d1d",
  warningBackground: "#fef3c7",
  warningText: "#78350f",
  successBackground: "#dcfce7",
  successText: "#14532d",
  chipBackground: "#e5e7eb",
  chipText: "#1c1e21",
}

export type ThemePreference = "system" | "light" | "dark"
