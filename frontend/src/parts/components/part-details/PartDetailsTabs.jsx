import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const PartDetailsTabs = ({
  description,
  specifications,
  compatibility,
  reviews,
  initialTab = 'description',
}) => {
  const { t } = useTranslation('part');
  const tabs = useMemo(
    () => [
      { key: 'description', label: t('tabs.description') },
      { key: 'specs', label: t('tabs.specs') },
      { key: 'compatibility', label: t('tabs.compatibility') },
      { key: 'reviews', label: t('tabs.reviews') },
    ],
    [t],
  );
  const [active, setActive] = useState(initialTab);

  const panel =
    active === 'description'
      ? description
      : active === 'specs'
        ? specifications
        : active === 'compatibility'
          ? compatibility
          : reviews;

  return (
    <div className="mt-6">
      <div className="-mx-4 overflow-x-auto border-b border-border sm:-mx-5" role="tablist" aria-label={t('tabs.ariaLabel')}>
        <div className="flex w-max min-w-full">
          {tabs.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={[
                  'min-h-11 shrink-0 whitespace-nowrap border-b-2 px-4 text-[14px] font-semibold',
                  isActive
                    ? 'border-primary text-primary-text'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                ].join(' ')}
                onClick={() => setActive(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="pt-4 text-foreground">{panel}</div>
    </div>
  );
};
