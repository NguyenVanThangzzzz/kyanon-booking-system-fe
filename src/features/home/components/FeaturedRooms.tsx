import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader } from './SectionHeader';
import { formatCurrency } from '@/common/utils/format';
import { useInView } from '@/common/hooks/useInView';
import { cn } from '@/common/utils/cn';
import { useRooms } from '@/features/room/hooks/useRooms';
import type { Room } from '@/features/room/types/room.types';

type AmenityKey = 'wifi' | 'ac' | 'tv' | 'bed' | 'bathtub' | 'balcony' | 'breakfast' | 'pool';

const WifiIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
  </svg>
);

const AcIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364" />
  </svg>
);

const TvIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BedIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 7v10M3 7a2 2 0 012-2h14a2 2 0 012 2M3 7h18M21 7v10M3 12h18" />
  </svg>
);

const BathtubIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4zM4 12V7a2 2 0 012-2h1M8 20v1M16 20v1" />
  </svg>
);

const BalconyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 21V9l9-6 9 6v12M9 21V12h6v9M3 21h18" />
  </svg>
);

const BreakfastIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
  </svg>
);

const PoolIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M2 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2M6 7a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const AMENITY_META: Record<AmenityKey, { icon: React.ReactNode; label: string }> = {
  wifi:      { icon: <WifiIcon />,      label: 'WiFi' },
  ac:        { icon: <AcIcon />,        label: 'Air Conditioning' },
  tv:        { icon: <TvIcon />,        label: 'TV' },
  bed:       { icon: <BedIcon />,       label: 'Double Bed' },
  bathtub:   { icon: <BathtubIcon />,   label: 'Bathtub' },
  balcony:   { icon: <BalconyIcon />,   label: 'Balcony' },
  breakfast: { icon: <BreakfastIcon />, label: 'Breakfast' },
  pool:      { icon: <PoolIcon />,      label: 'Swimming Pool' },
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80';

const getAmenityKeys = (amenities: Record<string, unknown> | null | undefined): AmenityKey[] => {
  if (!amenities) return [];
  return Object.keys(amenities).filter((k): k is AmenityKey => k in AMENITY_META);
};

const FeaturedRoomCard = ({ room }: { room: Room }) => {
  const [isFav, setIsFav] = useState(false);
  const amenityKeys = getAmenityKeys(room.amenities);
  const price = room.roomType?.basePricePerNight ?? 0;

  return (
    <Link
      to={`/rooms/${room.id}`}
      className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 block"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={room.imageUrl ?? FALLBACK_IMAGE}
          alt={room.name}
          width={400}
          height={300}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={(e) => { e.preventDefault(); setIsFav((f) => !f); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label="Save to favorites"
        >
          <svg
            className={cn('w-4 h-4 transition-colors', isFav ? 'text-red-500 fill-red-500' : 'text-neutral-400')}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        {room.floor && (
          <p className="text-xs text-neutral-400 mb-1 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Floor {room.floor}
          </p>
        )}

        {/* Name + type */}
        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {room.name}
        </h3>
        {room.roomType && (
          <span className="inline-block mt-1 text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
            {room.roomType.name}
          </span>
        )}

        {/* Amenity icons */}
        {amenityKeys.length > 0 && (
          <div className="flex items-center gap-2.5 mt-2.5">
            {amenityKeys.slice(0, 4).map((key) => {
              const meta = AMENITY_META[key];
              return (
                <div key={key} title={meta.label} className="flex items-center gap-1 text-neutral-500">
                  {meta.icon}
                </div>
              );
            })}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-primary-600">{formatCurrency(price)}</span>
            <span className="text-xs text-neutral-400">/night</span>
          </div>
          <span className="text-xs font-medium text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            View details
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-[4/3] bg-neutral-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-neutral-200 rounded-full w-1/3" />
      <div className="h-4 bg-neutral-200 rounded-full w-3/4" />
      <div className="h-4 bg-neutral-200 rounded-full w-1/4" />
      <div className="flex gap-2 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-4 h-4 bg-neutral-200 rounded-full" />
        ))}
      </div>
      <div className="flex justify-between pt-3 border-t border-neutral-100">
        <div className="h-4 bg-neutral-200 rounded-full w-1/3" />
        <div className="h-4 bg-neutral-200 rounded-full w-1/4" />
      </div>
    </div>
  </div>
);

const FETCH_OPTIONS = { page: 1, limit: 8, status: 'available' } as const;

export const FeaturedRooms = () => {
  const { ref, inView } = useInView();
  const { rooms, isLoading, error } = useRooms(FETCH_OPTIONS);

  return (
    <section className="section-pad">
      <div ref={ref} className={cn('container-app animate-section', inView && 'visible')}>
        <SectionHeader
          eyebrow="Explore"
          title="Featured Rooms"
          subtitle="Experience premium comfort at affordable prices in our most loved rooms"
          viewAllTo="/rooms"
        />

        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">😔</div>
            <h3 className="text-lg font-semibold text-neutral-900">Không thể tải danh sách phòng</h3>
            <p className="text-neutral-500 mt-1">{error}</p>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="stagger-card">
                    <SkeletonCard />
                  </div>
                ))
              : rooms.map((room) => (
                  <div key={room.id} className="stagger-card">
                    <FeaturedRoomCard room={room} />
                  </div>
                ))}
          </div>
        )}

        {!isLoading && !error && rooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-lg font-semibold text-neutral-900">Chưa có phòng nào</h3>
            <p className="text-neutral-500 mt-1">Các phòng sẽ sớm được cập nhật</p>
          </div>
        )}
      </div>
    </section>
  );
};
