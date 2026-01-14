import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton/BackButton';
import RatingStars from '@/components/RatingStars/RatingStars.jsx';
import { useFavoritesStore } from '@/store/favoritesStore';
import { PartGallery } from '@/features/parts/part-details/ui/PartGallery';
import { PartPurchaseCard } from '@/features/parts/part-details/ui/PartPurchaseCard';
import { PartDetailsTabs } from '@/features/parts/part-details/ui/PartDetailsTabs';
import { usePartDetails } from '@/features/parts/part-details/hooks/usePartDetails';

const Row = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-6 border-b border-dashed border-border pb-2">
    <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    <span className="text-sm font-bold text-foreground">{value}</span>
  </div>
);

export default function PartDetailsPage() {
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

  if (isLoading) {
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[1280px] space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading part details…
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
            Failed to load part. {message ? <span>{message}</span> : null}
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
            Part not found.
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
            <div className="flex items-center justify-between gap-3">
              <BackButton fallback="/parts" />
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
                      Brand: <span className="text-foreground">{part.brand}</span>
                    </span>
                    {part.oemCode ? (
                      <span className="text-xs font-semibold">
                        OEM: <span className="font-mono text-foreground">{part.oemCode}</span>
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
                      {reviewsCount} reviews
                    </div>
                  ) : (
                    <div className="mt-1 text-xs font-semibold text-muted-foreground">
                      No reviews yet
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <PartDetailsTabs
                  description={
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:divide-x md:divide-border">
                      <div className="space-y-6 md:pr-10">
                        <div className="text-center text-base font-extrabold">Main info</div>
                        <div className="space-y-4">
                          <Row label="Article / OEM" value={part.oemCode || '—'} />
                          <Row label="Condition" value={part.condition || '—'} />
                          <Row
                            label="Availability"
                            value={part.stock > 0 ? 'In stock' : 'Out of stock'}
                          />
                          <Row label="Location" value={part.location || '—'} />
                        </div>
                      </div>

                      <div className="space-y-6 md:pl-10">
                        <div className="text-center text-base font-extrabold">Compatibility</div>
                        <div className="space-y-4">
                          <Row label="Make" value={part.brand || '—'} />
                          <Row label="Model" value={part.model || '—'} />
                          <Row
                            label="Fits"
                            value={
                              compatibilityList.length
                                ? `${compatibilityList.length} variants`
                                : '—'
                            }
                          />
                          <Row
                            label="More"
                            value={
                              <Link to="/parts" className="underline">
                                Browse parts
                              </Link>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  }
                  specifications={
                    <div className="space-y-4">
                      <Row label="Category" value={part.category || '—'} />
                      <Row label="Brand" value={part.brand || '—'} />
                      <Row label="Model" value={part.model || '—'} />
                      <Row label="Condition" value={part.condition || '—'} />
                      <Row label="OEM" value={part.oemCode || '—'} />
                    </div>
                  }
                  compatibility={
                    compatibilityList.length ? (
                      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {compatibilityList.map((item) => (
                          <li
                            key={item}
                            className="rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Compatibility list is not available.</p>
                    )
                  }
                  reviews={
                    <div className="space-y-2">
                      <div className="text-sm font-extrabold">Reviews</div>
                      <p className="text-muted-foreground">
                        Reviews are not available yet. (This section is ready for backend data.)
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


