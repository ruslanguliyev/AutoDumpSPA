import type { ReactNode } from 'react';

type SpecialistBadgeVariant = 'default' | 'verified' | 'mobile';

type SpecialistBadgeProps = {
  label: string;
  icon?: ReactNode;
  variant?: SpecialistBadgeVariant;
  className?: string;
};

const variantStyles: Record<SpecialistBadgeVariant, string> = {
  default: 'border-border bg-muted text-muted-foreground',
  verified: 'border-success/30 bg-success/10 text-success',
  mobile: 'border-primary/30 bg-primary/10 text-primary',
};

const SpecialistBadge = ({
  label,
  icon,
  variant = 'default',
  className = '',
}: SpecialistBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {icon ? <span className="flex items-center">{icon}</span> : null}
      <span>{label}</span>
    </span>
  );
};

export default SpecialistBadge;
