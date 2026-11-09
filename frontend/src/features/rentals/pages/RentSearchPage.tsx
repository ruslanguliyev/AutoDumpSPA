import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { todayString } from '@/features/rentals/api/rentals.api';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { getVehicles } from '@/vehicles/api/vehicles.api';
import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard.jsx';

type RentalVehicle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number | null;
  currency: string;
  location: string | null;
  image: string[];
  transmission?: string;
  fuel?: string;
  rental: { deposit: number | null; minDays: number; maxDays: number | null; kmPerDay: number | null } | null;
};

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/**
 * The rent catalogue shows the same car card as everywhere else, in its rent variant.
 * A page-local copy would drift from the one the rest of the site uses.
 */
function RentalCard({ car }: { car: RentalVehicle }) {
  return <AutoCard car={{ ...car, image: resolveMediaUrl(car.image?.[0]) }} variant="rent" />;
}

/** Public catalogue of cars for rent with simple filters, including "free on these dates". */
export default function RentSearchPage() {
  const { t } = useTranslation('dashboard');
  useDocumentTitle(t('rentSearch.title'));
  const today = todayString();

  const [brand, setBrand] = useState('');
  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // The two dates only count together; a half-filled period is ignored.
  const period = from && to && to >= from ? { availableFrom: from, availableTo: to } : {};

  const query = useQuery({
    queryKey: ['rent-search', brand.trim(), city.trim(), period],
    queryFn: () => getVehicles({ purpose: 'RENT', brand: brand.trim(), city: city.trim(), limit: 200, ...period }) as Promise<RentalVehicle[]>,
    placeholderData: keepPreviousData,
  });

  const cars = useMemo(() => {
    const limit = Number(maxPrice);
    const list = query.data ?? [];
    return Number.isFinite(limit) && limit > 0 ? list.filter((c) => c.price != null && c.price <= limit) : list;
  }, [query.data, maxPrice]);

  const periodInvalid = Boolean(from && to && to < from);

  return (
    <div className="w-full px-4 py-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold text-foreground">{t('rentSearch.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('rentSearch.subtitle')}</p>
        </header>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input className={inputClass} placeholder={t('rentSearch.brand')} value={brand} onChange={(e) => setBrand(e.target.value)} aria-label={t('rentSearch.brand')} />
          <input className={inputClass} placeholder={t('rentSearch.city')} value={city} onChange={(e) => setCity(e.target.value)} aria-label={t('rentSearch.city')} />
          <input
            className={inputClass}
            type="number"
            min={0}
            placeholder={t('rentSearch.maxPrice')}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label={t('rentSearch.maxPrice')}
          />
          <input className={inputClass} type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} aria-label={t('rental.from')} />
          <input className={inputClass} type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} aria-label={t('rental.to')} />
          {periodInvalid ? <p role="alert" className="text-xs text-destructive sm:col-span-2 lg:col-span-5">{t('rental.errors.order')}</p> : null}
        </form>

        {query.isLoading ? (
          <div className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">{t('listings.loading')}</div>
        ) : cars.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">{t('rentSearch.empty')}</div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{t('rentSearch.count', { count: cars.length })}</p>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cars.map((car) => (
                <li key={car.id}>
                  <RentalCard car={car} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
