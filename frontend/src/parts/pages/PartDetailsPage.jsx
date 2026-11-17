import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { Badge } from '@/shared/ui/Badge';
import { Chip } from '@/shared/ui/Chip';
import { useFavoritesStore } from '@/shared/store/favoritesStore';
import { PartGallery } from '@/parts/components/part-details/PartGallery';
import { PartPurchaseCard } from '@/parts/components/part-details/PartPurchaseCard';
import { PartDetailsTabs } from '@/parts/components/part-details/PartDetailsTabs';
import { ContactSellerForm } from '@/features/inquiries/components/ContactSellerForm';
import { ReportListingForm } from '@/features/moderation/components/ReportListingForm';
import { ReviewsSection } from '@/features/reviews/components/ReviewsSection';
import { usePartDetails } from '@/parts/hooks/usePartDetails';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { formatPartCategoryLabel } from '@/parts/utils/partCategoryLabel';
import {
  DetailLayout,
  MiniSellerCard,
  PromoteShortcuts,
} from '@/shared/blocks';
import { TrustBlock } from '@/shared/blocks/TrustBlock/TrustBlock';
import { useTrackView } from '@/features/promotions/hooks/usePromotions';
import { buildPartMobileBar } from '@/parts/pages/partDetail/PartDetailMobileBar';
import { formatNumber, intlLocale } from '@/lib/format';

const SpecRow = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-border py-2">
    <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
    <span className="text-right text-[15px] font-semibold text-foreground">{value}</span>
  </div>
);

const conditionLabel = (t, condition) => {
  if (!condition) return '—';
  const lower = String(condition).toLowerCase();
  if (lower === 'new') return t('filter.new');
  if (lower === 'used') return t('filter.used');
  if (lower === 'refurbished') return t('filter.refurbished');
  return condition;
};

export default function PartDetailsPage() {
  const { t, i18n } = useTranslation(['part', 'common']);
  const locale = intlLocale(i18n.language);
  const { id } = useParams();
  const { data: part, isLoading, isError } = usePartDetails(id);
  useDocumentTitle(part?.name);
  useTrackView('LISTING', part?.listingId ?? undefined);

  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorited = useFavoritesStore((s) => (part?.id ? s.isFavorited('part', part.id) : false));

  const compatibilityList = useMemo(() => {
    const list = Array.isArray(part?.compatibility) ? part.compatibility : [];
    return list.filter(Boolean);
  }, [part?.compatibility]);

  const breadcrumbs = [
    { label: t('nav.home', { ns: 'common' }), to: '/' },
    { label: t('nav.parts', { ns: 'common' }), to: '/parts' },
    ...(part?.name ? [{ label: part.name }] : []),
  ];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 text-[15px] text-muted-foreground">
        {t('details.loadingDetails')}
      </div>
    );
  }

  if (isError || !part) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-10 text-[15px] text-muted-foreground">
        {t('details.notFound')}
      </div>
    );
  }

  const categoryLabel = formatPartCategoryLabel(t, part?.category);

  const inStock = (part.stock ?? 0) > 0;
  const seller = part.seller ?? null;
  const canReviewSeller = Boolean(seller?.id && seller?.hasPublicPage);

  const mobileBar = buildPartMobileBar({
    t,
    hasContact: Boolean(part.listingId),
    isFavorite: isFavorited,
    onToggleFavorite: () =>
      toggleFavorite({
        type: 'part',
        id: part.id,
        title: part.name,
        thumbnail: part.imageUrl,
      }),
  });

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-6">
      <DetailLayout
        mobileBar={mobileBar}
        main={
          <div className="flex flex-col gap-6">
            <Breadcrumbs items={breadcrumbs} />
            <PartGallery part={part} />

            <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 [overflow-wrap:anywhere]">
              <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-[22px] font-semibold tracking-tight text-foreground md:text-[30px]">{part.name}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
                    {categoryLabel ? <Badge variant="category">{categoryLabel}</Badge> : null}
                    {part.brand ? (
                      <span>
                        {t('details.brandLabel')}: <span className="font-semibold text-foreground">{part.brand}</span>
                      </span>
                    ) : null}
                    {part.oemCode ? (
                      <span>
                        {t('details.oemLabel')}:{' '}
                        <span className="font-mono font-semibold text-foreground">{part.oemCode}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </header>

              <div className="mt-6">
                <PartDetailsTabs
                  initialTab="specs"
                  description={
                    part.description ? (
                      <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground">{part.description}</p>
                    ) : (
                      <p className="text-[15px] text-muted-foreground">{t('details.noDescription')}</p>
                    )
                  }
                  specifications={
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:divide-x md:divide-border">
                      <div className="md:pr-8">
                        <h3 className="mb-4 text-center text-[15px] font-semibold text-foreground">{t('details.mainInfo')}</h3>
                        <SpecRow label={t('details.article')} value={part.oemCode || '—'} />
                        <SpecRow label={t('details.condition')} value={conditionLabel(t, part.condition)} />
                        <SpecRow label={t('details.location')} value={part.location?.trim() || '—'} />
                      </div>
                      <div className="md:pl-8">
                        <h3 className="mb-4 text-center text-[15px] font-semibold text-foreground">{t('details.extraInfo')}</h3>
                        <SpecRow label={t('details.make')} value={part.brand || '—'} />
                        <SpecRow label={t('filter.category')} value={categoryLabel || '—'} />
                        <SpecRow
                          label={t('details.availability')}
                          value={inStock ? t('details.inStock') : t('details.outOfStock')}
                        />
                        {Number.isFinite(part.viewsCount) ? (
                          <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-border py-3">
                            <span className="text-[13px] font-medium text-muted-foreground">{t('details.views')}</span>
                            <span className="text-right text-[15px] font-semibold text-foreground">
                              {formatNumber(part.viewsCount, locale)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  }
                  compatibility={
                    compatibilityList.length ? (
                      <ul className="flex list-none flex-wrap gap-2 p-0">
                        {compatibilityList.map((item) => (
                          <li key={item}>
                            <Chip>{item}</Chip>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[15px] text-muted-foreground">{t('details.compatibilityNotAvailable')}</p>
                    )
                  }
                  reviews={
                    canReviewSeller ? (
                      <ReviewsSection targetType="SELLER" targetId={seller.id} />
                    ) : (
                      <p className="text-[15px] text-muted-foreground">{t('details.reviewsNotAvailableBody')}</p>
                    )
                  }
                />
              </div>
            </section>
          </div>
        }
        sidebar={
          <div className="flex flex-col gap-4">
            <PartPurchaseCard
              part={part}
              isFavorited={isFavorited}
              onToggleFavorite={() =>
                toggleFavorite({
                  type: 'part',
                  id: part.id,
                  title: part.name,
                  thumbnail: part.imageUrl,
                })
              }
            />
            <MiniSellerCard seller={seller} />
            <TrustBlock variant="part" />
            <div id="contact-seller" className="scroll-mt-24">
              <ContactSellerForm listingId={part.listingId} />
            </div>
            <PromoteShortcuts targetType="LISTING" targetId={part.listingId} />
            <ReportListingForm listingId={part.listingId} />
          </div>
        }
      />
    </div>
  );
}
