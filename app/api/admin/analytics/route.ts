import { NextRequest, NextResponse } from 'next/server'
import { createSign } from 'crypto'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

export const dynamic = 'force-dynamic'

// ─── Konstanty ──────────────────────────────────────────────────────────────
const GA4_API = 'https://analyticsdata.googleapis.com/v1beta'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const DAY_LABELS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']

// ─── Pomocné funkce ──────────────────────────────────────────────────────────

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

/**
 * Vytvoří JWT a vymění ho za Google OAuth2 access token pro service account.
 * Nevyžaduje žádný npm balíček – využívá built-in Node.js crypto.
 */
async function getGoogleAccessToken(
  clientEmail: string,
  privateKey: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  const header = Buffer.from(
    JSON.stringify({ alg: 'RS256', typ: 'JWT' }),
  ).toString('base64url')

  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: GOOGLE_TOKEN_URL,
      exp: now + 3600,
      iat: now,
    }),
  ).toString('base64url')

  const toSign = `${header}.${payload}`
  const sign = createSign('RSA-SHA256')
  sign.update(toSign)
  // Env var může mít \\n místo skutečných newlines
  const normalizedKey = privateKey.replace(/\\n/g, '\n')
  const signature = sign.sign(normalizedKey, 'base64url')

  const jwt = `${toSign}.${signature}`

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(
      `Google OAuth2 token error: ${data.error_description ?? data.error ?? res.status}`,
    )
  }
  return data.access_token as string
}

// ─── GA4 Data API ────────────────────────────────────────────────────────────

interface GA4Row {
  dimensionValues: { value: string }[]
  metricValues: { value: string }[]
}

interface GA4ReportResponse {
  rows?: GA4Row[]
  error?: { message: string; code: number }
}

async function fetchGA4Report(
  propertyId: string,
  accessToken: string,
): Promise<GA4ReportResponse> {
  const url = `${GA4_API}/properties/${propertyId}:runReport`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }], // formát YYYYMMDD
      metrics: [
        { name: 'activeUsers' },     // unikátní návštěvníci
        { name: 'screenPageViews' }, // zobrazení stránek
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    }),
    next: { revalidate: 3600 }, // cache 1 hodinu
  })

  return res.json()
}

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const authUser = await authenticateApiRequest(request)
  if (!authUser) {
    return NextResponse.json({ error: 'Nejste přihlášeni' }, { status: 401 })
  }

  // Podporujeme dva způsoby konfigurace:
  // 1. GOOGLE_ANALYTICS_CREDENTIALS_BASE64 – celé service account JSON zakódované v base64
  // 2. GA4_SERVICE_ACCOUNT_EMAIL + GA4_SERVICE_ACCOUNT_PRIVATE_KEY – individuální hodnoty
  const propertyId =
    process.env.GOOGLE_ANALYTICS_PROPERTY_ID ?? process.env.GA4_PROPERTY_ID

  let clientEmail: string | undefined
  let privateKey: string | undefined

  const credB64 = process.env.GOOGLE_ANALYTICS_CREDENTIALS_BASE64
  if (credB64) {
    try {
      const json = JSON.parse(Buffer.from(credB64, 'base64').toString('utf8'))
      clientEmail = json.client_email
      privateKey = json.private_key
    } catch {
      // špatně zakódovaný base64 – padneme na individuální proměnné
    }
  }

  if (!clientEmail) clientEmail = process.env.GA4_SERVICE_ACCOUNT_EMAIL
  if (!privateKey) privateKey = process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY

  if (!propertyId || !clientEmail || !privateKey) {
    return NextResponse.json({
      configured: false,
      message:
        'Nastavte GOOGLE_ANALYTICS_PROPERTY_ID a GOOGLE_ANALYTICS_CREDENTIALS_BASE64 (nebo GA4_SERVICE_ACCOUNT_EMAIL + GA4_SERVICE_ACCOUNT_PRIVATE_KEY) v .env.local.',
      data: [],
    })
  }

  try {
    const accessToken = await getGoogleAccessToken(clientEmail, privateKey)
    const report = await fetchGA4Report(propertyId, accessToken)

    if (report.error) {
      throw new Error(`GA4 API: ${report.error.message} (code ${report.error.code})`)
    }

    // GA4 vrací datum ve formátu YYYYMMDD → převedeme na YYYY-MM-DD
    const rowMap: Record<string, { visitors: number; pageviews: number }> = {}
    for (const row of report.rows ?? []) {
      const raw = row.dimensionValues[0].value // "20250218"
      const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
      rowMap[date] = {
        visitors: parseInt(row.metricValues[0].value, 10) || 0,
        pageviews: parseInt(row.metricValues[1].value, 10) || 0,
      }
    }

    const days = getLast7Days()
    const chartData = days.map((date) => {
      const d = new Date(date)
      return {
        name: DAY_LABELS[d.getDay()],
        date,
        visitors: rowMap[date]?.visitors ?? 0,
        pageviews: rowMap[date]?.pageviews ?? 0,
      }
    })

    // Celkový počet návštěvníků za 7 dní (pro stat kartu)
    const totalVisitors = chartData.reduce((s, p) => s + p.visitors, 0)

    return NextResponse.json({
      configured: true,
      data: chartData,
      totalVisitors,
    })
  } catch (err) {
    console.error('GA4 Analytics fetch error:', err)
    return NextResponse.json(
      {
        configured: false,
        message: `Chyba při načítání dat z GA4: ${err instanceof Error ? err.message : String(err)}`,
        data: [],
      },
      { status: 500 },
    )
  }
}
