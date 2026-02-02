import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDefaultFilters } from '../store/filters.defaults';
import { useFiltersStore } from '../store/useFiltersStore';

const PARAM_MAP = [
  { param: 'type', key: 'vehicleType' },
  { param: 'brand', key: 'brand' },
  { param: 'model', key: 'model' },
  { param: 'priceTo', key: 'price' },
  { param: 'yearFrom', key: 'registration' },
  { param: 'region', key: 'region' },
  { param: 'city', key: 'city' },
];

const buildFiltersFromParams = (params, defaults) => {
  const next = { ...defaults };
  PARAM_MAP.forEach(({ param, key }) => {
    const value = params.get(param);
    if (value !== null && value !== '') {
      next[key] = value;
    }
  });
  return next;
};

const buildParamsFromFilters = (filters, defaults) => {
  const params = new URLSearchParams();
  PARAM_MAP.forEach(({ param, key }) => {
    const value = filters[key];
    const defaultValue = defaults[key];
    if (value === null || value === undefined || value === '') return;
    if (defaultValue !== undefined && value === defaultValue) return;
    params.set(param, String(value));
  });
  return params;
};

const areFiltersEqual = (a, b, defaults) =>
  Object.keys(defaults).every((key) => a[key] === b[key]);

export const useCarsFiltersUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useFiltersStore((state) => state.filters.cars);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const defaults = useMemo(() => getDefaultFilters('cars'), []);
  const paramsKey = searchParams.toString();

  const filtersFromParams = useMemo(
    () => buildFiltersFromParams(searchParams, defaults),
    [paramsKey, defaults]
  );

  useEffect(() => {
    if (!areFiltersEqual(filtersFromParams, filters, defaults)) {
      setFilters('cars', filtersFromParams);
    }
  }, [defaults, filters, filtersFromParams, setFilters]);

  const desiredParamsString = useMemo(
    () => buildParamsFromFilters(filters, defaults).toString(),
    [filters, defaults]
  );

  useEffect(() => {
    if (paramsKey !== desiredParamsString) {
      setSearchParams(new URLSearchParams(desiredParamsString), {
        replace: true,
      });
    }
  }, [desiredParamsString, paramsKey, setSearchParams]);
};
