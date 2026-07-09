import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { roomService } from '../services/room.service';
import { BookingWidget } from '../components/BookingWidget';
import { StarRating } from '@/common/components/ui/StarRating/StarRating';
import { Badge } from '@/common/components/ui/Badge/Badge';
import { RoomCardSkeleton } from '@/common/components/ui/Skeleton/Skeleton';
import { formatCurrency, formatDate } from '@/common/utils/format';
import { cn } from '@/common/utils/cn';
import type { Room, RoomSchedule } from '../types/room.types';

const GALLERY: string[] = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  'https://images.unsplash.com/photo-1578898886150-d97a69572ddf?w=600&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',
];

const AMENITY_MAP: Record<string, { icon: string; label: string }> = {
  wifi: { icon: '📶', label: 'Free WiFi' },
  ac: { icon: '❄️', label: 'Air Conditioning' },
  tv: { icon: '📺', label: 'Flat-screen TV' },
  bathtub: { icon: '🛁', label: 'Bathtub' },
  minibar: { icon: '☕', label: 'Minibar' },
  parking: { icon: '🚗', label: 'Parking' },
  gym: { icon: '🏋️', label: 'Gym' },
  swimming_pool: { icon: '🏊', label: 'Swimming Pool' },
  breakfast: { icon: '🍳', label: 'Breakfast' },
  reception_24h: { icon: '🛎️', label: '24/7 Reception' },
  slippers: { icon: '🧴', label: 'Slippers & Bathrobe' },
  spa: { icon: '💆', label: 'Spa & Massage' },
  ocean_view: { icon: '🌊', label: 'Ocean View' },
  living_area: { icon: '🛋️', label: 'Living Area' },
  kitchen: { icon: '🍽️', label: 'Kitchen' },
  multiple_beds: { icon: '🛏️', label: 'Multiple Beds' },
} as const;

function getAmenitiesFromRoom(
  roomAmenities: Room['amenities'],
): { icon: string; label: string }[] {
  if (!roomAmenities || typeof roomAmenities !== 'object') return [];
  return Object.entries(roomAmenities)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => {
      const normalized = key.toLowerCase().replace(/[\s-]+/g, '_');
      return AMENITY_MAP[normalized] ?? { icon: '✨', label: key };
    });
}


const ROOM_LOCATION = {
  address: '123 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City',
  shortLabel: 'District 1, Ho Chi Minh City',
  lat: 10.7745,
  lng: 106.7034,
};

const mapEmbedUrl = (lat: number, lng: number): string => {
  const delta = 0.005;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
};

const mapDirectionsUrl = (lat: number, lng: number): string =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

const FALLBACK_ROOM_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80';

const pseudoRandom = (seed: string, min: number, max: number): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const span = max - min;
  return min + (hash % 1000) / 1000 * span;
};

type TabKey = 'overview' | 'amenities' | 'reviews';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'amenities', label: 'Amenities' },
  { key: 'reviews', label: 'Reviews' },
];

const PhotoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ── GalleryGrid ──────────────────────────────────────────────────────────────

interface GalleryGridProps {
  images: string[];
  onOpen: (index: number) => void;
}

const ImgCell = ({
  src, alt, onClick, children, className,
}: {
  src: string; alt: string; onClick: () => void;
  children?: React.ReactNode; className?: string;
}) => (
  <div
    className={cn('relative cursor-pointer group overflow-hidden h-full w-full', className)}
    onClick={onClick}
  >
    <img
      src={src} alt={alt}
      className="absolute inset-0 w-full h-full object-cover group-hover:brightness-90 transition-all duration-200"
      loading="lazy"
    />
    {children}
  </div>
);

const ViewAllOverlay = ({ count, onClick }: { count: number; onClick: (e: React.MouseEvent) => void }) => (
  <button
    onClick={onClick}
    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white font-semibold text-sm gap-2 hover:bg-black/60 transition-colors"
  >
    <PhotoIcon />
    View all {count} photos
  </button>
);

const GalleryGrid = ({ images, onOpen }: GalleryGridProps) => {
  const n = images.length;
  const openAll = (e: React.MouseEvent) => { e.stopPropagation(); onOpen(0); };

  if (n === 1) {
    return (
      <div
        className="rounded-2xl overflow-hidden h-[500px] mb-8 cursor-pointer group"
        onClick={() => onOpen(0)}
      >
        <img
          src={images[0]} alt="Room photo"
          className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-200"
          loading="lazy"
        />
      </div>
    );
  }

  if (n === 2) {
    return (
      <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[440px] mb-8">
        {images.map((src, i) => (
          <ImgCell key={i} src={src} alt={`Photo ${i + 1}`} onClick={() => onOpen(i)} />
        ))}
      </div>
    );
  }

  const mainSrc = images[0] ?? '';

  if (n === 3) {
    return (
      <div className="grid grid-cols-[3fr_2fr] gap-2 rounded-2xl overflow-hidden h-[440px] mb-8">
        <ImgCell src={mainSrc} alt="Main photo" onClick={() => onOpen(0)} />
        <div className="grid grid-rows-2 gap-2 h-full">
          {images.slice(1, 3).map((src, i) => (
            <ImgCell key={i} src={src} alt={`Photo ${i + 2}`} onClick={() => onOpen(i + 1)} />
          ))}
        </div>
      </div>
    );
  }

  // 4 images: main left + 3 stacked right, overlay on last thumb
  if (n === 4) {
    return (
      <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[440px] mb-8">
        <ImgCell src={mainSrc} alt="Main photo" onClick={() => onOpen(0)} />
        <div className="grid grid-rows-3 gap-2 h-full">
          {images.slice(1, 4).map((src, i) => (
            <ImgCell key={i} src={src} alt={`Photo ${i + 2}`} onClick={() => onOpen(i + 1)}>
              {i === 2 && <ViewAllOverlay count={n} onClick={openAll} />}
            </ImgCell>
          ))}
        </div>
      </div>
    );
  }

  // 5+ images: main left + 2×2 grid right, overlay on last thumbnail
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[440px] mb-8">
      <ImgCell src={mainSrc} alt="Main photo" onClick={() => onOpen(0)} />
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
        {images.slice(1, 5).map((src, i) => (
          <ImgCell key={i} src={src} alt={`Photo ${i + 2}`} onClick={() => onOpen(i + 1)}>
            {i === 3 && <ViewAllOverlay count={n} onClick={openAll} />}
          </ImgCell>
        ))}
      </div>
    </div>
  );
};

// ── PhotoLightbox ─────────────────────────────────────────────────────────────

interface PhotoLightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onChange: (i: number) => void;
}

const PhotoLightbox = ({ images, currentIndex, onClose, onChange }: PhotoLightboxProps) => {
  const n = images.length;
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  const prev = useCallback(() => onChange((currentIndex - 1 + n) % n), [currentIndex, n, onChange]);
  const next = useCallback(() => onChange((currentIndex + 1) % n), [currentIndex, n, onChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  useEffect(() => {
    activeThumbRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentIndex]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl flex flex-col overflow-hidden shadow-2xl"
        style={{ maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 h-13 shrink-0 border-b border-neutral-200">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium py-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All photos
</button>
          <span className="text-neutral-400 text-sm font-medium">
            {currentIndex + 1} / {n}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors text-base my-2.5"
          >
            ✕
          </button>
        </div>

        {/* Main image area */}
        <div className="flex-1 relative flex items-center justify-center p-5 min-h-0 overflow-hidden bg-neutral-50">
          <img
            src={images[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain select-none rounded-xl"
            draggable={false}
          />

          {n > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md text-neutral-700 text-2xl flex items-center justify-center transition-colors leading-none"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-3 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md text-neutral-700 text-2xl flex items-center justify-center transition-colors leading-none"
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-2 px-4 py-3 border-t border-neutral-200 overflow-x-auto shrink-0 bg-white">
          {images.map((src, i) => (
            <button
              key={i}
              ref={i === currentIndex ? activeThumbRef : null}
              onClick={() => onChange(i)}
              className={cn(
                'shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all',
                i === currentIndex
                  ? 'border-primary-400 opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80',
              )}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── RelatedRoomCard ───────────────────────────────────────────────────────────

const RelatedRoomCard = ({ room }: { room: Room }) => {
  const rating = Number(pseudoRandom(room.id, 4.3, 5.0).toFixed(1));
  const reviewCount = Math.round(pseudoRandom(room.id + 'r', 80, 2500));
  const price = room.roomType?.basePricePerNight ?? 0;
  const typeName = room.roomType?.name ?? 'Room';

  return (
    <Link
      to={`/rooms/${room.id}`}
      className="group bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={room.imageUrl ?? FALLBACK_ROOM_IMAGE}
          alt={room.name}
          width={400}
          height={300}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
          {typeName}
        </span>
        <h3 className="text-sm font-semibold text-neutral-900 mt-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {room.name}
        </h3>
        <StarRating rating={rating} count={reviewCount} className="mt-2" />
        <div className="flex items-baseline gap-1 mt-3 pt-3 border-t border-neutral-100">
          <span className="text-base font-bold text-primary-600">{formatCurrency(price)}</span>
          <span className="text-xs text-neutral-400">/night</span>
        </div>
      </div>
    </Link>
  );
};

// ── RoomDetailPage ────────────────────────────────────────────────────────────

export const RoomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [relatedRooms, setRelatedRooms] = useState<Room[]>([]);
  const [schedules, setSchedules] = useState<RoomSchedule[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    roomService
      .getRoomById(id)
      .then((data) => { if (!cancelled) setRoom(data); })
      .catch(() => { if (!cancelled) setError('Room information not found'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    roomService
      .getRooms({ page: 1, limit: 8, status: 'available' })
      .then((res) => {
        if (cancelled) return;
        const others = res.data.data.filter((r) => r.id !== id).slice(0, 4);
        setRelatedRooms(others);
      })
      .catch(() => { if (!cancelled) setRelatedRooms([]); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    roomService
      .getRoomSchedules(id)
      .then((data) => { if (!cancelled) setSchedules(data); })
      .catch(() => { if (!cancelled) setSchedules([]); });
    return () => { cancelled = true; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="container-app section-pad">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <div className="aspect-[16/9] skeleton rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square skeleton rounded-xl" />)}
            </div>
          </div>
          <div className="lg:col-span-2">
            <RoomCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container-app section-pad text-center py-20">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">{error ?? 'Room not found'}</h2>
        <button onClick={() => navigate('/rooms')} className="btn-outline py-2 px-5 text-sm mt-4">
          ← Back to list
        </button>
      </div>
    );
  }

  const roomTypeName = room.roomType?.name ?? 'Room';
  const longDesc =
    room.roomType?.description ??
    `Spacious ${roomTypeName} with stunning views, fully equipped with modern amenities. The space is elegantly designed, offering a premium resort experience with professional 24/7 service. The room features generous floor space with luxurious furnishings, a well-appointed bathroom, and a private balcony with panoramic views. Designed to maximize comfort and privacy, it is the perfect choice for couples and business travelers.`;

  const amenities = getAmenitiesFromRoom(room.amenities);
  const images = room.imageUrl ? [room.imageUrl, ...GALLERY.slice(1)] : GALLERY;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-app py-3 flex items-center gap-1.5 text-sm text-neutral-500">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/rooms" className="hover:text-primary-600 transition-colors">Room list</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-neutral-900 font-medium truncate max-w-[200px]">{room.name}</span>
        </div>
      </div>

      <div className="container-app section-pad">

        {/* ── Status banner (maintenance / inactive only) ── */}
        {room.status !== 'available' && (
          <div
            className={cn(
              'flex items-start gap-3 rounded-xl p-4 mb-6 border',
              room.status === 'inactive'
                ? 'bg-error/5 border-error/20 text-error'
                : 'bg-amber-50 border-amber-200 text-amber-700',
            )}
          >
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold">
                {room.status === 'inactive' ? 'Room deactivated' : 'Room under maintenance'}
              </p>
              <p className="text-xs mt-0.5 opacity-75">
                {room.status === 'inactive'
                  ? 'This room is no longer accepting guests. Please choose another room.'
                  : 'The room is currently under maintenance and temporarily not accepting bookings.'}
              </p>
            </div>
          </div>
        )}

        {/* ── Gallery ── */}
        <GalleryGrid
          images={images}
          onOpen={(i) => { setLightboxIndex(i); setLightboxOpen(true); }}
        />

        {/* ── Room Info Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge
                variant={
                  room.status === 'available' ? 'success'
                  : room.status === 'inactive' ? 'error'
                  : 'warning'
                }
              >
                {room.status === 'available' ? 'Available'
                  : room.status === 'inactive' ? 'Deactivated'
                  : 'Under Maintenance'}
              </Badge>
              <Badge variant="default">{roomTypeName}</Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">
              {room.name} — {roomTypeName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Floor {room.floor}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Added on {formatDate(room.createdAt)}
              </span>
            </div>
            <StarRating rating={4.7} count={248} size="md" className="mt-3" />
          </div>

          {/* Share + Favorite */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-xl hover:bg-primary-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Favorite
            </button>
          </div>
        </div>

        {/* ── Main 2-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left — content */}
          <div className="flex-1 min-w-0">

            {/* Tabs */}
            <div className="border-b border-neutral-200 mb-6">
              <nav className="flex gap-0">
                {tabs.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                      activeTab === key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-neutral-500 hover:text-neutral-800',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* ── Tab: Tổng quan ── */}
            {activeTab === 'overview' && (
              <div className="space-y-8">

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Room Description</h3>
                  <p className={cn('text-neutral-600 leading-relaxed text-sm', !descExpanded && 'line-clamp-3')}>
                    {longDesc}
                  </p>
                  <button
                    onClick={() => setDescExpanded((v) => !v)}
                    className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {descExpanded ? 'Show less ↑' : 'Show more ↓'}
                  </button>
                </div>

                {/* Room info grid */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Room Information</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Room Code', value: room.code },
                      { label: 'Room Type', value: roomTypeName },
                      { label: 'Capacity', value: `${room.capacity} guests` },
                      { label: 'Floor', value: room.floor ? `Floor ${room.floor}` : '—' },
                      { label: 'Base Price', value: `${formatCurrency(room.roomType?.basePricePerNight ?? 0)}/night` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                        <div>
                          <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-neutral-800">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operating hours */}
                {schedules.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-3">Operating Hours</h3>
                    <div className="rounded-2xl border border-neutral-200 overflow-hidden">
                      {schedules
                        .slice()
                        .sort((a, b) => a.day_of_week - b.day_of_week)
                        .map((s, i) => {
                          const isToday = new Date().getDay() === s.day_of_week;
                          return (
                            <div
                              key={s.day_of_week}
                              className={cn(
                                'flex items-center justify-between px-4 py-3 text-sm',
                                i > 0 && 'border-t border-neutral-100',
                                isToday ? 'bg-primary-50' : 'bg-white',
                              )}
                            >
                              <span className={cn('font-medium', isToday ? 'text-primary-700' : 'text-neutral-700')}>
                                {s.day_name}
                                {isToday && (
                                  <span className="ml-2 text-xs font-normal text-primary-500">(Today)</span>
                                )}
                              </span>
                              {s.is_closed ? (
                                <span className="text-neutral-400">Closed</span>
                              ) : (
                                <span className={cn('font-medium', isToday ? 'text-primary-700' : 'text-neutral-800')}>
                                  {s.open_time} – {s.close_time}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}


                 {/* Policies */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Room Policies</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Check-in', value: 'From 14:00' },
                      { label: 'Check-out', value: 'Before 12:00' },
                      { label: 'Cancellation', value: 'Free before 24h' },
                      { label: 'Smoking', value: 'Not allowed' },
                      { label: 'Pets', value: 'Not allowed' },
                      { label: 'Children', value: 'Allowed' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm py-2.5 border-b border-neutral-100">
                        <span className="text-neutral-500">{label}</span>
                        <span className="font-medium text-neutral-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured amenities preview */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Featured Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {amenities.slice(0, 6).map(({ icon, label }) => (
                      <div key={label} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                        <span className="text-xl">{icon}</span>
                        <span className="text-sm text-neutral-700">{label}</span>
                      </div>
                    ))}
                  </div>
                  {amenities.length > 0 && (
                    <button
                      onClick={() => setShowAmenitiesModal(true)}
                      className="mt-4 text-sm font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 px-4 py-2 rounded-xl transition-colors"
                    >
                      View all {amenities.length} amenities
                    </button>
                  )}
                </div>

               

                {/* Location */}
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-3">Location</h3>
                  <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200 mb-3">
                    <svg className="w-5 h-5 shrink-0 mt-0.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{ROOM_LOCATION.address}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Close to the city center, convenient for getting to major attractions and popular restaurants.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-neutral-200 relative">
                    <iframe
                      title={`Location map — ${ROOM_LOCATION.shortLabel}`}
                      src={mapEmbedUrl(ROOM_LOCATION.lat, ROOM_LOCATION.lng)}
                      width="100%"
                      height="320"
                      loading="lazy"
                      className="w-full block"
                      style={{ border: 0 }}
                    />
                    <a
                      href={mapDirectionsUrl(ROOM_LOCATION.lat, ROOM_LOCATION.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-primary-700 hover:text-primary-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View larger map
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Tiện nghi ── */}
            {activeTab === 'amenities' && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm text-neutral-700 font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Tab: Đánh giá ── */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Rating overview */}
                <div className="bg-neutral-50 rounded-2xl p-5 mb-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-neutral-900">4.7</p>
                      <StarRating rating={4.7} size="md" className="mt-1 justify-center" />
                      <p className="text-xs text-neutral-400 mt-1">248 reviews</p>
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      {[
                        { label: 'Cleanliness', value: 4.9 },
                        { label: 'Service', value: 4.8 },
                        { label: 'Location', value: 4.7 },
                        { label: 'Value', value: 4.5 },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-3 text-sm">
                          <span className="text-neutral-500 w-16 shrink-0">{label}</span>
                          <div className="flex-1 bg-neutral-200 rounded-full h-1.5">
                            <div
                              className="bg-amber-400 h-1.5 rounded-full"
                              style={{ width: `${(value / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-neutral-700 font-medium w-6 text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews list */}
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border-b border-neutral-100 pb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={`https://i.pravatar.cc/40?img=${i + 10}`}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                        loading="lazy"
                        width={40}
                        height={40}
                      />
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">Guest {i + 1}</p>
                        <p className="text-xs text-neutral-400">Month {i + 1}, 2025</p>
                      </div>
                    </div>
                    <StarRating rating={5 - i * 0.3} />
                    <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                      The room is very clean and spacious, and the staff is attentive. The location is convenient for getting around. Will definitely come back!
                    </p>
                  </div>
                ))}

                <button className="w-full py-3 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:border-primary-400 hover:text-primary-600 transition-colors">
                  Write your review
                </button>
              </div>
            )}
          </div>

          {/* Right — booking widget (sticky) */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <BookingWidget room={room} />
          </div>
        </div>

        {/* ── Related Rooms ── */}
        {relatedRooms.length > 0 && (
          <div className="mt-16 pt-10 border-t border-neutral-200">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-sm font-medium text-primary-600 mb-1">You might also like</p>
                <h2 className="text-2xl font-bold text-neutral-900">Similar Rooms</h2>
              </div>
              <Link
                to="/rooms"
                className="text-sm font-medium text-primary-600 border border-primary-200 hover:bg-primary-50 px-4 py-2 rounded-full transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedRooms.map((related) => (
                <RelatedRoomCard key={related.id} room={related} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <PhotoLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onChange={setLightboxIndex}
        />
      )}

      {/* ── Amenities modal ── */}
      {showAmenitiesModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowAmenitiesModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-neutral-900">All Amenities</h3>
              <button
                onClick={() => setShowAmenitiesModal(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {amenities.map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm text-neutral-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
