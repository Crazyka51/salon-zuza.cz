import { normalizovatStav, STAV_EMAIL_ZPRAVA } from './reservations/stav';

interface NotificationConfig {
  email?: string;
  telefon?: string;
  jmeno?: string;
  prijmeni?: string;
}

interface ReservationData {
  id: number;
  datum: Date;
  casOd: string;
  casDo: string;
  sluzba?: {
    nazev: string;
  };
  // Podpora pro více služeb
  všechnySlužby?: Array<{
    nazev: string;
    dobaTrvaniMinuty: number;
    cena: number;
  }>;
  celkováCena?: number;
  zamestnanec?: {
    jmeno: string;
    prijmeni: string;
  };
  cena: number;
}

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export class NotificationService {
  // Email notifikace při vytvoření rezervace
  static async sendReservationConfirmation(
    config: NotificationConfig,
    reservation: ReservationData
  ): Promise<boolean> {
    try {
      console.log('📧 Odesílám potvrzovací email...');
      
      // Podpora pro více služeb
      let sluzby: string;
      let cena: string;
      
      if (reservation.všechnySlužby && reservation.všechnySlužby.length > 0) {
        // Více služeb - sestavíme seznam
        sluzby = reservation.všechnySlužby
          .map(s => `${s.nazev} (${s.dobaTrvaniMinuty} min, ${this.formatCena(s.cena)})`)
          .join('\n');
        cena = this.formatCena(reservation.celkováCena || reservation.cena);
      } else {
        // Jedna služba (zpětná kompatibilita)
        sluzby = reservation.sluzba?.nazev || 'Služba';
        cena = this.formatCena(reservation.cena);
      }
      
      const emailData = {
        to: config.email,
        subject: 'Registrace termínu rezervace - Salon Zuza',
        template: 'reservation-confirmation',
        data: {
          jmeno: config.jmeno,
          prijmeni: config.prijmeni,
          datum: NotificationService.formatDatum(reservation.datum),
          casOd: reservation.casOd,
          casDo: reservation.casDo,
          sluzby: sluzby, // Změneno z 'sluzba' 
          services: reservation.všechnySlužby || (reservation.sluzba ? [reservation.sluzba] : []),
          zamestnanec: reservation.zamestnanec 
            ? `${reservation.zamestnanec.jmeno} ${reservation.zamestnanec.prijmeni}`
            : 'Bude přidělen',
          cena: cena,
          rezervaceId: reservation.id,
        },
      };

      // V produkci by se posílalo přes email service (Resend, SendGrid, apod.)
      const response = await fetch(`${getBaseUrl()}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log('✅ Email úspěšně odeslán');
        return true;
      } else {
        console.error('❌ Chyba při odesílání emailu:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('❌ Chyba při odesílání emailu:', error);
      return false;
    }
  }

  // Email notifikace při změně stavu rezervace
  static async sendStatusChangeNotification(
    config: NotificationConfig,
    reservation: ReservationData,
    newStatus: string,
    oldStatus: string
  ): Promise<boolean> {
    try {
      console.log(`📧 Odesílám notifikaci o změně stavu ${oldStatus} → ${newStatus}...`);

      const statusMessage = STAV_EMAIL_ZPRAVA[normalizovatStav(newStatus)];

      // Podpora pro více služeb
      let sluzby: string;
      let cena: string;
      
      if (reservation.všechnySlužby && reservation.všechnySlužby.length > 0) {
        // Více služeb - sestavíme seznam
        sluzby = reservation.všechnySlužby
          .map(s => `${s.nazev} (${s.dobaTrvaniMinuty} min, ${this.formatCena(s.cena)})`)
          .join('\n');
        cena = this.formatCena(reservation.celkováCena || reservation.cena);
      } else {
        // Jedna služba (zpětná kompatibilita)
        sluzby = reservation.sluzba?.nazev || 'Služba';
        cena = this.formatCena(reservation.cena);
      }

      const emailData = {
        to: config.email,
        subject: `${statusMessage} - Salon Zuza`,
        template: 'status-change',
        data: {
          jmeno: config.jmeno,
          prijmeni: config.prijmeni,
          statusMessage,
          status: normalizovatStav(newStatus),
          datum: NotificationService.formatDatum(reservation.datum),
          casOd: reservation.casOd,
          casDo: reservation.casDo,
          sluzby: sluzby, // Přidáno formátování služeb jako v confirmation
          sluzba: sluzby, // Fallback string
          services: reservation.všechnySlužby || (reservation.sluzba ? [reservation.sluzba] : []),
          všechnySlužby: reservation.všechnySlužby,
          zamestnanec: reservation.zamestnanec 
            ? `${reservation.zamestnanec.jmeno} ${reservation.zamestnanec.prijmeni}`
            : 'Bude přidělen',
          cena: cena,
          rezervaceId: reservation.id,
        },
      };

      const response = await fetch(`${getBaseUrl()}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        console.log('✅ Email notifikace úspěšně odeslána');
        return true;
      } else {
        console.error('❌ Chyba při odesílání notifikace:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('❌ Chyba při odesílání notifikace:', error);
      return false;
    }
  }

  // SMS připomínka před rezervací
  static async sendSmsReminder(
    config: NotificationConfig,
    reservation: ReservationData,
    hoursBeforeReminder: number = 24
  ): Promise<boolean> {
    try {
      console.log(`📱 Odesílám SMS připomínku ${hoursBeforeReminder}h před rezervací...`);

      const smsData = {
        to: config.telefon,
        message: `Připomínka: Zítra máte rezervaci v Salonu Zuza v ${reservation.casOd}. ${reservation.sluzba?.nazev || 'Služba'}. Tel: +420 777 123 456`,
        scheduledFor: new Date(reservation.datum.getTime() - (hoursBeforeReminder * 60 * 60 * 1000)),
      };

      // V produkci by se posílalo přes SMS service (Twilio, apod.)
      const response = await fetch(`${getBaseUrl()}/api/notifications/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsData),
      });

      if (response.ok) {
        console.log('✅ SMS připomínka naplánována');
        return true;
      } else {
        console.error('❌ Chyba při plánování SMS:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('❌ Chyba při plánování SMS:', error);
      return false;
    }
  }

  // Admin notifikace o nové rezervaci
  static async notifyAdminNewReservation(
    reservation: ReservationData,
    customerConfig: NotificationConfig
  ): Promise<boolean> {
    try {
      console.log('🔔 Odesílám admin notifikaci o nové rezervaci...');

      const adminEmailData = {
        to: process.env.ADMIN_EMAIL || 'zuzka@salonzuza.cz',
        subject: 'Nová rezervace - Salon Zuza',
        template: 'admin-new-reservation',
        data: {
          customerName: `${customerConfig.jmeno} ${customerConfig.prijmeni}`,
          customerEmail: customerConfig.email,
          customerPhone: customerConfig.telefon,
          datum: NotificationService.formatDatum(reservation.datum),
          casOd: reservation.casOd,
          casDo: reservation.casDo,
          sluzba: reservation.sluzba?.nazev || 'Služba',
          cena: this.formatCena(reservation.cena),
          rezervaceId: reservation.id,
          // Odkaz míří rovnou na záložku Rezervace, aby ho administrátorka nemusela znovu dohledávat
          adminUrl: `${getBaseUrl()}/admin/rezervace`,
        },
      };

      const response = await fetch(`${getBaseUrl()}/api/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminEmailData),
      });

      if (response.ok) {
        console.log('✅ Admin notifikace odeslána');
        return true;
      } else {
        console.error('❌ Chyba při odesílání admin notifikace:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('❌ Chyba při odesílání admin notifikace:', error);
      return false;
    }
  }

  // Hromadné notifikace pro připomínky (cron job)
  static async sendDailyReminders(): Promise<void> {
    try {
      console.log('🔄 Zpracovávám denní připomínky...');

      // Získání rezervací na následující den
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const response = await fetch(
        `${getBaseUrl()}/api/rezervace?datum=${tomorrow.toISOString().split('T')[0]}&stav=confirmed`
      );

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst rezervace pro připomínky');
      }

      const { rezervace } = await response.json();

      // Odeslání připomínek pro rezervace, kde je povolen SMS
      const remindersPromises = rezervace
        .filter((r: any) => r.notifikaceSms)
        .map((r: any) => this.sendSmsReminder(
          {
            telefon: r.telefon,
            jmeno: r.jmeno,
            prijmeni: r.prijmeni,
          },
          {
            id: r.id,
            datum: new Date(r.datum),
            casOd: r.casOd,
            casDo: r.casDo,
            sluzba: r.sluzba,
            zamestnanec: r.zamestnanec,
            cena: r.cena,
          }
        ));

      const results = await Promise.allSettled(remindersPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      console.log(`✅ Odesláno ${successful}/${results.length} připomínek`);
    } catch (error) {
      console.error('❌ Chyba při zpracování denních připomínek:', error);
    }
  }

  private static formatCena(cena: number): string {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
    }).format(cena);
  }

  static formatDatum(datum: Date): string {
    // Stabilní formátování data bez problémů s časovým pásmem
    const den = datum.getDate().toString().padStart(2, '0');
    const mesic = (datum.getMonth() + 1).toString().padStart(2, '0');
    const rok = datum.getFullYear();
    return `${den}.${mesic}.${rok}`;
  }
}

// Helper funkce pro použití v API endpointech
export const sendReservationNotifications = async (
  reservation: any,
  type: 'created' | 'updated' | 'cancelled'
) => {
  const config = {
    email: reservation.email,
    telefon: reservation.telefon,
    jmeno: reservation.jmeno,
    prijmeni: reservation.prijmeni,
  };

  const reservationData = {
    id: reservation.id,
    datum: new Date(reservation.datum),
    casOd: reservation.casOd,
    casDo: reservation.casDo,
    sluzba: reservation.sluzba,
    // Podpora pro více služeb
    všechnySlužby: reservation.všechnySlužby,
    celkováCena: reservation.celkováCena,
    zamestnanec: reservation.zamestnanec,
    cena: reservation.cena,
  };

  const notifications = [];

  switch (type) {
    case 'created':
      if (reservation.email && reservation.notifikaceEmail !== false) { // Bez emailu zákaznickou zprávu neposíláme
        notifications.push(NotificationService.sendReservationConfirmation(config, reservationData));
      }
      if (reservation.notifikaceSms) {
        notifications.push(NotificationService.sendSmsReminder(config, reservationData));
      }
      notifications.push(NotificationService.notifyAdminNewReservation(reservationData, config));
      break;

    case 'updated':
      if (reservation.email && reservation.notifikaceEmail && reservation.stav) {
        notifications.push(
          NotificationService.sendStatusChangeNotification(
            config,
            reservationData,
            reservation.stav,
            reservation.previousStatus || 'pending'
          )
        );
      }
      break;

    case 'cancelled':
      if (reservation.email && reservation.notifikaceEmail) {
        notifications.push(
          NotificationService.sendStatusChangeNotification(
            config,
            reservationData,
            'cancelled',
            reservation.previousStatus || 'pending'
          )
        );
      }
      break;
  }

  try {
    await Promise.allSettled(notifications);
  } catch (error) {
    console.error('Chyba při odesílání notifikací:', error);
  }
};