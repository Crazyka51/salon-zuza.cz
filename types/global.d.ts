// Globální TypeScript deklarace

// Deklarace pro CSS moduly a importy
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

// Specifická deklarace pro Leaflet CSS
declare module 'leaflet/dist/leaflet.css'
