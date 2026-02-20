import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import SpecialistBadge from '@/specialists/components/SpecialistBadge';
import SpecialistHeader from '@/specialists/components/SpecialistHeader';
import { useSpecialistBySlug } from '@/specialists/hooks/useSpecialists';
import { useSpecialistServices } from '@/specialists/hooks/useSpecialistServices';
import ServiceCard from '@/services/components/ServiceCard';
import type { SupportedVehicle } from '@/specialists/types/specialist.types';

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
    {label}
  </div>
);

const formatVehicle = (vehicle: SupportedVehicle) => {
  const yearFrom = vehicle.yearFrom ?? null;
  const yearTo = vehicle.yearTo ?? null;
  const yearLabel =
    yearFrom && yearTo ? `${yearFrom}-${yearTo}` : yearFrom ? `${yearFrom}+` : yearTo ? `≤${yearTo}` : '';
  return `${vehicle.brand} ${vehicle.model}${yearLabel ? ` (${yearLabel})` : ''}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const SpecialistDetailPage = () => {
  const { t } = useTranslation('specialists');
  const { slug } = useParams();
  const { specialist, isLoading, error } = useSpecialistBySlug(slug);
  const {
    services,
    primaryService,
    isLoading: servicesLoading,
    error: servicesError,
  } = useSpecialistServices(specialist?.id);

  const sortedReviews = useMemo(() => {
    if (!specialist?.reviews) return [];
    return [...specialist.reviews].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [specialist?.reviews]);

  if (isLoading) {
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[1280px] space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {t('detail.loading')}
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
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
            {t('detail.errorFailed')} {message ? <span>{message}</span> : null}
          </div>
        </div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[1280px] space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {t('detail.notFound')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <SpecialistHeader
          specialist={specialist}
          city={primaryService?.location?.city ?? null}
        />

        <SectionCard title={t('detail.description')}>
          {specialist.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{specialist.description}</p>
          ) : (
            <EmptyState label={t('detail.empty.description')} />
          )}
        </SectionCard>

        <SectionCard title={t('detail.specializations')}>
          {specialist.specializations?.length ? (
            <div className="flex flex-wrap gap-2">
              {specialist.specializations.map((item) => (
                <SpecialistBadge key={item} label={t(`specializations.${item}`)} />
              ))}
            </div>
          ) : (
            <EmptyState label={t('detail.empty.specializations')} />
          )}
        </SectionCard>

        <SectionCard title={t('detail.supportedVehicles')}>
          {specialist.supportedVehicles?.length ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {specialist.supportedVehicles.map((vehicle, index) => (
                <li key={`${vehicle.brand}-${vehicle.model}-${index}`} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{formatVehicle(vehicle)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label={t('detail.empty.supportedVehicles')} />
          )}
        </SectionCard>

        <SectionCard title={t('detail.services')}>
          {servicesLoading ? (
            <div className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
              {t('detail.servicesLoading')}
            </div>
          ) : servicesError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-6 text-sm text-destructive">
              {t('detail.servicesError')}
            </div>
          ) : services.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <EmptyState label={t('detail.empty.services')} />
          )}
        </SectionCard>

        <SectionCard title={t('detail.portfolio')}>
          {specialist.portfolio?.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specialist.portfolio.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="overflow-hidden rounded-xl border border-border bg-muted"
                >
                  <img src={image} alt={`${specialist.name} ${index + 1}`} className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label={t('detail.empty.portfolio')} />
          )}
        </SectionCard>

        <SectionCard title={t('detail.reviews')}>
          {sortedReviews.length ? (
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-foreground">
                      <Star size={14} className="text-warning" aria-hidden="true" />
                      <span className="font-medium">{review.rating}</span>
                    </span>
                    <span>{review.authorName || t('detail.reviewsAnonymous')}</span>
                    {review.createdAt ? <span>· {formatDate(review.createdAt)}</span> : null}
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label={t('detail.empty.reviews')} />
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default SpecialistDetailPage;
