import { MapPin } from 'lucide-react';

type LocationBadgeSize = 'sm' | 'md';

type LocationBadgeProps = {
  location: string;
  size?: LocationBadgeSize;
  className?: string;
};

const baseClasses = 'inline-flex items-center gap-1 text-muted-foreground';

const sizeConfig: Record<LocationBadgeSize, { text: string; icon: string }> = {
  sm: { text: 'text-xs', icon: 'w-3 h-3' },
  md: { text: 'text-sm', icon: 'w-4 h-4' },
};

export function LocationBadge({ location, size = 'sm', className = '' }: LocationBadgeProps) {
  const config = sizeConfig[size];

  return (
    <span className={`${baseClasses} ${config.text} ${className}`.trim()}>
      <MapPin className={config.icon} aria-hidden="true" />
      <span>{location}</span>
    </span>
  );
}

export default LocationBadge;
