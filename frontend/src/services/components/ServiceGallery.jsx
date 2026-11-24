import { lazy, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const MediaCarousel = lazy(() => import('@/shared/ui/MediaCarousel/MediaCarousel'));

export default function ServiceGallery({ media, serviceName, serviceId }) {
  const { t } = useTranslation('services');

  const items = useMemo(() => {
    const urls = [media?.cover, ...(media?.gallery ?? [])].filter(Boolean);
    return urls.map((src, index) => ({
      id: `${serviceId ?? 'service'}-${index}`,
      src,
      alt: `${serviceName} ${index + 1}`,
      type: 'image',
    }));
  }, [media, serviceId, serviceName]);

  if (!items.length) return null;

  return (
    <Suspense
      fallback={
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-border bg-card-muted text-[15px] text-muted-foreground">
          {t('detail.loading')}
        </div>
      }
    >
      <MediaCarousel
        className="w-full"
        items={items}
        ariaLabel={t('detail.galleryAria', { name: serviceName })}
        showCounter
        showControls
        showThumbnails
        viewportClassName="aspect-video !rounded-2xl bg-card-muted"
        mediaClassName="aspect-video h-full w-full object-cover"
        thumbnailsClassName="!justify-start gap-2 px-0.5"
        thumbButtonClassName="!min-h-11 shrink-0 !opacity-100"
        thumbImageClassName="h-14 w-[4.5rem] rounded-[var(--radius)] object-cover"
      />
    </Suspense>
  );
}
