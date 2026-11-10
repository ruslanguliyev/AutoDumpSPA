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
    <section className="overflow-hidden rounded-2xl border border-border bg-card-muted">
      <Suspense
        fallback={
          <div className="rounded-xl bg-secondary p-6 text-sm font-semibold text-muted-foreground">
            {t('gallery.loadingImages')}
          </div>
        }
      >
        <MediaCarousel
          items={media}
          ariaLabel={t('gallery.ariaLabel', { name: part?.name ?? t('labels.part', { ns: 'common' }) })}
          viewportClassName="aspect-video bg-card-muted"
          mediaClassName="object-contain"
          showCounter={media.length > 1}
          thumbnailsClassName="px-2"
        />
      </Suspense>
    </section>
  );
};
