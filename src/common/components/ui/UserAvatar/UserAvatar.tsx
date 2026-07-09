import { cn } from '@/common/utils/cn';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AVATAR_GRADIENTS = [
  'from-primary-400 to-primary-600',
  'from-purple-400 to-purple-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-emerald-400 to-emerald-600',
  'from-blue-400 to-blue-600',
] as const;

const getGradient = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length] as string;
};

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
} as const;

export const UserAvatar = ({
  firstName,
  lastName,
  avatarUrl,
  size = 'md',
  className,
}: UserAvatarProps) => {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  const gradient = getGradient(`${firstName}${lastName}`);

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center shrink-0',
        sizeClasses[size],
        className,
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center bg-gradient-to-br text-white font-semibold',
            gradient,
          )}
        >
          {initials}
        </div>
      )}
    </div>
  );
};
