import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAutoDetails } from '@/vehicles/hooks/useAutoDetails';
import { ROUTES, withLang } from '@/shared/constants/routes';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import { useSpecialistsQuery } from '@/specialists/hooks/useSpecialists';
import { useFavoritesStore } from '@/shared/store/favoritesStore';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import {
  DetailLayout,
  PromoteShortcuts,
  SafetyTips,
} from '@/shared/blocks';
import { ContactSellerForm } from '@/features/inquiries/components/ContactSellerForm';
import { ReportListingForm } from '@/features/moderation/components/ReportListingForm';
import { RentalBookingCard } from '@/features/rentals/components/RentalBookingCard';
import { useTrackView } from '@/features/promotions/hooks/usePromotions';

import { VehicleDetailGallery } from './VehicleDetailGallery';
import { VehicleDetailSummary } from './VehicleDetailSummary';
import { VehicleDetailSpecs } from './VehicleDetailSpecs';
import { VehicleDetailMechanics } from './VehicleDetailMechanics';
import { VehicleDetailSellerSidebar } from './VehicleDetailSellerSidebar';
import { buildVehicleMobileBar } from './VehicleDetailMobileBar';

export default function VehicleDetail() {
  const { t } = useTranslation(['vehicle', 'sellers', 'dashboard']);
  const { language } = useLanguageSync();
  const { id } = useParams();
  const { data: car, isLoading } = useAutoDetails(id);
  const title = car ? [car.brand, car.model, car.year].filter(Boolean).join(' ') : null;
  useDocumentTitle(title);
  useTrackView('LISTING', car?.listingId ?? undefined);

  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => (car ? s.isFavorited('vehicle', car.id) : false));

  const [phoneVisible, setPhoneVisible] = useState(false);

  const vehicleFilters = useMemo(
    () => ({
      brand: car?.brand ?? null,
      model: car?.model ?? null,
      year: car?.year ? Number(car.year) : null,
    }),
    [car?.brand, car?.model, car?.year],
  );

  const {
    specialists: matchingSpecialists,
    isLoading: isMatchingLoading,
    error: matchingError,
  } = useSpecialistsQuery(vehicleFilters, { enabled: Boolean(car) });

  const topSpecialists = useMemo(() => {
    if (!matchingSpecialists?.length) return [];
    return [...matchingSpecialists]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }, [matchingSpecialists]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 text-[15px] text-muted-foreground">{t('gallery.loadingImages')}</div>
    );
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 text-[15px] text-muted-foreground">{t('details.notFound')}</div>
    );
  }

  const isRent = car.purpose === 'RENT';
  const media = (Array.isArray(car.image) ? car.image : [])
    .filter(Boolean)
    .map((src, index) => ({
      id: `${car.id}-${index}`,
      src,
      alt: `${car.brand} ${car.model} ${index + 1}`,
      type: 'image',
    }));

  const breadcrumbs = [
    { label: t('breadcrumbs.home'), to: withLang(ROUTES.home, language) },
    { label: t('breadcrumbs.cars'), to: withLang(ROUTES.cars, language) },
    { label: [car.brand, car.model].filter(Boolean).join(' ') },
  ];

  const sellerPhone = car.seller?.phone?.trim() || null;

  const onToggleFavorite = () => {
    toggleFavorite({
      type: 'vehicle',
      id: car.id,
      title: `${car.brand} ${car.model}`,
      thumbnail: Array.isArray(car.image) ? car.image[0] : car.image,
    });
  };

  const hasBooking = isRent && Boolean(car.listingId && car.rental);
  const mobileBar = buildVehicleMobileBar({
    t,
    hasContactForm: Boolean(car.listingId && (hasBooking || !isRent)),
    hasBooking,
    phone: sellerPhone,
    phoneVisible,
    onRevealPhone: () => setPhoneVisible(true),
    isFavorite,
    onToggleFavorite,
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6">
      <DetailLayout
        mobileBar={mobileBar}
        main={
          <div className="flex flex-col gap-6">
            <Breadcrumbs items={breadcrumbs} />
            <VehicleDetailGallery
              items={media}
              ariaLabel={t('gallery.galleryAria', { name: `${car.brand} ${car.model}` })}
            />
            <VehicleDetailSummary
              title={[car.brand, car.model].filter(Boolean).join(' ')}
              year={car.year}
              mileage={car.mileage}
              fuel={car.fuel}
              transmission={car.transmission}
              engine={car.engine}
              engineVolume={car.engineVolume}
              power={car.power}
              price={car.price}
              currency={car.currency ?? 'AZN'}
              priceSuffix={isRent ? t('card.perDay') : undefined}
            />
            <VehicleDetailSpecs car={car} />
            <VehicleDetailMechanics
              specialists={topSpecialists}
              isLoading={isMatchingLoading}
              isError={Boolean(matchingError)}
            />
          </div>
        }
        sidebar={
          <div className="flex flex-col gap-4">
            <VehicleDetailSellerSidebar
              seller={car.seller}
              location={car.location}
              showPhone={Boolean(sellerPhone)}
              phoneVisible={phoneVisible}
              onTogglePhone={() => setPhoneVisible((v) => !v)}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              barCarriesFavorite={Boolean(mobileBar)}
              barCarriesPhone={Boolean(mobileBar) && !hasBooking}
            />
            {isRent ? <RentalBookingCard car={car} /> : null}
            {!isRent ? (
              <div id="contact-seller" className="scroll-mt-24">
                <ContactSellerForm listingId={car.listingId} />
              </div>
            ) : null}
            <PromoteShortcuts targetType="LISTING" targetId={car.listingId} />
            <ReportListingForm listingId={car.listingId} />
            <SafetyTips />
          </div>
        }
      />
    </div>
  );
}
