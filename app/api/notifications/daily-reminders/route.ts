import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '../../../../lib/notifications';

// API endpoint pro cron job - denní připomínky
// V produkci by byl zabezpečený tokenem nebo webhookem od cron service (Vercel Cron, GitHub Actions, Crontab)
export async function POST(request: NextRequest) {
  try {
    // Ověření autorizace (v produkci)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    // Pokud je nastaven secret token, ověř ho
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Neautorizovaný přístup' },
        { status: 401 }
      );
    }

    console.log('🕐 Spouštím cron job pro denní připomínky...');
    
    // Spuštění denních připomínek
    await NotificationService.sendDailyReminders();
    
    return NextResponse.json({
      success: true,
      message: 'Denní připomínky byly zpracovány',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chyba při spouštění cron jobu:', error);
    return NextResponse.json(
      { 
        error: 'Chyba při zpracování denních připomínek',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    );
  }
}

// Manuální test endpoint (pouze pro development)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Tento endpoint není dostupný v produkci' },
      { status: 404 }
    );
  }

  try {
    console.log('🧪 Testovací spuštění denních připomínek...');
    
    await NotificationService.sendDailyReminders();
    
    return NextResponse.json({
      success: true,
      message: 'Test denních připomínek dokončen',
      timestamp: new Date().toISOString(),
      note: 'Tento endpoint je dostupný pouze ve vývoji',
    });

  } catch (error) {
    console.error('Chyba při testování cron jobu:', error);
    return NextResponse.json(
      { 
        error: 'Chyba při testování denních připomínek',
        details: error instanceof Error ? error.message : 'Neznámá chyba'
      },
      { status: 500 }
    );
  }
}