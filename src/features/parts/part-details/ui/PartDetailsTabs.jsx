import { useMemo, useState } from 'react';

const DEFAULT_TABS = [
  { key: 'description', label: 'Description' },
  { key: 'specs', label: 'Specifications' },
  { key: 'compatibility', label: 'Compatibility' },
  { key: 'reviews', label: 'Reviews' },
];

export const PartDetailsTabs = ({
  description,
  specifications,
  compatibility,
  reviews,
  initialTab = 'description',
}) => {
  const tabs = useMemo(() => DEFAULT_TABS, []);
  const [active, setActive] = useState(initialTab);

  const renderPanel = () => {
    if (active === 'description') return description;
    if (active === 'specs') return specifications;
    if (active === 'compatibility') return compatibility;
    if (active === 'reviews') return reviews;
    return null;
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div
        className="border-b border-border bg-secondary/40 p-4"
        role="tablist"
        aria-label="Part details sections"
      >
        <div className="flex w-full overflow-hidden rounded-xl border border-border bg-background">
          {tabs.map((tab, index) => {
            const isActive = tab.key === active;
            const withDivider = index !== tabs.length - 1;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={[
                  // Mobile-friendly: prevent overflow by allowing flex items to shrink
                  // and truncating long labels (e.g. "Compatibility").
                  'min-w-0 flex-1 truncate whitespace-nowrap px-2 py-2 text-xs font-extrabold transition sm:px-2 sm:text-sm',
                  withDivider ? 'border-r border-border' : '',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/60 text-foreground hover:bg-accent',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActive(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 text-foreground">{renderPanel()}</div>
    </section>
  );
};


