import { ShieldCheck, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * TrustBlock component for displaying trust/safety information.
 * 
 * Props:
 * - variant: 'car' | 'part' (default: 'car')
 *   - 'car' → Safety Tips content
 *   - 'part' → Buyer Protection content
 */
export const TrustBlock = ({ variant = 'car' }) => {
  const { t } = useTranslation('common');

  if (variant === 'part') {
    // Buyer Protection variant (for parts)
    return (
      <div className="rounded-xl border border-border bg-secondary/10 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-extrabold text-foreground">
          <ShieldCheck size={16} className="text-primary" aria-hidden="true" />
          {t('trust.buyerProtection')}
        </div>
        <div className="mt-2 flex flex-col gap-2 font-semibold">
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-success" aria-hidden="true" />
            {t('trust.verifiedSeller')}
          </span>
          <span className="inline-flex items-center gap-2">
            <Check size={14} className="text-success" aria-hidden="true" />
            {t('trust.securePayment')}
          </span>
        </div>
      </div>
    );
  }

  // Safety Tips variant (for cars)
  const safetyTips = [
    t('trust.safetyTip1'),
    t('trust.safetyTip2'),
    t('trust.safetyTip3'),
    t('trust.safetyTip4'),
  ];

  return (
    <div className="safety-tips">
      <h3 className="section-title">
        <ShieldCheck size={18} aria-hidden="true" />
        {t('trust.safetyTips')}
      </h3>
      <ul>
        {safetyTips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </div>
  );
};
