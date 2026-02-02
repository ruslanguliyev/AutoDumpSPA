import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import BackButton from '@/shared/ui/BackButton/BackButton';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import RatingStars from '@/shared/ui/RatingStars/RatingStars.jsx';
import { useFavoritesStore } from '@/shared/store/favoritesStore';
import { PartGallery } from '@/parts/components/part-details/PartGallery';
import { PartPurchaseCard } from '@/parts/components/part-details/PartPurchaseCard';
import { PartDetailsTabs } from '@/parts/components/part-details/PartDetailsTabs';
import { usePartDetails } from '@/parts/hooks/usePartDetails';
import { useTranslation } from 'react-i18next';

const Row = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-6 border-b border-dashed border-border pb-2">
    <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    <span className="text-sm font-bold text-foreground">{value}</span>
  </div>
);

export default function PartDetailsPage() {
  const { t } = useTranslation(['part', 'common']);
  const { id } = useParams();
  const { data: part, isLoading, error } = usePartDetails(id);

  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorited = useFavoritesStore((s) =>
    part?.id ? s.isFavorited('part', part.id) : false
  );

  const ratingValue = Number.isFinite(part?.rating) ? part.rating : 0;
  const reviewsCount = Number.isFinite(part?.reviewsCount) ? part.reviewsCount : 0;

  const compatibilityList = useMemo(() => {
    const list = Array.isArray(part?.compatibility) ? part.compatibility : [];
    return list.filter(Boolean);
  }, [part?.compatibility]);

  const breadcrumbs = [
    { label: t('nav.home', { ns: 'common' }), to: '/' },
    { label: t('nav.parts', { ns: 'common' }), to: '/parts' },
    ...(part?.name ? [{ label: part.name }] : []),
  ];

  if (isLoading) {
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[1280px] space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {t('details.loadingDetails', { ns: 'part' })}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[1280px] space-y-6">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
            {t('details.failedToLoad', { ns: 'part' })} {message ? <span>{message}</span> : null}
          </div>
          <BackButton fallback="/parts" />
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[1280px] space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {t('details.notFound', { ns: 'part' })}
          </div>
          <BackButton fallback="/parts" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* LEFT */}
          <div className="space-y-6">
            <Breadcrumbs items={breadcrumbs} />
            <div className="flex items-center justify-between gap-3">
            </div>

            <PartGallery part={part} />

            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">
                    {part.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="rounded-full px-3 py-1 text-xs font-bold bg-primary text-primary-foreground">
                      {part.category}
                    </span>
                    <span className="text-xs font-semibold">
                      {t('details.brandLabel', { ns: 'part' })}: <span className="text-foreground">{part.brand}</span>
                    </span>
                    {part.oemCode ? (
                      <span className="text-xs font-semibold">
                        {t('details.oemLabel', { ns: 'part' })}: <span className="font-mono text-foreground">{part.oemCode}</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="inline-flex items-center gap-2">
                    <RatingStars value={ratingValue} count={reviewsCount} />
                  </div>
                  {reviewsCount > 0 ? (
                    <div className="mt-1 text-xs font-semibold text-muted-foreground">
                      {t('details.reviewsCount', { ns: 'part', count: reviewsCount })}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs font-semibold text-muted-foreground">
                      {t('details.noReviewsYet', { ns: 'part' })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <PartDetailsTabs
                  initialTab="specs"
                  description={
                    part.description ? (
                      <p className="whitespace-pre-line text-sm leading-6 text-foreground">
                        {part.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('details.noDescription', { ns: 'part' })}</p>
                    )
                  }
                  specifications={
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:divide-x md:divide-border">
                      <div className="space-y-6 md:pr-10">
                        <div className="text-center text-base font-extrabold">{t('details.mainInfo', { ns: 'part' })}</div>
                        <div className="space-y-4">
                          <Row label={t('details.article', { ns: 'part' })} value={part.oemCode || '—'} />
                          <Row
                            label={t('details.condition', { ns: 'part' })}
                            value={
                              part.condition
                                ? (() => {
                                    const lower = part.condition.toLowerCase();
                                    if (lower === 'new') return t('filter.new', { ns: 'part' });
                                    if (lower === 'used') return t('filter.used', { ns: 'part' });
                                    if (lower === 'refurbished') return t('filter.refurbished', { ns: 'part' });
                                    return part.condition;
                                  })()
                                : '—'
                            }
                          />
                          <Row
                            label={t('details.availability', { ns: 'part' })}
                            value={part.stock > 0 ? t('details.inStock', { ns: 'part' }) : t('details.outOfStock', { ns: 'part' })}
                          />
                          <Row label={t('details.location', { ns: 'part' })} value={part.location || '—'} />
                        </div>
                      </div>

                      <div className="space-y-6 md:pl-10">
                        <div className="text-center text-base font-extrabold">{t('details.compatibilityTitle', { ns: 'part' })}</div>
                        <div className="space-y-4">
                          <Row label={t('details.make', { ns: 'part' })} value={part.brand || '—'} />
                          <Row label={t('details.model', { ns: 'part' })} value={part.model || '—'} />
                          <Row
                            label={t('details.fits', { ns: 'part' })}
                            value={
                              compatibilityList.length
                                ? t('details.variantsCount', { ns: 'part', count: compatibilityList.length })
                                : '—'
                            }
                          />
                          <Row
                            label={t('buttons.viewMore', { ns: 'common' })}
                            value={
                              <Link to="/parts" className="underline">
                                {t('details.browseParts', { ns: 'part' })}
                              </Link>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  }
                  compatibility={
                    compatibilityList.length ? (
                      <ul className="mx-auto grid w-full max-w-[520px] list-none grid-cols-1 gap-3 p-0 md:max-w-none md:grid-cols-2">
                        {compatibilityList.map((item) => (
                          <li
                            key={item}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-center text-sm font-semibold"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">{t('details.compatibilityNotAvailable', { ns: 'part' })}</p>
                    )
                  }
                  reviews={
                    <div className="space-y-2">
                      <div className="text-sm font-extrabold">{t('details.reviewsNotAvailableTitle', { ns: 'part' })}</div>
                      <p className="text-muted-foreground">
                        {t('details.reviewsNotAvailableBody', { ns: 'part' })}
                      </p>
                    </div>
                  }
                />
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <PartPurchaseCard
              part={part}
              isFavorited={isFavorited}
              onToggleFavorite={() =>
                toggleFavorite({
                  type: 'part',
                  id: part.id,
                  title: part.name,
                  thumbnail: part.imageUrl,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
