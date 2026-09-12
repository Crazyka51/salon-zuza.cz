'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Rezervace, CalendarViewProps } from '../../../types/rezervace';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { CalendarToolbar, CalendarDisplayMode } from './CalendarToolbar';
import { ResourceDayView } from './ResourceDayView';
import { STAV, normalizovatStav } from '../../../lib/reservations/stav';

const DAYS_NAMES = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
const MONTHS_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
];

const isExcludedCalendarEmployee = (employee: { jmeno: string; prijmeni: string }) =>
  `${employee.jmeno} ${employee.prijmeni}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase() === 'matej hrabak';

const DEFAULT_STATUS_STYLE = {
  className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  label: 'Neznamy stav',
};

const STATUS_STYLES: Record<string, { className: string; label: string }> = {
  [STAV.CEKA_NA_POTVRZENI]: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Čeká na potvrzení' },
  [STAV.POTVRZENO]: { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-white', label: 'Potvrzeno' },
  [STAV.DOKONCENO]: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Dokončeno' },
  [STAV.ZRUSENO_ZAKAZNIKEM]: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-white', label: 'Zrušeno zákazníkem' },
  [STAV.ZRUSENO_SALONEM]: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-white', label: 'Zrušeno salonem' },
  [STAV.NEDORAZIL]: { className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: 'Nedorazil' },
};

// Legacy hodnoty z dřívějška se před vyhledáním stylu normalizují na kanonický stav
const getStatusStyle = (stav?: string) => STATUS_STYLES[stav ?? ''] ?? STATUS_STYLES[normalizovatStav(stav)] ?? DEFAULT_STATUS_STYLE;

// Pomocná funkce pro styling události v měsíčním pohledu
const getEventBadgeStyles = (stav?: string) => {
  if (normalizovatStav(stav) === STAV.CEKA_NA_POTVRZENI) {
    return 'bg-[#3f2e18] text-[#fde047] border-l-2 border-yellow-500';
  }
  // Standardní potvrzená rezervace
  return 'bg-[#1e3a2f] text-[#a7f3d0] border-l-2 border-emerald-500';
};

const formatLocalDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function isDayBlocked(day: number, currentDate: Date, blockedTerms: CalendarViewProps['blockedTerms']): boolean {
  if (!blockedTerms || blockedTerms.length === 0) return false;
  const yr = currentDate.getFullYear();
  const mo = String(currentDate.getMonth() + 1).padStart(2, '0');
  const d = new Date(yr + '-' + mo + '-' + String(day).padStart(2, '0'));
  return blockedTerms.some(term => {
    if (term.source === 'employee-vacation') return false;
    const od = new Date(term.datumOd); od.setHours(0, 0, 0, 0);
    const doD = new Date(term.datumDo); doD.setHours(23, 59, 59, 999);
    return d >= od && d <= doD;
  });
}

export function CalendarView({
  onDateSelect,
  onReservationClick,
  onCreateReservation,
  onEditReservation,
  onDeleteReservation,
  selectedDate = new Date(),
  blockedTerms = []
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rezervace, setRezervace] = useState<Rezervace[]>([]);
  const [employees, setEmployees] = useState<{ id: number; jmeno: string; prijmeni: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Rezervace | null>(null);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [selectedDayForDayView, setSelectedDayForDayView] = useState<Date | null>(null);
  const [dayViewMode, setDayViewMode] = useState<CalendarDisplayMode>('month');
  const [employeeFilter, setEmployeeFilter] = useState('all');

  useEffect(() => { loadReservations(); }, [currentDate, dayViewMode]);

  useEffect(() => {
    fetch('/api/admin/zamestnanci')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Nepodařilo se načíst zaměstnance')))
      .then((data) => setEmployees((data.zamestnanci || []).filter((employee: { jmeno: string; prijmeni: string }) => !isExcludedCalendarEmployee(employee))))
      .catch((error) => console.error('Chyba při načítání zaměstnanců kalendáře:', error));
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      let s: Date;
      let e: Date;
      if (dayViewMode === 'day') {
        s = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        e = new Date(s);
      } else if (dayViewMode === 'week') {
        s = new Date(currentDate);
        s.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
        e = new Date(s);
        e.setDate(s.getDate() + 6);
      } else {
        s = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        e = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      }
      const startDate = formatLocalDateForApi(s);
      const endDate = formatLocalDateForApi(e);
      const res = await fetch('/api/rezervace?datum_od=' + startDate + '&datum_do=' + endDate);
      if (res.ok) { const data = await res.json(); setRezervace(data.rezervace || []); }
    } catch (err) { console.error('Chyba pri nacitani rezervaci:', err); }
    finally { setLoading(false); }
  };

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  const getReservationsForDay = (day: number) => {
    const yr = currentDate.getFullYear();
    const mo = String(currentDate.getMonth() + 1).padStart(2, '0');
    const ds = yr + '-' + mo + '-' + String(day).padStart(2, '0');
    return rezervace.filter(r => r.datum.startsWith(ds));
  };

  const getReservationsForDate = (date: Date) => {
    const ds = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    return rezervace.filter(r => r.datum.startsWith(ds));
  };

  const handleDayClick = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDayForDayView(d);
    setCurrentDate(d);
    setDayViewMode('day');
    onDateSelect?.(d);
  };

  const handleReservationClick = (rez: Rezervace) => {
    setSelectedReservation(rez);
    setShowReservationDetails(true);
    onReservationClick?.(rez);
  };

  const formatCena = (cena: number) => new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(cena);
  const isToday = (day: number) => { const t = new Date(); return day === t.getDate() && currentDate.getMonth() === t.getMonth() && currentDate.getFullYear() === t.getFullYear(); };
  const isSelected = (day: number) => day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear();

  return (
    <div className="space-y-4 flex flex-col">
      <Card className="shrink-0">
        <CardHeader>
          <CalendarToolbar
            date={dayViewMode === 'day' && selectedDayForDayView ? selectedDayForDayView : currentDate}
            mode={dayViewMode}
            employeeFilter={employeeFilter}
            reservations={rezervace}
            onDateChange={(date) => {
              setCurrentDate(date);
              setSelectedDayForDayView(date);
              onDateSelect?.(date);
            }}
            onModeChange={(mode) => {
              setDayViewMode(mode);
              if (mode === 'day' && !selectedDayForDayView) setSelectedDayForDayView(currentDate);
            }}
            onEmployeeFilterChange={setEmployeeFilter}
            onBackToMonth={() => setDayViewMode('month')}
          />
        </CardHeader>
      </Card>

      {dayViewMode === 'month' ? (
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <Calendar className="h-5 w-5" /><span>Kalendář rezervací</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="overflow-x-auto pb-2">
          <div className="grid min-w-175 grid-cols-7 gap-2">
            {DAYS_NAMES.map(day => (<div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b-2">{day}</div>))}
            {calendarDays.map((day, index) => {
              if (day === null) return <div key={index} className="min-h-38 p-2" />;
              const dayReservations = getReservationsForDay(day);
              const blocked = isDayBlocked(day, currentDate, blockedTerms);
              const dayKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${index}-${day}`;
              return (
                <div
                  key={dayKey}
                  className={`min-h-28 rounded-lg border p-2 flex flex-col justify-between transition-colors ${
                    blocked
                      ? 'bg-[#1c1415] border-[#3b1c1e] cursor-not-allowed'
                      : isToday(day)
                        ? 'bg-slate-800/70 border-amber-500/40 cursor-pointer'
                        : 'bg-[#161b22] border-slate-800/80 cursor-pointer hover:border-slate-700'
                  } ${isSelected(day) ? 'ring-2 ring-primary' : ''}`}
                  title={blocked ? 'Blokovaný termín' : undefined}
                  onClick={() => { if (!blocked) handleDayClick(day); }}
                >
                  {/* Hlavička buňky */}
                  <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-semibold ${blocked ? 'text-red-400/80' : 'text-slate-200'}`}>
                        {day}
                      </span>
                    {blocked ? (
                      <span className="text-[10px] font-medium text-red-400/70 uppercase tracking-wider">Zavřeno</span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDayClick(day); }}
                        className="hidden text-[11px] text-slate-500 transition-colors hover:text-amber-400 sm:block"
                      >
                        Zobrazit detail
                      </button>
                    )}
                  </div>

                  {/* Seznam položek v dnu */}
                  {!blocked && (
                    <div className="space-y-1">
                      {dayReservations.map((rez) => (
                        <TooltipProvider key={rez.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                onClick={(e) => { e.stopPropagation(); handleReservationClick(rez); }}
                                className={`px-2 py-1 rounded text-xs cursor-pointer flex justify-between items-center ${getEventBadgeStyles(rez.stav)}`}
                              >
                                <span className="font-medium truncate mr-2">{rez.jmeno} {rez.prijmeni}</span>
                                <span className="text-[10px] opacity-75 shrink-0">{rez.casOd || rez.cas_od}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs border bg-popover text-popover-foreground shadow-md">
                              <div className="text-xs space-y-0.5">
                                <div className="font-medium text-foreground">{rez.jmeno} {rez.prijmeni}</div>
                                <div className="text-foreground">{(rez.casOd || rez.cas_od)} - {(rez.casDo || rez.cas_do)}</div>
                                <div className="text-foreground">{rez.sluzba?.nazev}</div>
                                <div className="text-muted-foreground">{getStatusStyle(rez.stav).label}</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </CardContent>
      </Card>
      ) : (
        <ResourceDayView
          date={selectedDayForDayView || currentDate}
          mode={dayViewMode}
          reservations={rezervace}
          employees={employees}
          employeeFilter={employeeFilter}
          onReservationClick={onReservationClick || (() => {})}
        />
      )}

      <Dialog open={showReservationDetails} onOpenChange={setShowReservationDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detail rezervace</DialogTitle></DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {(() => {
                  const statusStyle = getStatusStyle(selectedReservation.stav);
                  return <Badge className={statusStyle.className}>{statusStyle.label}</Badge>;
                })()}
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="hover:bg-muted" onClick={() => onEditReservation?.(selectedReservation)}><Edit className="h-3 w-3 text-foreground" /></Button>
                  <Button size="sm" variant="outline" className="hover:bg-muted" onClick={() => onDeleteReservation?.(selectedReservation)}><Trash2 className="h-3 w-3 text-foreground" /></Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium text-foreground">{selectedReservation.jmeno} {selectedReservation.prijmeni}</span></div>
                <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{(selectedReservation.casOd || selectedReservation.cas_od)} - {(selectedReservation.casDo || selectedReservation.cas_do)}</span></div>
                <div className="flex items-center space-x-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{selectedReservation.telefon}</span></div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className={selectedReservation.email ? 'text-foreground' : 'font-semibold text-amber-600'}>
                    {selectedReservation.email || 'Pouze telefon'}
                  </span>
                </div>
                {selectedReservation.sluzba && (<div><div className="font-medium text-foreground">{selectedReservation.sluzba.nazev}</div><div className="text-sm text-muted-foreground">{selectedReservation.sluzba.kategorie.nazev}</div></div>)}
                {selectedReservation.zamestnanec && (<div><div className="font-medium text-foreground">{selectedReservation.zamestnanec.jmeno} {selectedReservation.zamestnanec.prijmeni}</div><div className="text-sm text-muted-foreground capitalize">{selectedReservation.zamestnanec.uroven.replace('_', ' ')}</div></div>)}
                <div className="font-medium text-lg text-foreground">{formatCena(selectedReservation.cena)}</div>
                {selectedReservation.poznamka && (<div><div className="font-medium text-sm text-foreground">Poznamka:</div><div className="text-sm text-muted-foreground">{selectedReservation.poznamka}</div></div>)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
