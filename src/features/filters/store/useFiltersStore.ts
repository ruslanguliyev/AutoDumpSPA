import { create } from 'zustand';
import type { FilterDomain, FilterValue } from '../types/filters.types';
import {
  createDefaultFiltersState,
  getDefaultFilters,
} from './filters.defaults';

type FiltersUIState = {
  panelOpen: boolean;
  collapsedGroups: Record<string, boolean>;
  chipsSearch: Record<string, string>;
  chipsShowAll: Record<string, boolean>;
};

type FiltersStoreState = {
  filters: ReturnType<typeof createDefaultFiltersState>;
  ui: Record<FilterDomain, FiltersUIState>;
  setFilter: (domain: FilterDomain, key: string, value: FilterValue) => void;
  setFilters: (
    domain: FilterDomain,
    next: Record<string, FilterValue>
  ) => void;
  toggleFilterValue: (
    domain: FilterDomain,
    key: string,
    value: string | number
  ) => void;
  resetFilters: (domain: FilterDomain, defaults?: Record<string, FilterValue>) => void;
  setPanelOpen: (domain: FilterDomain, isOpen: boolean) => void;
  togglePanel: (domain: FilterDomain) => void;
  setGroupCollapsed: (
    domain: FilterDomain,
    groupId: string,
    collapsed: boolean
  ) => void;
  setChipsSearch: (domain: FilterDomain, filterId: string, value: string) => void;
  setChipsShowAll: (
    domain: FilterDomain,
    filterId: string,
    value: boolean
  ) => void;
};

const createUiState = (): FiltersUIState => ({
  panelOpen: false,
  collapsedGroups: {},
  chipsSearch: {},
  chipsShowAll: {},
});

const createUiStateByDomain = (): FiltersStoreState['ui'] => ({
  cars: createUiState(),
  parts: createUiState(),
  sellers: createUiState(),
  services: createUiState(),
});

const toArray = (value: FilterValue): Array<string | number> => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  if (typeof value === 'string' || typeof value === 'number') return [value];
  return [];
};

export const useFiltersStore = create<FiltersStoreState>((set) => ({
  filters: createDefaultFiltersState(),
  ui: createUiStateByDomain(),

  setFilter: (domain, key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [domain]: {
          ...state.filters[domain],
          [key]: value,
        },
      },
    })),

  setFilters: (domain, next) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [domain]: {
          ...state.filters[domain],
          ...next,
        },
      },
    })),

  toggleFilterValue: (domain, key, value) =>
    set((state) => {
      const current = toArray(state.filters[domain]?.[key]);
      const exists = current.includes(value);
      const nextValue = exists
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        filters: {
          ...state.filters,
          [domain]: {
            ...state.filters[domain],
            [key]: nextValue,
          },
        },
      };
    }),

  resetFilters: (domain, defaults) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [domain]: defaults ? { ...defaults } : getDefaultFilters(domain),
      },
    })),

  setPanelOpen: (domain, isOpen) =>
    set((state) => ({
      ui: {
        ...state.ui,
        [domain]: { ...state.ui[domain], panelOpen: isOpen },
      },
    })),

  togglePanel: (domain) =>
    set((state) => ({
      ui: {
        ...state.ui,
        [domain]: {
          ...state.ui[domain],
          panelOpen: !state.ui[domain].panelOpen,
        },
      },
    })),

  setGroupCollapsed: (domain, groupId, collapsed) =>
    set((state) => ({
      ui: {
        ...state.ui,
        [domain]: {
          ...state.ui[domain],
          collapsedGroups: {
            ...state.ui[domain].collapsedGroups,
            [groupId]: collapsed,
          },
        },
      },
    })),

  setChipsSearch: (domain, filterId, value) =>
    set((state) => ({
      ui: {
        ...state.ui,
        [domain]: {
          ...state.ui[domain],
          chipsSearch: {
            ...state.ui[domain].chipsSearch,
            [filterId]: value,
          },
        },
      },
    })),

  setChipsShowAll: (domain, filterId, value) =>
    set((state) => ({
      ui: {
        ...state.ui,
        [domain]: {
          ...state.ui[domain],
          chipsShowAll: {
            ...state.ui[domain].chipsShowAll,
            [filterId]: value,
          },
        },
      },
    })),
}));
