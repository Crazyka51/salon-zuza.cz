import type { Metadata } from 'next'
import Script from 'next/script'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from '@/components/ui/toaster'
import { CookieConsent } from '@/components/CookieConsent'
import { GoogleTagManagerNoscript } from '@/components/GoogleTagManagerNoscript'
import './globals.css'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat'
})

export const metadata: Metadata = {
  title: 'Salon Zuza - Moderní kadeřnictví v Dobříši',
  description: 'Profesionální kadeřnictví v Dobříši. Střihy, barvy, účesy pro ženy. Online rezervace termínů.',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="cs">
      <head>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W65RMTGV');`,
          }}
        />
        
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-VX3P8HBX6Z"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              // Nastavit výchozí consent (na "denied" až do souhlasu uživatele)
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'wait_for_update': 500
              });
              
              gtag('js', new Date());
              gtag('config', 'G-VX3P8HBX6Z', {
                'anonymize_ip': true,
                'cookie_flags': 'SameSite=None;Secure'
              });
              
              // Zkontrolovat uložený souhlas
              const consent = localStorage.getItem('cookieConsent');
              if (consent) {
                const consentData = JSON.parse(consent);
                if (consentData.analytics) {
                  gtag('consent', 'update', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted'
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased bg-white text-[#212121]`}>
        <GoogleTagManagerNoscript />
        {children}
        <CookieConsent />
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
