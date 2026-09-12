import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

type StorageValue = string | null

interface StorageAdapter {
  getItem(key: string): Promise<StorageValue>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

const memoryStorage = new Map<string, string>()

const memoryAdapter: StorageAdapter = {
  async getItem(key) {
    return memoryStorage.get(key) ?? null
  },
  async setItem(key, value) {
    memoryStorage.set(key, value)
  },
  async removeItem(key) {
    memoryStorage.delete(key)
  },
}

const webAdapter: StorageAdapter = {
  async getItem(key) {
    if (typeof window === "undefined") {
      return memoryAdapter.getItem(key)
    }

    return window.localStorage.getItem(key)
  },
  async setItem(key, value) {
    if (typeof window === "undefined") {
      return memoryAdapter.setItem(key, value)
    }

    window.localStorage.setItem(key, value)
  },
  async removeItem(key) {
    if (typeof window === "undefined") {
      return memoryAdapter.removeItem(key)
    }

    window.localStorage.removeItem(key)
  },
}

let nativeStorageWarningShown = false

function shouldUseWebStorage(): boolean {
  return Platform.OS === "web"
}

function logNativeStorageWarning(error: unknown) {
  if (nativeStorageWarningShown) {
    return
  }

  nativeStorageWarningShown = true
  console.warn("AsyncStorage není v tomto prostředí dostupné, přepínám na fallback storage.", error)
}

async function withStorageFallback<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    logNativeStorageWarning(error)
    return fallback()
  }
}

export const mobileStorage: StorageAdapter = {
  async getItem(key) {
    if (shouldUseWebStorage()) {
      return webAdapter.getItem(key)
    }

    return withStorageFallback(() => AsyncStorage.getItem(key), () => memoryAdapter.getItem(key))
  },
  async setItem(key, value) {
    if (shouldUseWebStorage()) {
      return webAdapter.setItem(key, value)
    }

    return withStorageFallback(() => AsyncStorage.setItem(key, value), () => memoryAdapter.setItem(key, value))
  },
  async removeItem(key) {
    if (shouldUseWebStorage()) {
      return webAdapter.removeItem(key)
    }

    return withStorageFallback(() => AsyncStorage.removeItem(key), () => memoryAdapter.removeItem(key))
  },
}

export const secureStorage: StorageAdapter = {
  async getItem(key) {
    if (shouldUseWebStorage()) {
      return webAdapter.getItem(key)
    }

    return withStorageFallback(
      () => SecureStore.getItemAsync(key),
      () => memoryAdapter.getItem(key)
    )
  },
  async setItem(key, value) {
    if (shouldUseWebStorage()) {
      return webAdapter.setItem(key, value)
    }

    return withStorageFallback(
      () => SecureStore.setItemAsync(key, value),
      () => memoryAdapter.setItem(key, value)
    )
  },
  async removeItem(key) {
    if (shouldUseWebStorage()) {
      return webAdapter.removeItem(key)
    }

    return withStorageFallback(
      () => SecureStore.deleteItemAsync(key),
      () => memoryAdapter.removeItem(key)
    )
  },
}
