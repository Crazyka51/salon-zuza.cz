'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Opravit ikony markeru pro Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface SalonMapaProps {
  className?: string
  height?: string
}

export default function SalonMapa({ className = '', height = '400px' }: SalonMapaProps) {
  // GPS souřadnice pro Fričovu 1240, Dobříš
  const position: [number, number] = [49.7806136, 14.1707886]
  
  const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

  // Převod height prop na Tailwind CSS třídu
  const getHeightClass = (height: string) => {
    switch (height) {
      case '300px':
        return 'h-[300px]'
      case '400px':
        return 'h-[400px]'
      case '500px':
        return 'h-[500px]'
      default:
        return `h-[${height}]`
    }
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${getHeightClass(height)} ${className}`}>
      <MapContainer 
        center={position} 
        zoom={16} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon}>
          <Popup>
            <div className="text-center p-2">
              <strong className="block text-[#B8A876] font-semibold mb-1">
                SALON ZUZA
              </strong>
              <p className="text-sm text-gray-700 mb-1">
                Profesionální kadeřnictví & kosmetika
              </p>
              <p className="text-xs text-gray-600">
                Fričova 1240<br />
                Dobříš, 263 01
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}