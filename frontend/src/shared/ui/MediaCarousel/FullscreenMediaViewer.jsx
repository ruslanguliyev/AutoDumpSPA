import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import Button from '@/shared/ui/button';

/** Round translucent control over a photo, 44×44. */
const overPhoto = 'border-0! bg-scrim! px-0 text-primary-foreground hover:brightness-125';

/** Full-screen lightbox: Esc closes, ←/→ browse, the backdrop closes, thumbnails jump. */
export default function FullscreenMediaViewer({ items, index, onClose, onPrev, onNext, onSelect }) {
  const { t } = useTranslation('common');
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  // Page behind must not scroll; focus lands on the close button.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const current = items[index];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-scrim backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      onClick={onClose}
    >
      <div className="grid h-dvh grid-rows-[auto_1fr_auto]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end p-2">
          <Button
            ref={closeRef}
            variant="icon"
            size="icon"
            className={overPhoto}
            onClick={onClose}
            aria-label={t('mediaViewer.close')}
          >
            <X size={24} aria-hidden="true" />
          </Button>
        </div>

        <div className="relative flex min-h-0 items-center justify-center overflow-hidden">
          {items.length > 1 ? (
            <Button
              variant="icon"
              size="icon"
              className={`${overPhoto} absolute left-2 top-1/2 z-10 -translate-y-1/2`}
              onClick={onPrev}
              aria-label={t('mediaViewer.prev')}
            >
              <ChevronLeft size={28} aria-hidden="true" />
            </Button>
          ) : null}

          <img src={current.src} alt={current.alt} className="max-h-full max-w-[90vw] object-contain" />

          {items.length > 1 ? (
            <Button
              variant="icon"
              size="icon"
              className={`${overPhoto} absolute right-2 top-1/2 z-10 -translate-y-1/2`}
              onClick={onNext}
              aria-label={t('mediaViewer.next')}
            >
              <ChevronRight size={28} aria-hidden="true" />
            </Button>
          ) : null}
        </div>

        <div className="flex justify-center gap-2.5 overflow-x-auto px-4 py-3">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`min-h-11 shrink-0 rounded-[var(--radius)] border-0 bg-transparent p-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                i === index ? 'opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
              onClick={() => onSelect(i)}
              aria-label={t('mediaViewer.showImage', { number: i + 1 })}
              aria-current={i === index ? 'true' : undefined}
            >
              <img src={item.src} alt="" className="h-[70px] w-[90px] rounded-md object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
