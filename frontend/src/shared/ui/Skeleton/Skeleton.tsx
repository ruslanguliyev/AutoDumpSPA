type SkeletonProps = {
  className?: string;
};

const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted ${className}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
