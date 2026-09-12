import { Rezervace } from '../../../types/rezervace';
import { cn } from '../../../lib/utils';
import { STAV, normalizovatStav } from '../../../lib/reservations/stav';

interface EventBlockProps {
  reservation: Rezervace;
  startHour: number;
  pixelsPerMinute: number;
  onClick: (reservation: Rezervace) => void;
}

const getTime = (reservation: Rezervace, start: 'start' | 'end') => {
  const value = start === 'start'
    ? reservation.casOd || reservation.cas_od || '08:00'
    : reservation.casDo || reservation.cas_do || '08:30';
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

export function EventBlock({ reservation, startHour, pixelsPerMinute, onClick }: EventBlockProps) {
  const startMinutes = getTime(reservation, 'start');
  const endMinutes = Math.max(getTime(reservation, 'end'), startMinutes + 15);
  const top = Math.max(0, startMinutes - startHour * 60) * pixelsPerMinute;
  const height = Math.max(30, endMinutes - startMinutes) * pixelsPerMinute;
  const isPending = normalizovatStav(reservation.stav) === STAV.CEKA_NA_POTVRZENI;
  const serviceName = reservation.sluzba?.nazev || reservation.sluzby || 'Bez služby';
  const minimumHeight = isPending ? 112 : 88;
  const resourceEventStyles = isPending
    ? {
        container: 'bg-[#372810] border-l-4 border-l-amber-500 hover:bg-[#443214]',
        title: 'text-[#fffbe8] font-semibold',
        detail: 'text-[#fde047]',
        time: 'text-[#fde047] font-medium',
      }
    : {
        container: 'bg-[#14382c] border-l-4 border-l-emerald-500 hover:bg-[#1a4738]',
        title: 'text-[#ecfdf5] font-semibold',
        detail: 'text-[#a7f3d0]',
        time: 'text-[#a7f3d0] font-medium',
      };

  return (
    <button
      type="button"
      className={cn(
        'absolute inset-x-1 z-10 h-auto overflow-visible rounded-r-md p-2.5 text-left text-sm leading-snug shadow-sm transition-all hover:z-20 hover:shadow-lg',
        resourceEventStyles.container
      )}
      style={{
        top,
        height: Math.max(height, minimumHeight),
        minHeight: minimumHeight,
        ...(isPending ? { backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(245, 158, 11, .16) 6px, rgba(245, 158, 11, .16) 12px)' } : {}),
      }}
      onClick={() => onClick(reservation)}
      title={`${reservation.jmeno} ${reservation.prijmeni}, ${serviceName}`}
    >
      <span className={cn('block whitespace-normal wrap-break-word text-sm leading-tight', resourceEventStyles.title)}>{reservation.jmeno} {reservation.prijmeni}</span>
      <span className={cn('mt-0.5 block whitespace-normal wrap-break-word text-xs', resourceEventStyles.detail)}>{serviceName}</span>
      <span className={cn('mt-1 block whitespace-normal wrap-break-word text-xs', resourceEventStyles.time)}>{reservation.casOd || reservation.cas_od} - {reservation.casDo || reservation.cas_do}</span>
      {isPending && <span className="mt-1 block whitespace-normal wrap-break-word text-xs font-semibold text-[#fffbe8]">Čeká na potvrzení</span>}
    </button>
  );
}
