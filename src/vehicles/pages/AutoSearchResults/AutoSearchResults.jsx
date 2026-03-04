import { useTranslation } from 'react-i18next';
import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard';
import BackButton from '@/shared/ui/BackButton/BackButton';
import VehicleSearchBox from '@/vehicles/components/VehicleSearchBox';
import { useCarsFiltersUrlSync } from '@/features/filters/hooks/useCarsFiltersUrlSync';
import { useAutos } from '@/vehicles/hooks/useAutos';
import './AutoSearchResult.scss';

export default function AutoSearchResults() {
  const { t } = useTranslation('vehicle');
  const { autos } = useAutos();
  useCarsFiltersUrlSync();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="back_button d-flex align-items-start">
        <BackButton />
      </div>

      <VehicleSearchBox />

      <h1
        id="auto-results"
        className="text-xl font-semibold"
      >
        {t('search.resultsWithCount', { count: autos.length })}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {autos.map((car) => (
          <AutoCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
}
