import { NextRequest, NextResponse } from 'next/server';

// POZNÁMKA: Tento endpoint se momentálně nepoužívá
// Email potvrzení se posílá přímo z online-rezervace/page.tsx pomocí _cc pole v Formspree

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      email,
      jmeno,
      prijmeni,
      datum,
      cas,
      sluzby,
      kadernice,
      pocetOsob,
      pocetDeti,
      celkovaCena,
    } = data;

    if (!email || !jmeno || !datum) {
      return NextResponse.json(
        { error: 'Chybí povinná pole' },
        { status: 400 }
      );
    }

    // DOČASNĚ DEAKTIVOVÁNO - používá se _cc v hlavním emailu
    console.warn('⚠️ Endpoint /api/email/confirmation byl volán, ale je deaktivován. Potvrzovací emaily se posílají přes _cc.');
    
    return NextResponse.json(
      { success: true, message: 'Endpoint je deaktivován - používá se _cc v hlavním emailu' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Chyba v deaktivovaném potvrzovacím endpointu:', error);
    return NextResponse.json(
      { success: true, warning: 'Endpoint je deaktivován' },
      { status: 200 }
    );
  }
}
