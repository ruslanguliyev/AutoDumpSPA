import type { PromotionTarget } from '@/features/promotions/api/promotions.api';
import { PromoteShortcuts } from '@/shared/blocks/PromoteShortcuts';

/**
 * @deprecated Use `PromoteShortcuts` from `@/shared/blocks`. Kept for existing detail pages.
 */
export function PromoteInline({
  targetType,
  targetId,
  className = '',
}: {
  targetType: PromotionTarget;
  targetId: string | undefined;
  className?: string;
}) {
  return <PromoteShortcuts targetType={targetType} targetId={targetId} className={className} />;
}

export default PromoteInline;
