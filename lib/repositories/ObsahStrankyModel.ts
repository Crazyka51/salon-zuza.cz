import { prisma } from '@/lib/db'

export class ObsahStrankyModel {
  
  static async getObsah(klic: string): Promise<string | null> {
    try {
      const obsah = await prisma.obsahStranky.findUnique({
        where: {
          klicObsahu: klic
        }
      })
      if (!obsah || !obsah.jeAktivni) {
        return null
      }
      return obsah.obsah || null
    } catch (error) {
      console.error(`Chyba při načítání obsahu pro klíč "${klic}":`, error)
      return null
    }
  }

  static async getObsahPodleKategorie(kategorie: string): Promise<Array<{ id: number; klic: string; obsah: string; nazev?: string }>> {
    try {
      const obsahy = await prisma.obsahStranky.findMany({
        where: {
          kategorie,
          jeAktivni: true
        },
        orderBy: {
          poradoveId: 'asc'
        }
      })
      
      return obsahy.map((item: { id: number; klicObsahu: string; obsah: string; nazev: string | null }) => ({
        id: item.id,
        klic: item.klicObsahu,
        obsah: item.obsah,
        nazev: item.nazev || undefined
      }))
    } catch (error) {
      console.error(`Chyba při načítání obsahu pro kategorii "${kategorie}":`, error)
      return []
    }
  }

  // Legacy metody pro zpětnou kompatibilitu se stávajícím kódem
  static async ziskatPodleKlice(klic: string) {
    const obsah = await prisma.obsahStranky.findUnique({
      where: { klicObsahu: klic }
    })
    if (!obsah || !obsah.jeAktivni) {
      return null
    }
    return { 
      id: obsah.id, 
      klic: obsah.klicObsahu, 
      hodnota: obsah.obsah, 
      stranka: obsah.kategorie || 'general' 
    }
  }

  static async findByCategory(kategorie: string) {
    const obsahy = await this.getObsahPodleKategorie(kategorie)
    return obsahy.map(item => ({
      id: item.id,
      klicObsahu: item.klic,
      obsahText: item.obsah,
      kategorie
    }))
  }

  static async ziskatPodleStranky(stranka: string) {
    const obsahy = await prisma.obsahStranky.findMany({
      where: { 
        kategorie: stranka,
        jeAktivni: true 
      },
      orderBy: { klicObsahu: 'asc' }
    })
    return obsahy.map((item: { id: number; klicObsahu: string; obsah: string }) => ({
      id: item.id,
      klic: item.klicObsahu,
      hodnota: item.obsah,
      stranka
    }))
  }

  static async ziskatVsechny() {
    const obsahy = await prisma.obsahStranky.findMany({
      where: { jeAktivni: true },
      orderBy: { klicObsahu: 'asc' }
    })
    return obsahy.map((item: { id: number; klicObsahu: string; obsah: string; kategorie: string | null }) => ({
      id: item.id,
      klic: item.klicObsahu,
      hodnota: item.obsah,
      stranka: item.kategorie || 'general'
    }))
  }

  static async vytvorit(data: { klic: string; hodnota: string; stranka?: string }) {
    const created = await prisma.obsahStranky.create({
      data: {
        klicObsahu: data.klic,
        obsah: data.hodnota,
        kategorie: data.stranka || 'general'
      }
    })
    return { id: created.id, klic: data.klic, hodnota: data.hodnota, stranka: data.stranka || 'general' }
  }

  static async aktualizovat(id: number, data: { hodnota: string }) {
    await prisma.obsahStranky.update({
      where: { id },
      data: { obsah: data.hodnota }
    })
    return { id, ...data }
  }

  static async aktualizovatHodnotu(klic: string, hodnota: string) {
    const updated = await prisma.obsahStranky.upsert({
      where: { klicObsahu: klic },
      update: { obsah: hodnota },
      create: {
        klicObsahu: klic,
        obsah: hodnota,
        kategorie: 'general'
      }
    })
    return { id: updated.id, klic, hodnota }
  }

  static async smazat(id: number) {
    await prisma.obsahStranky.delete({ where: { id } })
    return { success: true, id }
  }

  static async create(data: { klicObsahu: string; obsahText?: string; nazev?: string; obsah?: string }) {
    const hodnota = data.obsahText || data.obsah || data.nazev || ''
    const created = await prisma.obsahStranky.create({
      data: {
        klicObsahu: data.klicObsahu,
        obsah: hodnota,
        kategorie: 'general',
        nazev: data.nazev
      }
    })
    return { id: created.id, klicObsahu: data.klicObsahu, obsahText: hodnota }
  }

  static async update(klicObsahu: string, data: any) {
    const hodnota = data.obsahText || data.obsah || data.nazev || ''
    const updated = await prisma.obsahStranky.upsert({
      where: { klicObsahu },
      update: { obsah: hodnota, nazev: data.nazev },
      create: {
        klicObsahu,
        obsah: hodnota,
        kategorie: 'general',
        nazev: data.nazev
      }
    })
    return { id: updated.id, klicObsahu, ...data }
  }

  static async delete(klicObsahu: string) {
    await prisma.obsahStranky.deleteMany({
      where: { klicObsahu }
    })
    return { success: true, klicObsahu }
  }

  static async findAll() {
    const obsahy = await prisma.obsahStranky.findMany({
      where: { jeAktivni: true },
      orderBy: { klicObsahu: 'asc' }
    })
    return obsahy.map((item: { id: number; klicObsahu: string; obsah: string; jeAktivni: boolean }) => ({
      id: item.id,
      klicObsahu: item.klicObsahu,
      obsahText: item.obsah,
      jeAktivni: item.jeAktivni
    }))
  }

  static async findMany() {
    return this.findAll()
  }
}