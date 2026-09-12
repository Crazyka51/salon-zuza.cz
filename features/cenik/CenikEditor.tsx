'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, Plus, Trash2, Edit, DollarSign, Clock, GripVertical } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
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

interface Sluzba {
  id: number
  nazev: string
  popis: string | null
  cenaTopStylist: number
  cenaStylist?: number
  cenaJuniorStylist?: number
  dobaTrvaniMinuty: number
  poradi: number
  jeAktivni: boolean
}

interface Kategorie {
  id: number
  nazev: string
  popis: string | null
  poradi: number
  jeAktivni: boolean
  sluzby: Sluzba[]
}

export function CenikEditor() {
  const [kategorie, setKategorie] = useState<Kategorie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  // Editace služby
  const [editingSluzba, setEditingSluzba] = useState<Sluzba | null>(null)
  const [showSluzbaDialog, setShowSluzbaDialog] = useState(false)
  const [selectedKategorieId, setSelectedKategorieId] = useState<number | null>(null)

  // Editace kategorie
  const [editingKategorie, setEditingKategorie] = useState<Kategorie | null>(null)
  const [showKategorieDialog, setShowKategorieDialog] = useState(false)

  // Drag and drop
  const [activeSluzbaId, setActiveSluzbaId] = useState<number | null>(null)
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

  useEffect(() => {
    fetchCenik()
  }, [])

  const fetchCenik = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/cenik')
      if (response.ok) {
        const result = await response.json()
        setKategorie(result.data || [])
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Chyba při načítání ceníku'})
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSluzba = (sluzba: Sluzba, kategorieId: number) => {
    setEditingSluzba(sluzba)
    setSelectedKategorieId(kategorieId)
    setShowSluzbaDialog(true)
  }

  const handleCreateSluzba = (kategorieId: number) => {
    setEditingSluzba({
      id: 0,
      nazev: '',
      popis: '',
      cenaTopStylist: 0,
      cenaStylist: 0,
      cenaJuniorStylist: 0,
      dobaTrvaniMinuty: 60,
      poradi: 0,
      jeAktivni: true
    })
    setSelectedKategorieId(kategorieId)
    setShowSluzbaDialog(true)
  }

  const handleSaveSluzba = async () => {
    if (!editingSluzba || !editingSluzba.nazev) {
      setMessage({type: 'error', text: 'Vyplňte název služby'})
      return
    }

    try {
      setIsSaving(true)
      const url = editingSluzba.id ? `/api/admin/cenik/sluzby/${editingSluzba.id}` : '/api/admin/cenik/sluzby'
      const method = editingSluzba.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...editingSluzba,
          kategorieId: selectedKategorieId
        })
      })

      if (response.ok) {
        setMessage({type: 'success', text: editingSluzba.id ? 'Služba byla upravena' : 'Služba byla vytvořena'})
        setShowSluzbaDialog(false)
        setEditingSluzba(null)
        fetchCenik()
      } else {
        const error = await response.json()
        setMessage({type: 'error', text: error.chyba || 'Chyba při ukládání'})
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Chyba při ukládání služby'})
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSluzba = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tuto službu?')) return

    try {
      const response = await fetch(`/api/admin/cenik/sluzby/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({type: 'success', text: 'Služba byla smazána'})
        fetchCenik()
      } else {
        setMessage({type: 'error', text: 'Chyba při mazání služby'})
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Chyba při mazání služby'})
    }
  }

  // Funkce pro kategorie
  const handleEditKategorie = (kat: Kategorie) => {
    setEditingKategorie(kat)
    setShowKategorieDialog(true)
  }

  const handleCreateKategorie = () => {
    setEditingKategorie({
      id: 0,
      nazev: '',
      popis: '',
      poradi: 0,
      jeAktivni: true,
      sluzby: []
    })
    setShowKategorieDialog(true)
  }

  const handleSaveKategorie = async () => {
    if (!editingKategorie || !editingKategorie.nazev) {
      setMessage({type: 'error', text: 'Vyplňte název kategorie'})
      return
    }

    try {
      setIsSaving(true)
      const url = editingKategorie.id ? `/api/admin/cenik/kategorie/${editingKategorie.id}` : '/api/admin/cenik/kategorie'
      const method = editingKategorie.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          nazev: editingKategorie.nazev,
          popis: editingKategorie.popis,
          jeAktivni: editingKategorie.jeAktivni
        })
      })

      if (response.ok) {
        setMessage({type: 'success', text: editingKategorie.id ? 'Kategorie byla upravena' : 'Kategorie byla vytvořena'})
        setShowKategorieDialog(false)
        setEditingKategorie(null)
        fetchCenik()
      } else {
        const error = await response.json()
        setMessage({type: 'error', text: error.chyba || 'Chyba při ukládání'})
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Chyba při ukládání kategorie'})
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteKategorie = async (id: number, maSluzby: boolean) => {
    if (maSluzby) {
      setMessage({type: 'error', text: 'Nelze smazat kategorii se službami. Nejprve smažte všechny služby.'})
      return
    }

    if (!confirm('Opravdu chcete smazat tuto kategorii?')) return

    try {
      const response = await fetch(`/api/admin/cenik/kategorie/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({type: 'success', text: 'Kategorie byla smazána'})
        fetchCenik()
      } else {
        const error = await response.json()
        setMessage({type: 'error', text: error.chyba || 'Chyba při mazání kategorie'})
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Chyba při mazání kategorie'})
    }
  }

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveSluzbaId(event.active.id as number)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveSluzbaId(null)

    if (!over || active.id === over.id) return

    // Najdi kategorii obsahující přetahovanou službu
    const activeKategorieIndex = kategorie.findIndex(kat =>
      kat.sluzby.some(s => s.id === active.id)
    )
    const overKategorieIndex = kategorie.findIndex(kat =>
      kat.sluzby.some(s => s.id === over.id)
    )

    if (activeKategorieIndex === -1 || overKategorieIndex === -1) return

    const activeKategorie = kategorie[activeKategorieIndex]
    const overKategorie = kategorie[overKategorieIndex]

    const activeIndex = activeKategorie.sluzby.findIndex(s => s.id === active.id)
    const overIndex = overKategorie.sluzby.findIndex(s => s.id === over.id)

    // Optimistická aktualizace UI
    const updatedKategorie = [...kategorie]

    if (activeKategorieIndex === overKategorieIndex) {
      // Přesun v rámci stejné kategorie
      updatedKategorie[activeKategorieIndex].sluzby = arrayMove(
        activeKategorie.sluzby,
        activeIndex,
        overIndex
      )
    } else {
      // Přesun mezi kategoriemi
      const movedSluzba = activeKategorie.sluzby[activeIndex]
      updatedKategorie[activeKategorieIndex].sluzby = activeKategorie.sluzby.filter(
        s => s.id !== active.id
      )
      updatedKategorie[overKategorieIndex].sluzby.splice(overIndex, 0, movedSluzba)
    }

    setKategorie(updatedKategorie)

    // Odeslat změnu na server
    try {
      const response = await fetch('/api/admin/cenik/poradi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sluzbaId: active.id,
          novePoradi: overIndex,
          novaKategorieId: activeKategorieIndex !== overKategorieIndex ? overKategorie.id : undefined
        })
      })

      if (!response.ok) {
        setMessage({type: 'error', text: 'Chyba při aktualizaci pořadí'})
        fetchCenik() // Obnovit data při chybě
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Chyba při aktualizaci pořadí'})
      fetchCenik()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editor ceníku</h1>
          <p className="text-muted-foreground mt-2">
            Spravujte služby a ceny pro klienty
          </p>
        </div>
        <Button onClick={handleCreateKategorie}>
          <Plus className="h-4 w-4 mr-2" />
          Přidat kategorii
        </Button>
      </div>

      {/* Message */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Split Layout - Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Levá strana - Editor */}
        <div className="space-y-6">
          {/* Editor obsah */}
          {kategorie.map((kat) => (
            <Card key={kat.id} className="bg-transparent">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl">{kat.nazev}</CardTitle>
                      {!kat.jeAktivni && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          Neaktivní
                        </span>
                      )}
                    </div>
                    {kat.popis && (
                      <CardDescription className="mt-1">{kat.popis}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditKategorie(kat)}
                      title="Upravit kategorii"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteKategorie(kat.id, kat.sluzby.length > 0)}
                      title="Smazat kategorii"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleCreateSluzba(kat.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Přidat službu
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {kat.sluzby.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Žádné služby v této kategorii
                  </p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={kat.sluzby.map(s => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {kat.sluzby.map((sluzba) => (
                          <SortableSluzbaItem
                            key={sluzba.id}
                            sluzba={sluzba}
                            onEdit={() => handleEditSluzba(sluzba, kat.id)}
                            onDelete={() => handleDeleteSluzba(sluzba.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pravá strana - Náhled */}
        <div className="hidden lg:block">
          <Card className="sticky top-4 bg-transparent">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Náhled ceníku
              </CardTitle>
              <CardDescription>
                Live preview ceníku služeb
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full overflow-hidden rounded-b-lg preview-iframe-container">
                <iframe
                  src="/cenik"
                  className="w-full h-full border-0"
                  title="Náhled ceníku"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog pro editaci služby */}
      <Dialog open={showSluzbaDialog} onOpenChange={setShowSluzbaDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-transparent">
          <DialogHeader>
            <DialogTitle>
              {editingSluzba?.id ? 'Upravit službu' : 'Nová služba'}
            </DialogTitle>
            <DialogDescription>
              Vyplňte informace o službě
            </DialogDescription>
          </DialogHeader>

          {editingSluzba && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="nazev">Název služby *</Label>
                <Input
                  id="nazev"
                  value={editingSluzba.nazev}
                  onChange={(e) => setEditingSluzba({...editingSluzba, nazev: e.target.value})}
                  placeholder="Např. Dámský střih"
                />
              </div>

              <div>
                <Label htmlFor="popis">Popis</Label>
                <Textarea
                  id="popis"
                  value={editingSluzba.popis || ''}
                  onChange={(e) => setEditingSluzba({...editingSluzba, popis: e.target.value})}
                  placeholder="Volitelný popis služby"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cena">Cena (Kč) *</Label>
                  <Input
                    id="cena"
                    type="number"
                    value={editingSluzba.cenaTopStylist}
                    onChange={(e) => setEditingSluzba({...editingSluzba, cenaTopStylist: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div>
                  <Label htmlFor="doba">Doba trvání (min) *</Label>
                  <Input
                    id="doba"
                    type="number"
                    value={editingSluzba.dobaTrvaniMinuty}
                    onChange={(e) => setEditingSluzba({...editingSluzba, dobaTrvaniMinuty: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aktivni"
                  checked={editingSluzba.jeAktivni}
                  onChange={(e) => setEditingSluzba({...editingSluzba, jeAktivni: e.target.checked})}
                  className="h-4 w-4"
                  aria-label="Služba je aktivní"
                />
                <Label htmlFor="aktivni" className="cursor-pointer">
                  Služba je aktivní
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSluzbaDialog(false)}
              disabled={isSaving}
            >
              Zrušit
            </Button>
            <Button onClick={handleSaveSluzba} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukládám...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Uložit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pro editaci kategorie */}
      <Dialog open={showKategorieDialog} onOpenChange={setShowKategorieDialog}>
        <DialogContent className="max-w-lg bg-transparent">
          <DialogHeader>
            <DialogTitle>
              {editingKategorie?.id ? 'Upravit kategorii' : 'Nová kategorie'}
            </DialogTitle>
            <DialogDescription>
              Vyplňte informace o kategorii služeb
            </DialogDescription>
          </DialogHeader>

          {editingKategorie && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="kat-nazev">Název kategorie *</Label>
                <Input
                  id="kat-nazev"
                  value={editingKategorie.nazev}
                  onChange={(e) => setEditingKategorie({...editingKategorie, nazev: e.target.value})}
                  placeholder="Např. Dámské střihy"
                />
              </div>

              <div>
                <Label htmlFor="kat-popis">Popis</Label>
                <Textarea
                  id="kat-popis"
                  value={editingKategorie.popis || ''}
                  onChange={(e) => setEditingKategorie({...editingKategorie, popis: e.target.value})}
                  placeholder="Volitelný popis kategorie"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="kat-aktivni"
                  checked={editingKategorie.jeAktivni}
                  onChange={(e) => setEditingKategorie({...editingKategorie, jeAktivni: e.target.checked})}
                  className="h-4 w-4"
                  aria-label="Kategorie je aktivní"
                />
                <Label htmlFor="kat-aktivni" className="cursor-pointer">
                  Kategorie je aktivní
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowKategorieDialog(false)}
              disabled={isSaving}
            >
              Zrušit
            </Button>
            <Button onClick={handleSaveKategorie} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukládám...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Uložit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Sortable služba item komponent pro drag and drop
interface SortableSluzbaItemProps {
  sluzba: Sluzba
  onEdit: () => void
  onDelete: () => void
}

function SortableSluzbaItem({ sluzba, onEdit, onDelete }: SortableSluzbaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sluzba.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg gap-3 bg-transparent hover:bg-white/10 focus-within:bg-[#B8A876]/10 focus-within:border-[#B8A876] transition-all duration-200"
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-base">{sluzba.nazev}</h4>
            {!sluzba.jeAktivni && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                Neaktivní
              </span>
            )}
          </div>
          {sluzba.popis && (
            <p className="text-sm text-muted-foreground mb-2">{sluzba.popis}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">{sluzba.cenaTopStylist} Kč</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{sluzba.dobaTrvaniMinuty} min</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  )
}
