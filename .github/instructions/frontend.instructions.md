
applyTo:
  - "app/**/*.tsx"
  - "app/**/*.ts"
  - "components/**/*.tsx"
  - "hooks/**/*.tsx"

# Purpose

Tyto instrukce platí pro veškerý frontendový kód v tomto Next.js 16 App Router projektu. Používej je při práci s komponentami, hooky, stránkami, layouty a animacemi.

**Technologie Stack:**
- Next.js 16.0.10 (App Router)
- React 18.3.0 + TypeScript 5
- Tailwind CSS 3.4.17
- Framer Motion 11.0.3
- Radix UI (shadcn/ui komponenty)
- Lucide React (ikony)

## Základní pokyny

- Před navrhováním změn si projdi související komponenty v `/app/components/`, hooky v `/hooks/` a utility v `/app/lib/`, `/app/utils/`.
- Nikdy neodhaduj, jak komponenta funguje - vždy si přečti její implementaci, props a použití v jiných souborách.
- Vždy zvaž UX dopad změny: loading stavy, error stavy, přístupnost, responzivita, performance (LCP, CLS, FID).
- Dodržuj konvence z hlavního `copilot-instructions.md` souboru.

## TypeScript a typování

- **VŽDY** používej silné typování:
  - `interface` pro component props a objektové struktury
  - `type` pro unions, primitives a utility types
  - Vyhýbej se `any` - místo toho použij `unknown` nebo konkrétní typ
- Props vždy definuj jako interface:
  ```typescript
  interface ComponentNameProps {
    title: string
    description?: string
    variant?: "insurance" | "developer"
    children?: React.ReactNode
  }
  ```
- U sdílených typů zvažuj vytvoření `/app/types/` nebo `/types/` složky.
- Při práci s API (např. `/app/api/send-email`) používej Zod schemas pro validaci.

## React komponenty

- **VŽDY** používej funkcionální komponenty s React hooks.
- Preferuj "use client" pouze tam, kde je to nutné (interaktivita, hooks, browser APIs).
- Server komponenty jsou defaultní v Next.js App Router - využívej je pro statický obsah.
- Komponenty navrhuj jako:
  - **Presentational** (UI, minimální logika) - např. `Card`, `Button`, animační komponenty
  - **Container** (data fetching, business logika) - např. pages, layouts
  - **Feature** (kombinace obou) - např. `ServiceCarousel`, `ProjectGallery`

### Pojmenování a struktura komponent

- Komponenty pojmenovávej **PascalCase**: `AnimatedText`, `WebDevNavbar`, `BlogPostLayout`
- Hooky pojmenovávej **use\***: `useToast`, `useMobile`
- Soubory strukturuj takto:
  ```
  /app/components/
    navbar.tsx              # Hlavní komponenta
    webdev-navbar.tsx       # Varianta komponenty
    animated-text.tsx       # Feature komponenta
    page-transition.tsx     # Wrapper komponenta
  
  /components/ui/           # shadcn/ui komponenty
    button.tsx
    card.tsx
    dialog.tsx
  
  /hooks/
    use-toast.ts           # Custom hooks
    use-mobile.tsx
  ```

### Component Structure Template

```typescript
"use client" // Pouze pokud je potřeba

import { useState, useEffect } from "react" // React hooks
import Image from "next/image"              // Next.js componenty
import Link from "next/link"

import { motion } from "framer-motion"      // Third-party
import { Shield, Code } from "lucide-react"

import Navbar from "@/app/components/navbar" // Lokální komponenty
import { cn } from "@/lib/utils"             // Utilities

/**
 * @component ComponentName
 * @description Stručný popis co komponenta dělá
 * 
 * @param {ComponentNameProps} props - Component props
 * @param {string} props.title - Nadpis komponenty
 * 
 * @example
 * ```tsx
 * <ComponentName title="Hello World" />
 * ```
 */
interface ComponentNameProps {
  title: string
  description?: string
  variant?: "insurance" | "developer"
}

export default function ComponentName({ 
  title, 
  description, 
  variant = "insurance" 
}: ComponentNameProps) {
  // Implementace
  return (
    <div className="...">
      {/* JSX */}
    </div>
  )
}
```

## Stylování a UI konzistence

**Projekt používá Tailwind CSS 3.4.17** - NIKDY nepoužívej inline styles nebo CSS Modules.

### Design System

**Barvy:**
```tsx
// Pozadí
bg-[#050A14]     // Hlavní pozadí (pojišťovací poradce)
bg-[#010714]     // Webový vývojář pozadí
bg-gray-900/50   // Card backgrounds s transparencí

// Akcenty
text-red-500     // Pojišťovací poradce primární
text-red-600     // Hover stavy
text-indigo-500  // Webový vývojář primární
text-purple-600  // Webový vývojář sekundární

// Text
text-white       // Hlavní text
text-gray-300    // Body text
text-gray-400    // Muted text

// Borders
border-gray-800  // Default border
border-gray-700  // Subtle border
border-red-500/30 // Akcent border s alpha
```

### Tailwind Conventions

```tsx
// ✅ SPRÁVNĚ - Logické pořadí classes
className="flex items-center justify-center gap-4 p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-red-500/30 transition-all duration-300"

// ✅ SPRÁVNĚ - Responsive design (mobile-first)
className="text-sm sm:text-base md:text-lg lg:text-xl"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// ✅ SPRÁVNĚ - cn() utility pro podmíněné styly
import { cn } from "@/lib/utils"

className={cn(
  "base-classes px-4 py-2 rounded-lg",
  isActive && "bg-red-500 text-white",
  variant === "primary" && "border-2 border-red-500",
  className // props className na konci
)}

// ❌ ŠPATNĚ - Inline styles (používat POUZE pro dynamické hodnoty)
style={{ color: userColor }} // OK - dynamická hodnota
style={{ padding: "1rem" }}  // ŠPATNĚ - použij Tailwind
```

### Radix UI / shadcn/ui

- Projekt používá kompletní sadu shadcn/ui komponent v `/components/ui/`
- VŽDY používej existující UI komponenty místo vytváření nových
- Dostupné komponenty: Button, Card, Dialog, Toast, Accordion, atd.
- Při použití Radix komponent dodržuj jejich API a best practices

### Responzivita

- **Mobile-first approach** - defaultní styly pro mobile, pak breakpointy
- Breakpointy: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`
- Testuj na všech viewportech: mobile (375px), tablet (768px), desktop (1440px)

## Přístupnost (a11y)

- **VŽDY** používej sémantické HTML elementy:
  ```tsx
  ✅ <button onClick={...}>    // SPRÁVNĚ
  ❌ <div onClick={...}>       // ŠPATNĚ
  
  ✅ <Link href="...">         // Next.js Link pro interní navigaci
  ✅ <a href="..." target="_blank" rel="noopener noreferrer"> // Externí odkazy
  
  ✅ <nav>, <main>, <footer>, <section>, <article> // Sémantické layouty
### React State Management

- **Lokální stav** (`useState`) pro UI state (menu open/closed, form inputs, loading states)
- **Context** pouze pro cross-cutting concerns - projekt používá `ToastContext` v `/app/context/toast-context.tsx`
- **URL state** (`usePathname`, `useSearchParams`) pro filtry, pagination
- **Server State** - preferuj Server Components a Server Actions v Next.js 16

### Asynchronní operace

```tsx
// ✅ SPRÁVNĚ - Vždy handleuj loading a error stavy
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

try {
  setIsLoading(true)
  const result = await fetch('/api/send-email', { method: 'POST', ... })
  // Zpracuj result
} catch (err) {
  setError(err.message)
} finally {
  setIsLoading(false)
}

// V UI vždy zobraz všechny stavy:
{isLoading && <LoadingSpinner />}
{error && <Alert variant="destructive">{error}</Alert>}
{data && <DataDisplay data={data} />}
```

### API Calls

- Pro formuláře používej `react-hook-form` + `zod` (už nainstalováno)
- API routes jsou v `/app/api/`
- Vyhýbej se duplicitním fetch callům - zvažuj cache nebo SWR pattern

## Next.js 16 Specifika

### Server vs Client Components

```tsx
// ✅ Server Component (default) - PREFERUJ pro:
// - Statický obsah
// - Data fetching
// - SEO critical content
export default async function Page() {
  const data = await getData() // Fetch na serveru
  return <div>{data}</div>
}

// ✅ Client Component - použij pro:
// - Interaktivitu (onClick, onChange)
// - React hooks (useState, useEffect)
// - Browser APIs (window, localStorage)
// - Animace (Framer Motion)
"use client"
export default function InteractiveComponent() {
  const [state, setState] = useState()
  return <motion.div>...</motion.div>
}
```

### Image Optimization

```tsx
// ✅ SPRÁVNĚ - Next.js Image komponenta
import Image from "next/image"

<Image
  src="/images/photo.webp"
  alt="Popisný text"
  width={600}
  height={400}
  priority // Pro LCP images (above the fold)
  loading="lazy" // Pro images below the fold (default)
  quality={85} // 75-90 je optimální
  placeholder="blur" // S blurDataURL
/>

// External images (Unsplash)
<Image
  src="https://images.unsplash.com/photo-..."
  alt="..."
  width={600}
  height={400}
  // Unsplash je whitelisted v next.config.mjs
/>
```

### Links & Navigation

```tsx
import Link from "next/link"

// ✅ Interní odkazy
<Link href="/blog">Blog</Link>
<Link href="/pojistovaci-poradce/sluzby/cestovni-pojisteni">
  Cestovní pojištění
</Link>

// ✅ Externí odkazy
<a 
  href="https://external.com" 
  target="_blank" 
  rel="noopener noreferrer"
>
  Externí odkaz
</a>
```

## Animace & Framer Motion

### Performance Best Practices

```tsx
import { motion } from "framer-motion"

// ✅ SPRÁVNĚ - Animuj pouze transform a opacity (GPU accelerated)
<motion.div
  initial={{ opacity: 0, y: 20, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>

// ✅ Layout animations
<motion.div layout layoutId="unique-id">

// ✅ Staggered children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map(item => (
    <motion.div variants={childVariants} key={item.id}>
      {item.content}
    </motion.div>
  ))}
</motion.div>

// ❌ ŠPATNĚ - Animace width, height, left, right (způsobí reflow)
<motion.div animate={{ width: 200 }} /> // Použij scale místo toho
```

### Lazy Loading Animations

```tsx
// Pro těžké animační komponenty používej dynamic import
import dynamic from "next/dynamic"

const InteractiveParticles = dynamic(
  () => import("./components/interactive-particles"),
  { 
    ssr: false,           // Disable SSR pro browser-only kód
    loading: () => null   // Žádný loading state
  }
)
```

### Performance Mode Pattern

Projekt implementuje performance mode switching:
```tsx
const [performanceMode, setPerformanceMode] = useState<"high" | "low">("low")

// High mode = plné animace
// Low mode = minimální animace pro rychlejší LCP
```

## Testování

⚠️ **TODO**: Projekt zatím nemá testy. Při přidávání testů:

- Použij Vitest nebo Jest + React Testing Library
- Testuj z pohledu uživatele (ne implementační detaily)
- Struktura: `/tests/unit/`, `/tests/integration/`, `/tests/e2e/`

## Výkon & Optimalizace

### Core Web Vitals

- **LCP (Largest Contentful Paint)** < 2.5s
  - Text před obrázky v DOM
  - `priority` prop na hero images
  - Font preload a fallbacks
  - Minimální JS na initial load

- **CLS (Cumulative Layout Shift)** < 0.1
  - Vždy specifikuj `width` a `height` u images
  - Rezervuj prostor pro lazy-loaded content
  - Stabilní layout (ne shifting)

- **FID (First Input Delay)** < 100ms
  - Lazy load non-critical JS
  - Dynamic imports pro heavy components
  - Minimize JS execution time

### Bundle Optimization

```tsx
// ✅ Dynamic imports pro route-based splitting
const HeavyComponent = dynamic(() => import("./heavy-component"))

// ✅ Conditional loading
{performanceMode === "high" && <HeavyAnimations />}

// ✅ Tree shaking - importuj jen co potřebuješ
import { Button } from "@/components/ui/button" // ✅
import * as RadixUI from "@radix-ui/react-*"    // ❌
```

### Next.js Config Optimizations

Projekt má již nakonfigurováno v `next.config.mjs`:
- SWC minifikace
- Odstranění console.log v produkci
- Image optimization (WebP format)
- Package import optimalizace (lucide-react, framer-motion)
- CSS optimalizace
- Komprese

### Monitoring

- **Vercel Speed Insights** už implementováno
- **Google Analytics** už implementováno
- Používej React DevTools Profiler pro debugging performance
  - Minimální kontrast 4.5:1 pro normální text
  - 3:1 pro velký text (18px+)
  - Projekt používá `text-white` na tmavém pozadí - dobrý kontrast ✅

- **Stavy interaktivních prvků:**
  ```tsx
  className={cn(
    "transition-all duration-300",
    "hover:bg-red-500",           // Hover
    "focus:ring-2 focus:ring-red-500", // Focus
    "active:scale-95",            // Active
    "disabled:opacity-50 disabled:cursor-not-allowed" // Disabled
  )}
  ```

## Práce s daty a stavem

- Preferuj lokální stav pro čistě UI věci, globální stav jen tam, kde je to nutné.
- U asynchronních operací vždy zvaž:
  - loading stav,
  - error stav,
  - případné retry nebo fallback.
- Upozorňuj na zbytečné volání API (duplicitní fetch, chybějící cache, nerespektování pagination).

## Testování frontendu

- Navrhuj testy, které ověřují:
  - renderování klíčových stavů (loading, success, error),
  - základní interakce (kliknutí, zadání textu, změna filtru),
  - integraci s routerem a globálním stavem, pokud je relevantní.
- Preferuj testy z pohledu uživatele (Testing Library) před testováním interní implementace.

## Výkon frontendu

- Upozorňuj na:
  - zbytečné re-renderování (props, context, chybějící memoizace),
  - velké bundly (lazy loading, code splitting),
  - náročné operace v renderu (těžké výpočty, mapování velkých kolekcí bez optimalizace).
- Navrhuj optimalizace, které nezhorší čitelnost a udržovatelnost kódu.
