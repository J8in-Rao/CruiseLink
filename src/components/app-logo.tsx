import { Ship } from 'lucide-react';
import { cn } from '@/lib/utils';

type AppLogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

export default function AppLogo({ className, size = 'md' }: AppLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-primary text-primary-foreground',
          sizeClasses[size]
        )}
      >
        <Ship className={cn(iconSizeClasses[size])} />
      </div>
      <span
        className={cn(
          'text-xl font-bold tracking-tighter text-primary',
          // If the parent has text-white, we want the logo text to be white.
          className?.includes('text-white') && 'text-white'
        )}
      >
        CruiseLink
      </span>
    </div>
  );
}
