import { NextRequest, NextResponse } from 'next/server';

// Mock SMS service - v produkci by se použil skutečný SMS provider
export async function POST(request: NextRequest) {
  try {
    const { to, message, scheduledFor } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Telefon a zpráva jsou povinné' },
        { status: 400 }
      );
    }

    // Validace telefonního čísla
    const phoneRegex = /^(\+420)?[0-9]{9,12}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Neplatný formát telefonního čísla' },
        { status: 400 }
      );
    }

    // Simulace SMS service
    console.log('📱 SMS Service - Odesílám/plánovám SMS:', {
      to,
      message: message.substring(0, 160) + (message.length > 160 ? '...' : ''),
      scheduledFor: scheduledFor || 'okamžitě',
      length: message.length,
    });

    // V produkci by zde bylo volání skutečného SMS providera:
    // - Twilio: https://www.twilio.com/
    // - Vonage (Nexmo): https://developer.vonage.com/
    // - Amazon SNS
    // - Český provider jako SMSKlika, SMSBusiness atd.
    
    // Simulace podle toho, zda je zpráva naplánovaná nebo okamžitá
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      const now = new Date();
      
      if (scheduledDate <= now) {
        await sendImmediateSms(to, message);
      } else {
        await scheduleSms(to, message, scheduledDate);
      }
    } else {
      await sendImmediateSms(to, message);
    }

    return NextResponse.json({
      success: true,
      messageId: `sms_mock_${Date.now()}`,
      message: scheduledFor ? 'SMS byla naplánována' : 'SMS byla odeslána',
      scheduled: !!scheduledFor,
      scheduledFor,
    });

  } catch (error) {
    console.error('Chyba SMS service:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se odeslat SMS' },
      { status: 500 }
    );
  }
}

async function sendImmediateSms(to: string, message: string): Promise<void> {
  // Simulace okamžitého odeslání
  await new Promise(resolve => setTimeout(resolve, 50));
  
  console.log('✅ SMS simulace - okamžité odeslání');
  console.log('📱 SMS obsah:');
  console.log(`Do: ${to}`);
  console.log(`Zpráva: ${message}`);
  console.log('---');
}

async function scheduleSms(to: string, message: string, scheduledDate: Date): Promise<void> {
  // V produkci by se uložila do databáze pro pozdější zpracování cron jobem
  // nebo by se naplánovala přímo v SMS provideru
  
  await new Promise(resolve => setTimeout(resolve, 50));
  
  console.log('📅 SMS simulace - naplánování');
  console.log(`Do: ${to}`);
  console.log(`Zpráva: ${message}`);
  console.log(`Naplánováno na: ${scheduledDate.toLocaleString('cs-CZ')}`);
  console.log('---');
  
  // Simulace uložení do databáze pro cron job
  // await prisma.scheduledSms.create({
  //   data: {
  //     to,
  //     message,
  //     scheduledFor: scheduledDate,
  //     status: 'scheduled'
  //   }
  // });
}