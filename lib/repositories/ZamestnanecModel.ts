// Model pro správu zaměstnanců
import prisma from '@/lib/db'
import { IZamestnanec, IRozvrh, UroveňStylisty, DenVTydnu } from '@/types/booking'

export class ZamestnanecModel {
  
  /**
   * Získat všechny aktivní zaměstnance
   */
  static async ziskatVsechny(): Promise<IZamestnanec[]> {
    try {
      const zamestnanci = await prisma.zamestnanec.findMany({
        where: { jeAktivni: true },
        orderBy: { uroven: 'desc' }
      })
      
      return zamestnanci.map(this.prismaToInterface)
    } catch (error) {
      console.error('Chyba při načítání zaměstnanců:', error)
      throw new Error('Nepodařilo se načíst zaměstnance')
    }
  }

  /**
   * Získat zaměstnance podle ID
   */
  static async ziskatPodleId(id: number): Promise<IZamestnanec | null> {
    try {
      const zamestnanec = await prisma.zamestnanec.findUnique({
        where: { id }
      })
      
      return zamestnanec ? this.prismaToInterface(zamestnanec) : null
    } catch (error) {
      console.error('Chyba při načítání zaměstnance:', error)
      throw new Error('Nepodařilo se načíst zaměstnance')
    }
  }

  /**
   * Vytvořit nového zaměstnance
   */
  static async vytvorit(data: Omit<IZamestnanec, '_id' | 'vytvořeno' | 'upraveno'>): Promise<IZamestnanec> {
    try {
      const zamestnanec = await prisma.zamestnanec.create({
        data: {
          jmeno: data.jmeno,
          prijmeni: data.prijmeni,
          uroven: data.uroveň,
          email: data.email,
          telefon: data.telefon || null,
          fotoUrl: data.fotoUrl || null,
          rozvrh: data.rozvrh as any,
          dnyVolna: data.dnyVolna,
          jeAktivni: data.jeAktivni
        }
      })
      
      return this.prismaToInterface(zamestnanec)
    } catch (error) {
      console.error('Chyba při vytváření zaměstnance:', error)
      throw new Error('Nepodařilo se vytvořit zaměstnance')
    }
  }

  /**
   * Aktualizovat zaměstnance
   */
  static async aktualizovat(id: number, data: Partial<IZamestnanec>): Promise<IZamestnanec> {
    try {
      const updateData: any = {}
      
      if (data.jmeno !== undefined) updateData.jmeno = data.jmeno
      if (data.prijmeni !== undefined) updateData.prijmeni = data.prijmeni
      if (data.uroveň !== undefined) updateData.uroven = data.uroveň
      if (data.email !== undefined) updateData.email = data.email
      if (data.telefon !== undefined) updateData.telefon = data.telefon
      if (data.fotoUrl !== undefined) updateData.fotoUrl = data.fotoUrl
      if (data.rozvrh !== undefined) updateData.rozvrh = data.rozvrh
      if (data.dnyVolna !== undefined) updateData.dnyVolna = data.dnyVolna
      if (data.jeAktivni !== undefined) updateData.jeAktivni = data.jeAktivni
      
      const zamestnanec = await prisma.zamestnanec.update({
        where: { id },
        data: updateData
      })
      
      return this.prismaToInterface(zamestnanec)
    } catch (error) {
      console.error('Chyba při aktualizaci zaměstnance:', error)
      throw new Error('Nepodařilo se aktualizovat zaměstnance')
    }
  }

  /**
   * Smazat zaměstnance (soft delete)
   */
  static async smazat(id: number): Promise<void> {
    try {
      await prisma.zamestnanec.update({
        where: { id },
        data: { jeAktivni: false }
      })
    } catch (error) {
      console.error('Chyba při mazání zaměstnance:', error)
      throw new Error('Nepodařilo se smazat zaměstnance')
    }
  }

  /**
   * Získat zaměstnance, kteří poskytují určitou službu
   */
  static async ziskatPodleSluzby(sluzby: string[]): Promise<IZamestnanec[]> {
    // TODO: Implementovat logiku podle kvalifikací zaměstnanců
    // Prozatím vrátíme všechny aktivní
    return this.ziskatVsechny()
  }

  /**
   * Převést Prisma objekt na TypeScript interface
   */
  private static prismaToInterface(prismaObj: any): IZamestnanec {
    return {
      _id: prismaObj.id.toString(),
      jmeno: prismaObj.jmeno,
      prijmeni: prismaObj.prijmeni,
      uroveň: prismaObj.uroven as UroveňStylisty,
      email: prismaObj.email,
      telefon: prismaObj.telefon || '',
      fotoUrl: prismaObj.fotoUrl || '',
      rozvrh: prismaObj.rozvrh as IRozvrh[],
      dnyVolna: prismaObj.dnyVolna,
      jeAktivni: prismaObj.jeAktivni,
      vytvořeno: prismaObj.createdAt,
      upraveno: prismaObj.updatedAt
    }
  }

  /**
   * Zkontrolovat dostupnost zaměstnance v určitý den a čas
   * 
   * NE POUŽÍVAT PŘÍMO - viz lib/reservations/availability.ts
   * Tato metoda je zde pro backward compatibility ale je deprecated.
   * 
   * Používejte: zkontrolovatDostupnost(zamestnanecId, datum, casOd, casDo) z availability.ts
   * 
   * @deprecated Klíčové logiky přineseny do @/lib/reservations/availability
   */
  static async zkontrolovatDostupnost(
    zamestnanecId: number, 
    datum: Date, 
    dobaTrvaniMinuty: number
  ): Promise<boolean> {
    // Tato metoda už není používána
    // Delegujeme na lib/reservations/availability.zkontrolovatDostupnost() s reálnými časy
    throw new Error(
      'ZamestnanecModel.zkontrolovatDostupnost() je deprecated. ' +
      'Používejte: zkontrolovatDostupnost(id, datum, casOd, casDo) z @/lib/reservations/availability'
    )
  }
}