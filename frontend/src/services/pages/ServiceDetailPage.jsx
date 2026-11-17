import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { DetailLayout, PromoteShortcuts } from '@/shared/blocks';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { useService } from '@/services/hooks/useService';
import { membershipsEnabled } from '@/memberships/config';
import { useServiceSpecialists } from '@/services/hooks/useServiceSpecialists';
import ServiceHeader from '@/services/components/ServiceHeader';
import ServiceGallery from '@/services/components/ServiceGallery';
import FullPriceList from '@/services/components/FullPriceList';
import BrandsServiced from '@/services/components/BrandsServiced';
import ServiceSidebar from '@/services/components/ServiceSidebar';
import SpecialistCard from '@/specialists/components/SpecialistCard';
import { useTrackView } from '@/features/promotions/hooks/usePromotions';
import { buildServiceMobileBar } from '@/services/pages/serviceDetail/ServiceDetailMobileBar';

export default function ServiceDetailPage() {
  const { t } = useTranslation('services');
  const { idOrSlug } = useParams();
  const { service, isLoading, error } = useService(idOrSlug);
  useTrackView('SERVICE_CENTER', service?.id);
  useDocumentTitle(service?.name);
  const {
    specialists,
    isLoading: specialistsLoading,
    error: specialistsError,
  } = useServiceSpecialists(service?.id);

  const reviewsCount = Number.isFinite(service?.reviewsCount) ? service.reviewsCount : 0;
  const viewsCount = Number.isFinite(service?.viewsCount) ? service.viewsCount : null;
  const ratingValue = Number.isFinite(service?.rating) ? service.rating : null;

  const breadcrumbs = [
    { label: t('detail.breadcrumbs.home'), to: '/' },
    ...(service?.location?.city ? [{ label: service.location.city }] : []),
    { label: t('detail.breadcrumbs.services'), to: '/services' },
    ...(service?.name ? [{ label: service.name }] : []),
  ];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 text-[15px] text-muted-foreground">{t('detail.loading')}</div>
    );
  }

  if (error || !service) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 text-[15px] text-muted-foreground">{t('detail.notFound')}</div>
    );
  }

  const contacts = {
    phone: service.phone || service.contacts?.phone,
    whatsapp: service.whatsapp || service.contacts?.whatsapp,
    website: service.website || service.contacts?.website,
    email: service.contacts?.email,
  };

  const mobileBar = buildServiceMobileBar({
    t,
    phone: contacts.phone ?? null,
    whatsapp: contacts.whatsapp ?? null,
    bookingHref: '#service-booking',
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6">
      <DetailLayout
        mobileBar={mobileBar}
        main={
          <div className="flex flex-col gap-6">
            <Breadcrumbs items={breadcrumbs} />
            <ServiceHeader
              service={service}
              ratingValue={ratingValue}
              reviewsCount={reviewsCount}
              viewsCount={viewsCount}
            />
            <ServiceGallery media={service.media} serviceName={service.name} serviceId={service.id} />
            <FullPriceList services={service.services || []} />
            <BrandsServiced brands={service.supportedBrands} />
            {membershipsEnabled() ? (
              <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
                <h2 className="text-[17px] font-semibold text-foreground">{t('detail.specialists.title')}</h2>
                <div className="mt-4">
                  {specialistsLoading ? (
                    <p className="text-[15px] text-muted-foreground">{t('detail.specialists.loading')}</p>
                  ) : specialistsError ? (
                    <p className="text-[15px] text-muted-foreground">{t('detail.specialists.error')}</p>
                  ) : specialists.length ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {specialists.map((specialist) => (
                        <SpecialistCard key={specialist.id} specialist={specialist} />
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-[15px] text-muted-foreground">
                      {t('detail.specialists.empty')}
                    </p>
                  )}
                </div>
              </section>
            ) : null}
            <ReviewsSection targetType="SERVICE_CENTER" targetId={service.id} />
          </div>
        }
        sidebar={
          <div className="flex flex-col gap-4">
            <ServiceSidebar
              serviceId={service.id}
              accepting={service.isActive !== false}
              schedule={service.schedule}
              contacts={contacts}
              location={service.location}
            />
            <PromoteShortcuts targetType="SERVICE_CENTER" targetId={service.id} />
          </div>
        }
      />
    </div>
  );
}
