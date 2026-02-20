import { create } from 'zustand';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Specialization } from '@/specialists/types/specialist.types';

export type SpecialistFiltersState = {
  brand: string;
  model: string;
  year: string;
  specialization: Specialization | '';
  city: string;
  minRating: string;
};

const createDefaultFilters = (): SpecialistFiltersState => ({
  brand: '',
  model: '',
  year: '',
  specialization: '',
  city: '',
  minRating: '',
});

type SpecialistFiltersStore = {
  filters: SpecialistFiltersState;
  setFilter: <K extends keyof SpecialistFiltersState>(
    key: K,
    value: SpecialistFiltersState[K]
  ) => void;
  setFilters: (next: Partial<SpecialistFiltersState>) => void;
  clearFilters: () => void;
};

export const useSpecialistFiltersStore = create<SpecialistFiltersStore>((set) => ({
  filters: createDefaultFilters(),
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  setFilters: (next) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...next,
      },
    })),
  clearFilters: () => set({ filters: createDefaultFilters() }),
}));

const PARAM_MAP: Array<{ param: string; key: keyof SpecialistFiltersState }> = [
  { param: 'brand', key: 'brand' },
  { param: 'model', key: 'model' },
  { param: 'year', key: 'year' },
  { param: 'specialization', key: 'specialization' },
  { param: 'city', key: 'city' },
  { param: 'minRating', key: 'minRating' },
];

const getSpecializationValue = (
  value: string | null,
  defaults: SpecialistFiltersState
) => {
  if (!value) return defaults.specialization;
  const valid = new Set(Object.values<string>(Specialization as Record<string, string>));
  return valid.has(value) ? (value as Specialization) : defaults.specialization;
};

const buildFiltersFromParams = (
  params: URLSearchParams,
  defaults: SpecialistFiltersState
) => {
  const next = { ...defaults };
  PARAM_MAP.forEach(({ param, key }) => {
    const value = params.get(param);
    if (value === null || value === '') return;
    if (key === 'specialization') {
      next.specialization = getSpecializationValue(value, defaults);
      return;
    }
    next[key] = value;
  });
  return next;
};

const buildParamsFromFilters = (
  filters: SpecialistFiltersState,
  defaults: SpecialistFiltersState
) => {
  const params = new URLSearchParams();
  PARAM_MAP.forEach(({ param, key }) => {
    const value = filters[key];
    const defaultValue = defaults[key];
    if (value === '' || value === null || value === undefined) return;
    if (defaultValue !== undefined && value === defaultValue) return;
    params.set(param, String(value));
  });
  return params;
};

const areFiltersEqual = (
  a: SpecialistFiltersState,
  b: SpecialistFiltersState,
  defaults: SpecialistFiltersState
) => Object.keys(defaults).every((key) => a[key as keyof SpecialistFiltersState] === b[key as keyof SpecialistFiltersState]);

export const useSpecialistFiltersUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useSpecialistFiltersStore((state) => state.filters);
  const setFilters = useSpecialistFiltersStore((state) => state.setFilters);
  const defaults = useMemo(() => createDefaultFilters(), []);
  const paramsKey = searchParams.toString();

  const filtersFromParams = useMemo(
    () => buildFiltersFromParams(searchParams, defaults),
    [paramsKey, defaults]
  );

  useEffect(() => {
    if (!areFiltersEqual(filtersFromParams, filters, defaults)) {
      setFilters(filtersFromParams);
    }
  }, [defaults, filters, filtersFromParams, setFilters]);

  const desiredParamsString = useMemo(
    () => buildParamsFromFilters(filters, defaults).toString(),
    [filters, defaults]
  );

  useEffect(() => {
    if (paramsKey !== desiredParamsString) {
      setSearchParams(new URLSearchParams(desiredParamsString), { replace: true });
    }
  }, [desiredParamsString, paramsKey, setSearchParams]);
};
