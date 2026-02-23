import type { ElementType, ComponentPropsWithoutRef } from 'react';

type CardWrapperOwnProps<E extends ElementType = 'article'> = {
  as?: E;
  hover?: boolean;
  className?: string;
};

type CardWrapperProps<E extends ElementType = 'article'> = CardWrapperOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof CardWrapperOwnProps<E>>;

const baseClasses = 'rounded-2xl bg-card border border-border shadow-[var(--shadow)] transition-all';
const hoverClasses = 'hover:-translate-y-1 hover:shadow-lg';

export function CardWrapper<E extends ElementType = 'article'>({
  as,
  hover = false,
  className = '',
  ...rest
}: CardWrapperProps<E>) {
  const Component = as || 'article';

  return (
    <Component
      className={`${baseClasses} ${hover ? hoverClasses : ''} ${className}`.trim()}
      {...rest}
    />
  );
}

export default CardWrapper;
