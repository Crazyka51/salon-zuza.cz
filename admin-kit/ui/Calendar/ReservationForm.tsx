'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
  MessageSquare,
  Save,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../components/ui/select';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import {
  Alert,
  AlertDescription,
} from '../../../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

interface Sluzba {
  id: number;
  nazev: string;
  dobaTrvaniMinuty: number;
  cenaTopStylist: number;
  cenaStylist: number;
  cenaJuniorStylist: number;
  kategorie: {
    nazev: string;
  };
}

interface Zamestnanec {
  id: number;
  jmeno: string;
  prijmeni: string;
  uroven: string;
}

interface DostupnyTermin {
  time: string;
  available: boolean;
}

interface ReservationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedDate?: Date;
  preselectedTime?: string;
}

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function ReservationForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  preselectedDate,
  preselectedTime 
}: ReservationFormProps) {
  const [formData, setFormData] = useState({
    jmeno: '',
    prijmeni: '',
    email: '',
    telefon: '',
    datum: preselectedDate ? formatLocalDate(preselectedDate) : '',
    casOd: preselectedTime || '',
    sluzbaIds: [] as string[],
    zamestnanecId: '',
    pocetOsob: '1',
    pocetDeti: '0',
    poznamka: '',
    zpusobPlatby: 'hotove',
    notifikaceEmail: true,
    notifikaceSms: false,
  });

  const [sluzby, setSluzby] = useState<Sluzba[]>([]);
  const [zamestnanci, setZamestnanci] = useState<Zamestnanec[]>([]);
  const [dostupneTerminy, setDostupneTerminy] = useState<DostupnyTermin[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTerminy, setLoadingTerminy] = useState(false);
  const [error, setError] = useState('');
  const [selectedSluzby, setSelectedSluzby] = useState<Sluzba[]>([]);
  const [selectedZamestnanec, setSelectedZamestnanec] = useState<Zamestnanec | null>(null);

  // Načtení služeb a zaměstnanců při otevření formuláře
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Načtení dostupných termínů při změně data nebo služeb
  useEffect(() => {
    if (formData.datum && (formData.sluzbaIds.length > 0 || selectedSluzby.length > 0)) {
      loadDostupneTerminy();
    }
  }, [formData.datum, formData.sluzbaIds, formData.zamestnanecId]);

  const loadInitialData = async () => {
    try {
      // Načtení služeb
      const sluzbyResponse = await fetch('/api/admin/sluzby');
      if (!sluzbyResponse.ok) {
        console.error('Chyba při načítání služeb:', sluzbyResponse.status, sluzbyResponse.statusText);
        throw new Error(`Služby: ${sluzbyResponse.status} ${sluzbyResponse.statusText}`);
      }
      const contentType = sluzbyResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await sluzbyResponse.text();
        console.error('API /api/admin/sluzby nevrací JSON:', text.substring(0, 200));
        throw new Error('API nevrací JSON odpověď');
      }
      const sluzbyData = await sluzbyResponse.json();
      setSluzby(sluzbyData.sluzby || []);

      // Načtení zaměstnanců
      const zamestnaniResponse = await fetch('/api/admin/zamestnanci');
      if (!zamestnaniResponse.ok) {
        console.error('Chyba při načítání zaměstnanců:', zamestnaniResponse.status, zamestnaniResponse.statusText);
        throw new Error(`Zaměstnanci: ${zamestnaniResponse.status} ${zamestnaniResponse.statusText}`);
      }
      const contentType2 = zamestnaniResponse.headers.get('content-type');
      if (!contentType2 || !contentType2.includes('application/json')) {
        const text = await zamestnaniResponse.text();
        console.error('API /api/admin/zamestnanci nevrací JSON:', text.substring(0, 200));
        throw new Error('API nevrací JSON odpověď');
      }
      const zamestnaniData = await zamestnaniResponse.json();
      setZamestnanci(zamestnaniData.zamestnanci || []);
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
      setError(`Nepodařilo se načíst data pro formulář: ${error instanceof Error ? error.message : 'neznámá chyba'}`);
    }
  };

  const loadDostupneTerminy = async () => {
    setLoadingTerminy(true);
    try {
      const params = new URLSearchParams({
        datum: formData.datum,
      });

      if (formData.sluzbaIds.length > 0) {
        // Pro dostupné termíny použijeme nejdelší službu
        const nejdelsiSluzba = selectedSluzby.reduce((prev, current) => 
          (current.dobaTrvaniMinuty > prev.dobaTrvaniMinuty) ? current : prev
        );
        if (nejdelsiSluzba) {
          params.append('sluzbaId', nejdelsiSluzba.id.toString());
        }
      }

      if (formData.zamestnanecId) {
        params.append('zamestnanecId', formData.zamestnanecId);
      }

      const response = await fetch(`/api/rezervace/dostupne-terminy?${params.toString()}`);
      if (!response.ok) {
        console.error('Chyba při načítání dostupných termínů:', response.status, response.statusText);
        return;
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API /api/rezervace/dostupne-terminy nevrací JSON:', text.substring(0, 200));
        return;
      }
      const data = await response.json();
      setDostupneTerminy(data.dostupneTerminy || []);
    } catch (error) {
      console.error('Chyba při načítání dostupných termínů:', error);
    } finally {
      setLoadingTerminy(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const handleSluzbaChange = (sluzbaId: string, checked: boolean) => {
    let newSluzbaIds: string[];
    if (checked) {
      newSluzbaIds = [...formData.sluzbaIds, sluzbaId];
    } else {
      newSluzbaIds = formData.sluzbaIds.filter(id => id !== sluzbaId);
    }
    
    const newSelectedSluzby = sluzby.filter(s => newSluzbaIds.includes(s.id.toString()));
    setSelectedSluzby(newSelectedSluzby);
    setFormData(prev => ({ ...prev, sluzbaIds: newSluzbaIds }));
    setError('');
  };

  const handleZamestnanecChange = (zamestnanecId: string) => {
    const zamestnanec = zamestnanci.find(z => z.id.toString() === zamestnanecId);
    setSelectedZamestnanec(zamestnanec || null);
    handleInputChange('zamestnanecId', zamestnanecId);
  };

  const calculateCena = () => {
    if (selectedSluzby.length === 0 || !selectedZamestnanec) return 0;
    
    return selectedSluzby.reduce((total, sluzba) => {
      let cenaSluby;
      switch (selectedZamestnanec.uroven) {
        case 'top_stylist':
          cenaSluby = sluzba.cenaTopStylist;
          break;
        case 'stylist':
          cenaSluby = sluzba.cenaStylist;
          break;
        case 'junior_stylist':
          cenaSluby = sluzba.cenaJuniorStylist;
          break;
        default:
          cenaSluby = sluzba.cenaStylist;
      }
      return total + cenaSluby;
    }, 0);
  };

  const calculateEndTime = () => {
    if (!formData.casOd || selectedSluzby.length === 0) return '';
    
    const totalMinutes = selectedSluzby.reduce((sum, sluzba) => sum + sluzba.dobaTrvaniMinuty, 0);
    const [hours, minutes] = formData.casOd.split(':').map(Number);
    const endMinutes = minutes + totalMinutes;
    const endHours = hours + Math.floor(endMinutes / 60);
    const finalMinutes = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  const checkWorkingHoursConflict = () => {
    if (!formData.casOd || selectedSluzby.length === 0) return null;
    
    const endTime = calculateEndTime();
    const [endHours] = endTime.split(':').map(Number);
    
    // Základní provozní doba salonu (lze rozšířit o dynamické načtení z DB)
    const closingTime = 17; // 17:00
    
    if (endHours >= closingTime || endTime >= '17:00') {
      return `Služby by skončily v ${endTime}, což je mimo běžnou pracovní dobu (do 17:00). Jako admin můžete rezervaci vytvořit i tak.`;
    }
    
    return null;
  };

  const validateForm = () => {
    if (!formData.jmeno.trim()) return 'Jméno je povinné';
    if (!formData.prijmeni.trim()) return 'Příjmení je povinné';
    if (!formData.email.trim()) return 'Email je povinný';
    if (!formData.telefon.trim()) return 'Telefon je povinný';
    if (!formData.datum) return 'Datum je povinné';
    if (!formData.casOd) return 'Čas začátku je povinný';
    if (!formData.sluzbaIds.length) return 'Alespoň jedna služba je povinná';

    // Validace emailu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Neplatný formát emailu';
    }

    // Validace telefonu
    const phoneRegex = /^(\+420)?[0-9]{9}$/;
    if (!phoneRegex.test(formData.telefon.replace(/\s/g, ''))) {
      return 'Neplatný formát telefonu';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔵 handleSubmit - spuštěno');
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      console.error('❌ Validační chyba:', validationError);
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endTime = calculateEndTime();
      const cena = calculateCena();

      const reservationData = {
        ...formData,
        casDo: endTime,
        cena,
        pocetOsob: parseInt(formData.pocetOsob),
        pocetDeti: parseInt(formData.pocetDeti),
        sluzbaIds: formData.sluzbaIds.map(id => parseInt(id)),
        zamestnanecId: formData.zamestnanecId ? parseInt(formData.zamestnanecId) : null,
        adminOverride: true, // Admin může vytvářet rezervace i mimo pracovní dobu
      };

      console.log('📤 Odesílám data na /api/rezervace:', reservationData);

      const response = await fetch('/api/rezervace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });

      console.log('📊 Response status:', response.status, response.statusText);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ API /api/rezervace nevrací JSON:', text.substring(0, 300));
        setError('Server vrátil neplatnou odpověď. Zkontrolujte konzoli pro více informací.');
        return;
      }

      if (response.ok) {
        const apiResponse = await response.json();
        console.log('✅ Rezervace úspěšně vytvořena - API response:', apiResponse);
        onSuccess();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Nepodařilo se vytvořit rezervaci';
        console.error('❌ Chyba při vytváření rezervace:', response.status, errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Exception při vytváření rezervace:', error);
      setError('Nepodařilo se vytvořit rezervaci');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      jmeno: '',
      prijmeni: '',
      email: '',
      telefon: '',
      datum: '',
      casOd: '',
      sluzbaIds: [],
      zamestnanecId: '',
      pocetOsob: '1',
      pocetDeti: '0',
      poznamka: '',
      zpusobPlatby: 'hotove',
      notifikaceEmail: true,
      notifikaceSms: false,
    });
    setSelectedSluzby([]);
    setSelectedZamestnanec(null);
    setError('');
  };

  const formatCena = (cena: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
    }).format(cena);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nová rezervace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Zákazník */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <User className="h-5 w-5" />
                <span>Kontaktní údaje zákazníka</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jmeno">Jméno *</Label>
                  <Input
                    id="jmeno"
                    value={formData.jmeno}
                    onChange={(e) => handleInputChange('jmeno', e.target.value)}
                    placeholder="Zadejte jméno"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prijmeni">Příjmení *</Label>
                  <Input
                    id="prijmeni"
                    value={formData.prijmeni}
                    onChange={(e) => handleInputChange('prijmeni', e.target.value)}
                    placeholder="Zadejte příjmení"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="priklad@email.cz"
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefon">Telefon *</Label>
                <Input
                  id="telefon"
                  value={formData.telefon}
                  onChange={(e) => handleInputChange('telefon', e.target.value)}
                  placeholder="+420 777 123 456"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Termín a služba */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Calendar className="h-5 w-5" />
                <span>Termín a služba</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="datum">Datum *</Label>
                  <Input
                    id="datum"
                    type="date"
                    value={formData.datum}
                    onChange={(e) => handleInputChange('datum', e.target.value)}
                    min={formatLocalDate(new Date())}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Služby * (můžete vybrat více)</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3 mt-2">
                  {sluzby.map(sluzba => (
                    <div key={sluzba.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sluzba-${sluzba.id}`}
                        checked={formData.sluzbaIds.includes(sluzba.id.toString())}
                        onCheckedChange={(checked) => handleSluzbaChange(sluzba.id.toString(), checked as boolean)}
                      />
                      <Label 
                        htmlFor={`sluzba-${sluzba.id}`} 
                        className="flex-1 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{sluzba.nazev}</div>
                          <div className="text-sm text-muted-foreground">
                            {sluzba.dobaTrvaniMinuty} min • {sluzba.kategorie.nazev}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-muted-foreground">
                            {formatCena(sluzba.cenaJuniorStylist)} - {formatCena(sluzba.cenaTopStylist)}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSluzby.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Vybrané služby ({selectedSluzby.length}):</div>
                  <div className="space-y-1">
                    {selectedSluzby.map(sluzba => (
                      <div key={sluzba.id} className="flex justify-between items-center text-sm">
                        <span>{sluzba.nazev}</span>
                        <span className="text-muted-foreground">{sluzba.dobaTrvaniMinuty} min</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t text-sm">
                    <div className="flex justify-between items-center font-medium">
                      <span>Celková doba:</span>
                      <span>{selectedSluzby.reduce((sum, s) => sum + s.dobaTrvaniMinuty, 0)} minut</span>
                    </div>
                    {selectedZamestnanec && (
                      <div className="flex justify-between items-center font-medium text-primary">
                        <span>Celková cena:</span>
                        <span>{formatCena(calculateCena())}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="zamestnanec">Kadeřník (volitelné)</Label>
                <Select value={formData.zamestnanecId} onValueChange={handleZamestnanecChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte kadeřníka nebo nechte prázdné" />
                  </SelectTrigger>
                  <SelectContent>
                    {zamestnanci.map(zamestnanec => (
                      <SelectItem key={zamestnanec.id} value={zamestnanec.id.toString()}>
                        <div>
                          <div>{zamestnanec.jmeno} {zamestnanec.prijmeni}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {zamestnanec.uroven.replace('_', ' ')}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="casOd">Čas začátku *</Label>
                <Input
                  id="casOd"
                  type="time"
                  value={formData.casOd}
                  onChange={(e) => handleInputChange('casOd', e.target.value)}
                  required
                  className="mb-2"
                />
                
                {loadingTerminy ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Načítám doporučené termíny...
                  </div>
                ) : dostupneTerminy.length > 0 ? (
                  <div>
                    <Label className="text-sm text-muted-foreground">Doporučené dostupné termíny:</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {dostupneTerminy.filter(t => t.available).map(termin => (
                        <Button
                          key={termin.time}
                          type="button"
                          variant={formData.casOd === termin.time ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleInputChange('casOd', termin.time)}
                        >
                          {termin.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {formData.casOd && selectedSluzby.length > 0 && (
                <div className="space-y-2">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {formData.casOd} - {calculateEndTime()}
                      </span>
                      <span className="text-sm text-muted-foreground">({selectedSluzby.reduce((sum, s) => sum + s.dobaTrvaniMinuty, 0)} min celkem)</span>
                    </div>
                    {selectedZamestnanec && (
                      <div className="mt-1 font-medium text-lg">
                        {formatCena(calculateCena())}
                      </div>
                    )}
                  </div>
                  
                  {checkWorkingHoursConflict() && (
                    <Alert variant="default" className="border-blue-500 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        {checkWorkingHoursConflict()}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Počet osob */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <User className="h-5 w-5" />
                <span>Počet osob</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pocetOsob">Počet osob *</Label>
                  <Input
                    id="pocetOsob"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.pocetOsob}
                    onChange={(e) => handleInputChange('pocetOsob', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pocetDeti">Počet dětí</Label>
                  <Input
                    id="pocetDeti"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.pocetDeti}
                    onChange={(e) => handleInputChange('pocetDeti', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dodatečné informace */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                <span>Dodatečné informace</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="poznamka">Poznámka</Label>
                <Textarea
                  id="poznamka"
                  value={formData.poznamka}
                  onChange={(e) => handleInputChange('poznamka', e.target.value)}
                  placeholder="Speciální požadavky, poznámky..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="zpusobPlatby">Způsob platby</Label>
                <Select value={formData.zpusobPlatby} onValueChange={(value) => handleInputChange('zpusobPlatby', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotove">Hotově</SelectItem>
                    <SelectItem value="karta">Kartou</SelectItem>
                    <SelectItem value="prevod">Bankovní převod</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notifikace</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifikaceEmail"
                    checked={formData.notifikaceEmail}
                    onCheckedChange={(checked) => handleInputChange('notifikaceEmail', checked as boolean)}
                  />
                  <Label htmlFor="notifikaceEmail" className="text-sm">Poslat potvrzovací email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifikaceSms"
                    checked={formData.notifikaceSms}
                    onCheckedChange={(checked) => handleInputChange('notifikaceSms', checked as boolean)}
                  />
                  <Label htmlFor="notifikaceSms" className="text-sm">Poslat SMS připomínku</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Akce */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Zrušit
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Vytváření...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Vytvořit rezervaci
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}