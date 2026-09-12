// Komponenta pro zobrazení editovatelného obsahu z databáze
'use client'

import { useCmsObsah } from '@/hooks/use-obsah-stranky'
import { TypObsahu } from '@/types/booking'

interface DatabaseTextProps {
  klic: string
  stranka?: string
  typ?: TypObsahu
  className?: string
  placeholder?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
}

export function DatabaseText({ 
  klic, 
  stranka,
  typ = 'text', 
  className = '', 
  placeholder = '',
  as = 'p'
}: DatabaseTextProps) {
  const { obsah, nacitaSe, chyba } = useCmsObsah({ klic, stranka })

  if (nacitaSe) {
    const Component = as
    return <Component className={`bg-white/10 ${className}`}>
      {/* Prázdný obsah během načítání - žádný placeholder */}
    </Component>
  }

  if (chyba || !obsah) {
    // Při chybě nebo nenalezení, použij placeholder pokud existuje, jinak prázdné
    if (placeholder) {
      const Component = as
      return <Component className={className}>
        {placeholder}
      </Component>
    }
    return null
  }

  const Component = as

  // Renderování podle typu obsahu
  switch (typ) {
    case 'html':
      return (
        <Component 
          className={className}
          dangerouslySetInnerHTML={{ __html: obsah.hodnota }}
        />
      )
    
    case 'nadpis':
      return (
        <Component className={`font-bold ${className}`}>
          {obsah.hodnota}
        </Component>
      )
    
    case 'popis':
      return (
        <Component className={`text-gray-600 ${className}`}>
          {obsah.hodnota}
        </Component>
      )
    
    case 'tlacitko_text':
      return (
        <span className={className}>
          {obsah.hodnota}
        </span>
      )
    
    default:
      return (
        <Component className={className}>
          {obsah.hodnota}
        </Component>
      )
  }
}