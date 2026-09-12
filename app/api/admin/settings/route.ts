import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { authenticateApiRequest } from '@/admin-kit/core/auth/proxy'

interface CMSSettings {
  defaultCategory: string | null
  autoSaveInterval: number
  allowImageUpload: boolean
  maxFileSize: number
  requireApproval: boolean
  defaultVisibility: "public" | "draft" 
  enableScheduling: boolean
  updatedAt?: string
}

// Výchozí nastavení
const DEFAULT_SETTINGS: CMSSettings = {
  defaultCategory: null,
  autoSaveInterval: 3000,
  allowImageUpload: true,
  maxFileSize: 5,
  requireApproval: false,
  defaultVisibility: "draft",
  enableScheduling: true
}

// GET - načtení nastavení
export async function GET(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Nejste přihlášeni' }, { status: 401 })
    }

    // Pokusíme se načíst nastavení z ObsahStranky tabulky s klíčem 'cms_settings'
    const settingsRecord = await prisma.obsahStranky.findUnique({
      where: { klicObsahu: 'cms_settings' }
    })

    if (settingsRecord && settingsRecord.obsah) {
      try {
        const settings = JSON.parse(settingsRecord.obsah) as CMSSettings
        return NextResponse.json({ 
          success: true, 
          settings,
          source: 'database'
        })
      } catch (parseError) {
        console.error('Error parsing settings from database:', parseError)
      }
    }

    // Pokud neexistuje nebo je chybný, vrátíme výchozí
    return NextResponse.json({ 
      success: true, 
      settings: DEFAULT_SETTINGS,
      source: 'defaults'
    })
  } catch (error) {
    console.error('Error loading settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Nepodařilo se načíst nastavení',
        settings: DEFAULT_SETTINGS 
      },
      { status: 500 }
    )
  }
}

// POST - uložení nastavení
export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticateApiRequest(request)
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Nejste přihlášeni' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Chybí data nastavení' },
        { status: 400 }
      )
    }

    // Validace nastavení
    const validatedSettings: CMSSettings = {
      defaultCategory: settings.defaultCategory || null,
      autoSaveInterval: Number(settings.autoSaveInterval) || 3000,
      allowImageUpload: Boolean(settings.allowImageUpload),
      maxFileSize: Number(settings.maxFileSize) || 5,
      requireApproval: Boolean(settings.requireApproval),
      defaultVisibility: settings.defaultVisibility === "public" ? "public" : "draft",
      enableScheduling: Boolean(settings.enableScheduling),
      updatedAt: new Date().toISOString()
    }

    // Uložíme do databáze pomocí upsert
    await prisma.obsahStranky.upsert({
      where: { klicObsahu: 'cms_settings' },
      update: {
        obsah: JSON.stringify(validatedSettings),
        nazev: 'CMS Nastavení',
        typ: 'json',
        kategorie: 'system',
        popis: 'Systémová nastavení CMS'
      },
      create: {
        klicObsahu: 'cms_settings',
        obsah: JSON.stringify(validatedSettings),
        nazev: 'CMS Nastavení',
        typ: 'json', 
        kategorie: 'system',
        popis: 'Systémová nastavení CMS',
        jeAktivni: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Nastavení bylo úspěšně uloženo',
      settings: validatedSettings
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Nepodařilo se uložit nastavení: ' + (error instanceof Error ? error.message : 'Neznámá chyba')
      },
      { status: 500 }
    )
  }
}