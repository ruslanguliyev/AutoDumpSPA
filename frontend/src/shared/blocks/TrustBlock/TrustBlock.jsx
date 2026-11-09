import { ShieldCheck, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SafetyTips } from '@/shared/blocks/SafetyTips/SafetyTips';

/**
 * Trust / safety sidebar content.
 * @deprecated Prefer `SafetyTips` (vehicles) or inline buyer protection on part detail.
 */
export const TrustBlock = ({ variant = 'car' }) => {
  const { t } = useTranslation('common');

  if (variant === 'part') {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-[13px] text-muted-foreground shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <ShieldCheck size={16} strokeWidth={1.5} className="text-primary-text" aria-hidden="true" />
          {t('trust.buyerProtection')}
        </div>
        <div className="mt-3 flex flex-col gap-2 font-semibold">
          <span className="inline-flex items-center gap-2">
            <Check size={14} strokeWidth={1.5} className="text-success" aria-hidden="true" />
            {t('trust.verifiedSeller')}
          </span>
          <span className="inline-flex items-center gap-2">
            <Check size={14} strokeWidth={1.5} className="text-success" aria-hidden="true" />
            {t('trust.securePayment')}
          </span>
        </div>
      </div>
    );
  }

  return <SafetyTips />;
};
