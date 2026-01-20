import { Slot } from '@radix-ui/react-slot';

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-card text-foreground hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
};

const Button = ({
  asChild = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button';
  const resolvedType = type ?? 'button';

  return (
    <Comp
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(asChild ? props : { type: resolvedType, ...props })}
    />
  );
};

export { Button };
export default Button;
