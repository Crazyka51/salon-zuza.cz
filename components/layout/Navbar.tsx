// Hlavní navigace podle skutečného webu Salon Zuza
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DatabaseText } from '@/components/DatabaseText'

export function Navbar() {
  const [jeMobileMenuOtevrene, setJeMobileMenuOtevrene] = useState(false)

  return (
    <nav className="bg-white/98 backdrop-blur-md shadow-sm fixed w-full z-50 top-0 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo_salon.webp" 
                alt="SALON ZUZA" 
                width={150} 
                height={60} 
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              <Link 
                href="/" 
                className="text-[#212121] hover:text-[#B8A876] px-4 py-2 text-sm font-semibold tracking-widest transition-colors duration-200 uppercase"
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_domu" as="span" placeholder="DOMŮ" />
              </Link>
              <span className="text-gray-300 text-lg">|</span>
              <Link 
                href="/sluzby" 
                className="text-[#212121] hover:text-[#B8A876] px-4 py-2 text-sm font-semibold tracking-widest transition-colors duration-200 uppercase"
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_sluzby" as="span" placeholder="SLUŽBY" />
              </Link>
              <span className="text-gray-300 text-lg">|</span>
              <Link 
                href="/cenik" 
                className="text-[#212121] hover:text-[#B8A876] px-4 py-2 text-sm font-semibold tracking-widest transition-colors duration-200 uppercase"
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_cenik" as="span" placeholder="CENÍK" />
              </Link>
              <span className="text-gray-300 text-lg">|</span>
              <Link 
                href="/galerie" 
                className="text-[#212121] hover:text-[#B8A876] px-4 py-2 text-sm font-semibold tracking-widest transition-colors duration-200 uppercase"
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_galerie" as="span" placeholder="GALERIE" />
              </Link>
              <span className="text-gray-300 text-lg">|</span>
              <Link 
                href="/kontakt" 
                className="text-[#212121] hover:text-[#B8A876] px-4 py-2 text-sm font-semibold tracking-widest transition-colors duration-200 uppercase"
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_kontakt" as="span" placeholder="KONTAKT" />
              </Link>
              <span className="text-gray-300 text-lg">|</span>
              <Link 
                href="/online-rezervace" 
                className="bg-[#B8A876] hover:bg-[#A39566] text-[#212121] px-6 py-3 ml-6 text-sm font-black tracking-widest transition-all duration-200 uppercase rounded-none"
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_rezervace" as="span" placeholder="ONLINE REZERVACE" />
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              title="Otevřít/zavřít mobilní menu"
              onClick={() => setJeMobileMenuOtevrene(!jeMobileMenuOtevrene)}
              className="text-[#333333] hover:text-[#B8A876] inline-flex items-center justify-center p-2 rounded-md focus:outline-none"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {jeMobileMenuOtevrene ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {jeMobileMenuOtevrene && (
          <div className="md:hidden">
            <div className="px-6 pt-4 pb-6 space-y-4 bg-white border-t border-gray-100">
              <Link 
                href="/" 
                className="text-[#212121] hover:text-[#B8A876] block py-3 text-base font-semibold tracking-widest uppercase transition-colors"
                onClick={() => setJeMobileMenuOtevrene(false)}
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_domu" as="span" placeholder="DOMŮ" />
              </Link>
              <Link 
                href="/sluzby" 
                className="text-[#212121] hover:text-[#B8A876] block py-3 text-base font-semibold tracking-widest uppercase transition-colors"
                onClick={() => setJeMobileMenuOtevrene(false)}
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_sluzby" as="span" placeholder="SLUŽBY" />
              </Link>
              <Link 
                href="/cenik" 
                className="text-[#212121] hover:text-[#B8A876] block py-3 text-base font-semibold tracking-widest uppercase transition-colors"
                onClick={() => setJeMobileMenuOtevrene(false)}
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_cenik" as="span" placeholder="CENÍK" />
              </Link>
              <Link 
                href="/galerie" 
                className="text-[#212121] hover:text-[#B8A876] block py-3 text-base font-semibold tracking-widest uppercase transition-colors"
                onClick={() => setJeMobileMenuOtevrene(false)}
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_galerie" as="span" placeholder="GALERIE" />
              </Link>
              <Link 
                href="/kontakt" 
                className="text-[#212121] hover:text-[#B8A876] block py-3 text-base font-semibold tracking-widest uppercase transition-colors"
                onClick={() => setJeMobileMenuOtevrene(false)}
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_kontakt" as="span" placeholder="KONTAKT" />
              </Link>
              <Link 
                href="/online-rezervace" 
                className="bg-[#B8A876] hover:bg-[#A39566] text-[#212121] block py-4 px-6 text-base font-black tracking-widest uppercase transition-all mt-4 text-center"
                onClick={() => setJeMobileMenuOtevrene(false)}
              >
                <DatabaseText stranka="navbar" klic="navbar_polozka_rezervace" as="span" placeholder="ONLINE REZERVACE" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}