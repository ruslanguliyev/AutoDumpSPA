import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import Skeleton from '@/shared/ui/Skeleton';
import SpecialistHero from '@/specialists/components/SpecialistHero';
import SpecialistSidebarCard from '@/specialists/components/SpecialistSidebarCard';
import { DetailLayout, PromoteShortcuts } from '@/shared/blocks';
import { useTrackView } from '@/features/promotions/hooks/usePromotions';
import SpecialistGallery from '@/specialists/components/SpecialistGallery';
import SpecialistHighlights from '@/specialists/components/SpecialistHighlights';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { membershipsEnabled } from '@/memberships/config';
import { useSpecialistBySlug } from '@/specialists/hooks/useSpecialists';
import { useSpecialistServices } from '@/specialists/hooks/useSpecialistServices';
import { buildSpecialistMobileBar } from '@/specialists/pages/specialistDetail/SpecialistDetailMobileBar';
import { ROUTES, withLang } from '@/shared/constants/routes';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';

const SimilarSpecialistsSection = lazy(
  () => import('@/specialists/components/SimilarSpecialistsSection'),
);

const DetailSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-56 w-full rounded-2xl" />
    <Skeleton className="h-72 w-full rounded-2xl" />
  </div>
);

const SpecialistDetailPage = () => {
  const { t } = useTranslation(['specialists', 'common']);
  const { language } = useLanguageSync();
  const { slug } = useParams<{ slug: string }>();

  const { specialist, isLoading, error } = useSpecialistBySlug(slug);
  useTrackView('SPECIALIST', specialist?.id);
  useDocumentTitle(specialist?.name);

  const showMemberships = membershipsEnabled();
  const { primaryService, isLoading: servicesLoading } = useSpecialistServices(specialist?.id);

  const isPageLoading = isLoading || (showMemberships && servicesLoading);

  if (isPageLoading && !specialist) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !specialist) {
    return (
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 text-[15px] text-muted-foreground">
        {t('detail.notFound')}
      </div>
    );
  }

  const breadcrumbItems = [
    { label: t('nav.home', { ns: 'common' }), to: withLang(ROUTES.home, language) },
    { label: t('title'), to: withLang(ROUTES.specialists, language) },
    { label: specialist.name },
  ];

  const portfolio = specialist.portfolio ?? [];

  const mobileBar = buildSpecialistMobileBar({
    t,
    phone: specialist.phone ?? null,
    whatsapp: specialist.whatsapp ?? null,
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-4 flex flex-col gap-8">
        <DetailLayout
          mobileBar={mobileBar}
          main={
            <div className="flex flex-col gap-6 [overflow-wrap:anywhere]">
              <SpecialistHero specialist={specialist} />
              {portfolio.length > 0 ? (
                <SpecialistGallery portfolio={portfolio} altPrefix={specialist.name} />
              ) : null}
              <SpecialistHighlights
                description={specialist.description}
                rating={specialist.rating}
                reviewsCount={specialist.reviewsCount}
              />
              <ReviewsSection targetType="SPECIALIST" targetId={specialist.id} />
            </div>
          }
          sidebar={
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <SpecialistSidebarCard
                  specialist={specialist}
                  primaryService={showMemberships ? primaryService : null}
                />
              </div>
              <PromoteShortcuts targetType="SPECIALIST" targetId={specialist.id} />
            </div>
          }
        />

        <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
          <SimilarSpecialistsSection currentId={specialist.id} specialization={specialist.specializations?.[0] ?? null} />
        </Suspense>
      </div>
    </div>
  );
};

export default SpecialistDetailPage;
