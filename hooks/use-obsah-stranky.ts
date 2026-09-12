// React hook pro načítání obsahu stránek
'use client'

import { useEffect, useState } from 'react'
import { IApiResponse, IObsahStranky } from '@/types/booking'

type CmsObsahHookResult<T> = {
  obsah: T
  nacitaSe: boolean
  chyba: string | null
}

interface UseCmsObsahOptions {
  klic: string
  stranka?: string
}

const cacheObsahuStranek = new Map<string, IObsahStranky[]>()
const cacheObsahuPodleKlice = new Map<string, IObsahStranky | null>()
const pendingObsahStranek = new Map<string, Promise<IObsahStranky[]>>()
const pendingObsahPodleKlice = new Map<string, Promise<IObsahStranky | null>>()

async function nacistObsahStrankyZeServeru(stranka: string): Promise<IObsahStranky[]> {
  const zCache = cacheObsahuStranek.get(stranka)

  if (zCache) {
    return zCache
  }

  const pending = pendingObsahStranek.get(stranka)

  if (pending) {
    return pending
  }

  const requestPromise = (async () => {
    const response = await fetch(`/api/cms/page-content?stranka=${encodeURIComponent(stranka)}`)
    const result = (await response.json()) as IApiResponse<IObsahStranky[]>

    if (!result.uspech || !result.data) {
      throw new Error(result.chyba || 'Chyba při načítání obsahu')
    }

    cacheObsahuStranek.set(stranka, result.data)
    return result.data
  })()

  pendingObsahStranek.set(stranka, requestPromise)

  try {
    return await requestPromise
  } finally {
    pendingObsahStranek.delete(stranka)
  }
}

async function nacistObsahPodleKliceZeServeru(klic: string): Promise<IObsahStranky | null> {
  const zCache = cacheObsahuPodleKlice.get(klic)

  if (zCache !== undefined) {
    return zCache
  }

  const pending = pendingObsahPodleKlice.get(klic)

  if (pending) {
    return pending
  }

  const requestPromise = (async () => {
    const response = await fetch(`/api/cms/page-content?klic=${encodeURIComponent(klic)}`)
    const result = (await response.json()) as IApiResponse<IObsahStranky>

    if (!result.uspech || !result.data) {
      return null
    }

    cacheObsahuPodleKlice.set(klic, result.data)
    return result.data
  })()

  pendingObsahPodleKlice.set(klic, requestPromise)

  try {
    return await requestPromise
  } finally {
    pendingObsahPodleKlice.delete(klic)
  }
}

/**
 * Hook pro načítání obsahu konkrétní stránky
 */
export function useObsahStranky(stranka: string) {
  const [obsah, setObsah] = useState<IObsahStranky[]>([])
  const [nacitaSe, setNacitaSe] = useState(true)
  const [chyba, setChyba] = useState<string | null>(null)

  useEffect(() => {
    let jeAktivni = true

    const cachedObsah = cacheObsahuStranek.get(stranka)

    if (cachedObsah) {
      setObsah(cachedObsah)
      setChyba(null)
      setNacitaSe(false)
      return () => {
        jeAktivni = false
      }
    }

    async function nacistObsah() {
      try {
        setNacitaSe(true)
        setChyba(null)

        const data = await nacistObsahStrankyZeServeru(stranka)

        if (jeAktivni) {
          setObsah(data)
        }
      } catch (error) {
        if (jeAktivni) {
          setChyba('Chyba při načítání obsahu')
          console.error('Chyba useObsahStranky:', error)
        }
      } finally {
        if (jeAktivni) {
          setNacitaSe(false)
        }
      }
    }

    if (stranka) {
      void nacistObsah()
    } else {
      setNacitaSe(false)
    }

    return () => {
      jeAktivni = false
    }
  }, [stranka])

  return { obsah, nacitaSe, chyba }
}

/**
 * Hook pro načítání konkrétního obsahu podle klíče nebo ze sekce stránky
 */
export function useCmsObsah({ klic, stranka }: UseCmsObsahOptions): CmsObsahHookResult<IObsahStranky | null> {
  const [obsah, setObsah] = useState<IObsahStranky | null>(null)
  const [nacitaSe, setNacitaSe] = useState(true)
  const [chyba, setChyba] = useState<string | null>(null)

  useEffect(() => {
    let jeAktivni = true

    if (!stranka) {
      setObsah(null)
      setNacitaSe(false)
      setChyba(null)
      return () => {
        jeAktivni = false
      }
    }

    const cachedObsahZeStranky = cacheObsahuStranek.get(stranka)

    if (cachedObsahZeStranky) {
      const nalezenyObsah = cachedObsahZeStranky.find((polozka) => polozka.klic === klic) ?? null

      setObsah(nalezenyObsah)
      setChyba(nalezenyObsah ? null : 'Obsah nenalezen')
      setNacitaSe(false)

      return () => {
        jeAktivni = false
      }
    }

    async function nacistObsah() {
      try {
        setNacitaSe(true)
        setChyba(null)
        setObsah(null)

        const data = stranka
          ? (await nacistObsahStrankyZeServeru(stranka)).find((polozka) => polozka.klic === klic) ?? null
          : await nacistObsahPodleKliceZeServeru(klic)

        if (!jeAktivni) {
          return
        }

        if (data) {
          setObsah(data)
        } else {
          setChyba('Obsah nenalezen')
        }
      } catch (error) {
        if (jeAktivni) {
          setChyba('Chyba při načítání obsahu')
          console.error('Chyba useCmsObsah:', error)
        }
      } finally {
        if (jeAktivni) {
          setNacitaSe(false)
        }
      }
    }

    if (klic) {
      void nacistObsah()
    } else {
      setNacitaSe(false)
    }

    return () => {
      jeAktivni = false
    }
  }, [klic, stranka])

  return { obsah, nacitaSe, chyba }
}

/**
 * Hook pro načítání konkrétního obsahu podle klíče
 */
export function useObsahPodleKlice(klic: string) {
  return useCmsObsah({ klic })
}

/**
 * Hook pro načítání konkrétního obsahu podle klíče v rámci jedné stránky.
 */
export function useObsahPodleKliceZeStranky(stranka: string, klic: string) {
  return useCmsObsah({ klic, stranka })
}

/**
 * Hook pro admin - správa obsahu s možností editace
 */
export function useAdminObsah(stranka?: string) {
  const [obsah, setObsah] = useState<IObsahStranky[]>([])
  const [nacitaSe, setNacitaSe] = useState(true)
  const [chyba, setChyba] = useState<string | null>(null)

  const nacistObsah = async () => {
    try {
      setNacitaSe(true)
      setChyba(null)

      const url = stranka
        ? `/api/admin/page-content?stranka=${stranka}`
        : '/api/admin/page-content'

      const response = await fetch(url)
      const result = (await response.json()) as IApiResponse<IObsahStranky[]>

      if (result.uspech && result.data) {
        setObsah(result.data)
      } else {
        setChyba(result.chyba || 'Chyba při načítání obsahu')
      }
    } catch (error) {
      setChyba('Chyba při načítání obsahu')
      console.error('Chyba useAdminObsah:', error)
    } finally {
      setNacitaSe(false)
    }
  }

  const aktualizovatObsah = async (klic: string, hodnota: string) => {
    try {
      const response = await fetch(`/api/admin/page-content?klic=${klic}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hodnota })
      })

      const result = await response.json()

      if (result.uspech) {
        // Aktualizovat lokální stav
        setObsah(prev => prev.map(item =>
          item.klic === klic
            ? { ...item, hodnota, upraveno: new Date() }
            : item
        ))
      } else {
        throw new Error(result.chyba)
      }

      return result
    } catch (error) {
      console.error('Chyba při aktualizaci:', error)
      throw error
    }
  }

  const vytvorit = async (data: Omit<IObsahStranky, '_id' | 'vytvořeno' | 'upraveno'>) => {
    try {
      const response = await fetch('/api/admin/page-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.uspech) {
        await nacistObsah()
      }

      return result
    } catch (error) {
      console.error('Chyba při vytváření:', error)
      throw error
    }
  }

  const smazat = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/page-content?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.uspech) {
        await nacistObsah()
      }

      return result
    } catch (error) {
      console.error('Chyba při mazání:', error)
      throw error
    }
  }

  useEffect(() => {
    void nacistObsah()
  }, [stranka])

  return {
    obsah,
    nacitaSe,
    chyba,
    nacistObsah,
    aktualizovatObsah,
    vytvorit,
    smazat
  }
}