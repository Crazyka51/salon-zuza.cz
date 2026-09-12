import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy';
import type { AdminUser } from '@/admin-kit/core/types';
import { synchronizeProvozniHodinySZamestnanci } from '@/lib/reservations/sync-provozni-hodiny';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// JWT nenese `jeAdmin` (viz admin-kit/api/auth.ts), proto admin poznáme podle přiděleného oprávnění.
const jeAdminUzivatel = (authUser: AdminUser): boolean => !!authUser.permissions?.includes('users.update');
const jeVlastniZaznam = (authUser: AdminUser, id: number): boolean => authUser.id === String(id);

// PUT - úprava zaměstnance
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Nejste přihlášeni' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    // Zaměstnanec bez admin role smí upravovat pouze svůj vlastní záznam (např. rozvrh, volno)
    if (!jeAdminUzivatel(authUser) && !jeVlastniZaznam(authUser, id)) {
      return NextResponse.json({ error: 'Nemáte oprávnění upravit tohoto zaměstnance' }, { status: 403 });
    }

    const data = await request.json();

    // jeAdmin se řídí přes PATCH /api/admin/zamestnanci/[id] (viz níže), zde ho nepovolujeme měnit přes PUT
    await prisma.$executeRaw`
      UPDATE zamestnanci
      SET jmeno = ${data.jmeno},
          prijmeni = ${data.prijmeni},
          uroven = ${data.uroven},
          email = ${data.email},
          telefon = ${data.telefon ?? null},
          foto_url = ${data.fotoUrl ?? null},
          rozvrh = ${data.rozvrh ? JSON.stringify(data.rozvrh) : null}::jsonb,
          dny_volna = ${data.dnyVolna ?? []}::text[],
          updated_at = NOW()
      WHERE id = ${id}
    `;

    const [updated] = await prisma.$queryRaw<{ id: number; jmeno: string; prijmeni: string; uroven: string; email: string; jeAdmin: boolean }[]>`
      SELECT id, jmeno, prijmeni, uroven, email, je_admin AS "jeAdmin"
      FROM zamestnanci WHERE id = ${id}
    `;

    // Rozvrh (např. nově zapnutá sobota) se musí promítnout do provozních hodin, jinak online rezervace daný den nenabídne
    if (data.rozvrh) {
      await synchronizeProvozniHodinySZamestnanci();
    }

    return NextResponse.json({ zamestnanec: updated }, { status: 200 });
  } catch (error) {
    console.error('Chyba při úpravě zaměstnance:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se upravit zaměstnance' },
      { status: 500 }
    );
  }
}

// PATCH - přepnutí admin stavu zaměstnance
// Body: { jeAdmin: boolean }
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Nejste přihlášeni' }, { status: 401 });
    }
    if (!jeAdminUzivatel(authUser)) {
      return NextResponse.json({ error: 'Nemáte oprávnění měnit admin roli' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const data = await request.json();

    if (typeof data.jeAdmin !== 'boolean') {
      return NextResponse.json({ error: 'Pole jeAdmin musí být boolean' }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE zamestnanci SET je_admin = ${data.jeAdmin}, updated_at = NOW() WHERE id = ${id}
    `;

    return NextResponse.json({
      message: data.jeAdmin
        ? 'Zaměstnanec byl označen jako administrátor'
        : 'Administrátorská role byla odebrána',
    }, { status: 200 });
  } catch (error) {
    console.error('Chyba při úpravě admin stavu:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se změnit admin stav' },
      { status: 500 }
    );
  }
}

// DELETE - deaktivace zaměstnance (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const authUser = await authenticateApiRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Nejste přihlášeni' }, { status: 401 });
    }
    if (!jeAdminUzivatel(authUser)) {
      return NextResponse.json({ error: 'Nemáte oprávnění deaktivovat zaměstnance' }, { status: 403 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    // Soft delete - pouze deaktivujeme zaměstnance
    const deactivatedZamestnanec = await prisma.zamestnanec.update({
      where: { id },
      data: { jeAktivni: false },
    });

    return NextResponse.json({ 
      message: 'Zaměstnanec byl deaktivován',
      zamestnanec: deactivatedZamestnanec 
    }, { status: 200 });
  } catch (error) {
    console.error('Chyba při deaktivaci zaměstnance:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se deaktivovat zaměstnance' },
      { status: 500 }
    );
  }
}