import type {
  AuthResponse,
  BlockedTermsResponse,
  EmployeeResponse,
  OpeningHoursItem,
  ReservationResponse,
  ServiceResponse,
  Reservation,
  LocalDraftInput,
} from "./types"

interface ApiRequestOptions {
  token?: string
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: Record<string, unknown>
}

export interface AvailableTimeSlot {
  time: string
  available: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "")
}

async function apiRequest<T>(
  baseUrl: string,
  path: string,
  { token, method = "GET", body }: ApiRequestOptions = {}
): Promise<T> {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: ["Bearer", token].join(" ") } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const json = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    const message =
      (isRecord(json) && typeof json.message === "string" && json.message) ||
      (isRecord(json) && typeof json.error === "string" && json.error) ||
      "API požadavek selhal"
    throw new Error(message)
  }

  if (json === null) {
    throw new Error("Server vrátil prázdnou nebo neplatnou odpověď. Zkontrolujte URL serveru.")
  }

  return json as T
}

export async function login(baseUrl: string, email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>(baseUrl, "/api/admin/auth/login", {
    method: "POST",
    body: { email, password },
  })

  if (!isRecord(response) || typeof response.token !== "string" || !isRecord(response.data)) {
    throw new Error("Přihlášení selhalo: server nevrátil platný token. Zkontrolujte URL serveru.")
  }

  return response as AuthResponse
}

export async function fetchReservations(
  baseUrl: string,
  token: string,
  params: { datumOd?: string; datumDo?: string; stav?: string }
): Promise<ReservationResponse> {
  const searchParams = new URLSearchParams()
  if (params.datumOd) searchParams.set("datum_od", params.datumOd)
  if (params.datumDo) searchParams.set("datum_do", params.datumDo)
  if (params.stav) searchParams.set("stav", params.stav)

  return apiRequest<ReservationResponse>(baseUrl, `/api/rezervace?${searchParams.toString()}`, { token })
}

export async function fetchEmployees(baseUrl: string, token: string): Promise<EmployeeResponse> {
  return apiRequest<EmployeeResponse>(baseUrl, "/api/admin/zamestnanci", { token })
}

export async function fetchBlockedTerms(baseUrl: string, token: string): Promise<BlockedTermsResponse> {
  return apiRequest<BlockedTermsResponse>(baseUrl, "/api/admin/rezervace/blokovane-terminy", { token })
}

export async function fetchOpeningHours(baseUrl: string, token: string): Promise<OpeningHoursItem[]> {
  return apiRequest<OpeningHoursItem[]>(baseUrl, "/api/admin/provozni-hodiny", { token })
}

export async function fetchServices(baseUrl: string, token: string): Promise<ServiceResponse> {
  return apiRequest<ServiceResponse>(baseUrl, "/api/admin/sluzby", { token })
}

export async function fetchAvailableTimeSlots(
  baseUrl: string,
  token: string,
  params: { datum: string; sluzbaId: number; zamestnanecId: number | null }
): Promise<string[]> {
  const searchParams = new URLSearchParams({
    datum: params.datum,
    sluzbaId: String(params.sluzbaId),
  })

  if (params.zamestnanecId !== null) {
    searchParams.set("zamestnanecId", String(params.zamestnanecId))
  }

  const response = await apiRequest<{ dostupneTerminy?: AvailableTimeSlot[] }>(
    baseUrl,
    `/api/rezervace/dostupne-terminy?${searchParams.toString()}`,
    { token }
  )

  return (response.dostupneTerminy ?? [])
    .filter((slot) => slot.available)
    .map((slot) => slot.time)
}

export async function createReservation(
  baseUrl: string,
  token: string,
  input: LocalDraftInput,
  casDo: string
): Promise<Reservation> {
  const response = await apiRequest<{ rezervace: Reservation }>(baseUrl, "/api/rezervace", {
    method: "POST",
    token,
    body: {
      ...input,
      casDo,
      sluzbaId: input.sluzbaId,
      adminOverride: true,
      notifikaceEmail: true,
      notifikaceSms: false,
    },
  })

  return response.rezervace
}

export async function updateReservationStatus(
  baseUrl: string,
  token: string,
  reservationId: number,
  status: Reservation["stav"]
): Promise<Reservation> {
  const response = await apiRequest<{ rezervace: Reservation }>(
    baseUrl,
    `/api/rezervace/${reservationId}`,
    { method: "PUT", token, body: { stav: status } }
  )

  return response.rezervace
}

export async function deleteReservation(baseUrl: string, token: string, reservationId: number): Promise<void> {
  await apiRequest<{ success: boolean }>(baseUrl, `/api/rezervace/${reservationId}`, { method: "DELETE", token })
}
