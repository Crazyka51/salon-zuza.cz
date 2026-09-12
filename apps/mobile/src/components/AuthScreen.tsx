import { useMemo } from "react"
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

import { useTheme } from "../ThemeContext"
import type { ThemeColors } from "../theme"

interface AuthScreenProps {
  email: string
  errorMessage: string | null
  isLoggingIn: boolean
  onEmailChange: (value: string) => void
  onLogin: () => void
  onPasswordChange: (value: string) => void
  onRememberCredentialsChange: (value: boolean) => void
  password: string
  rememberCredentials: boolean
}

export function AuthScreen({
  email,
  errorMessage,
  isLoggingIn,
  onEmailChange,
  onLogin,
  onPasswordChange,
  onRememberCredentialsChange,
  password,
  rememberCredentials,
}: AuthScreenProps) {
  const { colors } = useTheme()
  const styles = useMemo(() => createStyles(colors), [colors])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.wrapper}
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Salon Zuza booking</Text>
        <Text style={styles.title}></Text>
                

        <Text style={styles.inputLabel}>E-mail</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={onEmailChange}
          placeholder="email@domena.cz"
          placeholderTextColor={colors.textPlaceholder}
          style={styles.input}
          value={email}
        />

        <Text style={styles.inputLabel}>Heslo</Text>
        <TextInput
          onChangeText={onPasswordChange}
          placeholder="••••••••"
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberCredentials }}
          onPress={() => onRememberCredentialsChange(!rememberCredentials)}
          style={styles.rememberRow}
        >
          <View style={[styles.checkbox, rememberCredentials ? styles.checkboxChecked : undefined]}>
            {rememberCredentials ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </View>
          <Text style={styles.rememberLabel}>Zapamatovat přihlašovací údaje</Text>
        </Pressable>

        <Pressable
          disabled={isLoggingIn}
          onPress={onLogin}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed ? styles.primaryButtonPressed : undefined,
            isLoggingIn ? styles.buttonDisabled : undefined,
          ]}
        >
          {isLoggingIn ? (
            <ActivityIndicator color={colors.accentText} />
          ) : (
            <Text style={styles.primaryButtonText}>Přihlásit se</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      gap: 12,
      padding: 20,
    },
    eyebrow: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "700",
    },
    helperText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    inputLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginTop: 4,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      color: colors.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    rememberRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      marginTop: 4,
    },
    checkbox: {
      alignItems: "center",
      borderColor: colors.cardBorder,
      borderRadius: 6,
      borderWidth: 1,
      height: 20,
      justifyContent: "center",
      width: 20,
    },
    checkboxChecked: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    checkboxMark: {
      color: colors.accentText,
      fontSize: 13,
      fontWeight: "700",
    },
    rememberLabel: {
      color: colors.text,
      fontSize: 14,
    },
    primaryButton: {
      alignItems: "center",
      backgroundColor: colors.accent,
      borderRadius: 14,
      marginTop: 8,
      paddingVertical: 14,
    },
    primaryButtonPressed: {
      opacity: 0.88,
    },
    primaryButtonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: "700",
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    errorText: {
      color: colors.dangerText,
      fontSize: 13,
    },
  })
}
