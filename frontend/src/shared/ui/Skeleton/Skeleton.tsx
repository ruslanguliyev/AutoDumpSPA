type SkeletonProps = {
  className?: string;
};

/**
 * A shimmer in --card-muted shaped like the thing that is loading. Never a spinner on a
 * card grid: a spinner says "wait", a skeleton says what is about to appear.
 */
const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-card-muted ${className}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
