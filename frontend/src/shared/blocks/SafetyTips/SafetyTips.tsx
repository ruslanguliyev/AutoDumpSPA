import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  className?: string;
};

/** Vehicle detail safety tips — shield icon and four bullets (design/pages.md). */
export function SafetyTips({ className = '' }: Props) {
  const { t } = useTranslation('common');

  const tips = [t('trust.safetyTip1'), t('trust.safetyTip2'), t('trust.safetyTip3'), t('trust.safetyTip4')];

  return (
    <section
      className={`rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] ${className}`.trim()}
    >
      <h3 className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
        <Shield size={18} strokeWidth={1.5} className="text-primary-text" aria-hidden="true" />
        {t('trust.safetyTips')}
      </h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-muted-foreground">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </section>
  );
}

export default SafetyTips;
