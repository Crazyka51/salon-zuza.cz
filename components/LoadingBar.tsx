'use client'

import { useEffect, useState } from 'react'

interface LoadingBarProps {
  onComplete?: () => void
}

export function LoadingBar({ onComplete }: LoadingBarProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            onComplete?.()
          }, 300)
          return 100
        }
        // Rychlé načítání na začátku, pomalejší ke konci
        if (prev < 50) {
          return prev + Math.random() * 15 + 5
        } else if (prev < 90) {
          return prev + Math.random() * 8 + 2
        } else {
          return prev + Math.random() * 2 + 1
        }
      })
    }, 120)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-[#212121] flex flex-col items-center justify-center z-50">
      <div className="max-w-md w-full px-8">
        {/* Logo nebo text */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-[#B8A876] tracking-wider mb-2">
            SALON ZUZA
          </h1>
          <p className="text-[#676767] text-sm font-semibold tracking-[0.3em] uppercase">
            Načítání...
          </p>
        </div>

        {/* Loading bar */}
        <div className="relative w-full">
          <div className="h-1 bg-[#353535] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#B8A876] to-[#A39566] transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Procenta */}
          <div className="mt-4 text-center">
            <span className="text-[#B8A876] font-bold text-sm">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Animovaná ikona */}
        <div className="text-center mt-8">
          <div className="inline-block animate-pulse">
            <svg 
              className="w-8 h-8 text-[#B8A876]" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1C14.5 0.5 13.9 0.3 13.3 0.3C12.7 0.3 12.1 0.5 11.6 1L6 6.5C5.5 7 5.3 7.6 5.3 8.2C5.3 8.8 5.5 9.4 6 9.9L12 15.9L18 9.9C18.5 9.4 18.7 8.8 18.7 8.2C18.7 7.6 18.5 7 18 6.5L12.4 1C11.9 0.5 11.3 0.3 10.7 0.3C10.1 0.3 9.5 0.5 9 1L3 7V9L21 9Z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}