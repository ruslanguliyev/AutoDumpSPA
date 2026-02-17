import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import FiltersPanel from '@/features/filters/components/FiltersPanel';
import { createSellersFiltersConfig } from '@/features/filters/config/sellers.filters';
import SellersGrid from '@/sellers/components/SellersGrid';
import { useSellers } from '@/sellers/hooks/useSellers';

const SELLER_ROUTE_PREFIX = '/sellers';

export default function SellerPage({
  vehicles = [],
  parts = [],
  isPartsLoading = false,
} = {}) {
  const { t } = useTranslation('sellers');
  const navigate = useNavigate();
  const { sellers, filteredSellers, filterOptions, isFiltering } = useSellers({
    vehicles,
    parts,
  });

  const total = filteredSellers.length;
  const totalAll = sellers.length;
  const countLabel = isFiltering
    ? t('list.countFiltered', { total, totalAll })
    : t('list.countAll', { count: totalAll });

  const filtersConfig = useMemo(
    () =>
      createSellersFiltersConfig({
        t,
        options: filterOptions,
        total,
        isLoading: isPartsLoading,
      }),
    [t, filterOptions, isPartsLoading, total]
  );

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <header className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {countLabel} {t('subtitle')}
            </p>
          </div>

          <FiltersPanel domain="sellers" config={filtersConfig} total={total} />
        </header>

        {isPartsLoading && sellers.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
            {t('list.loading')}
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
            {t('list.empty')}
          </div>
        ) : (
          <SellersGrid
            sellers={filteredSellers}
            onSellerClick={(seller) =>
              navigate(`${SELLER_ROUTE_PREFIX}/${seller.id}`)
            }
          />
        )}
      </div>
    </div>
  );
}
