import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy';
import { STAV, normalizovatStav } from '@/lib/reservations/stav';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Nejste přihlášeni' }, { status: 401 });
    }

    // Poslední 7 dní
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Načti poslední rezervace
    const reserves = await prisma.rezervace.findMany({
      where: {
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 3,
      include: {
        sluzba: true,
        zamestnanec: true,
      },
    });

    const pendingReservations = await prisma.rezervace.findMany({
      where: { stav: { in: [STAV.CEKA_NA_POTVRZENI, 'ceka_na_potvrzeni'] } },
      orderBy: [{ datum: 'asc' }, { casOd: 'asc' }],
      take: 5,
      select: {
        id: true,
        jmeno: true,
        prijmeni: true,
        datum: true,
        casOd: true,
        casDo: true,
      },
    });

    // Načti poslední úpravy obsahu
    const contentUpdates = await prisma.obsahStranky.findMany({
      where: {
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 3,
    });

    // Načti poslední úpravy služeb
    const serviceUpdates = await prisma.sluzba.findMany({
      where: {
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 3,
    });

    // Transformuj do activity formátu
    const activities = [
      ...reserves.map((res) => ({
        id: `reservation-${res.id}`,
        type: 'booking',
        title: `${
          normalizovatStav(res.stav) === STAV.CEKA_NA_POTVRZENI
            ? 'Nová rezervace'
            : normalizovatStav(res.stav) === STAV.POTVRZENO
              ? 'Potvrzena rezervace'
              : normalizovatStav(res.stav) === STAV.ZRUSENO_ZAKAZNIKEM || normalizovatStav(res.stav) === STAV.ZRUSENO_SALONEM
                ? 'Zrušena rezervace'
                : 'Aktualizována rezervace'
        }: ${res.jmeno} ${res.prijmeni}`,
        time: formatTime(res.updatedAt),
        user: 'Online',
        timestamp: res.updatedAt.getTime(),
      })),
      ...contentUpdates.map((content) => ({
        id: `content-${content.id}`,
        type: 'content',
        title: `Upraven obsah: ${content.nazev || content.klicObsahu}`,
        time: formatTime(content.updatedAt),
        user: 'Admin',
        timestamp: content.updatedAt.getTime(),
      })),
      ...serviceUpdates.map((service) => ({
        id: `service-${service.id}`,
        type: 'content',
        title: `Aktualizována služba: ${service.nazev}`,
        time: formatTime(service.updatedAt),
        user: 'Admin',
        timestamp: service.updatedAt.getTime(),
      })),
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(({ timestamp, ...rest }) => rest);

    return NextResponse.json({
      activities,
      pendingReservations,
      success: true,
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch recent activity',
        activities: [],
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'právě teď';
  if (diffMins < 60) return `před ${diffMins} ${diffMins === 1 ? 'minutou' : 'minutami'}`;
  if (diffHours < 24) return `před ${diffHours} ${diffHours === 1 ? 'hodinou' : 'hodinami'}`;
  if (diffDays < 7) return `před ${diffDays} ${diffDays === 1 ? 'dnem' : 'dny'}`;

  return date.toLocaleDateString('cs-CZ');
}
