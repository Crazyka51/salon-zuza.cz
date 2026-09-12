import { Rezervace } from '../../../types/rezervace';
import { EventBlock } from './EventBlock';
import { CalendarDisplayMode } from './CalendarToolbar';

interface ResourceDayViewProps {
  date: Date;
  mode: CalendarDisplayMode;
  reservations: Rezervace[];
  employees: { id: number; jmeno: string; prijmeni: string }[];
  employeeFilter: string;
  onReservationClick: (reservation: Rezervace) => void;
}

const START_HOUR = 8;
const END_HOUR = 17.5;
const SLOT_MINUTES = 30;
const PIXELS_PER_MINUTE = 0.75;

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const reservationDateKey = (reservation: Rezervace) => reservation.datum.slice(0, 10);

const employeeKey = (reservation: Rezervace) => reservation.zamestnanecId ? String(reservation.zamestnanecId) : 'unassigned';
const employeeName = (reservation: Rezervace) => reservation.zamestnanec
  ? `${reservation.zamestnanec.jmeno} ${reservation.zamestnanec.prijmeni}`
  : 'Nepřiřazeno';
const isExcludedCalendarEmployee = (name: string) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase() === 'matej hrabak';

export function ResourceDayView({ date, mode, reservations, employees, employeeFilter, onReservationClick }: ResourceDayViewProps) {
  const dayReservations = reservations.filter((reservation) => reservationDateKey(reservation) === dateKey(date));
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const weekDate = new Date(weekStart);
    weekDate.setDate(weekStart.getDate() + index);
    return weekDate;
  });
  const resources = [
    ...employees
      .filter((employee) => !isExcludedCalendarEmployee(`${employee.jmeno} ${employee.prijmeni}`) && (employeeFilter === 'all' || String(employee.id) === employeeFilter))
      .map((employee): [string, string] => [String(employee.id), `${employee.jmeno} ${employee.prijmeni}`]),
    ...Array.from(new Map(
      reservations
        .filter((reservation) => !isExcludedCalendarEmployee(employeeName(reservation)) && (employeeFilter === 'all' || employeeKey(reservation) === employeeFilter))
        .map((reservation) => [employeeKey(reservation), employeeName(reservation)] as [string, string])
    ).entries()).filter(([key]) => !employees.some((employee) => String(employee.id) === key)),
  ];
  if (employeeFilter === 'all' && !resources.some(([key]) => key === 'unassigned')) {
    resources.push(['unassigned', 'Nepřiřazeno']);
  }
  const visibleResources: [string, string][] = mode === 'week'
    ? weekDates.map((weekDate) => [dateKey(weekDate), weekDate.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric' })])
    : resources.length > 0 ? resources : employeeFilter === 'all' ? [['unassigned', 'Nepřiřazeno']] : [];
  const totalHeight = (END_HOUR - START_HOUR) * 60 * PIXELS_PER_MINUTE;
  const timeSlots = Array.from({ length: ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES }, (_, index) => START_HOUR * 60 + index * SLOT_MINUTES);

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-800 bg-background [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="min-w-190">
        <div className="grid border-b border-neutral-800" style={{ gridTemplateColumns: `72px repeat(${Math.max(visibleResources.length, 1)}, minmax(180px, 1fr))` }}>
          <div className="border-r border-neutral-800 p-3 text-sm font-semibold text-muted-foreground">Čas</div>
          {visibleResources.map(([key, name]) => <div key={key} className="p-3 text-center text-base font-semibold text-foreground">{name}</div>)}
        </div>

        {visibleResources.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Pro tohoto zaměstnance nejsou v tento den rezervace.</div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: `72px repeat(${visibleResources.length}, minmax(180px, 1fr))` }}>
            <div className="relative border-r border-neutral-800" style={{ height: totalHeight }}>
              {timeSlots.map((minutes) => <div key={minutes} className="absolute left-0 right-0 -translate-y-1/2 px-2 text-sm font-medium text-muted-foreground" style={{ top: (minutes - START_HOUR * 60) * PIXELS_PER_MINUTE }}>{String(Math.floor(minutes / 60)).padStart(2, '0')}:{String(minutes % 60).padStart(2, '0')}</div>)}
            </div>
            {visibleResources.map(([key]) => (
              <div key={key} className="relative border-r border-neutral-800 last:border-r-0" style={{ height: totalHeight }}>
                {timeSlots.map((minutes) => <div key={minutes} className="absolute inset-x-0 border-t border-neutral-800/70" style={{ top: (minutes - START_HOUR * 60) * PIXELS_PER_MINUTE }} />)}
                {(mode === 'week'
                  ? reservations.filter((reservation) => !isExcludedCalendarEmployee(employeeName(reservation)) && reservationDateKey(reservation) === key && (employeeFilter === 'all' || employeeKey(reservation) === employeeFilter))
                  : dayReservations.filter((reservation) => !isExcludedCalendarEmployee(employeeName(reservation)) && employeeKey(reservation) === key && (employeeFilter === 'all' || employeeKey(reservation) === employeeFilter))
                ).map((reservation) => <EventBlock key={reservation.id} reservation={reservation} startHour={START_HOUR} pixelsPerMinute={PIXELS_PER_MINUTE} onClick={onReservationClick} />)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
