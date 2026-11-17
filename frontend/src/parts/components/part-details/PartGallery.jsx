import { lazy, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const MediaCarousel = lazy(() => import('@/shared/ui/MediaCarousel/MediaCarousel'));

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

export const PartGallery = ({ part }) => {
  const { t } = useTranslation(['part', 'common']);
  const media = useMemo(() => {
    const images = toArray(part?.image?.length ? part.image : part?.imageUrl);
    const fallbackAlt = part?.name ? `${part.name}` : t('gallery.fallbackAlt', { ns: 'part' });
    return images.map((src, index) => ({
      id: `${part?.id ?? 'part'}-${index}`,
      src,
      alt: `${fallbackAlt} ${index + 1}`,
      type: 'image',
    }));
  }, [part, t]);

  return (
    <Suspense
      fallback={
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-border bg-card-muted text-[15px] text-muted-foreground">
          {t('gallery.loadingImages')}
        </div>
      }
    >
      <MediaCarousel
        className="w-full"
        items={media}
        ariaLabel={t('gallery.ariaLabel', { name: part?.name ?? t('labels.part', { ns: 'common' }) })}
        showCounter
        showControls
        showThumbnails
        viewportClassName="aspect-video !rounded-2xl bg-card-muted"
        mediaClassName="aspect-video h-full w-full object-contain"
        thumbnailsClassName="!justify-start gap-2 px-0.5"
        thumbButtonClassName="!min-h-11 shrink-0 !opacity-100"
        thumbImageClassName="h-14 w-[4.5rem] rounded-[var(--radius)] object-contain"
      />
    </Suspense>
  );
};
