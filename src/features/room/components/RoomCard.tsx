import { Link } from 'react-router-dom';
import { StarRating } from '@/common/components/ui/StarRating/StarRating';
import { Badge } from '@/common/components/ui/Badge/Badge';
import { formatCurrency } from '@/common/utils/format';
import { cn } from '@/common/utils/cn';
import type { Room } from '../types/room.types';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80';

interface RoomCardProps {
  room: Room;
  layout?: 'grid' | 'list';
}

const STATUS_BADGE: Record<Room['status'], { variant: 'success' | 'warning' | 'default'; label: string }> = {
  available: { variant: 'success', label: 'Available' },
  maintenance: { variant: 'warning', label: 'Maintenance' },
  inactive: { variant: 'default', label: 'Suspended' },
};

const getAmenityLabels = (amenities: Room['amenities']): string[] => {
  if (!amenities || typeof amenities !== 'object') return [];
  return Object.entries(amenities)
    .filter(([, v]) => Boolean(v))
    .map(([k]) => k)
    .slice(0, 4);
};

export const RoomCard = ({ room, layout = 'grid' }: RoomCardProps): JSX.Element => {
  const image = room.imageUrl ?? FALLBACK_IMAGE;
  const status = STATUS_BADGE[room.status];
  const pricePerNight = room.roomType?.basePricePerNight ?? 0;
  const typeName = room.roomType?.name ?? 'Room';
  const amenityList = getAmenityLabels(room.amenities);

  if (layout === 'list') {
    return (
      <Link
        to={`/rooms/${room.id}`}
        className="group flex bg-white rounded-2xl border border-neutral-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
      >
        <div className="relative w-64 shrink-0 overflow-hidden">
          <img
            src={image}
            alt={room.name}
            width={400}
            height={300}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </div>
        <div className="flex flex-col justify-between p-5 flex-1">
          <div>
            <p className="text-xs text-neutral-400 mb-1">
              {typeName}
              {room.floor ? ` · Floor ${room.floor}` : ''} · Code {room.code}
            </p>
            <h3 className="text-base font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
              {room.name}
            </h3>
            <StarRating rating={4.5} count={124} className="mt-2" />
            {amenityList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {amenityList.map((a) => (
                  <span key={a} className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-primary-600">{formatCurrency(pricePerNight)}</span>
              <span className="text-xs text-neutral-400">/night</span>
            </div>
            <span className="btn-primary py-2 px-5 text-sm">Book now</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/rooms/${room.id}`}
      className={cn(
        'group bg-white rounded-2xl border border-neutral-100 overflow-hidden',
        'shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 block',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={image}
          alt={room.name}
          width={400}
          height={300}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label="Favorite"
        >
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-neutral-400 mb-1">
          {typeName}
          {room.floor ? ` · Floor ${room.floor}` : ''}
        </p>
        <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
          {room.name}
        </h3>
        <StarRating rating={4.5} count={124} className="mt-2" />
        <div className="flex items-baseline gap-1 mt-3 pt-3 border-t border-neutral-100">
          <span className="text-base font-bold text-primary-600">{formatCurrency(pricePerNight)}</span>
          <span className="text-xs text-neutral-400">/night</span>
        </div>
      </div>
    </Link>
  );
};
