'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface SalonGalerieProps {
  className?: string
}

interface GalerieImage {
  id: string
  src: string
  alt: string
  title: string
}

export default function SalonGalerie({ className = '' }: SalonGalerieProps) {
  const [images, setImages] = useState<GalerieImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  // Mapování technických názvů na popisné názvy
  const imageTitles: Record<string, string> = {
    'exterier.jpg': 'Pohled na salon z ulice',
    'interier1.jpg': 'Interiér salonu – hlavní místnost',
    'interier2.jpg': 'Interiér salonu – detail pracovního místa',
    'team.jpg': 'Tým salonu',
    'pracoviste.jpg': 'Pracoviště v salonu',
    'produktovy-koutek.jpg': 'Produktový koutek',
    'recepce.jpg': 'Recepce salonu',
    'detail.jpg': 'Detail vybavení',
    'klientka.jpg': 'Spokojená klientka',
    'ukazka-prace.jpg': 'Ukázka práce',
    'moderni-prostory.jpg': 'Moderní prostory salonu',
    'vybaveni.jpg': 'Vybavení salonu',
    'kolektiv.jpg': 'Kolektiv salonu',
    'sluzby.jpg': 'Ukázka služeb',
  }

  function getImageTitle(image: GalerieImage): string {
    const fileName = image.src.split('/').pop() ?? '';
    return imageTitles[fileName] || image.title || fileName;
  }

  useEffect(() => {
    fetch('/api/galerie')
      .then((r) => r.json())
      .then((data) => {
        // Omezíme pole na 4 obrázky hned při načtení
        setImages(data.images?.slice(0, 4) ?? [])
      })
      .catch(() => setImages([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B8A876]" />
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-16">Galerie je prázdná.</p>
    )
  }

  return (
    <div className={`${className} pb-16 mb-8`}>
      {/* Grid galerie - fixní 4 sloupce, zobrazí se jen jeden řádek */}
      <div className="grid grid-cols-4 gap-6">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group cursor-pointer relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setSelectedImage(index)}
          >
            <div className="aspect-video relative">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 flex items-end">
                <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-t from-black/50 to-transparent w-full">
                  <h4 className="font-semibold text-lg">{getImageTitle(image)}</h4>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pro zvětšený obrázek */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />

            {/* Zavřít */}
            <button
              className="absolute top-4 right-4 text-[#212121] hover:text-[#B8A876] transition-colors bg-white/80 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null) }}
              aria-label="Zavřít náhled obrázku"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>

            {/* Předchozí */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#212121] hover:text-[#B8A876] transition-colors bg-white/80 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); setSelectedImage((p) => p === 0 ? images.length - 1 : p! - 1) }}
              aria-label="Předchozí obrázek"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
              </svg>
            </button>

            {/* Další */}
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#212121] hover:text-[#B8A876] transition-colors bg-white/80 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); setSelectedImage((p) => p === images.length - 1 ? 0 : p! + 1) }}
              aria-label="Další obrázek"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}