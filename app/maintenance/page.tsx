'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen w-full bg-[#212121] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated circles with golden accent */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#B8A876]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#B8A876]/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#B8A876]/15 rounded-full blur-3xl animate-pulse [animation-delay:0.5s]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
        {/* Logo */}
        <div className="mb-12 animate-fade-in">
          <Link href="/" className="inline-block">
            <Image
              src="/logo_salon.webp"
              alt="SALON ZUZA"
              width={200}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Animated icon */}
        <div className="mb-8 relative">
          <div className="inline-block">
            <div className="w-24 h-24 bg-[#B8A876]/20 rounded-full flex items-center justify-center animate-bounce">
              <div className="w-20 h-20 bg-[#B8A876]/40 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-[#B8A876] animate-spin-slow"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
          Brzo v novém kabátě
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-gray-300 mb-8 animate-fade-in animate-delay-200">
          Právě probíhá údržba našeho webu. Brzy se vrátíme v plné síle!
        </p>

        {/* Description */}
        <div className="bg-white/5 backdrop-blur-md border border-[#B8A876]/30 rounded-lg p-6 sm:p-8 mb-8 animate-fade-in animate-delay-400">
          <p className="text-gray-300 mb-4">
            Vylepšujeme naši stránku, aby jsme vám poskytli nejlepší službu. Během údržby budeme pracovat na nových funkcích a vylepšeních.
          </p>
          <p className="text-sm text-gray-400">
            Pokud máte naléhavé dotazy, prosím kontaktujte nás na <span className="text-[#B8A876] font-semibold">info@salon-zuza.cz</span>
          </p>
        </div>

        {/* Reservation button */}
        <div className="mb-8 animate-fade-in animate-delay-500">
          <p className="text-gray-300 mb-4 text-sm">Přesto si můžete zarezervovat čas na vaše služby:</p>
          <a
            href="/online-rezervace"
            className="inline-block px-8 py-3 bg-[#B8A876] hover:bg-[#A39566] text-[#212121] font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Přejít na rezervační systém →
          </a>
        </div>

        {/* Status dots animation */}
        <div className="flex gap-2 justify-center mb-8 animate-fade-in animate-delay-600">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>

        {/* Footer text */}
        <p className="text-gray-400 text-sm animate-fade-in animate-delay-800">
          Salon Zuza © {new Date().getFullYear()}
        </p>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-delay-200 {
          animation-delay: 0.2s;
        }

        .animate-delay-400 {
          animation-delay: 0.4s;
        }

        .animate-delay-500 {
          animation-delay: 0.5s;
        }

        .animate-delay-800 {
          animation-delay: 0.8s;
        }
      `}</style>
    </div>
  )
}

