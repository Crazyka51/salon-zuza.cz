import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializace Resend - vyžaduje RESEND_API_KEY v .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, template, data } = await request.json();

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Email a předmět jsou povinné' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY není nastavené - používám mock mode');
      return mockEmailResponse(to, subject, template, data);
    }

    console.log('📧 Resend Email Service - Odesílám email:', {
      to,
      subject,
      template,
    });

    // Vygenerování HTML obsahu emailu podle šablony
    const { htmlContent, textContent } = generateEmailContent(template, data);

    const emailData = {
      from: process.env.RESEND_FROM_EMAIL || 'Salon Zuza <rezervace@salon-zuza.cz>',
      to: [to],
      subject: subject,
      html: htmlContent,
      text: textContent,
      reply_to: process.env.RESEND_REPLY_TO || 'info@salon-zuza.cz',
    };

    const response = await resend.emails.send(emailData);

    if (response.error) {
      console.error('❌ Chyba Resend API:', response.error);
      return NextResponse.json(
        { error: 'Chyba při odesílání emailu', details: response.error },
        { status: 500 }
      );
    }

    console.log('✅ Email úspěšně odeslán přes Resend:', response.data?.id);
    return NextResponse.json({
      success: true,
      messageId: response.data?.id,
      message: 'Email byl úspěšně odeslán přes Resend'
    });

  } catch (error) {
    console.error('❌ Chyba email service:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se odeslat email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fallback mock pro dev prostředí bez Resend API key
function mockEmailResponse(to: string, subject: string, template: string, data: any) {
  console.log('📧 Mock Email Service (Resend API key nebyl nalezen):');
  const { textContent } = generateEmailContent(template, data);
  console.log('📨 Obsah emailu:');
  console.log('---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(textContent);
  console.log('---');

  return NextResponse.json({
    success: true,
    messageId: `mock_${Date.now()}`,
    message: 'Email byl simulován (mock mode)'
  });
}

function generateEmailContent(template: string, data: any): { htmlContent: string; textContent: string } {
  switch (template) {
    case 'reservation-confirmation':
      const htmlContent = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registrace termínu rezervace - Salon Zuza</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      margin: 0; 
      padding: 0; 
      background-color: #f8f9fa; 
      color: #333;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #B8A876 0%, #A39566 100%); 
      color: white; 
      padding: 30px 40px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0 0 10px 0; 
      font-size: 28px; 
      font-weight: 700;
    }
    .header p { 
      margin: 0; 
      font-size: 16px; 
      opacity: 0.95;
    }
    .content { 
      padding: 40px; 
      color: #333; 
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #333;
    }
    .details { 
      background: #f8f9fa; 
      padding: 24px; 
      border-radius: 8px; 
      margin: 24px 0;
      border: 1px solid #e9ecef;
    }
    .details h3 {
      color: #B8A876;
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
    }
    .details-row { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin: 12px 0; 
      padding: 12px 0; 
      border-bottom: 1px solid #dee2e6; 
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label { 
      font-weight: 600; 
      color: #495057;
      font-size: 14px;
    }
    .details-value {
      font-weight: 500;
      color: #212529;
    }
    .reservation-id {
      background: #B8A876;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 12px;
    }
    .contact-info { 
      background: #e3f2fd; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 24px 0;
      border-left: 4px solid #2196f3;
    }
    .contact-info h3 {
      color: #1976d2;
      margin: 0 0 12px 0;
      font-size: 16px;
    }
    .contact-info p {
      margin: 8px 0;
      color: #424242;
    }
    .info-list {
      background: #fff3e0;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border-left: 4px solid #ff9800;
    }
    .info-list h3 {
      color: #f57c00;
      margin: 0 0 12px 0;
      font-size: 16px;
    }
    .info-list ul {
      margin: 0;
      padding-left: 20px;
      color: #424242;
    }
    .info-list li {
      margin: 8px 0;
    }
    .footer { 
      background: #f8f9fa;
      padding: 24px 40px; 
      text-align: center; 
      color: #6c757d; 
      font-size: 14px;
      border-top: 1px solid #dee2e6;
    }
    .cta {
      background: #fff;
      border: 2px solid #B8A876;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      margin: 24px 0;
    }
    .cta p {
      margin: 0;
      color: #B8A876;
      font-weight: 600;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Salon Zuza</h1>
      <p>Registrace termínu vaší rezervace</p>
    </div>

    <div class="content">
      <div class="greeting">
        Dobrý den <strong>${data.jmeno} ${data.prijmeni}</strong>,
      </div>
      
      <p>děkujeme za vaši rezervaci! Vaše rezervace byla úspěšně zaznamenána v našem systému. <strong>Nyní čeká na schválení naším personálem.</strong></p>

      <p style="background: #fff3e0; padding: 16px; border-radius: 8px; border-left: 4px solid #ff9800; color: #424242;">
        <strong>⏳ Důležité:</strong> Jakmile zaměstnanec vaši rezervaci schválí v administraci, pošleme vám potvrzovací e-mail. Do té doby je váš termín rezervován a na seznamu čekajících na schválení.
      </p>

      <div class="details">
        <h3>📋 Detaily vaší rezervace</h3>
        
        <div class="details-row">
          <span class="details-label">Číslo rezervace:</span>
          <span class="reservation-id">#${data.rezervaceId}</span>
        </div>
        
        <div class="details-row">
          <span class="details-label">📅 Datum:</span>
          <span class="details-value"><strong>${data.datum}</strong></span>
        </div>
        
        <div class="details-row">
          <span class="details-label">🕒 Čas:</span>
          <span class="details-value"><strong>${data.casOd} - ${data.casDo}</strong></span>
        </div>
        
        <div class="details-row">
          <span class="details-label">💅 Služb${(data.services && data.services.length > 1) || (data.všechnySlužby && data.všechnySlužby.length > 1) ? 'y' : 'a'}:</span>
          <span class="details-value">
            ${(() => {
              // Podpora pro více služeb
              if (data.všechnySlužby && Array.isArray(data.všechnySlužby) && data.všechnySlužby.length > 0) {
                return data.všechnySlužby
                  .map((s: any) => `<strong>${s.nazev}</strong> (${s.dobaTrvaniMinuty} min, ${s.cena} Kč)`)
                  .join('<br>• ');
              }
              // Podpora pro services pole (zpětná kompatibilita)
              if (data.services && Array.isArray(data.services) && data.services.length > 0) {
                return data.services.map((s: any) => s.nazev || s).join('<br>• ');
              }
              // Fallback na původní data.sluzba
              if (data.sluzba) {
                return Array.isArray(data.sluzba) ? data.sluzba.join('<br>• ') : data.sluzba;
              }
              // Fallback na data.sluzby string (z lib/notifications.ts)
              if (data.sluzby) {
                return data.sluzby.replace(/\n/g, '<br>• ');
              }
              return 'Služba nebyla správně načtena';
            })()}
          </span>
        </div>
        
        <div class="details-row">
          <span class="details-label">👩‍💼 Kadeřnice:</span>
          <span class="details-value">${data.zamestnanec}</span>
        </div>
        
        <div class="details-row">
          <span class="details-label">💰 Celková cena:</span>
          <span class="details-value"><strong style="color: #B8A876; font-size: 16px;">${data.cena}</strong></span>
        </div>
      </div>

      <div class="cta">
        <p>🎉 Těšíme se na vaši návštěvu!</p>
      </div>

      <div class="contact-info">
        <h3>📞 Kontakt a informace</h3>
        <p><strong>Salon Zuza</strong></p>
        <p>📧 Email: info@salon-zuza.cz</p>
        <p>📞 Telefon: +420 724 311 258</p>
        <p>🏠 Adresa:Dobříš, Fričova 1240</p>
        <p>🌐 Web: www.salon-zuza.cz</p>
      </div>

      <div class="info-list">
        <h3>💡 Důležité informace</h3>
        <ul>
          <li><strong>⏳ Rezervace čeká na schválení</strong> - jakmile zaměstnanec rezervaci schválí, obdržíte potvrzovací e-mail</li>
          <li>Do potvrzení je váš termín rezervován, ale není finálně zamluvený</li>
          <li>Doporučujeme dorazit 5-10 minut před začátkem rezervace</li>
          <li>V případě potřeby změny termínu nás kontaktujte alespoň 24 hodin předem</li>
          <li>Platba probíhá po poskytnutí služby přímo v salonu</li>
        </ul>
      </div>

      <p style="text-align: center; margin-top: 32px; color: #B8A876; font-style: italic;">
        "Krása začína s vaší sebedůvěrou" ✨
      </p>
    </div>

    <div class="footer">
      <p><strong>Salon Zuza</strong></p>
      <p>Tento email byl vygenerován automaticky na základě vaší rezervace.<br>
      Pro jakékoli dotazy nás kontaktujte na info@salon-zuza.cz nebo +420 724 311 258</p>
    </div>
  </div>
</body>
</html>`;

      const textContent = `
Registrace termínu rezervace - Salon Zuza

Dobrý den ${data.jmeno} ${data.prijmeni},

děkujeme za vaši rezervaci! Vaše rezervace byla úspěšně zaznamenána v našem systému.
Nyní čeká na schválení naším personálem.

⏳ DŮLEŽITÉ:
Jakmile zaměstnanec vaši rezervaci schválí v administraci, pošleme vám potvrzovací e-mail.
Do té doby je váš termín rezervován a na seznamu čekajících na schválení.

DETAILY REZERVACE:
==================
Číslo rezervace: #${data.rezervaceId}
Datum: ${data.datum}
Čas: ${data.casOd} - ${data.casDo}
Služb${(() => {
  if (data.všechnySlužby && Array.isArray(data.všechnySlužby) && data.všechnySlužby.length > 1) return 'y';
  if (data.services && Array.isArray(data.services) && data.services.length > 1) return 'y';
  return 'a';
})()}: ${(() => {
  // Podpora pro více služeb
  if (data.všechnySlužby && Array.isArray(data.všechnySlužby) && data.všechnySlužby.length > 0) {
    return data.všechnySlužby
      .map((s: any) => `  • ${s.nazev} (${s.dobaTrvaniMinuty} min, ${s.cena} Kč)`)
      .join('\n');
  }
  // Podpora pro services pole
  if (data.services && Array.isArray(data.services) && data.services.length > 0) {
    return data.services.map((s: any) => `  • ${s.nazev || s}`).join('\n');
  }
  // Fallback na původní data
  if (data.sluzba) {
    return Array.isArray(data.sluzba) ? data.sluzba.map((s: any) => `  • ${s}`).join('\n') : `  • ${data.sluzba}`;
  }
  if (data.sluzby) {
    return data.sluzby.split('\n').map((line: any) => `  • ${line.trim()}`).join('\n');
  }
  return 'Služba nebyla správně načtena';
})()}
Kadeřnice: ${data.zamestnanec}
Celková cena: ${data.cena}

KONTAKT:
========
Salon Zuza
Email: info@salon-zuza.cz
Telefon: +420 777 123 456
Web: www.salon-zuza.cz

DŮLEŽITÉ INFORMACE:
===================
- Rezervace čeká na schválení - jakmile zaměstnanec rezervaci schválí, obdržíte potvrzovací e-mail
- Do potvrzení je váš termín rezervován, ale není finálně zamluvený
- Doporučujeme dorazit 5-10 minut před začátkem rezervace
- V případě potřeby změny termínu nás kontaktujte alespoň 24 hodin předem
- Platba probíhá po poskytnutí služby přímo v salonu

Děkujeme za trpělivost!

S pozdravem,
Tým Salon Zuza
      `.trim();

      return { htmlContent, textContent };

    case 'status-change':
      const statusHtml = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.statusMessage || 'Změna stavu rezervace'} - Salon Zuza</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      margin: 0; 
      padding: 0; 
      background-color: #f8f9fa; 
      color: #333;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #B8A876 0%, #A39566 100%); 
      color: white; 
      padding: 30px 40px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0 0 10px 0; 
      font-size: 28px; 
      font-weight: 700;
    }
    .header p { 
      margin: 0; 
      font-size: 16px; 
      opacity: 0.95;
    }
    .content { 
      padding: 40px; 
      color: #333; 
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #333;
    }
    .details { 
      background: #f8f9fa; 
      padding: 24px; 
      border-radius: 8px; 
      margin: 24px 0;
      border: 1px solid #e9ecef;
    }
    .details h3 {
      color: #B8A876;
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
    }
    .details-row { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin: 12px 0; 
      padding: 12px 0; 
      border-bottom: 1px solid #dee2e6; 
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label { 
      font-weight: 600; 
      color: #495057;
      font-size: 14px;
    }
    .details-value {
      font-weight: 500;
      color: #212529;
    }
    .reservation-id {
      background: #B8A876;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 12px;
    }
    .contact-info { 
      background: #e3f2fd; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 24px 0;
      border-left: 4px solid #2196f3;
    }
    .contact-info h3 {
      color: #1976d2;
      margin: 0 0 12px 0;
      font-size: 16px;
    }
    .contact-info p {
      margin: 8px 0;
      color: #424242;
    }
    .status-message {
      background: #e1f5fe;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #03a9f4;
      color: #0277bd;
      font-weight: 500;
      margin-bottom: 24px;
    }
    .footer { 
      background: #f8f9fa;
      padding: 24px 40px; 
      text-align: center; 
      color: #6c757d; 
      font-size: 14px;
      border-top: 1px solid #dee2e6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Salon Zuza</h1>
      <p>Změna stavu rezervace</p>
    </div>

    <div class="content">
      <div class="greeting">
        Dobrý den <strong>${data.jmeno} ${data.prijmeni}</strong>,
      </div>
      
      <p>informujeme vás o změně stavu vaší rezervace.</p>

      <div class="status-message">
        ${data.statusMessage}
      </div>

      <div class="details">
        <h3>📋 Detaily vaší rezervace</h3>
        
        <div class="details-row">
          <span class="details-label">Číslo rezervace:</span>
          <span class="reservation-id">#${data.rezervaceId}</span>
        </div>
        
        <div class="details-row">
          <span class="details-label">📅 Datum:</span>
          <span class="details-value"><strong>${data.datum}</strong></span>
        </div>
        
        <div class="details-row">
          <span class="details-label">🕒 Čas:</span>
          <span class="details-value"><strong>${data.casOd} - ${data.casDo}</strong></span>
        </div>
        
        <div class="details-row">
          <span class="details-label">💅 Služb${(data.services && data.services.length > 1) || (data.všechnySlužby && data.všechnySlužby.length > 1) ? 'y' : 'a'}:</span>
          <span class="details-value">
            ${(() => {
              if (data.všechnySlužby && Array.isArray(data.všechnySlužby) && data.všechnySlužby.length > 0) {
                return data.všechnySlužby
                  .map((s: any) => `<strong>${s.nazev}</strong> (${s.dobaTrvaniMinuty} min, ${s.cena} Kč)`)
                  .join('<br>• ');
              }
              if (data.services && Array.isArray(data.services) && data.services.length > 0) {
                return data.services.map((s: any) => s.nazev || s).join('<br>• ');
              }
              if (data.sluzba) {
                return Array.isArray(data.sluzba) ? data.sluzba.join('<br>• ') : data.sluzba;
              }
              if (data.sluzby) {
                return data.sluzby.replace(/\n/g, '<br>• ');
              }
              return 'Služba nebyla správně načtena';
            })()}
          </span>
        </div>
        
        <div class="details-row">
          <span class="details-label">👩‍💼 Kadeřnice:</span>
          <span class="details-value">${data.zamestnanec}</span>
        </div>
        
        <div class="details-row">
          <span class="details-label">💰 Celková cena:</span>
          <span class="details-value"><strong style="color: #B8A876; font-size: 16px;">${data.cena}</strong></span>
        </div>
      </div>

      <div class="contact-info">
        <h3>📞 Kontakt a informace</h3>
        <p><strong>Salon Zuza</strong></p>
        <p>📧 Email: info@salon-zuza.cz</p>
        <p>📞 Telefon: +420 724 311 258</p>
        <p>🏠 Adresa:Dobříš, Fričova 1240</p>
        <p>🌐 Web: www.salon-zuza.cz</p>
      </div>

      ${data.status === 'POTVRZENO' ? `
      <div class="info-list" style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; margin: 0 0 12px 0; font-size: 16px;">💡 Důležité informace</h3>
        <ul style="margin: 0; padding-left: 20px; color: #424242;">
          <li style="margin: 8px 0;">Vaše rezervace je potvrzena. Těšíme se na vás!</li>
          <li style="margin: 8px 0;">Platba probíhá po poskytnutí služby přímo v salonu.</li>
          <li style="margin: 8px 0;">Doporučujeme dorazit 5-10 minut před začátkem.</li>
        </ul>
      </div>
      ` : (data.status === 'ZAMITNUTO' || data.status === 'ZRUSENO' || data.status === 'ZRUSENO_KLIENTEM') ? `
      <div class="info-list" style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #f44336;">
        <h3 style="color: #c62828; margin: 0 0 12px 0; font-size: 16px;">💡 Důležité informace</h3>
        <ul style="margin: 0; padding-left: 20px; color: #424242;">
          <li style="margin: 8px 0;">Rezervace byla úspěšně zrušena/zamítnuta a váš termín uvolněn.</li>
          <li style="margin: 8px 0;">Pokud si přejete vytvořit novou, budeme se těšit online či telefonicky!</li>
        </ul>
      </div>
      ` : `
      <div class="info-list" style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #ff9800;">
        <h3 style="color: #f57c00; margin: 0 0 12px 0; font-size: 16px;">💡 Důležité informace</h3>
        <ul style="margin: 0; padding-left: 20px; color: #424242;">
          <li style="margin: 8px 0;">Pro jakékoliv otázky ohledně změny stavu nás prosím neváhejte kontaktovat.</li>
        </ul>
      </div>
      `}
      
      <p style="text-align: center; margin-top: 32px; color: #B8A876; font-style: italic;">
        "Krása začína s vaší sebedůvěrou" ✨
      </p>
    </div>

    <div class="footer">
      <p><strong>Salon Zuza</strong></p>
      <p>Tento email byl vygenerován automaticky na základě vaší rezervace.<br>
      Pro jakékoli dotazy nás kontaktujte na info@salon-zuza.cz nebo +420 724 311 258</p>
    </div>
  </div>
</body>
</html>`;

      const statusText = `
Změna stavu rezervace - Salon Zuza

Dobrý den ${data.jmeno} ${data.prijmeni},

informujeme vás o změně stavu vaší rezervace.

STAV REZERVACE
==============
${data.statusMessage}

DETAILY REZERVACE:
==================
Číslo rezervace: #${data.rezervaceId}
Datum: ${data.datum}
Čas: ${data.casOd} - ${data.casDo}
Služb${(() => {
  if (data.všechnySlužby && Array.isArray(data.všechnySlužby) && data.všechnySlužby.length > 1) return 'y';
  if (data.services && Array.isArray(data.services) && data.services.length > 1) return 'y';
  return 'a';
})()}: ${(() => {
  if (data.všechnySlužby && Array.isArray(data.všechnySlužby) && data.všechnySlužby.length > 0) {
    return data.všechnySlužby
      .map((s: any) => `  • ${s.nazev} (${s.dobaTrvaniMinuty} min, ${s.cena} Kč)`)
      .join('\n');
  }
  if (data.services && Array.isArray(data.services) && data.services.length > 0) {
    return data.services.map((s: any) => `  • ${s.nazev || s}`).join('\n');
  }
  if (data.sluzba) {
    return Array.isArray(data.sluzba) ? data.sluzba.map((s: any) => `  • ${s}`).join('\n') : `  • ${data.sluzba}`;
  }
  if (data.sluzby) {
    return data.sluzby.split('\n').map((line: any) => `  • ${line.trim()}`).join('\n');
  }
  return 'Služba nebyla správně načtena';
})()}
Kadeřnice: ${data.zamestnanec}
Celková cena: ${data.cena}

KONTAKT:
========
Salon Zuza
Email: info@salon-zuza.cz
Telefon: +420 724 311 258
Web: www.salon-zuza.cz

DŮLEŽITÉ INFORMACE:
===================
${data.status === 'POTVRZENO' ? 
`- Vaše rezervace je potvrzena. Těšíme se na vás!
- Platba probíhá po poskytnutí služby přímo v salonu.
- Doporučujeme dorazit 5-10 minut před začátkem.` : 
(data.status === 'ZAMITNUTO' || data.status === 'ZRUSENO' || data.status === 'ZRUSENO_KLIENTEM') ? 
`- Rezervace byla úspěšně zrušena/zamítnuta a váš termín uvolněn.
- Pokud si přejete vytvořit novou, budeme se těšit online či telefonicky!` : 
`- Pro jakékoliv otázky ohledně změny stavu nás prosím neváhejte kontaktovat.`}

V případě dotazů nás kontaktujte.

S pozdravem,
Tým Salon Zuza
      `.trim();

      return { htmlContent: statusHtml, textContent: statusText };

    case 'admin-new-reservation':
      const adminHtmlContent = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nová rezervace - administrace</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      margin: 0; 
      padding: 0; 
      background-color: #f8f9fa; 
      color: #333;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #333333 0%, #111111 100%); 
      color: white; 
      padding: 30px 40px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0 0 10px 0; 
      font-size: 28px; 
      font-weight: 700;
    }
    .header p { 
      margin: 0; 
      font-size: 16px; 
      opacity: 0.95;
    }
    .content { 
      padding: 40px; 
      color: #333; 
    }
    .details { 
      background: #f8f9fa; 
      padding: 24px; 
      border-radius: 8px; 
      margin: 24px 0;
      border: 1px solid #e9ecef;
    }
    .details-row { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin: 12px 0; 
      padding: 12px 0; 
      border-bottom: 1px solid #dee2e6; 
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label { 
      font-weight: 600; 
      color: #495057;
      font-size: 14px;
    }
    .details-value {
      font-weight: 500;
      color: #212529;
    }
    .reservation-id {
      background: #333333;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 12px;
    }
    .btn {
      display: inline-block;
      background-color: #B8A876;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 24px;
      text-align: center;
      width: 100%;
      box-sizing: border-box;
    }
    .footer { 
      background: #f8f9fa;
      padding: 24px 40px; 
      text-align: center; 
      color: #6c757d; 
      font-size: 14px;
      border-top: 1px solid #dee2e6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nová rezervace</h1>
      <p>Byla vytvořena nová rezervace online</p>
    </div>

    <div class="content">
      <div class="details">
        <div class="details-row">
          <span class="details-label">ID Rezervace:</span>
          <span class="reservation-id">#${data.rezervaceId}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Zákazník:</span>
          <span class="details-value">${data.customerName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Telefon:</span>
          <span class="details-value">${data.customerPhone}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Email:</span>
          <span class="details-value">${data.customerEmail}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Datum:</span>
          <span class="details-value">${data.datum}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Čas:</span>
          <span class="details-value">${data.casOd} - ${data.casDo}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Služba:</span>
          <span class="details-value">${data.sluzba}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Cena:</span>
          <span class="details-value">${data.cena}</span>
        </div>
      </div>

      <a href="${data.adminUrl}?edit=${data.rezervaceId}" class="btn">Otevřít detail rezervace</a>
    </div>

    <div class="footer">
      <p>Salon Zuza - Administrační notifikace</p>
    </div>
  </div>
</body>
</html>`;

      const adminText = `
Nová rezervace - Salon Zuza

Nová rezervace byla vytvořena:

Zákazník: ${data.customerName}
Email: ${data.customerEmail}
Telefon: ${data.customerPhone}

Datum: ${data.datum}
Čas: ${data.casOd} - ${data.casDo}
Služba: ${data.sluzba}
Cena: ${data.cena}

Číslo rezervace: #${data.rezervaceId}

Otevřít detail rezervace:
${data.adminUrl}?edit=${data.rezervaceId}
      `.trim();

      return { 
        htmlContent: adminHtmlContent, 
        textContent: adminText 
      };

    default:
      const defaultText = `
Obsah emailu pro šablonu "${template}" s daty:
${JSON.stringify(data, null, 2)}
      `.trim();

      return { 
        htmlContent: `<pre>${defaultText}</pre>`, 
        textContent: defaultText 
      };
  }
}