import { cn } from '@/common/utils/cn';

interface LoadingScreenProps {
  fadeOut?: boolean;
}

const HotelIcon = () => (
  <svg
    width="52"
    height="52"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21V7a2 2 0 012-2h14a2 2 0 012 2v14" />
    <path d="M3 21h18" />
    <path d="M9 21v-6h6v6" />
    <rect x="7" y="9" width="3" height="3" rx=".5" />
    <rect x="14" y="9" width="3" height="3" rx=".5" />
  </svg>
);

export const LoadingScreen = ({ fadeOut = false }: LoadingScreenProps) => (
  <div
    className={cn(
      'fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-50',
      fadeOut ? 'animate-fade-out pointer-events-none' : 'animate-fade-in',
    )}
  >
    <div className="mb-5 text-primary-500">
      <HotelIcon />
    </div>

    <h1 className="mb-8 text-lg font-semibold tracking-wide text-neutral-900">
      Kyanon Booking
    </h1>

    <div className="flex items-center gap-2.5">
      <span className="h-2 w-2 rounded-full bg-primary-400 animate-dot-pulse" />
      <span className="h-2 w-2 rounded-full bg-primary-500 animate-dot-pulse [animation-delay:0.2s]" />
      <span className="h-2 w-2 rounded-full bg-primary-600 animate-dot-pulse [animation-delay:0.4s]" />
    </div>
  </div>
);
