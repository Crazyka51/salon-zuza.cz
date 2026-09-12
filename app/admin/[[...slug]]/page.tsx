import { AdminCatchAllPage } from "./AdminCatchAllPage"

// Next.js App Router catch-all page for admin routes
export default async function AdminPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params
  return <AdminCatchAllPage slug={resolvedParams.slug || []} />
}

// Generate metadata for admin pages
export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug || []
  const pageName = slug.length > 0 ? slug[0] : "prehled"
  
  const pageNames: Record<string, string> = {
    dashboard: "Přehled",
    prehled: "Přehled", 
    statistiky: "Statistiky",
    analytics: "Statistiky",
  }

  const czechPageName = pageNames[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1)

  return {
    title: `${czechPageName} - Salon Zuza Administrace`,
    description: `Administrační panel Salon Zuza - ${czechPageName}`,
  }
}
