import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useDragScroll = () => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = useCallback((e) => {
    if (!ref.current) return;
    setIsDragging(true);
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    ref.current.scrollLeft = scrollLeft.current - walk;
  }, [isDragging]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return { ref, isDragging, onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
};

export const PartDetailsTabs = ({
  description,
  specifications,
  compatibility,
  reviews,
  initialTab = 'description',
}) => {
  const { t } = useTranslation('part');
  const { ref: scrollRef, isDragging, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useDragScroll();
  
  const tabs = useMemo(() => [
    { key: 'description', label: t('tabs.description') },
    { key: 'specs', label: t('tabs.specs') },
    { key: 'compatibility', label: t('tabs.compatibility') },
    { key: 'reviews', label: t('tabs.reviews') },
  ], [t]);
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
        className="border-b border-border bg-card p-4"
        role="tablist"
        aria-label={t('tabs.ariaLabel')}
      >
        {/* Mobile: horizontal swipe (carousel). Desktop: segmented full width. */}
        <div
          ref={scrollRef}
          className={`scrollbar-hide w-full overflow-x-scroll ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} sm:cursor-default sm:overflow-hidden`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <div className="flex w-max min-w-full snap-x snap-mandatory rounded-xl border border-border bg-secondary/40">
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
                  // Swipeable tabs on small screens; segmented on sm+.
                  'snap-start whitespace-nowrap px-3 py-2 text-xs font-extrabold transition sm:flex-1 sm:px-4 sm:py-3 sm:text-sm',
                  withDivider ? 'sm:border-r sm:border-border' : '',
                  isActive
                    ? 'bg-foreground text-background shadow-[var(--shadow)]'
                    : 'bg-transparent text-foreground hover:bg-background/70',
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
      </div>

      <div className="p-6 text-foreground">{renderPanel()}</div>
    </section>
  );
};
