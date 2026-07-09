import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/common/utils/cn';

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const today = new Date().toISOString().split('T')[0] ?? '';
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0] ?? '';

export const SearchBar = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [focusedField, setFocusedField] = useState<'checkIn' | 'checkOut' | null>(null);
  const [checkInIconKey, setCheckInIconKey] = useState(0);
  const [checkOutIconKey, setCheckOutIconKey] = useState(0);

  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    setCheckInIconKey((k) => k + 1);
    if (checkOut <= value) {
      const next = new Date(value);
      next.setDate(next.getDate() + 1);
      setCheckOut(next.toISOString().split('T')[0] ?? '');
    }
  };

  const handleCheckOutChange = (value: string) => {
    setCheckOut(value);
    setCheckOutIconKey((k) => k + 1);
  };

  const handleSearch = () => {
    const params = new URLSearchParams({ checkIn, checkOut });
    void navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-widget p-2 flex flex-col lg:flex-row gap-2 animate-slide-up">
      {/* Check-in */}
      <div
        className={cn(
          'flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer',
          focusedField === 'checkIn'
            ? 'ring-2 ring-primary-300 bg-primary-50/40 scale-[1.01] shadow-md'
            : 'hover:bg-neutral-50',
        )}
      >
        <span
          key={checkInIconKey}
          className={cn('text-primary-500 shrink-0', checkInIconKey > 0 && 'animate-wiggle')}
        >
          <CalendarIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-400 mb-0.5">Nhận phòng</p>
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => handleCheckInChange(e.target.value)}
            onFocus={() => setFocusedField('checkIn')}
            onBlur={() => setFocusedField(null)}
            className="w-full text-sm font-medium text-neutral-800 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      <div className="hidden lg:block w-px bg-neutral-200 my-2" />

      {/* Check-out */}
      <div
        className={cn(
          'flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer',
          focusedField === 'checkOut'
            ? 'ring-2 ring-primary-300 bg-primary-50/40 scale-[1.01] shadow-md'
            : 'hover:bg-neutral-50',
        )}
      >
        <span
          key={checkOutIconKey}
          className={cn('text-primary-500 shrink-0', checkOutIconKey > 0 && 'animate-wiggle')}
        >
          <CalendarIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-400 mb-0.5">Trả phòng</p>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => handleCheckOutChange(e.target.value)}
            onFocus={() => setFocusedField('checkOut')}
            onBlur={() => setFocusedField(null)}
            className="w-full text-sm font-medium text-neutral-800 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="btn-primary gap-2 px-6 lg:px-8 py-3 rounded-xl shrink-0 hover:scale-[1.05] active:scale-[0.93] transition-all duration-150"
      >
        <SearchIcon />
        <span className="hidden sm:inline">Tìm kiếm</span>
      </button>
    </div>
  );
};
