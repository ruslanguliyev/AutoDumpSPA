type AiSparkleProps = {
  size?: number;
  className?: string;
};

/** Four-point star used everywhere the product marks something as AI. */
export function AiSparkle({ size = 16, className = '' }: AiSparkleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2.5l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5-6.5-2 6.5-2z" />
    </svg>
  );
}
