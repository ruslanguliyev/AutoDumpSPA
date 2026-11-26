import { useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

import { useSellerListings } from '@/sellers/hooks/useSellerListings';
import { useSellerById } from '@/sellers/hooks/useSellerById';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useFavoritesStore } from '@/shared/store/favoritesStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { useDebounce } from '@/shared/hooks/useDebounce';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { Badge } from '@/shared/ui/Badge';
import Button from '@/shared/ui/button';
import { Input } from '@/shared/ui/Input';
import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard';
import PartCard from '@/parts/components/PartCard/PartCard';
import { ProfileHeader, ShareButton } from '@/shared/blocks';
import { formatMonthYear, formatNumber, intlLocale } from '@/lib/format';
import { hasPublicSellerPage, normalizeSellerType } from '@/shared/utils/sellerType';

const Shell = ({ children }) => (
  <div className="mx-auto w-full max-w-[1280px] px-4 py-6">{children}</div>
);

const stockGridClass =
  'grid list-none grid-cols-1 gap-4 sm:grid-cols-2 stock:grid-cols-4';

export default function SellerDetailPage({
  vehicles: vehiclesProp,
  parts: partsProp,
  isLoading: isLoadingProp = false,
  error: errorProp = null,
} = {}) {
  const { t, i18n } = useTranslation(['sellers', 'common']);
  const locale = intlLocale(i18n.language);
  const params = useParams();
  const sellerId = String(params?.sellerId ?? '').trim();

  const hasExternalData = vehiclesProp !== undefined || partsProp !== undefined;
  const loaded = useSellerListings(sellerId, { enabled: !hasExternalData && Boolean(sellerId) });
  const vehicles = vehiclesProp ?? loaded.vehicles;
  const parts = partsProp ?? loaded.parts;
  const { data: seller, isLoading: sellerProfileLoading, error: sellerError } = useSellerById(sellerId);
  const isLoading = isLoadingProp || loaded.isLoading || sellerProfileLoading;
  const error = errorProp ?? loaded.error ?? sellerError;

  const [activeTab, setActiveTab] = useState('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneVisible, setPhoneVisible] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 350);

  useDocumentTitle(
    seller && !hasPublicSellerPage(seller.type) ? t('detail.profileUnavailable') : seller?.name,
  );

  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => (seller ? s.isFavorited('seller', seller.id) : false));
  const viewerId = useAuthStore((s) => s.user?.id);

  const ratingValue = Number.isFinite(Number(seller?.rating)) ? Number(seller.rating) : null;
  const reviewsCount = Number.isFinite(Number(seller?.votes ?? seller?.reviewsCount))
    ? Number(seller.votes ?? seller.reviewsCount)
    : null;
  const city = typeof seller?.city === 'string' && seller.city.trim() ? seller.city.trim() : null;
  const listingsCount = Number.isFinite(seller?.listingsCount) ? seller.listingsCount : null;
  const memberSince = formatMonthYear(seller?.createdAt ?? seller?.memberSince, locale) || null;
  const typeKey = normalizeSellerType(seller?.type);
  const isPartsSeller = typeKey === 'parts';
  const phone = seller?.phone?.trim() || null;

  const owned = useMemo(() => {
    if (!sellerId) return { vehicles: [], parts: [] };
    return {
      vehicles: vehicles.filter((v) => v?.seller?.id && String(v.seller.id) === sellerId),
      parts: parts.filter((p) => p?.seller?.id && String(p.seller.id) === sellerId),
    };
  }, [vehicles, parts, sellerId]);

  const sellerListings = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return owned;
    const query = debouncedSearchQuery.toLowerCase().trim();
    return {
      vehicles: owned.vehicles.filter((item) => {
        const brand = item?.brand?.toLowerCase() || '';
        const model = item?.model?.toLowerCase() || '';
        const version = item?.version?.toLowerCase() || '';
        return brand.includes(query) || model.includes(query) || version.includes(query);
      }),
      parts: owned.parts.filter((item) => {
        const name = item?.name?.toLowerCase() || '';
        const brand = item?.brand?.toLowerCase() || '';
        const model = item?.model?.toLowerCase() || '';
        return name.includes(query) || brand.includes(query) || model.includes(query);
      }),
    };
  }, [owned, debouncedSearchQuery]);

  const handleFavoriteToggle = useCallback(() => {
    if (!seller?.id) return;
    toggleFavorite({
      type: 'seller',
      id: seller.id,
      title: seller.name || t('detail.fallbackName'),
      thumbnail: null,
    });
  }, [seller, toggleFavorite, t]);

  if (!sellerId) {
    return (
      <Shell>
        <h1 className="text-[22px] font-semibold text-foreground">{t('detail.fallbackName')}</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">{t('detail.missingId')}</p>
        <Link to="/sellers" className="mt-4 inline-flex min-h-11 items-center text-primary-text underline">
          {t('detail.backToSellers')}
        </Link>
      </Shell>
    );
  }

  if (isLoading) {
    return (
      <Shell>
        <p className="text-[15px] text-muted-foreground">{t('detail.loading')}</p>
      </Shell>
    );
  }

  if (error || !seller) {
    return (
      <Shell>
        <h1 className="text-[22px] font-semibold text-foreground">{t('detail.notFound')}</h1>
        <Link to="/sellers" className="mt-4 inline-flex min-h-11 items-center text-primary-text underline">
          {t('detail.backToSellers')}
        </Link>
      </Shell>
    );
  }

  if (!hasPublicSellerPage(seller.type)) {
    return (
      <Shell>
        <h1 className="text-[22px] font-semibold text-foreground">{t('detail.profileUnavailable')}</h1>
        <Link to="/sellers" className="mt-4 inline-flex min-h-11 items-center text-primary-text underline">
          {t('detail.backToSellers')}
        </Link>
      </Shell>
    );
  }

  const breadcrumbs = [
    { label: t('detail.breadcrumbs.home'), to: '/' },
    { label: t('detail.breadcrumbs.sellers'), to: '/sellers' },
    { label: seller.name || t('detail.fallbackName') },
  ];
  const verifiedLabel = isPartsSeller ? t('detail.verifiedPartsSeller') : t('detail.verifiedDealer');
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;
  const carsInStock = owned.vehicles.length;
  const formattedCars = formatNumber(carsInStock, locale);
  const formattedListings = listingsCount != null ? formatNumber(listingsCount, locale) : null;

  const tabClass = (key) =>
    [
      'min-h-11 shrink-0 border-b-2 px-2 text-[15px] font-semibold transition',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      activeTab === key
        ? 'border-primary text-primary-text'
        : 'border-transparent text-muted-foreground hover:text-foreground',
    ].join(' ');

  const emptyClass =
    'rounded-2xl border border-dashed border-border px-4 py-8 text-center text-[15px] text-muted-foreground';

  return (
    <Shell>
      <div className="flex min-w-0 flex-col gap-6">
        <Breadcrumbs items={breadcrumbs} />

        <ProfileHeader
          variant="seller"
          name={seller.name || t('detail.fallbackName')}
          verified={Boolean(seller.verified)}
          verifiedBadge={seller.verified ? <Badge variant="verified">{verifiedLabel}</Badge> : null}
          rating={{ rating: ratingValue, reviewsCount }}
          activity={memberSince ? t('vehicle.memberSince', { date: memberSince }) : null}
          location={city}
          listingsLabel={
            formattedListings != null
              ? t('detail.activeListings', { count: listingsCount, formatted: formattedListings })
              : null
          }
          actions={
            <div className={`flex w-full items-center gap-3 sm:w-auto ${phone ? '' : 'justify-end'}`}>
              {phone ? (
                phoneVisible ? (
                  <Button asChild variant="primary" className="min-w-0 flex-1 sm:flex-none">
                    <a href={telHref}>
                      <span className="truncate">{phone}</span>
                    </a>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    className="min-w-0 flex-1 sm:flex-none"
                    onClick={() => setPhoneVisible(true)}
                  >
                    {t('card.showNumber')}
                  </Button>
                )
              ) : null}
              <ShareButton iconOnly title={seller.name || t('detail.fallbackName')} />
              <Button
                type="button"
                variant="icon"
                size="icon"
                className="shrink-0"
                aria-label={isFavorite ? t('card.removeFromFavorites') : t('card.addToFavorites')}
                title={isFavorite ? t('card.removeFromFavorites') : t('card.addToFavorites')}
                aria-pressed={isFavorite}
                onClick={handleFavoriteToggle}
              >
                <Heart
                  size={18}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  className={isFavorite ? 'fill-destructive text-destructive' : undefined}
                />
              </Button>
            </div>
          }
        />

        <div className="flex gap-1 overflow-x-auto border-b border-border" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'listings'}
            className={tabClass('listings')}
            onClick={() => setActiveTab('listings')}
          >
            {t('detail.tabs.stock')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'parts'}
            className={tabClass('parts')}
            onClick={() => setActiveTab('parts')}
          >
            {t('detail.tabs.parts')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviews'}
            className={tabClass('reviews')}
            onClick={() => setActiveTab('reviews')}
          >
            {t('detail.tabs.reviews')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'about'}
            className={tabClass('about')}
            onClick={() => setActiveTab('about')}
          >
            {t('detail.tabs.about')}
          </button>
        </div>

        {activeTab === 'listings' ? (
          <div className="flex flex-col gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <Input
                label={t('detail.tabs.stock')}
                labelHidden
                wrapperClassName="min-w-0 flex-1 basis-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('detail.searchPlaceholder')}
              />
              <p className="shrink-0 text-[13px] text-muted-foreground">
                {t('detail.inStock', { count: carsInStock, formatted: formattedCars })}
              </p>
            </div>
            {sellerListings.vehicles.length > 0 ? (
              <ul className={stockGridClass}>
                {sellerListings.vehicles.map((vehicle) => (
                  <li key={vehicle.id} className="min-w-0">
                    <AutoCard
                      car={vehicle}
                      variant={vehicle.purpose === 'RENT' ? 'rent' : 'sale'}
                      layout="seller"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={emptyClass}>
                {debouncedSearchQuery.trim() ? t('detail.empty.nothingFound') : t('detail.empty.noListings')}
              </p>
            )}
          </div>
        ) : null}

        {activeTab === 'parts' ? (
          <div className="flex flex-col gap-4">
            <Input
              label={t('detail.tabs.parts')}
              labelHidden
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('detail.searchPlaceholderParts')}
            />
            {sellerListings.parts.length > 0 ? (
              <ul className={stockGridClass}>
                {sellerListings.parts.map((part) => (
                  <li key={part.id} className="min-w-0">
                    <PartCard part={part} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={emptyClass}>
                {debouncedSearchQuery.trim() ? t('detail.empty.nothingFound') : t('detail.empty.noParts')}
              </p>
            )}
          </div>
        ) : null}

        {activeTab === 'reviews' ? (
          <ReviewsSection
            targetType="SELLER"
            targetId={seller.id}
            canReview={!viewerId || viewerId !== seller.userId}
          />
        ) : null}

        {activeTab === 'about' ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {typeKey ? (
              <div className="rounded-[var(--radius)] border border-dashed border-border-strong px-3 py-2 dark:border-border">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {t('filters.sellerType')}
                </p>
                <p className="mt-1 text-[15px] font-semibold text-foreground">
                  {t(`seller.type.${typeKey}`, { ns: 'common' })}
                </p>
              </div>
            ) : null}
            {memberSince ? (
              <div className="rounded-[var(--radius)] border border-dashed border-border-strong px-3 py-2 dark:border-border">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {t('vehicle.memberSince', { date: memberSince })}
                </p>
              </div>
            ) : null}
            {!typeKey && !memberSince ? (
              <p className="text-[15px] text-muted-foreground">{t('detail.empty.aboutSoon')}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Shell>
  );
}
