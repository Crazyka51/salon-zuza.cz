// Model pro správu služeb
import prisma from '@/lib/db'
import { ISluzba, IKategorieSluzeb } from '@/types/booking'

export class SluzbaModel {
  
  /**
   * Získat všechny aktivní služby s kategoriemi
   */
  static async ziskatVsechny(): Promise<ISluzba[]> {
    try {
      const sluzby = await prisma.sluzba.findMany({
        where: { jeAktivni: true },
        include: { kategorie: true },
        orderBy: [
          { kategorie: { poradi: 'asc' } },
          { nazev: 'asc' }
        ]
      })
      
      return sluzby.map(this.prismaToInterface)
    } catch (error) {
      console.error('Chyba při načítání služeb:', error)
      throw new Error('Nepodařilo se načíst služby')
    }
  }

  /**
   * Získat služby podle kategorie
   */
  static async ziskatPodleKategorie(kategorieId: number): Promise<ISluzba[]> {
    try {
      const sluzby = await prisma.sluzba.findMany({
        where: { 
          kategorieId,
          jeAktivni: true 
        },
        include: { kategorie: true },
        orderBy: { nazev: 'asc' }
      })
      
      return sluzby.map(this.prismaToInterface)
    } catch (error) {
      console.error('Chyba při načítání služeb podle kategorie:', error)
      throw new Error('Nepodařilo se načíst služby podle kategorie')
    }
  }

  /**
   * Získat službu podle ID
   */
  static async ziskatPodleId(id: number): Promise<ISluzba | null> {
    try {
      const sluzba = await prisma.sluzba.findUnique({
        where: { id },
        include: { kategorie: true }
      })
      
      return sluzba ? this.prismaToInterface(sluzba) : null
    } catch (error) {
      console.error('Chyba při načítání služby:', error)
      throw new Error('Nepodařilo se načíst službu')
    }
  }

  /**
   * Vytvořit novou službu
   */
  static async vytvorit(data: Omit<ISluzba, '_id' | 'vytvořeno' | 'upraveno' | 'kategorie'>): Promise<ISluzba> {
    try {
      const sluzba = await prisma.sluzba.create({
        data: {
          nazev: data.nazev,
          popis: data.popis,
          dobaTrvaniMinuty: data.dobaTrvaniMinuty,
          cenaTopStylist: data.cena.top_stylist,
          cenaStylist: data.cena.stylist,
          cenaJuniorStylist: data.cena.junior_stylist ?? 0,
          jeAktivni: data.jeAktivni,
          kategorieId: parseInt(data.kategorieId)
        },
        include: { kategorie: true }
      })
      
      return this.prismaToInterface(sluzba)
    } catch (error) {
      console.error('Chyba při vytváření služby:', error)
      throw new Error('Nepodařilo se vytvořit službu')
    }
  }

  /**
   * Aktualizovat službu
   */
  static async aktualizovat(id: number, data: Partial<ISluzba>): Promise<ISluzba> {
    try {
      const updateData: any = {}
      
      if (data.nazev !== undefined) updateData.nazev = data.nazev
      if (data.popis !== undefined) updateData.popis = data.popis
      if (data.dobaTrvaniMinuty !== undefined) updateData.dobaTrvaniMinuty = data.dobaTrvaniMinuty
      if (data.jeAktivni !== undefined) updateData.jeAktivni = data.jeAktivni
      
      if (data.cena) {
        if (data.cena.top_stylist !== undefined) updateData.cenaTopStylist = data.cena.top_stylist
        if (data.cena.stylist !== undefined) updateData.cenaStylist = data.cena.stylist
        if (data.cena.junior_stylist !== undefined) updateData.cenaJuniorStylist = data.cena.junior_stylist
      }
      
      if (data.kategorieId) {
        updateData.kategorieId = parseInt(data.kategorieId)
      }
      
      const sluzba = await prisma.sluzba.update({
        where: { id },
        data: updateData,
        include: { kategorie: true }
      })
      
      return this.prismaToInterface(sluzba)
    } catch (error) {
      console.error('Chyba při aktualizaci služby:', error)
      throw new Error('Nepodařilo se aktualizovat službu')
    }
  }

  /**
   * Smazat službu (soft delete)
   */
  static async smazat(id: number): Promise<void> {
    try {
      await prisma.sluzba.update({
        where: { id },
        data: { jeAktivni: false }
      })
    } catch (error) {
      console.error('Chyba při mazání služby:', error)
      throw new Error('Nepodařilo se smazat službu')
    }
  }

  /**
   * Převést Prisma objekt na TypeScript interface
   */
  private static prismaToInterface(prismaObj: any): ISluzba {
    return {
      _id: prismaObj.id.toString(),
      nazev: prismaObj.nazev,
      kategorie: prismaObj.kategorie.nazev,
      kategorieId: prismaObj.kategorieId.toString(),
      popis: prismaObj.popis || '',
      dobaTrvaniMinuty: prismaObj.dobaTrvaniMinuty,
      cena: {
        top_stylist: prismaObj.cenaTopStylist,
        stylist: prismaObj.cenaStylist,
        junior_stylist: prismaObj.cenaJuniorStylist
      },
      jeAktivni: prismaObj.jeAktivni,
      vytvořeno: prismaObj.createdAt,
      upraveno: prismaObj.updatedAt
    }
  }
}

export class KategorieSluzebModel {
  
  /**
   * Získat všechny aktivní kategorie
   */
  static async ziskatVsechny(): Promise<IKategorieSluzeb[]> {
    try {
      const kategorie = await prisma.kategorieSluzeb.findMany({
        where: { jeAktivni: true },
        orderBy: { poradi: 'asc' }
      })
      
      return kategorie.map(this.prismaToInterface)
    } catch (error) {
      console.error('Chyba při načítání kategorií:', error)
      throw new Error('Nepodařilo se načíst kategorie')
    }
  }

  /**
   * Získat kategorii podle ID
   */
  static async ziskatPodleId(id: number): Promise<IKategorieSluzeb | null> {
    try {
      const kategorie = await prisma.kategorieSluzeb.findUnique({
        where: { id }
      })
      
      return kategorie ? this.prismaToInterface(kategorie) : null
    } catch (error) {
      console.error('Chyba při načítání kategorie:', error)
      throw new Error('Nepodařilo se načíst kategorii')
    }
  }

  /**
   * Vytvořit novou kategorii
   */
  static async vytvorit(data: Omit<IKategorieSluzeb, '_id' | 'vytvořeno' | 'upraveno'>): Promise<IKategorieSluzeb> {
    try {
      const kategorie = await prisma.kategorieSluzeb.create({
        data: {
          nazev: data.nazev,
          popis: data.popis || '',
          poradi: data.poradi,
          jeAktivni: data.jeAktivni
        }
      })
      
      return this.prismaToInterface(kategorie)
    } catch (error) {
      console.error('Chyba při vytváření kategorie:', error)
      throw new Error('Nepodařilo se vytvořit kategorii')
    }
  }

  /**
   * Aktualizovat kategorii
   */
  static async aktualizovat(id: number, data: Partial<IKategorieSluzeb>): Promise<IKategorieSluzeb> {
    try {
      const updateData: any = {}
      
      if (data.nazev !== undefined) updateData.nazev = data.nazev
      if (data.popis !== undefined) updateData.popis = data.popis
      if (data.poradi !== undefined) updateData.poradi = data.poradi
      if (data.jeAktivni !== undefined) updateData.jeAktivni = data.jeAktivni
      
      const kategorie = await prisma.kategorieSluzeb.update({
        where: { id },
        data: updateData
      })
      
      return this.prismaToInterface(kategorie)
    } catch (error) {
      console.error('Chyba při aktualizaci kategorie:', error)
      throw new Error('Nepodařilo se aktualizovat kategorii')
    }
  }

  /**
   * Smazat kategorii (soft delete)
   */
  static async smazat(id: number): Promise<void> {
    try {
      await prisma.kategorieSluzeb.update({
        where: { id },
        data: { jeAktivni: false }
      })
    } catch (error) {
      console.error('Chyba při mazání kategorie:', error)
      throw new Error('Nepodařilo se smazat kategorii')
    }
  }

  /**
   * Převést Prisma objekt na TypeScript interface
   */
  private static prismaToInterface(prismaObj: any): IKategorieSluzeb {
    return {
      _id: prismaObj.id.toString(),
      nazev: prismaObj.nazev,
      popis: prismaObj.popis || '',
      poradi: prismaObj.poradi,
      jeAktivni: prismaObj.jeAktivni,
      vytvořeno: prismaObj.createdAt,
      upraveno: prismaObj.updatedAt
    }
  }
}