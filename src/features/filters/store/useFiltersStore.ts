import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import type { DomainFilters, FilterDomain, FilterValue } from '../types/filters.types';
import { FILTER_DEFAULTS, getDefaultFilters } from './filters.defaults';

type FiltersUIState = {
  panelOpen: boolean;
  collapsedGroups: Record<string, boolean>;
  chipsSearch: Record<string, string>;
  chipsShowAll: Record<string, boolean>;
};

type FiltersStoreState = {
  filters: Record<string, DomainFilters>;
  ui: Record<string, FiltersUIState>;
  setFilter: (domain: FilterDomain, key: string, value: FilterValue) => void;
  setFilters: (domain: FilterDomain, next: Record<string, FilterValue>) => void;
  toggleFilterValue: (domain: FilterDomain, key: string, value: string | number) => void;
  resetFilters: (domain: FilterDomain, defaults?: Record<string, FilterValue>) => void;
  setPanelOpen: (domain: FilterDomain, isOpen: boolean) => void;
  togglePanel: (domain: FilterDomain) => void;
  setGroupCollapsed: (domain: FilterDomain, groupId: string, collapsed: boolean) => void;
  setChipsSearch: (domain: FilterDomain, filterId: string, value: string) => void;
  setChipsShowAll: (domain: FilterDomain, filterId: string, value: boolean) => void;
};

const DEFAULT_UI_STATE: FiltersUIState = {
  panelOpen: false,
  collapsedGroups: {},
  chipsSearch: {},
  chipsShowAll: {},
};

const toArray = (value: FilterValue): Array<string | number> => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  if (typeof value === 'string' || typeof value === 'number') return [value];
  return [];
};

export const useFiltersStore = create<FiltersStoreState>((set) => ({
  filters: { ...FILTER_DEFAULTS },
  ui: {},

  setFilter: (domain, key, value) =>
    set((state) => {
      const currentFilters = state.filters[domain] ?? FILTER_DEFAULTS[domain] ?? {};
      return {
        filters: {
          ...state.filters,
          [domain]: {
            ...currentFilters,
            [key]: value,
          },
        },
      };
    }),

  setFilters: (domain, next) =>
    set((state) => {
      const currentFilters = state.filters[domain] ?? FILTER_DEFAULTS[domain] ?? {};
      return {
        filters: {
          ...state.filters,
          [domain]: {
            ...currentFilters,
            ...next,
          },
        },
      };
    }),

  toggleFilterValue: (domain, key, value) =>
    set((state) => {
      const domainFilters = state.filters[domain] ?? FILTER_DEFAULTS[domain] ?? {};
      const current = toArray(domainFilters[key]);
      const exists = current.includes(value);
      const nextValue = exists
        ? current.filter((item) => item !== value)
        : [...current, value];

      return {
        filters: {
          ...state.filters,
          [domain]: {
            ...domainFilters,
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
    set((state) => {
      const currentUi = state.ui[domain] ?? DEFAULT_UI_STATE;
      return {
        ui: {
          ...state.ui,
          [domain]: { ...currentUi, panelOpen: isOpen },
        },
      };
    }),

  togglePanel: (domain) =>
    set((state) => {
      const currentUi = state.ui[domain] ?? DEFAULT_UI_STATE;
      return {
        ui: {
          ...state.ui,
          [domain]: { ...currentUi, panelOpen: !currentUi.panelOpen },
        },
      };
    }),

  setGroupCollapsed: (domain, groupId, collapsed) =>
    set((state) => {
      const currentUi = state.ui[domain] ?? DEFAULT_UI_STATE;
      return {
        ui: {
          ...state.ui,
          [domain]: {
            ...currentUi,
            collapsedGroups: { ...currentUi.collapsedGroups, [groupId]: collapsed },
          },
        },
      };
    }),

  setChipsSearch: (domain, filterId, value) =>
    set((state) => {
      const currentUi = state.ui[domain] ?? DEFAULT_UI_STATE;
      return {
        ui: {
          ...state.ui,
          [domain]: {
            ...currentUi,
            chipsSearch: { ...currentUi.chipsSearch, [filterId]: value },
          },
        },
      };
    }),

  setChipsShowAll: (domain, filterId, value) =>
    set((state) => {
      const currentUi = state.ui[domain] ?? DEFAULT_UI_STATE;
      return {
        ui: {
          ...state.ui,
          [domain]: {
            ...currentUi,
            chipsShowAll: { ...currentUi.chipsShowAll, [filterId]: value },
          },
        },
      };
    }),
}));

export const useFilters = (domain: FilterDomain): DomainFilters =>
  useFiltersStore(
    (state) => state.filters[domain] ?? FILTER_DEFAULTS[domain],
    shallow
  );

export const useFiltersUi = (domain: FilterDomain): FiltersUIState =>
  useFiltersStore(
    (state) => state.ui[domain] ?? DEFAULT_UI_STATE,
    shallow
  );
