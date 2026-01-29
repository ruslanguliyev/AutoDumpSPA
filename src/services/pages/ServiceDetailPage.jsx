import { useParams } from 'react-router-dom';
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
  const { idOrSlug } = useParams();
  const { service, isLoading, error } = useService(idOrSlug);

  const ratingValue = Number.isFinite(service?.rating) ? service.rating : 0;
  const reviewsCount = Number.isFinite(service?.reviewsCount) ? service.reviewsCount : 0;

  const breadcrumbs = [
    { label: 'Home', to: '/' },
    ...(service?.location?.city ? [{ label: service.location.city }] : []),
    { label: 'Services', to: '/services' },
    ...(service?.name ? [{ label: service.name }] : []),
  ];

  if (isLoading) {
    return (
      <div className="w-full px-4 py-10">
        <div className="mx-auto w-full max-w-[1280px] space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading service details…
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
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Failed to load service. {message ? <span>{message}</span> : null}
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Service not found.
          </div>
          <BackButton fallback="/services" />
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail-page w-full px-4 py-10">
      <div className="mx-auto w-full max-w-[1280px]">
        <Breadcrumbs items={breadcrumbs} />

        <ServiceHeader
          service={service}
          ratingValue={ratingValue}
          reviewsCount={reviewsCount}
        />

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
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
