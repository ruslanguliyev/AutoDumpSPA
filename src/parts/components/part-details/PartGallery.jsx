import { lazy, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const MediaCarousel = lazy(() => import('@/shared/ui/MediaCarousel/MediaCarousel'));

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

export const PartGallery = ({ part }) => {
  const { t } = useTranslation('part');
  const media = useMemo(() => {
    const images = toArray(part?.image?.length ? part.image : part?.imageUrl);
    const fallbackAlt = part?.name ? `${part.name}` : 'Part image';
    return images.map((src, index) => ({
      id: `${part?.id ?? 'part'}-${index}`,
      src,
      alt: `${fallbackAlt} ${index + 1}`,
      type: 'image',
    }));
  }, [part]);

  if (media.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        {t('gallery.noImages')}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <Suspense
        fallback={
          <div className="rounded-xl bg-secondary p-6 text-sm font-semibold text-muted-foreground">
            {t('gallery.loadingImages')}
          </div>
        }
      >
        <MediaCarousel
          items={media}
          ariaLabel={t('gallery.ariaLabel', { name: part?.name ?? 'Part' })}
          viewportClassName="!flex !items-center !justify-center !bg-background !h-[320px] md:!h-[420px]"
          mediaClassName="!object-contain !max-h-full !max-w-full !w-auto !mx-auto"
          thumbnailsClassName="!justify-start"
        />
      </Suspense>
    </section>
  );
};
