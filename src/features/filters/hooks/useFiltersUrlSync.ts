import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useFiltersStore, useFilters } from '../store/useFiltersStore';
import { getDefaultFilters } from '../store/filters.defaults';
import type { DomainFilters, FilterDomain, FilterValue } from '../types/filters.types';

export type UrlParamMapping = {
  param: string;
  key: string;
  parse?: (value: string) => FilterValue;
  serialize?: (value: FilterValue) => string | null;
};

export type FiltersUrlSyncConfig = {
  paramMap: UrlParamMapping[];
};

const defaultParse = (value: string): FilterValue => value;

const defaultSerialize = (value: FilterValue): string | null => {
  if (value === null || value === undefined || value === '') return null;
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(',') : null;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : null;
  }
  return String(value);
};

const buildFiltersFromParams = (
  params: URLSearchParams,
  defaults: DomainFilters,
  paramMap: UrlParamMapping[]
): DomainFilters => {
  const next: DomainFilters = { ...defaults };

  paramMap.forEach(({ param, key, parse = defaultParse }) => {
    const value = params.get(param);
    if (value !== null && value !== '') {
      next[key] = parse(value);
    }
  });

  return next;
};

const buildParamsFromFilters = (
  filters: DomainFilters,
  defaults: DomainFilters,
  paramMap: UrlParamMapping[]
): URLSearchParams => {
  const params = new URLSearchParams();

  paramMap.forEach(({ param, key, serialize = defaultSerialize }) => {
    const value = filters[key];
    const defaultValue = defaults[key];
    const serialized = serialize(value);

    if (serialized === null) return;

    const defaultSerialized = serialize(defaultValue);
    if (serialized === defaultSerialized) return;

    params.set(param, serialized);
  });

  return params;
};

const serializeForComparison = (
  filters: DomainFilters,
  paramMap: UrlParamMapping[]
): string => {
  const parts: string[] = [];
  paramMap.forEach(({ key, serialize = defaultSerialize }) => {
    const value = filters[key];
    const serialized = serialize(value);
    parts.push(`${key}=${serialized ?? ''}`);
  });
  return parts.sort().join('&');
};

export const useFiltersUrlSync = (
  domain: FilterDomain,
  config: FiltersUrlSyncConfig
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useFilters(domain);
  const setFilters = useFiltersStore((state) => state.setFilters);

  const defaults = useMemo(() => getDefaultFilters(domain), [domain]);
  const { paramMap } = config;

  const isHydrated = useRef(false);
  const lastSyncedParams = useRef<string>('');
  const lastSyncedFilters = useRef<string>('');

  const filtersFromParams = useMemo(
    () => buildFiltersFromParams(searchParams, defaults, paramMap),
    [searchParams, defaults, paramMap]
  );

  const filtersFromParamsKey = useMemo(
    () => serializeForComparison(filtersFromParams, paramMap),
    [filtersFromParams, paramMap]
  );

  const currentFiltersKey = useMemo(
    () => serializeForComparison(filters, paramMap),
    [filters, paramMap]
  );

  const paramsString = searchParams.toString();

  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;
      lastSyncedParams.current = paramsString;
      lastSyncedFilters.current = filtersFromParamsKey;

      if (currentFiltersKey !== filtersFromParamsKey) {
        setFilters(domain, filtersFromParams);
      }
      return;
    }

    if (paramsString !== lastSyncedParams.current) {
      lastSyncedParams.current = paramsString;
      lastSyncedFilters.current = filtersFromParamsKey;

      if (currentFiltersKey !== filtersFromParamsKey) {
        setFilters(domain, filtersFromParams);
      }
      return;
    }

    if (currentFiltersKey !== lastSyncedFilters.current) {
      lastSyncedFilters.current = currentFiltersKey;
      const newParams = buildParamsFromFilters(filters, defaults, paramMap);
      const newParamsString = newParams.toString();

      if (newParamsString !== paramsString) {
        lastSyncedParams.current = newParamsString;
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [
    domain,
    paramsString,
    filtersFromParams,
    filtersFromParamsKey,
    currentFiltersKey,
    filters,
    defaults,
    paramMap,
    setFilters,
    setSearchParams,
  ]);
};
