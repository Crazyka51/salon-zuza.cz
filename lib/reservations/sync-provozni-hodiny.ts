/**
 * Synchronizace salonních provozních hodin (ProvozniHodiny) s pracovními rozvrhy zaměstnanců.
 *
 * Provozní hodiny jsou "hlavní vypínač" pro online rezervace - i když má zaměstnanec
 * v rozvrhu nastavený pracovní den (např. sobotu), web nenabídne žádné termíny, pokud
 * je daný den v ProvozniHodiny označen jako zavřený. Tato funkce po každé změně rozvrhu
 * přepočítá otevírací dobu salonu jako sjednocení pracovní doby všech aktivních
 * kadeřnic/stylistů (bez ohledu na to, zda mají i administrátorská práva) pro daný den v týdnu.
 */
import { prisma } from '@/lib/db';

interface RozvrhPolozka {
  den: string;
  od: string;
  do: string;
  jePracovniDen: boolean;
}

const CESKY_DEN_NA_CISLO: Record<string, number> = {
  nedele: 0,
  pondeli: 1,
  utery: 2,
  streda: 3,
  ctvrtek: 4,
  patek: 5,
  sobota: 6,
};

export async function synchronizeProvozniHodinySZamestnanci(): Promise<void> {
  // "jeAdmin" říá jen přístupová práva (např. Zuzana je admin i kadeřnice zároveň) - do provozních
  // hodin musí počítat každý, kdo reálně poskytuje služby, tedy podle role `uroven`.
  const zamestnanci = await prisma.zamestnanec.findMany({
    where: { jeAktivni: true, uroven: 'top_stylist' },
    select: { rozvrh: true },
  });

  const perDen: Record<number, { od: string; do: string; pracujeNekdo: boolean }> = {};
  for (let d = 0; d < 7; d++) {
    perDen[d] = { od: '00:00', do: '00:00', pracujeNekdo: false };
  }

  for (const zamestnanec of zamestnanci) {
    const rozvrh = (zamestnanec.rozvrh as RozvrhPolozka[] | null) ?? [];
    for (const polozka of rozvrh) {
      if (!polozka.jePracovniDen) continue;
      const denCislo = CESKY_DEN_NA_CISLO[polozka.den];
      if (denCislo === undefined) continue;

      const den = perDen[denCislo];
      if (!den.pracujeNekdo || polozka.od < den.od) den.od = polozka.od;
      if (!den.pracujeNekdo || polozka.do > den.do) den.do = polozka.do;
      den.pracujeNekdo = true;
    }
  }

  for (let d = 0; d < 7; d++) {
    const den = perDen[d];
    await prisma.provozniHodiny.upsert({
      where: { denTydne: d },
      update: den.pracujeNekdo
        ? { casOtevrani: den.od, casZavreni: den.do, jeZavreno: false }
        : { jeZavreno: true },
      create: {
        denTydne: d,
        casOtevrani: den.pracujeNekdo ? den.od : '00:00',
        casZavreni: den.pracujeNekdo ? den.do : '00:00',
        jeZavreno: !den.pracujeNekdo,
      },
    });
  }
}
