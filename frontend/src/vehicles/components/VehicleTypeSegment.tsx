import { useMemo } from 'react';
import {
  IconBike,
  IconCamper,
  IconCar,
  IconDeviceDesktop,
  IconTruck,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { useFiltersStore, useFilters } from '@/features/filters/store/useFiltersStore';
import { getDefaultFilters } from '@/features/filters/store/filters.defaults';

const VehicleTypeSegment = () => {
  const { t } = useTranslation('vehicle');
  const filters = useFilters('cars');
  const setFilters = useFiltersStore((state) => state.setFilters);
  const defaults = useMemo(() => getDefaultFilters('cars'), []);

  const options = useMemo(
    () => [
      { value: 'car', icon: IconCar, label: t('filter.car') },
      { value: 'motorcycle', icon: IconBike, label: t('filter.motorcycle') },
      { value: 'truck', icon: IconTruck, label: t('filter.truck') },
      { value: 'camper', icon: IconCamper, label: t('filter.camper') },
      { value: 'commercial', icon: IconDeviceDesktop, label: t('filter.commercial') },
    ],
    [t]
  );

  const activeValue = String(filters.vehicleType || defaults.vehicleType || 'car');

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-muted p-1">
      {options.map((option) => {
        const isActive = option.value === activeValue;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            className={`relative flex flex-1 items-center justify-center rounded-lg py-2 text-muted-foreground transition hover:text-foreground ${
              isActive ? 'text-foreground' : ''
            }`}
            onClick={() =>
              setFilters('cars', {
                vehicleType: option.value,
                brand: defaults.brand ?? '',
                model: defaults.model ?? '',
              })
            }
            aria-pressed={isActive}
            aria-label={option.label}
            title={option.label}
          >
            <Icon size={20} />
            <span
              className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full ${
                isActive ? 'bg-primary' : 'bg-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default VehicleTypeSegment;
