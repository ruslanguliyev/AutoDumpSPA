import type { ReactNode } from 'react';

type FilterBarProps = {
  className?: string;
  children: ReactNode;
  actions?: ReactNode;
};

const FilterBar = ({ className, children, actions }: FilterBarProps) => {
  const classes = ['filters-bar', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
      {actions ? <div className="filters-actions">{actions}</div> : null}
    </div>
  );
};

export default FilterBar;
