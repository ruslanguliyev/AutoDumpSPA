import { useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Heart, MapPin, Phone, Share2 } from 'lucide-react';

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
import RatingStars from '@/shared/ui/RatingStars/RatingStars';
import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard';
import PartCard from '@/parts/components/PartCard/PartCard';
import { DetailLayout } from '@/shared/blocks';
import { formatMonthYear, formatNumber, intlLocale } from '@/lib/format';
import { shareOrCopyUrl } from '@/lib/share';
import { hasPublicSellerPage, normalizeSellerType } from '@/shared/utils/sellerType';
import { buildSellerMobileBar } from '@/sellers/pages/sellerDetail/SellerDetailMobileBar';

const getInitials = (name) => {
  const safe = String(name ?? '').trim();
  if (!safe) return '??';
  return safe.slice(0, 2).toUpperCase();
};

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
  const [shareNotice, setShareNotice] = useState(null);
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
  const showRating = reviewsCount != null && reviewsCount > 0 && ratingValue != null;
  const city = typeof seller?.city === 'string' && seller.city.trim() ? seller.city.trim() : null;
  const listingsCount = Number.isFinite(seller?.listingsCount) ? seller.listingsCount : null;
  const memberSince = formatMonthYear(seller?.createdAt ?? seller?.memberSince, locale) || null;
  const typeKey = normalizeSellerType(seller?.type);
  const isPartsSeller = typeKey === 'parts';
  const phone = seller?.phone?.trim() || null;

  const sellerListings = useMemo(() => {
    if (!sellerId) return { vehicles: [], parts: [] };
    const sellerVehicles = vehicles.filter((v) => v?.seller?.id && String(v.seller.id) === sellerId);
    const sellerParts = parts.filter((p) => p?.seller?.id && String(p.seller.id) === sellerId);

    if (!debouncedSearchQuery.trim()) {
      return { vehicles: sellerVehicles, parts: sellerParts };
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
    };
  }, [vehicles, parts, sellerId, debouncedSearchQuery]);

  const handleShare = useCallback(async () => {
    const result = await shareOrCopyUrl({
      title: seller?.name || t('detail.fallbackName'),
      url: window.location.href,
    });
    if (result === 'copied') setShareNotice(t('share.copied', { ns: 'common' }));
    else if (result === 'failed') setShareNotice(t('share.failed', { ns: 'common' }));
    else setShareNotice(null);
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

  const allListingsCount = sellerListings.vehicles.length + sellerListings.parts.length;
  const breadcrumbs = [
    { label: t('detail.breadcrumbs.home'), to: '/' },
    { label: t('detail.breadcrumbs.sellers'), to: '/sellers' },
    { label: seller.name || t('detail.fallbackName') },
  ];
  const stockTabLabel = isPartsSeller ? t('detail.tabs.parts') : t('detail.tabs.stock');
  const verifiedLabel = isPartsSeller ? t('card.verifiedPartsSeller') : t('card.verifiedDealer');
  const emptyListingsKey = isPartsSeller ? 'detail.empty.noParts' : 'detail.empty.noListings';
  const typeLabel = typeKey ? t(`seller.type.${typeKey}`, { ns: 'common' }) : null;

  const tabClass = (key) =>
    [
      'min-h-11 shrink-0 border-b-2 px-3 text-[15px] font-semibold transition',
      activeTab === key
        ? 'border-primary text-primary-text'
        : 'border-transparent text-muted-foreground hover:text-foreground',
    ].join(' ');

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

            <article className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 [overflow-wrap:anywhere]">
              <div className="flex gap-3">
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-border bg-card-muted text-[13px] font-semibold text-muted-foreground">
                  {getInitials(seller.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[26px]">
                      {seller.name}
                    </h1>
                    {seller.verified ? <Badge variant="verified">{verifiedLabel}</Badge> : null}
                  </div>
                  {typeLabel ? <p className="mt-0.5 text-[13px] text-muted-foreground">{typeLabel}</p> : null}
                  {showRating ? (
                    <RatingStars
                      value={ratingValue}
                      count={reviewsCount}
                      countLabel={t('card.reviews', { count: reviewsCount })}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-[13px] text-muted-foreground">{t('detail.noReviewsYet')}</p>
                  )}
                  <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
                    {city ? (
                      <li className="flex items-center gap-2">
                        <MapPin size={16} strokeWidth={1.5} aria-hidden="true" />
                        <span>{city}</span>
                      </li>
                    ) : null}
                    {memberSince ? (
                      <li className="flex items-center gap-2">
                        <CalendarDays size={16} strokeWidth={1.5} aria-hidden="true" />
                        <span>{t('vehicle.memberSince', { date: memberSince })}</span>
                      </li>
                    ) : null}
                    {listingsCount != null ? (
                      <li>{t('seller.listings', { ns: 'common', count: listingsCount })}</li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </article>

            <div className="flex gap-1 overflow-x-auto border-b border-border">
              <button type="button" className={tabClass('listings')} onClick={() => setActiveTab('listings')}>
                {stockTabLabel}
                {listingsCount != null ? ` (${formatNumber(listingsCount, locale)})` : ''}
              </button>
              <button type="button" className={tabClass('reviews')} onClick={() => setActiveTab('reviews')}>
                {t('detail.tabs.reviews')}
                {reviewsCount != null && reviewsCount > 0 ? ` (${formatNumber(reviewsCount, locale)})` : ''}
              </button>
              <button type="button" className={tabClass('about')} onClick={() => setActiveTab('about')}>
                {t('detail.tabs.about')}
              </button>
            </div>

            {activeTab === 'listings' ? (
              <div className="flex flex-col gap-4">
                <Input
                  label={stockTabLabel}
                  labelHidden
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isPartsSeller ? t('detail.searchPlaceholderParts') : t('detail.searchPlaceholder')
                  }
                />
                {allListingsCount > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {sellerListings.vehicles.map((vehicle) => (
                      <AutoCard key={vehicle.id} car={vehicle} />
                    ))}
                    {sellerListings.parts.map((part) => (
                      <PartCard key={part.id} part={part} />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-[15px] text-muted-foreground">
                    {debouncedSearchQuery.trim() ? t('detail.empty.nothingFound') : t(emptyListingsKey)}
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
                {typeLabel ? (
                  <div className="rounded-[var(--radius)] border border-dashed border-border-strong px-3 py-2 dark:border-border">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      {t('filters.sellerType')}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-foreground">{typeLabel}</p>
                  </div>
                ) : null}
                {memberSince ? (
                  <div className="rounded-[var(--radius)] border border-dashed border-border-strong px-3 py-2 dark:border-border">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      {t('vehicle.memberSince', { date: memberSince })}
                    </p>
                  </div>
                ) : null}
                {!typeLabel && !memberSince ? (
                  <p className="text-[15px] text-muted-foreground">{t('detail.empty.aboutSoon')}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        }
        sidebar={
          <div className="hidden flex-col gap-3 lg:flex">
            {phone ? (
              phoneVisible ? (
                <Button asChild variant="secondary" className="min-h-11 w-full justify-center gap-2">
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
                    <Phone size={18} aria-hidden="true" />
                    {phone}
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
            <Button type="button" variant="ghost" className="min-h-11 w-full justify-center gap-2" onClick={handleShare}>
              <Share2 size={18} aria-hidden="true" />
              {t('card.share')}
            </Button>
            {shareNotice ? (
              <p className="text-center text-[13px] text-muted-foreground" role="status">
                {shareNotice}
              </p>
            ) : null}
          </div>
        }
      />
    </Shell>
  );
}
