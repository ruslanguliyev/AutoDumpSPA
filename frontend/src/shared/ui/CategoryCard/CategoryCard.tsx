import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type CategoryCardProps = {
  icon: ReactNode;
  label: string;
  href: string;
  className?: string;
};

/**
 * A tile: 26px icon in --primary-text over a 14px label, at least 108px tall.
 * Hover lifts the card and brightens its border; the icon never takes --primary as a
 * text colour, which would fail contrast on the dark background.
 */
const CategoryCard = ({ icon, label, href, className = '' }: CategoryCardProps) => {
  return (
    <Link
      to={href}
      className={`group flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-lg ${className}`.trim()}
    >
      <span
        className="text-primary-text [&_svg]:h-[26px] [&_svg]:w-[26px] [&_svg]:stroke-[1.5]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-[14px] font-medium text-foreground">{label}</span>
    </Link>
  );
};

export default CategoryCard;
