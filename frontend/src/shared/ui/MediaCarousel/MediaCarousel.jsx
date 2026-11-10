import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import Button from '@/shared/ui/button';
import { ListingImagePlaceholder, ListingPhoto } from '@/shared/ui/ListingImagePlaceholder';
import FullscreenMediaViewer from './FullscreenMediaViewer';

const join = (...parts) => parts.filter(Boolean).join(' ');

/** Translucent arrow laid over a photo. 44×44, tokens only. */
const arrowClass =
  'absolute top-1/2 -translate-y-1/2 border-0! bg-scrim! px-0 text-primary-foreground hover:brightness-125';

/**
 * Photo gallery: main image (click opens the lightbox), arrows, counter, thumbnails, swipe.
 * The `*ClassName` props let a page size the viewport and the thumbnails.
 */
export default function MediaCarousel({
  items,
  ariaLabel = 'Media carousel',
  showControls = true,
  showThumbnails = true,
  showCounter = false,
  className,
  viewportClassName,
  mediaClassName,
  thumbnailsClassName,
  thumbButtonClassName,
  thumbImageClassName,
}) {
  const { t } = useTranslation('common');
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartX = useRef(null);

  const safeItems = items?.length ? items : [];
  const current = safeItems[index];

  const goTo = (i) => setIndex(i);

  const prev = useCallback(() => {
    setIndex((i) => (i === 0 ? safeItems.length - 1 : i - 1));
  }, [safeItems.length]);

  const next = useCallback(() => {
    setIndex((i) => (i === safeItems.length - 1 ? 0 : i + 1));
  }, [safeItems.length]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  if (!safeItems.length) {
    return (
      <section className={join('w-full', className)} aria-label={ariaLabel}>
        <div
          className={join(
            'relative flex items-center justify-center overflow-hidden rounded-xl',
            viewportClassName,
          )}
        >
          <ListingImagePlaceholder className="aspect-video rounded-xl" />
        </div>
      </section>
    );
  }

  return (
    <section
      className={join('w-full', className)}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div
        className={join('relative overflow-hidden rounded-xl', viewportClassName)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className={join('block h-full w-full cursor-zoom-in', mediaClassName)}
          onClick={() => setIsFullscreen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsFullscreen(true);
          }}
          role="button"
          tabIndex={0}
        >
          <ListingPhoto
            src={current.src}
            className="block h-full w-full object-cover"
            loading="eager"
          />
        </div>

        {showControls && safeItems.length > 1 && (
          <>
            <Button
              variant="icon"
              size="icon"
              className={join(arrowClass, 'left-2.5')}
              onClick={prev}
              aria-label={t('mediaViewer.prev')}
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </Button>
            <Button
              variant="icon"
              size="icon"
              className={join(arrowClass, 'right-2.5')}
              onClick={next}
              aria-label={t('mediaViewer.next')}
            >
              <ChevronRight size={24} aria-hidden="true" />
            </Button>
          </>
        )}

        {showCounter ? (
          <span
            className="pointer-events-none absolute bottom-3 right-3 rounded-[var(--radius)] bg-background/85 px-2.5 py-1 text-[13px] font-semibold tabular-nums text-foreground backdrop-blur"
            aria-live="polite"
          >
            {index + 1} / {safeItems.length}
          </span>
        ) : null}
      </div>

      {showThumbnails && (
        <div className={join('flex justify-center gap-2 overflow-x-auto py-2', thumbnailsClassName)}>
          {safeItems.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={join(
                'min-h-11 shrink-0 rounded-[var(--radius)] border-0 bg-transparent p-0 transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                i === index ? 'opacity-100' : 'opacity-60 hover:opacity-85',
                thumbButtonClassName,
              )}
              onClick={() => goTo(i)}
              aria-label={t('mediaViewer.showImage', { number: i + 1 })}
              aria-current={i === index ? 'true' : undefined}
            >
              <ListingPhoto
                src={item.src}
                className={join('h-[60px] w-20 rounded-md object-cover', thumbImageClassName)}
              />
            </button>
          ))}
        </div>
      )}

      {isFullscreen && (
        <FullscreenMediaViewer
          items={items}
          index={index}
          onClose={() => setIsFullscreen(false)}
          onPrev={prev}
          onNext={next}
          onSelect={goTo}
        />
      )}
    </section>
  );
}
