import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

import type { DomainFilters, FilterDomain, FilterValue } from '../types/filters.types';
import { FILTER_DEFAULTS, getDefaultFilters } from './filters.defaults';

type FiltersUIState = {
  panelOpen: boolean;
  isCollapsed: boolean;
  isExpanded: boolean;
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
  setCollapsed: (domain: FilterDomain, next: boolean) => void;
  toggleCollapsed: (domain: FilterDomain) => void;
  setExpanded: (domain: FilterDomain, next: boolean) => void;
  toggleExpanded: (domain: FilterDomain) => void;
  setGroupCollapsed: (domain: FilterDomain, groupId: string, collapsed: boolean) => void;
  setChipsSearch: (domain: FilterDomain, filterId: string, value: string) => void;
  setChipsShowAll: (domain: FilterDomain, filterId: string, value: boolean) => void;
};

const FILTERS_UI_KEY = 'autodump-filters-ui';

const DEFAULT_UI_STATE: FiltersUIState = {
  panelOpen: false,
  isCollapsed: false,
  isExpanded: false,
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

export const useFiltersStore = create<FiltersStoreState>()(
  persist(
    (set) => ({
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

      setCollapsed: (domain, next) =>
        set((state) => {
          const currentUi = state.ui[domain] ?? DEFAULT_UI_STATE;
          return {
            ui: {
              ...state.ui,
              [domain]: { ...currentUi, isCollapsed: next },
            },
          };
        }),

      toggleCollapsed: (domain) =>
        set((state) => {
          const currentUi = state.ui[domain] ?? DEFAULT_UI_STATE;
          return {
            ui: {
              ...state.ui,
              [domain]: { ...currentUi, isCollapsed: !currentUi.isCollapsed },
            },
          };
        }),

      setExpanded: (domain, next) =>
        set((state) => {
          const currentUi = state.ui[domain] ?? DEFAULT_UI_STATE;
          return {
            ui: {
              ...state.ui,
              [domain]: { ...currentUi, isExpanded: next },
            },
          };
        }),

      toggleExpanded: (domain) =>
        set((state) => {
          const currentUi = state.ui[domain] ?? DEFAULT_UI_STATE;
          return {
            ui: {
              ...state.ui,
              [domain]: { ...currentUi, isExpanded: !currentUi.isExpanded },
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
                collapsedGroups: {
                  ...currentUi.collapsedGroups,
                  [groupId]: collapsed,
                },
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
    }),
    {
      name: FILTERS_UI_KEY,
      partialize: (state) => ({ ui: state.ui }),
      merge: (persisted, current) => {
        const p = persisted as { ui?: Record<string, Partial<FiltersUIState>> };
        const merged = { ...current, ...p };
        if (p?.ui && typeof p.ui === 'object') {
          merged.ui = { ...current.ui };
          for (const key of Object.keys(p.ui)) {
            merged.ui[key] = { ...DEFAULT_UI_STATE, ...p.ui[key] };
          }
        }
        return merged;
      },
    }
  )
);

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
