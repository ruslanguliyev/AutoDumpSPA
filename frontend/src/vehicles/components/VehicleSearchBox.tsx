import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFiltersStore, useFiltersUi } from '@/features/filters/store/useFiltersStore';
import { useAutos } from '@/vehicles/hooks/useAutos';

import VehicleAdvancedFilters from './VehicleAdvancedFilters';
import VehicleTypeSegment from './VehicleTypeSegment';
import VehiclePrimaryFilters from './VehiclePrimaryFilters';
import RefineSearchToggle from './RefineSearchToggle';

const VehicleSearchBox = () => {
  const { t } = useTranslation('vehicle');
  const { autos, total } = useAutos();
  const ui = useFiltersUi('cars');
  const toggleExpanded = useFiltersStore((state) => state.toggleExpanded);

  const resultsCount = typeof total === 'number' ? total : autos.length;

  const hiddenFields = useMemo(
    () => ['brand', 'model', 'city', 'vehicleType'],
    []
  );

  const handleCtaClick = () => {
    const target = document.getElementById('auto-results');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow)] md:p-6">
      <div className="flex flex-col gap-4">
        <VehicleTypeSegment />

        <p className="text-sm font-medium text-foreground">
          {t('searchBox.title')}
        </p>

        <VehiclePrimaryFilters
          resultsCount={resultsCount}
          onCtaClick={handleCtaClick}
        />

        <RefineSearchToggle
          isExpanded={ui.isExpanded}
          onToggle={() => toggleExpanded('cars')}
        />

        {ui.isExpanded ? (
          <div className="pt-4">
            <VehicleAdvancedFilters
              showHeader={false}
              hiddenFields={hiddenFields}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default VehicleSearchBox;
