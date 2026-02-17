import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BackButton from '@/shared/ui/BackButton/BackButton';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { useService } from '@/services/hooks/useService';
import ServiceHeader from '@/services/components/ServiceHeader';
import ServiceGallery from '@/services/components/ServiceGallery';
import FullPriceList from '@/services/components/FullPriceList';
import BrandsServiced from '@/services/components/BrandsServiced';
import ReviewsPreview from '@/services/components/ReviewsPreview';
import ServiceSidebar from '@/services/components/ServiceSidebar';
import './ServiceDetailPage.scss';

export default function ServiceDetailPage() {
  const { t } = useTranslation('services');
  const { idOrSlug } = useParams();
  const { service, isLoading, error } = useService(idOrSlug);

  const ratingValue = Number.isFinite(service?.rating) ? service.rating : 0;
  const reviewsCount = Number.isFinite(service?.reviewsCount) ? service.reviewsCount : 0;

  const breadcrumbs = [
    { label: t('detail.breadcrumbs.home'), to: '/' },
    ...(service?.location?.city ? [{ label: service.location.city }] : []),
    { label: t('detail.breadcrumbs.services'), to: '/services' },
    ...(service?.name ? [{ label: service.name }] : []),
  ];

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
          <BackButton fallback="/services" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[1280px] space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {t('detail.notFound')}
          </div>
          <BackButton fallback="/services" />
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail-page w-full px-2 py-4 sm:px-4 sm:py-6 md:py-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <Breadcrumbs items={breadcrumbs} />

        <ServiceHeader
          service={service}
          ratingValue={ratingValue}
          reviewsCount={reviewsCount}
        />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-4 sm:space-y-6">
            <ServiceGallery media={service.media} serviceName={service.name} />
            <FullPriceList services={service.services || []} />
            <BrandsServiced brands={service.supportedBrands} />
            <ReviewsPreview
              ratingValue={ratingValue}
              reviewsCount={reviewsCount}
            />
          </div>

          {/* RIGHT COLUMN - STICKY SIDEBAR */}
          <ServiceSidebar
            schedule={service.schedule}
            contacts={service.contacts}
            location={service.location}
          />
        </div>
      </div>
    </div>
  );
}
