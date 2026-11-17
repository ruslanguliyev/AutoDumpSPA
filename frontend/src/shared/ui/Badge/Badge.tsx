import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * The badges of design/components.md.
 *
 * Paid-placement tiers (VIP, PREMIUM) are not here: `PromotionBadge` owns them, so an
 * advert is always labelled by one component and cannot be imitated by a stray badge.
 * Colour never carries the meaning on its own — every variant pairs it with a label,
 * and the status ones with an icon or a dot.
 */
export type BadgeVariant =
  | 'verified'
  | 'hot'
  | 'ad'
  | 'category'
  | 'inStock'
  | 'outOfStock'
  | 'openNow'
  | 'closed'
  | 'custom';

type BadgeProps = {
  variant?: BadgeVariant;
  /** Leading icon or dot. `verified` supplies a check when this is left out. */
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Pill badges: 11px, 600, the letter-spacing the design asks for. */
const pill =
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold leading-none tracking-[0.04em]';

/** Status words that are text, not a pill. */
const plain = 'inline-flex items-center gap-1.5 text-[13px] font-semibold leading-none';

const variantClasses: Record<BadgeVariant, string> = {
  verified: `${pill} border-success text-success`,
  hot: `${pill} border-transparent bg-promo-vip-fill text-promo-vip-on-fill`,
  // An advert label has to be readable, so this one departs from the first draft of
  // components.md: --subtle-foreground only reaches 2.6:1 as a border on the light
  // background, and the muted label was faint in dark. Border and label both firm up.
  ad: `${pill} border-muted-foreground uppercase text-foreground`,
  category: `${pill} border-transparent bg-primary text-primary-foreground`,
  inStock: `${plain} text-success`,
  outOfStock: `${plain} text-destructive`,
  openNow: `${plain} text-success`,
  closed: `${plain} text-muted-foreground`,
  custom: pill,
};

const Dot = () => <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />;

const defaultIcon: Partial<Record<BadgeVariant, ReactNode>> = {
  verified: <Check size={12} strokeWidth={1.5} aria-hidden="true" />,
  openNow: <Dot />,
  closed: <Dot />,
};

export function Badge({ variant = 'custom', icon, className = '', children }: BadgeProps) {
  const leading = icon === undefined ? defaultIcon[variant] : icon;

  return (
    <span className={`${variantClasses[variant]} ${className}`.trim()}>
      {leading}
      {children}
    </span>
  );
}

export default Badge;
