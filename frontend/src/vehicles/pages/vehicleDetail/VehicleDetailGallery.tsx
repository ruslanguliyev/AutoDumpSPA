import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const MediaCarousel = lazy(() => import('@/shared/ui/MediaCarousel/MediaCarousel'));

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  type: string;
};

type Props = {
  items: GalleryItem[];
  ariaLabel: string;
};

export function VehicleDetailGallery({ items, ariaLabel }: Props) {
  const { t } = useTranslation('vehicle');

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
        items={items}
        ariaLabel={ariaLabel}
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

export default VehicleDetailGallery;
