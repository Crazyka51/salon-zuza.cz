'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Zkontrolovat, zda již uživatel dal souhlas
    const consentGiven = localStorage.getItem('cookieConsent')
    if (!consentGiven) {
      setShowConsent(true)
    } else {
      // Nastavit Google Analytics consent na základě uloženého stavu
      const consent = JSON.parse(consentGiven)
      updateGoogleAnalyticsConsent(consent.analytics)
    }
  }, [])

  const handleAcceptAll = () => {
    const consent = {
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookieConsent', JSON.stringify(consent))
    updateGoogleAnalyticsConsent(true)
    setShowConsent(false)
  }

  const handleAcceptAnalyticsOnly = () => {
    const consent = {
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookieConsent', JSON.stringify(consent))
    updateGoogleAnalyticsConsent(true)
    setShowConsent(false)
  }

  const handleRejectAll = () => {
    const consent = {
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookieConsent', JSON.stringify(consent))
    updateGoogleAnalyticsConsent(false)
    setShowConsent(false)
  }

  const updateGoogleAnalyticsConsent = (analyticsConsent: boolean) => {
    // Nastavit Google Consent Mode
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as any).gtag('consent', 'update', {
        'analytics_storage': analyticsConsent ? 'granted' : 'denied',
        'ad_storage': analyticsConsent ? 'granted' : 'denied',
      })
    }
  }

  const handleCloseBanner = () => {
    // Implicitní souhlas při zavření (GDPR friendly)
    const consent = {
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookieConsent', JSON.stringify(consent))
    updateGoogleAnalyticsConsent(true)
    setShowConsent(false)
  }

  if (!mounted || !showConsent) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-1000 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#333333] mb-2">
              Práva na soukromí a cookies
            </h3>
            <p className="text-sm text-[#555555] mb-3">
              Používáme cookies a podobné technologie k vylepšení vašeho zážitku, analýze návštěv a personalizované obsahu. 
              Soubory cookies slouží k měření výkonu reklam a sledování konverzí. Pokud souhlasíte, budeme moci využít Google Analytics 
              a modelování konverzí Googlu pro zlepšení naší služby.
            </p>
            <p className="text-xs text-[#777777]">
              Svůj souhlas můžete kdykoli odvolat v nastavení cookies. Podrobnosti naleznete v našem{' '}
              <a href="/privacy" className="text-[#B8A876] hover:underline">
                zásadách ochrany osobních údajů
              </a>
            </p>
          </div>

          <button
            onClick={handleCloseBanner}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Zavřít"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <button
            onClick={handleRejectAll}
            className="px-4 py-2 text-sm font-medium text-[#333333] bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Odmítnout vše
          </button>
          <button
            onClick={handleAcceptAnalyticsOnly}
            className="px-4 py-2 text-sm font-medium text-white bg-[#B8A876] hover:bg-[#A39566] rounded-md transition-colors"
          >
            Pouze analytika
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 text-sm font-medium text-white bg-[#333333] hover:bg-[#1a1a1a] rounded-md transition-colors"
          >
            Přijmout vše
          </button>
        </div>
      </div>
    </div>
  )
}
