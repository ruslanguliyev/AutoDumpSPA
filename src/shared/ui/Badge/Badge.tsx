import type { ReactNode } from 'react';

type BadgeVariant = 'verified' | 'premium' | 'boosted' | 'hot' | 'custom';

type BadgeProps = {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
};

const baseClasses = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1';

const variantClasses: Record<BadgeVariant, string> = {
  verified: 'bg-success/10 text-success ring-success/30',
  premium: 'bg-premium/10 text-premium ring-premium/30',
  boosted: 'bg-primary/10 text-primary ring-primary/30',
  hot: 'bg-destructive/10 text-destructive ring-destructive/30',
  custom: '',
};

export function Badge({ variant = 'custom', className = '', children }: BadgeProps) {
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}>
      {children}
    </span>
  );
}

export default Badge;
