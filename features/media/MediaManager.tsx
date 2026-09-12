'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2, UploadIcon, Trash2, Search } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { clientAuthorizedFetch, checkApiStatus } from '@/lib/auth-fetch-client'

type MediaFile = {
  name: string
  originalName: string
  url: string
  size: number
  createdAt: string
  updatedAt: string
  description?: string // popisný název
}

export default function MediaManager({ onSelectMedia }: { onSelectMedia?: (url: string) => void }) {
  const [years, setYears] = useState<string[]>([])
  const [months, setMonths] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('browse')
  const [editingDescUrl, setEditingDescUrl] = useState<string | null>(null)
  const [descInput, setDescInput] = useState('')
  
  const { toast } = useToast()

  // Načtení let při inicializaci
  useEffect(() => {
    fetchYears()
  }, [])

  // Načtení měsíců při změně roku
  useEffect(() => {
    if (selectedYear) {
      fetchMonths(selectedYear)
    } else {
      setMonths([])
      setSelectedMonth(null)
      setMediaFiles([])
    }
  }, [selectedYear])

  // Načtení souborů při změně měsíce
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      fetchMediaFiles(selectedYear, selectedMonth)
    } else {
      setMediaFiles([])
    }
  }, [selectedYear, selectedMonth])

  const fetchYears = async () => {
    try {
      setLoading(true)
      const response = await clientAuthorizedFetch('/api/admin/media/list', {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.years) {
        setYears(data.years)
        // Automaticky vybereme první rok
        if (data.years.length > 0) {
          setSelectedYear(data.years[0])
        }
      } else {
        throw new Error(data.error || 'Nepodařilo se načíst roky médií')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepodařilo se načíst roky médií'
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      })
      console.error('Fetch years error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMonths = async (year: string) => {
    try {
      setLoading(true)
      const response = await clientAuthorizedFetch(`/api/admin/media/list?year=${year}`, {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.months) {
        setMonths(data.months)
        // Automaticky vybereme první měsíc
        if (data.months.length > 0) {
          setSelectedMonth(data.months[0])
        }
      } else {
        throw new Error(data.error || 'Nepodařilo se načíst měsíce médií')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepodařilo se načíst měsíce médií'
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      })
      console.error('Fetch months error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMediaFiles = async (year: string, month: string) => {
    try {
      setLoading(true)
      const response = await clientAuthorizedFetch(`/api/admin/media/list?year=${year}&month=${month}`, {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.media) {
        setMediaFiles(data.media)
      } else {
        throw new Error(data.error || 'Nepodařilo se načíst média')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepodařilo se načíst média'
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      })
      console.error('Fetch media files error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast({ 
            title: 'Nepodporovaný formát', 
            description: `Soubor "${file.name}" není obrázek`, 
            variant: 'destructive' 
          })
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({ 
            title: 'Soubor je příliš velký', 
            description: `Soubor "${file.name}" je větší než 5MB`, 
            variant: 'destructive' 
          })
          continue
        }

        // Vytvoříme FormData pro upload přes náš API endpoint
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await clientAuthorizedFetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          let errorMessage = 'Upload selhal'
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || `Chyba ${response.status}: ${response.statusText}`
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Upload selhal')
        }
        
        const url = data.url

        toast({ 
          title: 'Soubor nahrán', 
          description: `Soubor "${file.name}" byl úspěšně nahrán` 
        })

        // Aktualizace seznamu souborů
        const currentDate = new Date()
        const year = currentDate.getFullYear().toString()
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
        
        if (selectedYear !== year || selectedMonth !== month) {
          setSelectedYear(year)
          setSelectedMonth(month)
        } else {
          fetchMediaFiles(year, month)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepodařilo se nahrát soubory'
      toast({ 
        title: 'Chyba nahrávání', 
        description: errorMessage, 
        variant: 'destructive' 
      })
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const deleteMedia = async (file: MediaFile) => {
    if (!confirm(`Opravdu chcete smazat soubor "${file.originalName}"?`)) {
      return
    }
    
    try {
      const response = await clientAuthorizedFetch(`/api/admin/media/delete?path=${encodeURIComponent(file.url)}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Soubor smazán',
          description: `Soubor "${file.originalName}" byl úspěšně smazán`,
        })
        
        // Aktualizace seznamu souborů
        setMediaFiles(mediaFiles.filter(m => m.url !== file.url))
      } else {
        throw new Error(data.error || `Nepodařilo se smazat soubor "${file.originalName}"`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nepodařilo se smazat soubor'
      toast({
        title: 'Chyba',
        description: errorMessage,
        variant: 'destructive',
      })
      console.error('Delete error:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const filteredMediaFiles = searchTerm 
    ? mediaFiles.filter(file => 
      (file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))))
    : mediaFiles

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4 grid grid-cols-2">
          <TabsTrigger value="browse">Procházet média</TabsTrigger>
          <TabsTrigger value="upload">Nahrát média</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select
                value={selectedYear || undefined}
                onValueChange={(value) => setSelectedYear(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Rok" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedMonth || undefined}
                onValueChange={(value) => setSelectedMonth(value)}
                disabled={!selectedYear || months.length === 0}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Měsíc" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hledat média..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredMediaFiles.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-md">
              {searchTerm ? (
                <p className="text-white">Žádná média neodpovídají vyhledávání.</p>
              ) : (
                <p className="text-white">Pro tento měsíc nejsou k dispozici žádná média.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMediaFiles.map((file) => (
                <Card key={file.url} className="overflow-hidden group relative">
                  <div className="aspect-square relative">
                    <Image
                      src={file.url}
                      alt={file.originalName}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    {/* Overlay pouze pro Vybrat a Odstranit */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {onSelectMedia && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => onSelectMedia(file.url)}
                        >
                          Vybrat
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteMedia(file)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-2">
                    {/* Popisný název a editace pod obrázkem */}
                    {editingDescUrl === file.url ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          className="border rounded px-2 py-1 text-xs flex-1"
                          value={descInput}
                          onChange={e => setDescInput(e.target.value)}
                          placeholder="Zadejte popis obrázku"
                        />
                        <Button size="sm" variant="secondary" onClick={async () => {
                          try {
                            setLoading(true)
                            const response = await clientAuthorizedFetch('/api/admin/media/update', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ url: file.url, description: descInput })
                            })
                            if (!response.ok) throw new Error('Nepodařilo se uložit popis')
                            const data = await response.json()
                            if (!data.success) throw new Error(data.error || 'Nepodařilo se uložit popis')
                            toast({ title: 'Popis uložen', description: 'Popis obrázku byl úspěšně uložen.' })
                            setMediaFiles(mediaFiles.map(m => m.url === file.url ? { ...m, description: descInput } : m))
                            setEditingDescUrl(null)
                          } catch (error) {
                            toast({ title: 'Chyba', description: error instanceof Error ? error.message : 'Nepodařilo se uložit popis', variant: 'destructive' })
                          } finally {
                            setLoading(false)
                          }
                        }}>
                          Uložit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingDescUrl(null)}>Zrušit</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs truncate flex-1">
                          {file.description || file.originalName}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingDescUrl(file.url)
                          setDescInput(file.description || '')
                        }}>
                          Upravit popis
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
                <UploadIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nahrajte média</h3>
                <p className="text-muted-foreground mb-4">
                  Přetáhněte soubory sem nebo klikněte pro výběr souborů.
                  <br />
                  Podporované formáty: JPG, PNG, GIF, WebP, SVG
                  <br />
                  Maximální velikost souboru: 5MB
                </p>
                
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                
                <Button 
                  asChild
                  disabled={uploading}
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Nahrávání...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="h-4 w-4 mr-2" />
                        Vybrat soubory
                      </>
                    )}
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
