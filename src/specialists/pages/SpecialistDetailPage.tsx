import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import Skeleton from '@/shared/ui/Skeleton';
import SpecialistHero from '@/specialists/components/SpecialistHero';
import SpecialistSidebarCard from '@/specialists/components/SpecialistSidebarCard';
import SpecialistGallery from '@/specialists/components/SpecialistGallery';
import SpecialistHighlights from '@/specialists/components/SpecialistHighlights';
import SpecialistCertifications from '@/specialists/components/SpecialistCertifications';
import SpecialistReviewsPreview from '@/specialists/components/SpecialistReviewsPreview';
import { useSpecialistBySlug } from '@/specialists/hooks/useSpecialists';
import { useSpecialistServices } from '@/specialists/hooks/useSpecialistServices';

const SimilarSpecialistsSection = lazy(
  () => import('@/specialists/components/SimilarSpecialistsSection')
);

const DetailSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-56 w-full rounded-2xl" />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_360px]">
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  </div>
);

const SpecialistDetailPage = () => {
  const { t } = useTranslation('specialists');
  const { slug } = useParams<{ slug: string }>();

  const { specialist, isLoading, error } = useSpecialistBySlug(slug);

  const {
    services: _services,
    primaryService,
    isLoading: servicesLoading,
  } = useSpecialistServices(specialist?.id);

  const isPageLoading = isLoading || servicesLoading;

  if (isPageLoading && !specialist) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10">
        <DetailSkeleton />
      </div>
    );
  }

  if (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
          {t('detail.errorFailed')}
          {message ? <span className="ml-1">{message}</span> : null}
        </div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          {t('detail.notFound')}
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: t('title'), to: '/specialists' },
    { label: specialist.name },
  ];

  const primarySpecialization = specialist.specializations?.[0] ?? null;
  const certifications = specialist.certifications ?? [];
  const reviews = specialist.reviews ?? [];
  const portfolio = specialist.portfolio ?? [];
  const reviewsCount = Number.isFinite(specialist.reviewsCount)
    ? Number(specialist.reviewsCount)
    : reviews.length;

  return (
    <div className="w-full bg-background pb-16" data-theme="light">
      <div className="mx-auto w-full max-w-[1280px] px-4 pt-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="mx-auto w-full max-w-[1280px] space-y-8 px-4 pt-5">
        {/* Two-column grid: main content left, sticky sidebar right */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_360px] lg:gap-8">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">
            <SpecialistHero specialist={specialist} />

            {portfolio.length > 0 ? (
              <SpecialistGallery portfolio={portfolio} altPrefix={specialist.name} />
            ) : null}

            <SpecialistHighlights
              description={specialist.description}
              rating={specialist.rating}
              reviewsCount={specialist.reviewsCount}
            />

            {certifications.length > 0 ? (
              <SpecialistCertifications certifications={certifications} />
            ) : null}

            <SpecialistReviewsPreview reviews={reviews} totalCount={reviewsCount} />
          </div>

          {/* ── RIGHT COLUMN (sticky) ── */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <SpecialistSidebarCard specialist={specialist} primaryService={primaryService} />
          </aside>
        </div>

        {/* Similar specialists — lazy loaded */}
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
          <SimilarSpecialistsSection
            currentId={specialist.id}
            specialization={primarySpecialization}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default SpecialistDetailPage;
