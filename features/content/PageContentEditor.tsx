'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, Plus, Trash2, Edit, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ObsahItem {
  id?: number
  klic: string
  hodnota: string
  stranka: string
  poradoveId?: number | null
}

const STRANKY = [
  'homepage',
  'sluzby',
  'galerie',
  'kontakt',
  'online-rezervace',
  'recenze',
  'navbar',
  'footer'
]

const STRANKY_LABELS: Record<string, string> = {
  'homepage': 'Úvodní stránka',
  'sluzby': 'Služby',
  'cenik': 'Ceník',
  'galerie': 'Galerie',
  'kontakt': 'Kontakt',
  'online-rezervace': 'Online rezervace',
  'recenze': 'Recenze',
  'navbar': 'Navigace (Navbar)',
  'footer': 'Zápatí (Footer)',
  'general': 'Obecný obsah'
}

const STRANKY_URLS: Record<string, string> = {
  'homepage': '/',
  'sluzby': '/sluzby',
  'cenik': '/cenik',
  'galerie': '/galerie',
  'kontakt': '/kontakt',
  'online-rezervace': '/online-rezervace',
  'recenze': '/preview/recenze',
  'navbar': '/preview/navbar',
  'footer': '/preview/footer',
  'general': '/' // Obecný obsah zobrazí homepage jako příklad
}

export function PageContentEditor() {
  const [obsahy, setObsahy] = useState<ObsahItem[]>([])
  const [editingItem, setEditingItem] = useState<ObsahItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [selectedStranka, setSelectedStranka] = useState<string>('homepage')
  const [activeObsahId, setActiveObsahId] = useState<number | null>(null)
  
  // Ref pro textarea
  const editorCardRef = useRef<HTMLDivElement>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Načtení všech obsahů při načtení komponenty
  useEffect(() => {
    fetchObsahy()
  }, [])

  // Automatický scroll a focus na editor když se změní editingItem
  useEffect(() => {
    if (editingItem && editorCardRef.current) {
      // Scroll na editor kartu
      editorCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // Focus na textarea po malé prodlevě aby se scroll stihol
      setTimeout(() => {
        const textarea = editorCardRef.current?.querySelector('textarea') as HTMLTextAreaElement
        if (textarea) {
          textarea.focus()
        }
      }, 100)
    }
  }, [editingItem])

  const fetchObsahy = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/page-content')
      if (response.ok) {
        const result = await response.json()
        setObsahy(result.data || [])
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Chyba při načítání obsahu'})
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrování obsahu podle vybrané stránky (musí být tu, aby bylo k dispozici v handleDragEnd)
  const filteredObsahy = obsahy.filter(item => item.stranka === selectedStranka)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveObsahId(event.active.id as number)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveObsahId(null)

    if (!over || active.id === over.id) return

    // Najdi index obsahu v seznamu
    const activeIndex = filteredObsahy.findIndex(item => item.id === active.id)
    const overIndex = filteredObsahy.findIndex(item => item.id === over.id)

    if (activeIndex === -1 || overIndex === -1) return

    // Optimistická aktualizace UI
    const updatedObsahy = [...filteredObsahy]
    updatedObsahy.splice(activeIndex, 1)
    updatedObsahy.splice(overIndex, 0, filteredObsahy[activeIndex])

    // Aktualizovat obsah v paměti s novým pořadím
    const newObsahy = [...obsahy]
    const obsahIndex = newObsahy.findIndex(o => o.id === active.id)
    if (obsahIndex !== -1) {
      newObsahy.splice(obsahIndex, 1)
      newObsahy.splice(overIndex, 0, newObsahy[obsahIndex])
      setObsahy(newObsahy)
    }

    // Odeslat změnu na server
    try {
      const response = await fetch('/api/admin/page-content/poradi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          obsahId: active.id,
          novePoradi: overIndex,
          novaKategorie: selectedStranka
        })
      })

      if (!response.ok) {
        setMessage({type: 'error', text: 'Chyba při aktualizaci pořadí'})
        fetchObsahy() // Obnovit data při chybě
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Chyba při aktualizaci pořadí'})
      fetchObsahy()
    }
  }

  const handleSave = async () => {
    if (!editingItem || !editingItem.klic || !editingItem.hodnota) {
      setMessage({type: 'error', text: 'Vyplňte všechna povinná pole'})
      return
    }

    try {
      setIsSaving(true)
      const url = editingItem.id 
        ? `/api/admin/page-content?id=${editingItem.id}`
        : '/api/admin/page-content'
      
      const method = editingItem.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(editingItem)
      })

      if (response.ok) {
        setMessage({type: 'success', text: editingItem.id ? 'Obsah byl upraven' : 'Obsah byl vytvořen'})
        setEditingItem(null)
        fetchObsahy()
      } else {
        const error = await response.json()
        setMessage({type: 'error', text: error.chyba || 'Chyba při ukládání'})
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Chyba při ukládání obsahu'})
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tento obsah?')) return

    try {
      const response = await fetch(`/api/admin/page-content?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({type: 'success', text: 'Obsah byl smazán'})
        fetchObsahy()
      } else {
        setMessage({type: 'error', text: 'Chyba při mazání obsahu'})
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Chyba při mazání obsahu'})
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-primary">Editor obsahu</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Spravujte textový obsah všech stránek webu</p>
        </div>
        <Button onClick={() => setEditingItem({klic: '', hodnota: '', stranka: 'homepage'})} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Přidat obsah
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Split Layout - Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        {/* Levá strana - Editor */}
        <div className="space-y-4">
          {/* Editor form */}
          {editingItem && (
            <div ref={editorCardRef}>
              <Card>
              <CardHeader>
                <CardTitle>{editingItem.id ? 'Upravit obsah' : 'Nový obsah'}</CardTitle>
                <CardDescription>
                  Upravte textový obsah, který se zobrazí na webu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="klic">Klíč obsahu *</Label>
                    <Input
                      id="klic"
                      value={editingItem.klic}
                      onChange={(e) => setEditingItem({...editingItem, klic: e.target.value})}
                      placeholder="např. hero_nadpis"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stranka">Stránka *</Label>
                    <Select 
                      value={editingItem.stranka}
                      onValueChange={(value) => setEditingItem({...editingItem, stranka: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STRANKY.map(str => (
                          <SelectItem key={str} value={str}>{STRANKY_LABELS[str] || str}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="hodnota">Obsah *</Label>
                  <Textarea
                    id="hodnota"
                    value={editingItem.hodnota}
                    onChange={(e) => setEditingItem({...editingItem, hodnota: e.target.value})}
                    placeholder="Zadejte textový obsah..."
                    rows={4}
                    className="sm:rows-6"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Uložit
                  </Button>
                  <Button variant="outline" onClick={() => setEditingItem(null)} className="w-full sm:w-auto">
                    Zrušit
                  </Button>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Seznam obsahů */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-base sm:text-lg">Existující obsah</CardTitle>
                <Select value={selectedStranka} onValueChange={setSelectedStranka}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STRANKY.map(str => (
                      <SelectItem key={str} value={str}>{STRANKY_LABELS[str] || str}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredObsahy.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Žádný obsah nebyl nalezen
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredObsahy.map(item => item.id || 0)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {filteredObsahy.map((item) => (
                        <SortableContentItem
                          key={item.id || item.klic}
                          item={item}
                          onEdit={() => setEditingItem(item)}
                          onDelete={() => item.id && handleDelete(item.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pravá strana - Náhled */}
        {selectedStranka && (
          <div className="hidden lg:block">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-block w-2 h-10 bg-green-500 rounded-full animate-pulse" />
                  Náhled stránky: {STRANKY_LABELS[selectedStranka]}
                </CardTitle>
                <CardDescription>
                  Live preview editované stránky
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full h-175 overflow-hidden rounded-b-lg">
                  <iframe
                    key={selectedStranka}
                    src={STRANKY_URLS[selectedStranka]}
                    className="w-full h-full border-0"
                    title={`Náhled ${STRANKY_LABELS[selectedStranka]}`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// Sortable obsah item komponent pro drag and drop
interface SortableContentItemProps {
  item: ObsahItem
  onEdit: () => void
  onDelete: () => void
}

function SortableContentItem({ item, onEdit, onDelete }: SortableContentItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id || 0 })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row items-start justify-between p-3 sm:p-4 border rounded-lg gap-3 bg-background"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing shrink-0 mt-1"
          title="Přetáhnout pro změnu pořadí"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 w-full sm:w-auto min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <code className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs sm:text-sm font-mono break-all">
              {item.klic}
            </code>
            <span className="text-xs sm:text-sm bg-accent text-accent-foreground px-2 py-1 rounded w-fit">
              {STRANKY_LABELS[item.stranka] || item.stranka}
            </span>
          </div>
          <p className="text-foreground text-xs sm:text-sm line-clamp-3 break-words">
            {item.hodnota}
          </p>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto sm:ml-4 shrink-0">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onEdit}
          className="flex-1 sm:flex-none"
        >
          <Edit className="h-4 w-4 mr-1 sm:mr-0" />
          <span className="sm:hidden">Upravit</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onDelete}
          className="flex-1 sm:flex-none"
        >
          <Trash2 className="h-4 w-4 mr-1 sm:mr-0" />
          <span className="sm:hidden">Smazat</span>
        </Button>
      </div>
    </div>
  )
}