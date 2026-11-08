import { Slot } from '@radix-ui/react-slot';
import type { ButtonHTMLAttributes } from 'react';

/**
 * The button of design/components.md.
 *
 * Height is 44px on every size, because a target smaller than that is a target
 * people miss on a phone. `drawer` is the 48px variant the mobile filter sheet uses.
 * Colours come from tokens only; in dark theme --primary stays a fill, so the
 * secondary button takes its text from --primary-text.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'drawer';

const baseStyles = [
  'inline-flex items-center justify-center gap-2',
  'rounded-[var(--radius)] font-semibold whitespace-nowrap',
  'transition focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:pointer-events-none disabled:opacity-50',
  // lucide icons ship stroke-width 2; the design asks for 1.5 everywhere.
  '[&_svg]:stroke-[1.5] [&_svg]:shrink-0',
].join(' ');

const ghostStyles =
  'border border-border-strong bg-transparent text-foreground hover:bg-foreground/5 dark:border-border';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:brightness-95',
  secondary: 'border border-brand bg-transparent text-primary-text hover:bg-foreground/5',
  ghost: ghostStyles,
  /** Icon-only: ghost in a square box. Always pass an aria-label. */
  icon: ghostStyles,
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-11 px-3 text-[15px]',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-12 px-6 text-base',
  icon: 'h-11 w-11 p-0',
  /** Controls inside the mobile filter drawer. */
  drawer: 'h-12 px-5 text-[15px]',
};

type ButtonProps = {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> &
  Pick<Partial<ButtonHTMLAttributes<HTMLButtonElement>>, 'type'>;

const Button = ({
  asChild = false,
  variant = 'primary',
  size,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : 'button';
  const resolvedSize: ButtonSize = size ?? (variant === 'icon' ? 'icon' : 'md');

  if (import.meta.env.DEV && resolvedSize === 'icon' && !props['aria-label']) {
    console.warn('Button: an icon-only button needs an aria-label.');
  }

  return (
    <Comp
      className={`${baseStyles} ${variants[variant]} ${sizes[resolvedSize]} ${className}`.trim()}
      {...(asChild ? props : { type, ...props })}
    />
  );
};

export { Button };
export default Button;
