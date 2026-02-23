import type { ReactNode, MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

type CardCTAVariant = 'primary' | 'brand';

type CardCTAProps = {
  to?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  variant?: CardCTAVariant;
  fullWidth?: boolean;
  className?: string;
};

const baseClasses = 'inline-flex items-center justify-center font-semibold transition hover:brightness-110';

const shapeClasses = {
  default: 'rounded-full px-4 py-2',
  fullWidth: 'w-full rounded-xl px-4 py-2',
};

const variantClasses: Record<CardCTAVariant, string> = {
  primary: 'bg-primary text-primary-foreground',
  brand: 'bg-brand text-brand-foreground',
};

export function CardCTA({
  to,
  onClick,
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
}: CardCTAProps) {
  const classes = `${baseClasses} ${fullWidth ? shapeClasses.fullWidth : shapeClasses.default} ${variantClasses[variant]} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export default CardCTA;
