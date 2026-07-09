import { cn } from '@/common/utils/cn';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn('skeleton', className)} />
);

export const RoomCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100">
    <div className="aspect-[4/3] skeleton" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4 rounded-full" />
      <Skeleton className="h-3 w-1/2 rounded-full" />
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-3.5 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-5 w-1/3 rounded-full" />
    </div>
  </div>
);
