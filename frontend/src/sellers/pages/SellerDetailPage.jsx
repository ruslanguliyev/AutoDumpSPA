import { useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Heart, Layers, MapPin, Phone, SearchX } from 'lucide-react';

import { useSellerListings } from '@/sellers/hooks/useSellerListings';
import { useSellerById } from '@/sellers/hooks/useSellerById';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useLanguageSync } from '@/shared/hooks/useLanguageSync';
import { useFavoritesStore } from '@/shared/store/favoritesStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { ROUTES, withLang } from '@/shared/constants/routes';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { Badge } from '@/shared/ui/Badge';
import Button from '@/shared/ui/button';
import { Chip } from '@/shared/ui/Chip';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Input } from '@/shared/ui/Input';
import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard';
import PartCard from '@/parts/components/PartCard/PartCard';
import { DetailLayout, ProfileHeader, ShareButton } from '@/shared/blocks';
import { formatMonthYear, formatNumber, intlLocale } from '@/lib/format';
import { shareOrCopyUrl } from '@/lib/share';
import { hasPublicSellerPage, normalizeSellerType } from '@/shared/utils/sellerType';
import { buildSellerMobileBar } from '@/sellers/pages/sellerDetail/SellerDetailMobileBar';
import { useTrackView } from '@/features/promotions/hooks/usePromotions';

const Shell = ({ children }) => (
  <div className="mx-auto w-full max-w-[1280px] px-4 py-6">{children}</div>
);

export default function SellerDetailPage({
  vehicles: vehiclesProp,
  parts: partsProp,
  isLoading: isLoadingProp = false,
  error: errorProp = null,
} = {}) {
  const { t, i18n } = useTranslation(['sellers', 'common']);
  const locale = intlLocale(i18n.language);
  const { language } = useLanguageSync();
  const params = useParams();
  const sellerId = String(params?.sellerId ?? '').trim();

  const hasExternalData = vehiclesProp !== undefined || partsProp !== undefined;
  const loaded = useSellerListings(sellerId, { enabled: !hasExternalData && Boolean(sellerId) });
  const vehicles = vehiclesProp ?? loaded.vehicles;
  const parts = partsProp ?? loaded.parts;
  const { data: seller, isLoading: sellerProfileLoading, error: sellerError } = useSellerById(sellerId);
  const publicSellerId = seller && hasPublicSellerPage(seller.type) ? seller.id : undefined;
  useTrackView('SELLER', publicSellerId);
  const isLoading = isLoadingProp || loaded.isLoading || sellerProfileLoading;
  const error = errorProp ?? loaded.error ?? sellerError;

  const [activeTab, setActiveTab] = useState('stock');
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
  const createdAt = seller?.createdAt ?? seller?.memberSince ?? null;
  const memberSince = formatMonthYear(createdAt, locale) || null;
  const yearsActive = (() => {
    if (!createdAt) return null;
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return null;
    const years = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return years >= 1 ? years : null;
  })();
  const typeKey = normalizeSellerType(seller?.type);
  const isPartsSeller = typeKey === 'parts';
  const phone = seller?.phone?.trim() || null;

  const sellerListings = useMemo(() => {
    if (!sellerId) return { vehicles: [], parts: [], stockTotal: 0, partsTotal: 0 };
    const sellerVehicles = vehicles.filter((v) => v?.seller?.id && String(v.seller.id) === sellerId);
    const sellerParts = parts.filter((p) => p?.seller?.id && String(p.seller.id) === sellerId);

    if (!debouncedSearchQuery.trim()) {
      return {
        vehicles: sellerVehicles,
        parts: sellerParts,
        stockTotal: sellerVehicles.length,
        partsTotal: sellerParts.length,
      };
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    return {
      vehicles: sellerVehicles.filter((item) => {
        const brand = item?.brand?.toLowerCase() || '';
        const model = item?.model?.toLowerCase() || '';
        return brand.includes(query) || model.includes(query);
      }),
      parts: sellerParts.filter((item) => {
        const name = item?.name?.toLowerCase() || '';
        const brand = item?.brand?.toLowerCase() || '';
        const model = item?.model?.toLowerCase() || '';
        return name.includes(query) || brand.includes(query) || model.includes(query);
      }),
      stockTotal: sellerVehicles.length,
      partsTotal: sellerParts.length,
    };
  }, [vehicles, parts, sellerId, debouncedSearchQuery]);

  const handleShare = useCallback(async () => {
    await shareOrCopyUrl({
      title: seller?.name || t('detail.fallbackName'),
      url: window.location.href,
    });
  }, [seller?.name, t]);

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
        <Link to={withLang(ROUTES.sellers, language)} className="mt-4 inline-flex min-h-11 items-center text-primary-text underline">
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
        <Link to={withLang(ROUTES.sellers, language)} className="mt-4 inline-flex min-h-11 items-center text-primary-text underline">
          {t('detail.backToSellers')}
        </Link>
      </Shell>
    );
  }

  if (!hasPublicSellerPage(seller.type)) {
    return (
      <Shell>
        <h1 className="text-[22px] font-semibold text-foreground">{t('detail.profileUnavailable')}</h1>
        <Link to={withLang(ROUTES.sellers, language)} className="mt-4 inline-flex min-h-11 items-center text-primary-text underline">
          {t('detail.backToSellers')}
        </Link>
      </Shell>
    );
  }

  const breadcrumbs = [
    { label: t('detail.breadcrumbs.home'), to: withLang(ROUTES.home, language) },
    { label: t('detail.breadcrumbs.sellers'), to: withLang(ROUTES.sellers, language) },
    { label: seller.name || t('detail.fallbackName') },
  ];
  const stockTabLabel = t('detail.tabs.stock');
  const partsTabLabel = t('detail.tabs.parts');
  const verifiedLabel = isPartsSeller ? t('card.verifiedPartsSeller') : t('card.verifiedDealer');
  const typeLabel = typeKey ? t(`seller.type.${typeKey}`, { ns: 'common' }) : null;
  const stockCount = sellerListings.stockTotal;
  const partsCount = sellerListings.partsTotal;
  const searching = Boolean(debouncedSearchQuery.trim());

  const tabClass = (key) =>
    [
      'min-h-11 shrink-0 whitespace-nowrap border-b-2 px-3 text-[15px] font-semibold transition',
      activeTab === key
        ? 'border-primary text-primary-text'
        : 'border-transparent text-muted-foreground hover:text-foreground',
    ].join(' ');

  const tileClass =
    'flex min-h-11 min-w-0 flex-col justify-center rounded-[var(--radius)] border border-dashed border-border-strong px-3 py-2 dark:border-border';

  const renderCatalogue = (items, emptyKey, renderItem) => (
    <div className="flex flex-col gap-4">
      <Input
        label={activeTab === 'parts' ? partsTabLabel : stockTabLabel}
        labelHidden
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={
          activeTab === 'parts' ? t('detail.searchPlaceholderParts') : t('detail.searchPlaceholder')
        }
      />
      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(renderItem)}</div>
      ) : (
        <EmptyState icon={<SearchX size={26} strokeWidth={1.5} />}>
          {searching ? t('detail.empty.nothingFound') : t(emptyKey)}
        </EmptyState>
      )}
    </div>
  );

  const mobileBar = buildSellerMobileBar({
    t,
    phone,
    phoneVisible,
    onRevealPhone: () => setPhoneVisible(true),
    isFavorite,
    onToggleFavorite: handleFavoriteToggle,
    onShare: handleShare,
  });

  return (
    <Shell>
      <DetailLayout
        mobileBar={mobileBar}
        main={
          <div className="flex flex-col gap-6">
            <Breadcrumbs items={breadcrumbs} />

            <ProfileHeader
              name={seller.name || t('detail.fallbackName')}
              verified={Boolean(seller.verified)}
              verifiedBadge={seller.verified ? <Badge variant="verified">{verifiedLabel}</Badge> : null}
              rating={{ rating: ratingValue, reviewsCount }}
              viewsCount={Number.isFinite(Number(seller.viewsCount)) ? Number(seller.viewsCount) : null}
              meta={[
                city
                  ? {
                      icon: <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />,
                      text: city,
                    }
                  : null,
                yearsActive != null
                  ? {
                      icon: <CalendarDays size={16} strokeWidth={1.5} aria-hidden="true" />,
                      text: t('detail.activeFor', { count: yearsActive }),
                    }
                  : memberSince
                    ? {
                        icon: <CalendarDays size={16} strokeWidth={1.5} aria-hidden="true" />,
                        text: t('vehicle.memberSince', { date: memberSince }),
                      }
                    : null,
                listingsCount != null
                  ? {
                      icon: <Layers size={16} strokeWidth={1.5} aria-hidden="true" />,
                      text: t('seller.listings', { ns: 'common', count: listingsCount }),
                    }
                  : null,
              ].filter(Boolean)}
              tags={typeLabel ? <Chip>{typeLabel}</Chip> : null}
              actions={<ShareButton title={seller.name || t('detail.fallbackName')} />}
            />

            <div className="flex gap-1 overflow-x-auto border-b border-border">
              <button type="button" className={tabClass('stock')} onClick={() => setActiveTab('stock')}>
                {stockTabLabel} ({formatNumber(stockCount, locale)})
              </button>
              <button type="button" className={tabClass('parts')} onClick={() => setActiveTab('parts')}>
                {partsTabLabel} ({formatNumber(partsCount, locale)})
              </button>
              <button type="button" className={tabClass('reviews')} onClick={() => setActiveTab('reviews')}>
                {t('detail.tabs.reviews')}
                {reviewsCount != null && reviewsCount > 0 ? ` (${formatNumber(reviewsCount, locale)})` : ''}
              </button>
              <button type="button" className={tabClass('about')} onClick={() => setActiveTab('about')}>
                {t('detail.tabs.about')}
              </button>
            </div>

            {activeTab === 'stock'
              ? renderCatalogue(sellerListings.vehicles, 'detail.empty.noListings', (vehicle) => (
                  <div key={vehicle.id} className="min-w-0">
                    <AutoCard car={vehicle} variant={vehicle.purpose === 'RENT' ? 'rent' : 'sale'} />
                  </div>
                ))
              : null}

            {activeTab === 'parts'
              ? renderCatalogue(sellerListings.parts, 'detail.empty.noParts', (part) => (
                  <div key={part.id} className="min-w-0">
                    <PartCard part={part} />
                  </div>
                ))
              : null}

            {activeTab === 'reviews' ? (
              <ReviewsSection
                targetType="SELLER"
                targetId={seller.id}
                canReview={!viewerId || viewerId !== seller.userId}
              />
            ) : null}

            {activeTab === 'about' ? (
              <div className="flex flex-col gap-4">
                <p className="text-[15px] leading-relaxed text-muted-foreground">{t('detail.empty.aboutSoon')}</p>
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {typeLabel ? (
                    <div className={tileClass}>
                      <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        {t('filters.sellerType')}
                      </dt>
                      <dd className="mt-1 text-[15px] font-semibold text-foreground">{typeLabel}</dd>
                    </div>
                  ) : null}
                  {memberSince ? (
                    <div className={tileClass}>
                      <dt className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        {t('detail.memberSinceLabel')}
                      </dt>
                      <dd className="mt-1 text-[15px] font-semibold text-foreground">{memberSince}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}
          </div>
        }
        sidebar={
          <div className="hidden flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] lg:flex">
            {phone ? (
              phoneVisible ? (
                <Button asChild variant="secondary" className="min-h-11 w-full justify-center gap-2">
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
                    <Phone size={18} aria-hidden="true" />
                    <span className="truncate">{phone}</span>
                  </a>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 w-full justify-center gap-2"
                  onClick={() => setPhoneVisible(true)}
                >
                  <Phone size={18} aria-hidden="true" />
                  {t('card.showNumber')}
                </Button>
              )
            ) : null}
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 w-full justify-center gap-2"
              aria-pressed={isFavorite}
              onClick={handleFavoriteToggle}
            >
              <Heart
                size={18}
                strokeWidth={1.5}
                aria-hidden="true"
                className={isFavorite ? 'fill-destructive text-destructive' : undefined}
              />
              {isFavorite ? t('card.removeFromFavorites') : t('card.addToFavorites')}
            </Button>
          </div>
        }
      />
    </Shell>
  );
}
