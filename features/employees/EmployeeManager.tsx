"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/admin-kit/core/auth/AuthProvider"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  CalendarDays,
  Clock,
  Save,
  X,
  ShieldCheck,
  ShieldOff,
  Info
} from "lucide-react"

interface IZamestnanec {
  id: number
  jmeno: string
  prijmeni: string
  uroven: string
  email: string
  telefon?: string
  fotoUrl?: string
  jeAktivni: boolean
  jeAdmin?: boolean
  rozvrh?: IRozvrh[]
  dnyVolna?: string[]
}

interface IRozvrh {
  den: DenVTydnu
  od: string
  do: string
  jePracovniDen: boolean
}

type DenVTydnu = 'pondeli' | 'utery' | 'streda' | 'ctvrtek' | 'patek' | 'sobota' | 'nedele'

interface ZamestnanecForm {
  jmeno: string
  prijmeni: string
  uroven: string
  email: string
  telefon: string
  fotoUrl: string
  rozvrh: IRozvrh[]
  dnyVolna: string[]
}

const UROVNE_STYLISTU = [
  { value: "top_stylist", label: "Kadeřnice", color: "bg-purple-100 text-purple-800" }
]

const DNY_TYDNE: { value: DenVTydnu; label: string }[] = [
  { value: 'pondeli', label: 'Pondělí' },
  { value: 'utery', label: 'Úterý' },
  { value: 'streda', label: 'Středa' },
  { value: 'ctvrtek', label: 'Čtvrtek' },
  { value: 'patek', label: 'Pátek' },
  { value: 'sobota', label: 'Sobota' },
  { value: 'nedele', label: 'Neděle' }
]

// Rozvrh je opakující se týdenní šablona (ne konkrétní datum), ale pro přehlednost
// se u dní zobrazují data následujícího pracovního týdne (pondělí - neděle).
function getDatumyNasledujicihoTydne(): Record<DenVTydnu, string> {
  const dnesek = new Date()
  const denVTydnuDnes = dnesek.getDay() // 0 = neděle, 1 = pondělí, ...
  const dnyDoPristihoPondeli = ((1 - denVTydnuDnes + 7) % 7) || 7
  const pristiPondeli = new Date(dnesek)
  pristiPondeli.setDate(dnesek.getDate() + dnyDoPristihoPondeli)

  const poradiDnu: DenVTydnu[] = ['pondeli', 'utery', 'streda', 'ctvrtek', 'patek', 'sobota', 'nedele']
  const vysledek = {} as Record<DenVTydnu, string>
  poradiDnu.forEach((den, index) => {
    const datum = new Date(pristiPondeli)
    datum.setDate(pristiPondeli.getDate() + index)
    vysledek[den] = `${datum.getDate()}. ${datum.getMonth() + 1}.`
  })
  return vysledek
}

const VYCHOZI_ROZVRH: IRozvrh[] = [
  { den: 'pondeli', od: '09:00', do: '17:00', jePracovniDen: true },
  { den: 'utery', od: '09:00', do: '17:00', jePracovniDen: true },
  { den: 'streda', od: '09:00', do: '17:00', jePracovniDen: true },
  { den: 'ctvrtek', od: '09:00', do: '17:00', jePracovniDen: true },
  { den: 'patek', od: '09:00', do: '17:00', jePracovniDen: true },
  { den: 'sobota', od: '09:00', do: '15:00', jePracovniDen: true },
  { den: 'nedele', od: '09:00', do: '15:00', jePracovniDen: false }
]

interface EmployeeManagerProps {
  selfOnly?: boolean
  onOpenReservations?: (employeeId: number) => void
}

export function EmployeeManager({ selfOnly = false, onOpenReservations }: EmployeeManagerProps) {
  const { user } = useAuth()
  const [zamestnanci, setZamestnanci] = useState<IZamestnanec[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<IZamestnanec | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState<ZamestnanecForm>({
    jmeno: "",
    prijmeni: "",
    uroven: "stylist",
    email: "",
    telefon: "",
    fotoUrl: "",
    rozvrh: VYCHOZI_ROZVRH,
    dnyVolna: []
  })

  const { toast } = useToast()

  // Rozvrh management state
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [editingScheduleFor, setEditingScheduleFor] = useState<IZamestnanec | null>(null)
  
  // Volné dny management state
  const [showVacationModal, setShowVacationModal] = useState(false)
  const [editingVacationFor, setEditingVacationFor] = useState<IZamestnanec | null>(null)
  const [newVacationDate, setNewVacationDate] = useState('')
  const [newVacationFrom, setNewVacationFrom] = useState('')
  const [newVacationTo, setNewVacationTo] = useState('')

  // Načtení zaměstnanců
  useEffect(() => {
    loadZamestnanci()
  }, [])

  const loadZamestnanci = async () => {
    try {
      const response = await fetch('/api/admin/zamestnanci')
      if (response.ok) {
        const data = await response.json()
        setZamestnanci(data.zamestnanci || [])
      } else {
        throw new Error('Chyba při načítání')
      }
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst seznam zaměstnanců",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.jmeno || !formData.prijmeni || !formData.email) {
      toast({
        title: "Chyba",
        description: "Vyplňte všechna povinná pole",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const method = editingEmployee ? 'PUT' : 'POST'
      const url = editingEmployee ? `/api/admin/zamestnanci/${editingEmployee.id}` : '/api/admin/zamestnanci'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: editingEmployee ? "Zaměstnanec byl upraven" : "Zaměstnanec byl přidán"
        })
        
        resetForm()
        loadZamestnanci()
      } else {
        throw new Error('Chyba při ukládání')
      }
    } catch (error) {
      toast({
        title: "Chyba", 
        description: "Nepodařilo se uložit zaměstnance",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (zamestnanec: IZamestnanec) => {
    setEditingEmployee(zamestnanec)
    setFormData({
      jmeno: zamestnanec.jmeno,
      prijmeni: zamestnanec.prijmeni,
      uroven: zamestnanec.uroven,
      email: zamestnanec.email,
      telefon: zamestnanec.telefon || "",
      fotoUrl: zamestnanec.fotoUrl || "",
      rozvrh: zamestnanec.rozvrh || VYCHOZI_ROZVRH,
      dnyVolna: zamestnanec.dnyVolna || []
    })
    setShowForm(true)
  }

  const handleToggleAdmin = async (zamestnanec: IZamestnanec) => {
    const novaHodnota = !zamestnanec.jeAdmin
    if (novaHodnota && !confirm(`Opravdu chcete označit ${zamestnanec.jmeno} ${zamestnanec.prijmeni} jako administrátora? Administrátoři se nezobrazují v online rezervaci.`)) return
    if (!novaHodnota && !confirm(`Opravdu chcete odebrat administrátorská práva uživateli ${zamestnanec.jmeno} ${zamestnanec.prijmeni}?`)) return

    try {
      const response = await fetch(`/api/admin/zamestnanci/${zamestnanec.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jeAdmin: novaHodnota })
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: novaHodnota
            ? `${zamestnanec.jmeno} označen/a jako administrátor`
            : `Administrátorská role odebrána`
        })
        loadZamestnanci()
      } else {
        throw new Error('Chyba při změně admin stavu')
      }
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se změnit admin stav",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Opravdu chcete smazat tohoto zaměstnance?')) return

    try {
      const response = await fetch(`/api/admin/zamestnanci/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: "Zaměstnanec byl smazán"
        })
        loadZamestnanci()
      } else {
        throw new Error('Chyba při mazání')
      }
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se smazat zaměstnance", 
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      jmeno: "",
      prijmeni: "",
      uroven: "stylist", 
      email: "",
      telefon: "",
      fotoUrl: "",
      rozvrh: VYCHOZI_ROZVRH,
      dnyVolna: []
    })
    setEditingEmployee(null)
    setShowForm(false)
  }

  // Schedule management functions
  const handleScheduleEdit = (zamestnanec: IZamestnanec) => {
    setEditingScheduleFor(zamestnanec)
    setFormData({
      jmeno: zamestnanec.jmeno,
      prijmeni: zamestnanec.prijmeni,
      uroven: zamestnanec.uroven,
      email: zamestnanec.email,
      telefon: zamestnanec.telefon || "",
      fotoUrl: zamestnanec.fotoUrl || "",
      rozvrh: zamestnanec.rozvrh || VYCHOZI_ROZVRH,
      dnyVolna: zamestnanec.dnyVolna || []
    })
    setShowScheduleModal(true)
  }

  const handleScheduleUpdate = async () => {
    if (!editingScheduleFor) return

    try {
      const response = await fetch(`/api/admin/zamestnanci/${editingScheduleFor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jmeno: editingScheduleFor.jmeno,
          prijmeni: editingScheduleFor.prijmeni,
          uroven: editingScheduleFor.uroven,
          email: editingScheduleFor.email,
          telefon: editingScheduleFor.telefon ?? null,
          fotoUrl: editingScheduleFor.fotoUrl ?? null,
          rozvrh: formData.rozvrh,
          dnyVolna: editingScheduleFor.dnyVolna ?? [],
        })
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: "Rozvrh byl aktualizován"
        })
        setShowScheduleModal(false)
        setEditingScheduleFor(null)
        loadZamestnanci()
      } else {
        throw new Error('Chyba při ukládání rozvrhu')
      }
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit rozvrh",
        variant: "destructive"
      })
    }
  }

  const updateScheduleDay = (den: DenVTydnu, updates: Partial<IRozvrh>) => {
    setFormData(prev => ({
      ...prev,
      rozvrh: prev.rozvrh.map(r => 
        r.den === den ? { ...r, ...updates } : r
      )
    }))
  }

  // Vacation management functions
  const handleVacationEdit = (zamestnanec: IZamestnanec) => {
    setEditingVacationFor(zamestnanec)
    setFormData(prev => ({
      ...prev,
      dnyVolna: zamestnanec.dnyVolna || []
    }))
    setShowVacationModal(true)
  }

  const addVacationDay = () => {
    if (!newVacationDate) return

    const hasFrom = Boolean(newVacationFrom)
    const hasTo = Boolean(newVacationTo)

    if (hasFrom !== hasTo) {
      toast({
        title: "Chyba",
        description: "Pro časové volno vyplňte čas od i do",
        variant: "destructive"
      })
      return
    }

    if (hasFrom && hasTo && newVacationFrom >= newVacationTo) {
      toast({
        title: "Chyba",
        description: "Čas 'od' musí být menší než čas 'do'",
        variant: "destructive"
      })
      return
    }

    const entry = hasFrom && hasTo
      ? `${newVacationDate}|${newVacationFrom}-${newVacationTo}`
      : newVacationDate

    if (formData.dnyVolna.includes(entry)) {
      toast({
        title: "Upozornění",
        description: "Tato položka volna už existuje"
      })
      return
    }
    
    setFormData(prev => ({
      ...prev,
      dnyVolna: [...prev.dnyVolna, entry].sort((a, b) => {
        const [dateA] = a.split('|')
        const [dateB] = b.split('|')
        return dateA.localeCompare(dateB) || a.localeCompare(b)
      })
    }))
    setNewVacationDate('')
    setNewVacationFrom('')
    setNewVacationTo('')
  }

  const removeVacationDay = (date: string) => {
    setFormData(prev => ({
      ...prev,
      dnyVolna: prev.dnyVolna.filter(d => d !== date)
    }))
  }

  const handleVacationUpdate = async () => {
    if (!editingVacationFor) return

    try {
      const response = await fetch(`/api/admin/zamestnanci/${editingVacationFor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jmeno: editingVacationFor.jmeno,
          prijmeni: editingVacationFor.prijmeni,
          uroven: editingVacationFor.uroven,
          email: editingVacationFor.email,
          telefon: editingVacationFor.telefon ?? null,
          fotoUrl: editingVacationFor.fotoUrl ?? null,
          rozvrh: editingVacationFor.rozvrh ?? null,
          dnyVolna: formData.dnyVolna,
        })
      })

      if (response.ok) {
        toast({
          title: "Úspěch",
          description: "Volné dny byly aktualizovány"
        })
        setShowVacationModal(false)
        setEditingVacationFor(null)
        loadZamestnanci()
      } else {
        throw new Error('Chyba při ukládání volných dnů')
      }
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit volné dny",
        variant: "destructive"
      })
    }
  }

  const handleOpenReservations = (employeeId: number) => {
    if (onOpenReservations) {
      onOpenReservations(employeeId)
      return
    }

    toast({
      title: "Informace",
      description: "Přepnutí do rezervací není zatím propojené"
    })
  }

  const getUroveňLabel = (uroven: string) => {
    const found = UROVNE_STYLISTU.find(u => u.value === uroven)
    return found ? found.label : uroven
  }

  const getUroveňColor = (uroven: string) => {
    const found = UROVNE_STYLISTU.find(u => u.value === uroven)
    return found ? found.color : "bg-gray-100 text-gray-800"
  }

  const parseVacationEntry = (entry: string) => {
    if (!entry.includes('|')) {
      return { date: entry, od: null as string | null, do: null as string | null }
    }

    const [date, range] = entry.split('|')
    const [od, to] = (range ?? '').split('-')

    if (!date || !od || !to) {
      return { date: entry, od: null as string | null, do: null as string | null }
    }

    return { date, od, do: to }
  }

  const isVacationEntryUpcoming = (entry: string) => {
    const { date } = parseVacationEntry(entry)
    const entryDate = new Date(`${date}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return entryDate >= today
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Viditelnost zaměstnanců je řízena serverově v API
  const visibleZamestnanci = zamestnanci

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-white">
            <Users className="h-6 w-6" />
            {selfOnly ? 'Moje volno' : 'Správa zaměstnanců'}
          </h1>
          <p className="text-muted-foreground">
            {selfOnly ? 'Spravujte své volné dny a pracovní rozvrh' : 'Spravujte tým stylistů a jejich nastavení'}
          </p>
        </div>
        
        {!selfOnly && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Přidat zaměstnance
          </Button>
        )}
      </div>



      {/* Form Modal/Panel */}
      {showForm && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {editingEmployee ? 'Upravit zaměstnance' : 'Nový zaměstnanec'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jmeno">Jméno *</Label>
                <Input
                  id="jmeno"
                  value={formData.jmeno}
                  onChange={(e) => setFormData(prev => ({ ...prev, jmeno: e.target.value }))}
                  placeholder="Jméno"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prijmeni">Příjmení *</Label>
                <Input
                  id="prijmeni" 
                  value={formData.prijmeni}
                  onChange={(e) => setFormData(prev => ({ ...prev, prijmeni: e.target.value }))}
                  placeholder="Příjmení"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@priklad.cz"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefon"
                    value={formData.telefon}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                    placeholder="+420 123 456 789"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Úroveň *</Label>
                <Select
                  value={formData.uroven}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, uroven: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UROVNE_STYLISTU.map(uroven => (
                      <SelectItem key={uroven.value} value={uroven.value}>
                        {uroven.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fotoUrl">URL fotky</Label>
                <Input
                  id="fotoUrl"
                  value={formData.fotoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, fotoUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              {/* Rozvrh Section */}
              <div className="md:col-span-2 space-y-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold">Pracovní rozvrh</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {DNY_TYDNE.map(({ value: den, label }) => {
                    const denRozvrh = formData.rozvrh.find(r => r.den === den) || {
                      den,
                      od: '09:00',
                      do: '17:00',
                      jePracovniDen: false
                    }
                    
                    return (
                      <div key={den} className="flex items-center gap-4 p-3 rounded-lg border bg-orange-400/0">
                        <div className="w-20 font-medium text-sm">{label}</div>
                        
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={denRozvrh.jePracovniDen}
                            onCheckedChange={(checked) => updateScheduleDay(den, { jePracovniDen: !!checked })}
                          />
                          <Label className="text-sm">V práci</Label>
                        </div>
                        
                        {denRozvrh.jePracovniDen && (
                          <>
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Od:</Label>
                              <Input
                                type="time"
                                value={denRozvrh.od}
                                onChange={(e) => updateScheduleDay(den, { od: e.target.value })}
                                className="w-24"
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Do:</Label>
                              <Input
                                type="time"
                                value={denRozvrh.do}
                                onChange={(e) => updateScheduleDay(den, { do: e.target.value })}
                                className="w-24"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Zrušit
                </Button>
                <Button type="submit" disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? "Ukládání..." : "Uložit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Schedule Management Modal */}
      {showScheduleModal && editingScheduleFor && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Rozvrh - {editingScheduleFor.jmeno} {editingScheduleFor.prijmeni}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Tento rozvrh je trvalá týdenní šablona - pokud ho ručně nezměníte, platí navždy stejně každý týden
                (např. když je zapnutá sobota, bude otevřeno každou sobotu, dokud to nezměníte). Data u dnů níže
                ukazují jen následující týden pro orientaci.
              </span>
            </div>
            <div className="space-y-4">
              {(() => {
                const datumyTydne = getDatumyNasledujicihoTydne()
                return DNY_TYDNE.map(({ value: den, label }) => {
                const denRozvrh = formData.rozvrh.find(r => r.den === den) || {
                  den,
                  od: '09:00',
                  do: '17:00',
                  jePracovniDen: false
                }
                
                return (
                  <div key={den} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="w-28 font-medium">
                      {label}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">{datumyTydne[den]}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${den}-active`}
                        checked={denRozvrh.jePracovniDen}
                        onCheckedChange={(checked) => updateScheduleDay(den, { jePracovniDen: !!checked })}
                      />
                      <Label htmlFor={`${den}-active`} className="cursor-pointer">
                        Pracovní den
                      </Label>
                    </div>
                    
                    {denRozvrh.jePracovniDen && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`${den}-od`}>Od:</Label>
                          <Input
                            id={`${den}-od`}
                            type="time"
                            value={denRozvrh.od}
                            onChange={(e) => updateScheduleDay(den, { od: e.target.value })}
                            className="w-24"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`${den}-do`}>Do:</Label>
                          <Input
                            id={`${den}-do`}
                            type="time"
                            value={denRozvrh.do}
                            onChange={(e) => updateScheduleDay(den, { do: e.target.value })}
                            className="w-24"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )
              })
              })()}
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)}>
                  Zrušit
                </Button>
                <Button onClick={handleScheduleUpdate} className="gap-2">
                  <Save className="h-4 w-4" />
                  Uložit rozvrh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vacation Management Modal */}
      {showVacationModal && editingVacationFor && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Volné dny - {editingVacationFor.jmeno} {editingVacationFor.prijmeni}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowVacationModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add new vacation day */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-2">
                  <Label htmlFor="new-vacation">Datum volna</Label>
                  <Input
                    id="new-vacation"
                    type="date"
                    value={newVacationDate}
                    onChange={(e) => setNewVacationDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-vacation-from">Od (volitelné)</Label>
                  <Input
                    id="new-vacation-from"
                    type="time"
                    value={newVacationFrom}
                    onChange={(e) => setNewVacationFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-vacation-to">Do (volitelné)</Label>
                  <Input
                    id="new-vacation-to"
                    type="time"
                    value={newVacationTo}
                    onChange={(e) => setNewVacationTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Nechte čas prázdný pro volno na celý den, nebo vyplňte oba časy pro jednorázové volno v části dne.
                  </p>
                  <Button onClick={addVacationDay} disabled={!newVacationDate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Přidat
                  </Button>
                </div>
              </div>

              {/* Current vacation days */}
              <div>
                <Label>Naplánované volné dny</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {formData.dnyVolna.length === 0 ? (
                    <p className="text-black-foreground text-sm p-4 text-center border rounded-md">
                      Žádné volné dny nejsou naplánované
                    </p>
                  ) : (
                    formData.dnyVolna
                      .sort()
                      .filter(entry => {
                        const parsed = parseVacationEntry(entry)
                        const dateObj = new Date(parsed.date + 'T00:00:00')
                        return dateObj >= new Date()
                      })
                      .map(entry => {
                        const parsed = parseVacationEntry(entry)
                        const dateObj = new Date(parsed.date + 'T00:00:00')
                        const isToday = new Date().toDateString() === dateObj.toDateString()
                        const isPast = dateObj < new Date()
                        
                        return (
                          <div
                            key={entry}
                            className={`flex justify-between items-center p-3 rounded-md border ${
                              isToday ? 'bg-blue-950/30 border-blue-800' :
                              isPast ? 'bg-muted/30 border-border' : 
                              'bg-transparent border-border'
                            }`}
                          >
                            <div>
                              <span className={`font-medium ${
                                isPast ? 'text-muted-foreground' : 
                                isToday ? 'text-blue-200' :
                                'text-foreground'
                              }`}>
                                {dateObj.toLocaleDateString('cs-CZ', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              {parsed.od && parsed.do && (
                                <Badge className="ml-2" variant="outline">
                                  {parsed.od} - {parsed.do}
                                </Badge>
                              )}
                              {isToday && <Badge className="ml-2" variant="default">Dnes</Badge>}
                              {isPast && <Badge className="ml-2" variant="secondary">Minulost</Badge>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVacationDay(entry)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowVacationModal(false)}>
                  Zrušit
                </Button>
                <Button onClick={handleVacationUpdate} className="gap-2">
                  <Save className="h-4 w-4" />
                  Uložit volné dny
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleZamestnanci.map(zamestnanec => (
          <Card key={zamestnanec.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={zamestnanec.fotoUrl || "/zajac.jpg"} />
                  <AvatarFallback>
                    {zamestnanec.jmeno.charAt(0)}{zamestnanec.prijmeni.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">
                          {zamestnanec.jmeno} {zamestnanec.prijmeni}
                        </h3>
                        {zamestnanec.jeAdmin && (
                          <Badge className="text-xs bg-blue-100 text-blue-800 border border-blue-300">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <Badge className={`text-xs ${getUroveňColor(zamestnanec.uroven)}`}>
                        {getUroveňLabel(zamestnanec.uroven)}
                      </Badge>
                    </div>
                    
                    {!selfOnly && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(zamestnanec)}
                          title="Upravit zaměstnance"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAdmin(zamestnanec)}
                          title={zamestnanec.jeAdmin ? "Odebrat admin roli" : "Označit jako administrátor"}
                          className={zamestnanec.jeAdmin ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}
                        >
                          {zamestnanec.jeAdmin ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => !zamestnanec.jeAdmin && handleDelete(zamestnanec.id)}
                          disabled={!!zamestnanec.jeAdmin}
                          title={zamestnanec.jeAdmin ? "Administrátor nemůže být smazán" : "Smazat zaměstnance"}
                          className={zamestnanec.jeAdmin ? "opacity-30 cursor-not-allowed" : "text-red-600 hover:text-red-700 hover:bg-red-50"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-1 text-sm text-white">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{zamestnanec.email}</span>
                    </div>
                    {zamestnanec.telefon && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{zamestnanec.telefon}</span>
                      </div>
                    )}
                    {zamestnanec.rozvrh && (
                      <div className="mt-2 p-2 bg-yellow-500/0 rounded text-xs">
                        <div className="font-medium mb-1 text-white">Dnešní pracovní doba:</div>
                        {(() => {
                          const today = new Date().getDay()
                          const dayNames = ['nedele', 'pondeli', 'utery', 'streda', 'ctvrtek', 'patek', 'sobota']
                          const todayName = dayNames[today] as DenVTydnu
                          const todaysSchedule = (zamestnanec.rozvrh as IRozvrh[])?.find(r => r.den === todayName)
                          
                          if (todaysSchedule?.jePracovniDen) {
                            return (
                              <span className="text-white font-medium">
                                {todaysSchedule.od} - {todaysSchedule.do}
                              </span>
                            )
                          }
                          return <span className="text-red-200">Volno</span>
                        })()}
                      </div>
                    )}
                    {zamestnanec.dnyVolna && zamestnanec.dnyVolna.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-500/0 rounded text-xs">
                        <div className="font-medium mb-1 text-white">Plánované volno:</div>
                        <span className="text-orange-600 font-medium">
                          {zamestnanec.dnyVolna.filter(isVacationEntryUpcoming).length} volno
                        </span>
                      </div>
                    )}
                  </div>
                  
                    <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
                    <Badge variant={zamestnanec.jeAktivni ? "default" : "secondary"}>
                      {zamestnanec.jeAktivni ? "Aktivní" : "Neaktivní"}
                    </Badge>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleScheduleEdit(zamestnanec)}>
                        <Clock className="h-3 w-3" />
                        Rozvrh
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleVacationEdit(zamestnanec)}>
                        <CalendarDays className="h-3 w-3" />
                        Volno
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleOpenReservations(zamestnanec.id)}>
                        <Calendar className="h-3 w-3" />
                        Rezervace
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {zamestnanci.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Žádní zaměstnanci</h3>
            <p className="text-muted-foreground mb-4">
              Přidejte první zaměstnance do systému
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Přidat zaměstnance
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}