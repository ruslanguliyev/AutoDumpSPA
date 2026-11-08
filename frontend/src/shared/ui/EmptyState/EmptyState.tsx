import type { ReactNode } from 'react';

type EmptyStateProps = {
  /** A lucide icon. Rendered muted, at the size the caller passes. */
  icon?: ReactNode;
  /** One line saying what is not here. */
  children: ReactNode;
  /** One way out: a link or a button. */
  action?: ReactNode;
  className?: string;
};

/**
 * A dashed box, a muted icon, one line, one way out. An empty state that only says
 * "nothing found" leaves people stuck, so there is always somewhere to go next.
 */
export function EmptyState({ icon, children, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong px-6 py-10 text-center dark:border-border ${className}`.trim()}
    >
      {icon ? (
        <span className="text-subtle-foreground [&_svg]:stroke-[1.5]" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <p className="text-[15px] text-muted-foreground">{children}</p>
      {action}
    </div>
  );
}

export default EmptyState;
