import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRooms } from '../hooks/useRooms';
import { useAvailableRooms } from '../hooks/useAvailableRooms';
import { useRoomTypes } from '../hooks/useRoomTypes';
import { RoomCard } from '../components/RoomCard';
import { usePagination } from '@/common/hooks/usePagination';
import { useDebounce } from '@/common/hooks/useDebounce';
import { RoomCardSkeleton } from '@/common/components/ui/Skeleton/Skeleton';
import { cn } from '@/common/utils/cn';
import { formatDate } from '@/common/utils/format';

const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

interface FilterPanelProps {
  search: string; setSearch: (v: string) => void;
  minPrice: string; setMinPrice: (v: string) => void;
  maxPrice: string; setMaxPrice: (v: string) => void;
  selectedRoomTypeIds: string[];
  onToggleRoomType: (id: string) => void;
  roomTypes: { id: string; name: string }[];
  onReset: () => void;
}

const ROOM_TYPE_VISIBLE_COUNT = 7;

const FilterPanel = ({
  search, setSearch,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  selectedRoomTypeIds, onToggleRoomType, roomTypes,
  onReset,
}: FilterPanelProps) => {
  const [roomTypeExpanded, setRoomTypeExpanded] = useState(false);
  const visibleRoomTypes = roomTypeExpanded ? roomTypes : roomTypes.slice(0, ROOM_TYPE_VISIBLE_COUNT);
  const hiddenCount = roomTypes.length - ROOM_TYPE_VISIBLE_COUNT;

  return (
    <aside className="w-full lg:w-72 shrink-0 animate-slide-in-left">
      <div className="card p-5 sticky top-20 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Filters</h2>
          <button onClick={onReset} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
            Reset
          </button>
        </div>

        {/* Search */}
        <div>
          <label className="form-label">Search by name</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room name..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-400"
            />
          </div>
        </div>

        {/* Price range */}
        <div>
          <label className="form-label">Price range / night</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="From"
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-neutral-400 text-sm shrink-0">–</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="To"
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Room Types */}
        {roomTypes.length > 0 && (
          <div>
            <label className="form-label">Room Type</label>
            <div className="space-y-2">
              {visibleRoomTypes.map((rt) => (
                <label
                  key={rt.id}
                  className={cn(
                    'flex items-center gap-3 cursor-pointer group rounded-lg px-2 py-1 -mx-2 transition-all duration-150',
                    selectedRoomTypeIds.includes(rt.id) && 'bg-primary-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedRoomTypeIds.includes(rt.id)}
                    onChange={() => onToggleRoomType(rt.id)}
                    className="w-4 h-4 rounded text-primary-500 border-neutral-300 focus:ring-primary-400 cursor-pointer"
                  />
                  <span className={cn(
                    'text-sm transition-colors duration-150',
                    selectedRoomTypeIds.includes(rt.id)
                      ? 'text-primary-700 font-medium'
                      : 'text-neutral-600 group-hover:text-neutral-900',
                  )}>
                    {rt.name}
                  </span>
                </label>
              ))}
            </div>
            {hiddenCount > 0 && (
              <button
                onClick={() => setRoomTypeExpanded((v) => !v)}
                className="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
              >
                {roomTypeExpanded ? (
                  <>Show less ▴</>
                ) : (
                  <>+ Show {hiddenCount} more ▾</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

const SORT_PARAMS: Record<string, { sortBy?: 'price' | 'name' | 'createdAt'; sortOrder?: 'asc' | 'desc' }> = {
  popular:    {},
  price_asc:  { sortBy: 'price', sortOrder: 'asc' },
  price_desc: { sortBy: 'price', sortOrder: 'desc' },
  rating:     {},
};

// ── Search context banner ─────────────────────────────────────────────────────

interface SearchBannerProps {
  checkIn: string;
  checkOut: string;
  onClear: () => void;
}

const SearchBanner = ({ checkIn, checkOut, onClear }: SearchBannerProps) => (
  <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 mb-6">
    <svg className="w-4 h-4 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p className="text-sm text-primary-700 flex-1">
      Phòng trống từ{' '}
      <span className="font-semibold">{formatDate(checkIn)}</span>
      {' '}đến{' '}
      <span className="font-semibold">{formatDate(checkOut)}</span>
    </p>
    <button
      onClick={onClear}
      className="text-primary-500 hover:text-primary-700 transition-colors shrink-0"
      title="Xóa tìm kiếm"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

// ── Available rooms mode ──────────────────────────────────────────────────────

interface AvailableRoomsModeProps {
  checkIn: string;
  checkOut: string;
  layout: 'grid' | 'list';
  onClear: () => void;
}

const AvailableRoomsMode = ({ checkIn, checkOut, layout, onClear }: AvailableRoomsModeProps) => {
  const { rooms, isLoading, error } = useAvailableRooms({ checkIn, checkOut });
  const [gridKey, setGridKey] = useState(0);

  useEffect(() => {
    if (!isLoading && rooms.length > 0) setGridKey((k) => k + 1);
  }, [isLoading, rooms.length]);

  return (
    <>
      <SearchBanner checkIn={checkIn} checkOut={checkOut} onClear={onClear} />

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>
      )}

      {isLoading ? (
        <div className={cn(
          layout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'flex flex-col gap-4',
        )}>
          {Array.from({ length: 6 }).map((_, i) => <RoomCardSkeleton key={i} />)}
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h3 className="text-lg font-semibold text-neutral-900">Không có phòng trống</h3>
          <p className="text-neutral-500 mt-1 mb-6 text-sm">
            Không tìm thấy phòng trống từ {formatDate(checkIn)} đến {formatDate(checkOut)}
          </p>
          <button onClick={onClear} className="btn-outline py-2 px-5 text-sm">
            Xem tất cả phòng
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-4">Tìm thấy {rooms.length} phòng trống</p>
          <div
            key={gridKey}
            className={cn(
              'animate-section visible',
              layout === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                : 'flex flex-col gap-4',
            )}
          >
            {rooms.map((room) => (
              <div key={room.id} className="stagger-card">
                <RoomCard room={room} layout={layout} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

export const RoomListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const isSearchMode = Boolean(checkIn && checkOut && checkOut > checkIn);

  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRoomTypeIds, setSelectedRoomTypeIds] = useState<string[]>([]);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('popular');
  const [gridKey, setGridKey] = useState(0);
  const debouncedSearch = useDebounce(search, 400);
  const { page, limit, nextPage, prevPage, resetPage } = usePagination();
  const { roomTypes } = useRoomTypes();

  useEffect(() => {
    resetPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, minPrice, maxPrice, sort, selectedRoomTypeIds.join(',')]);

  const sortParams = SORT_PARAMS[sort] ?? {};
  const { rooms, total, isLoading, error } = useRooms({
    page,
    limit,
    search: debouncedSearch || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    roomTypeIds: selectedRoomTypeIds.length ? selectedRoomTypeIds : undefined,
    ...sortParams,
  });

  useEffect(() => {
    if (!isLoading && rooms.length > 0) setGridKey((k) => k + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const totalPages = Math.ceil(total / limit);

  const handleToggleRoomType = (id: string) => {
    setSelectedRoomTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleReset = () => {
    setSearch(''); setMinPrice(''); setMaxPrice(''); setSelectedRoomTypeIds([]); resetPage();
  };

  const handleClearSearch = () => {
    setSearchParams({});
  };

  return (
    <div className="container-app section-pad">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          {isSearchMode ? 'Kết quả tìm kiếm' : 'Tìm phòng'}
        </h1>
        {!isSearchMode && (
          <p className="text-neutral-500 mt-1 text-sm">
            {total > 0 ? `Found ${total} matching rooms` : 'Loading...'}
          </p>
        )}
      </div>

      {isSearchMode ? (
        /* ── Available rooms mode: không cần sidebar filter ── */
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            {/* View toggle */}
            <div className="flex justify-end mb-5">
              <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-xl p-1">
                <button
                  onClick={() => setLayout('grid')}
                  className={cn('p-1.5 rounded-lg transition-colors', layout === 'grid' ? 'bg-primary-500 text-white' : 'text-neutral-400 hover:text-neutral-600')}
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  className={cn('p-1.5 rounded-lg transition-colors', layout === 'list' ? 'bg-primary-500 text-white' : 'text-neutral-400 hover:text-neutral-600')}
                >
                  <ListIcon />
                </button>
              </div>
            </div>
            <AvailableRoomsMode
              checkIn={checkIn}
              checkOut={checkOut}
              layout={layout}
              onClear={handleClearSearch}
            />
          </div>
        </div>
      ) : (
        /* ── Browse mode: sidebar + sort + pagination ── */
        <div className="flex flex-col lg:flex-row gap-6">
          <FilterPanel
            search={search} setSearch={setSearch}
            minPrice={minPrice} setMinPrice={setMinPrice}
            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            selectedRoomTypeIds={selectedRoomTypeIds}
            onToggleRoomType={handleToggleRoomType}
            roomTypes={roomTypes}
            onReset={handleReset}
          />

          <div className="flex-1 min-w-0">
            {/* Sort + view toggle bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                {['Popular', 'Low price', 'High price', 'Rating'].map((opt, i) => {
                  const val = ['popular', 'price_asc', 'price_desc', 'rating'][i] ?? 'popular';
                  const isActive = sort === val;
                  return (
                    <button
                      key={isActive ? `${opt}-active` : opt}
                      onClick={() => setSort(val)}
                      className={cn(
                        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-500 text-white animate-bounce-in'
                          : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-600',
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-xl p-1">
                <button
                  onClick={() => setLayout('grid')}
                  className={cn('p-1.5 rounded-lg transition-colors', layout === 'grid' ? 'bg-primary-500 text-white' : 'text-neutral-400 hover:text-neutral-600')}
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  className={cn('p-1.5 rounded-lg transition-colors', layout === 'list' ? 'bg-primary-500 text-white' : 'text-neutral-400 hover:text-neutral-600')}
                >
                  <ListIcon />
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-error-50 text-error-600 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>
            )}

            {/* Cards */}
            {isLoading ? (
              <div className={cn(
                layout === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'flex flex-col gap-4',
              )}>
                {Array.from({ length: 6 }).map((_, i) => <RoomCardSkeleton key={i} />)}
              </div>
            ) : rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-lg font-semibold text-neutral-900">No rooms found</h3>
                <p className="text-neutral-500 mt-1 mb-6 text-sm">Try changing the filters or search terms</p>
                <button onClick={handleReset} className="btn-outline py-2 px-5 text-sm">Clear filters</button>
              </div>
            ) : (
              <>
                <div
                  key={gridKey}
                  className={cn(
                    'animate-section visible',
                    layout === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                      : 'flex flex-col gap-4',
                  )}
                >
                  {rooms.map((room) => (
                    <div key={room.id} className="stagger-card">
                      <RoomCard room={room} layout={layout} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
                  <p className="text-sm text-neutral-500">
                    Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} results
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={cn(
                          'w-9 h-9 rounded-xl text-sm font-medium transition-colors',
                          p === page
                            ? 'bg-primary-500 text-white'
                            : 'border border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600',
                        )}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={nextPage}
                      disabled={page >= totalPages}
                      className="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:border-primary-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
