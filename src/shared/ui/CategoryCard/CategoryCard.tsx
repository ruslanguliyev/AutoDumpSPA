import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type CategoryCardProps = {
  icon: ReactNode;
  label: string;
  href: string;
  className?: string;
};

const CategoryCard = ({ icon, label, href, className = '' }: CategoryCardProps) => {
  return (
    <Link
      to={href}
      className={`
        group flex flex-col items-center justify-center gap-3 rounded-xl
        border border-border bg-card p-4 shadow-[var(--shadow)]
        transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
        ${className}
      `}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-warning group-hover:text-warning-foreground">
        {icon}
      </div>
      <span className="text-center text-sm font-medium text-foreground">
        {label}
      </span>
    </Link>
  );
};

export default CategoryCard;
