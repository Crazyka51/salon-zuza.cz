"use client"

import { useState, useCallback } from "react"
import type { ApiResponse } from "../types"

interface UseAdminApiOptions {
  baseUrl?: string
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useAdminApi(options: UseAdminApiOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { baseUrl = "/api/admin", onSuccess, onError } = options

  const request = useCallback(
    async <T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          ...options,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "API request failed")
        }

        onSuccess?.(data)
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error)
        onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, onSuccess, onError],
  )

  const get = useCallback(<T = any>(endpoint: string) => request<T>(endpoint, { method: "GET" }), [request])

  const post = useCallback(
    <T = any>(endpoint: string, data?: any) =>
      request<T>(endpoint, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [request],
  )

  const put = useCallback(
    <T = any>(endpoint: string, data?: any) =>
      request<T>(endpoint, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [request],
  )

  const del = useCallback(<T = any>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }), [request])

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    request,
  }
}
