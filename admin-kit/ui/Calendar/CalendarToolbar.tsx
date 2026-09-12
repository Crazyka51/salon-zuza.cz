'use client';

import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Rezervace } from '../../../types/rezervace';

export type CalendarDisplayMode = 'month' | 'day' | 'week';

const MONTHS_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
];

const isExcludedCalendarEmployee = (name: string) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase() === 'matej hrabak';

interface CalendarToolbarProps {
  date: Date;
  mode: CalendarDisplayMode;
  employeeFilter: string;
  reservations: Rezervace[];
  onDateChange: (date: Date) => void;
  onModeChange: (mode: CalendarDisplayMode) => void;
  onEmployeeFilterChange: (employeeId: string) => void;
  onBackToMonth?: () => void;
}

export function CalendarToolbar({
  date,
  mode,
  employeeFilter,
  reservations,
  onDateChange,
  onModeChange,
  onEmployeeFilterChange,
  onBackToMonth,
}: CalendarToolbarProps) {
  const employees = Array.from(
    new Map(
      reservations
        .filter((reservation) => reservation.zamestnanecId && reservation.zamestnanec)
        .map((reservation): [string, string] => [
          String(reservation.zamestnanecId),
          `${reservation.zamestnanec?.jmeno} ${reservation.zamestnanec?.prijmeni}`,
        ])
        .filter(([, name]) => !isExcludedCalendarEmployee(name))
    ).entries()
  );

  const moveDate = (amount: number) => {
    const next = new Date(date);
    if (mode === 'month') {
      next.setMonth(next.getMonth() + amount);
    } else {
      next.setDate(next.getDate() + amount * (mode === 'day' ? 1 : 7));
    }
    onDateChange(next);
  };

  const selectMonth = (month: string) => {
    const monthIndex = Number(month);
    const lastDayOfMonth = new Date(date.getFullYear(), monthIndex + 1, 0).getDate();
    const next = new Date(date);
    next.setDate(Math.min(date.getDate(), lastDayOfMonth));
    next.setMonth(monthIndex);
    onDateChange(next);
  };

  const dateLabel = mode === 'month'
    ? date.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })
    : mode === 'day'
    ? date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : `Týden od ${date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1">
        {mode !== 'month' && onBackToMonth && (
          <Button variant="outline" size="sm" onClick={onBackToMonth}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zpět na měsíc
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>Dnes</Button>
        <Button variant="ghost" size="icon" onClick={() => moveDate(-1)} aria-label="Předchozí období">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => moveDate(1)} aria-label="Následující období">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Select value={String(date.getMonth())} onValueChange={selectMonth}>
          <SelectTrigger className="h-8 w-32 sm:w-36">
            <SelectValue aria-label="Vybrat měsíc" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS_NAMES.map((month, index) => (
              <SelectItem key={month} value={String(index)}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-2 text-sm font-semibold capitalize text-foreground">{dateLabel}</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="grid grid-cols-3 rounded-md border border-neutral-700 p-0.5" role="group" aria-label="Typ zobrazení">
          <Button variant={mode === 'month' ? 'secondary' : 'ghost'} size="sm" onClick={() => onModeChange('month')}>Měsíc</Button>
          <Button variant={mode === 'day' ? 'secondary' : 'ghost'} size="sm" onClick={() => onModeChange('day')}>Den</Button>
          <Button variant={mode === 'week' ? 'secondary' : 'ghost'} size="sm" onClick={() => onModeChange('week')}>Týden</Button>
        </div>
        <Select value={employeeFilter} onValueChange={onEmployeeFilterChange}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Všichni zaměstnanci" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všichni zaměstnanci</SelectItem>
            {employees.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
