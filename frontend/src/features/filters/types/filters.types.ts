import type { ComponentType } from 'react';

export type FilterDomain = 'cars' | 'parts' | 'sellers' | 'services' | 'specialists';

export type FilterValue =
  | string
  | number
  | boolean
  | Array<string | number>
  | null;

export type DomainFilters = Record<string, FilterValue>;

export type FiltersByDomain = Record<FilterDomain, DomainFilters>;

export type IconComponent = ComponentType<{ size?: number; className?: string }>;

export type FilterOption = {
  value: string | number;
  label: string;
  icon?: IconComponent;
};

export type OptionsResolver =
  | FilterOption[]
  | ((filters: DomainFilters) => FilterOption[]);

export type DisabledWhen = (filters: DomainFilters) => boolean;

export type BaseFilterConfig = {
  id: string;
  label?: string;
  placeholder?: string;
  dependsOn?: string | string[];
  disabledWhen?: DisabledWhen;
};

export type TextFilterConfig = BaseFilterConfig & {
  type: 'text';
  icon?: IconComponent;
  inputType?: 'text' | 'number' | 'search';
};

export type SelectFilterConfig = BaseFilterConfig & {
  type: 'select';
  options: OptionsResolver;
};

export type RangeFilterConfig = BaseFilterConfig & {
  type: 'range';
  minKey: string;
  maxKey: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  inputType?: 'number' | 'text';
};

export type ToggleFilterConfig = BaseFilterConfig & {
  type: 'toggle';
  label: string;
  variant?: 'switch' | 'checkbox';
};

export type ChipsFilterConfig = BaseFilterConfig & {
  type: 'chips';
  options: OptionsResolver;
  multiple?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  maxVisible?: number;
  showMoreLabel?: (hiddenCount: number) => string;
  listClassName?: string;
  itemClassName?: string;
  itemActiveClassName?: string;
  searchIcon?: IconComponent;
};

export type FilterControlConfig =
  | TextFilterConfig
  | SelectFilterConfig
  | RangeFilterConfig
  | ToggleFilterConfig
  | ChipsFilterConfig;

export type FilterGroup = {
  id: string;
  label?: string;
  controls: FilterControlConfig[];
  containerClassName?: string;
  labelClassName?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

export type FiltersConfig = {
  domain: FilterDomain;
  defaults: DomainFilters;
  containerClassName?: string;
  contentClassName?: string;
  contentInnerClassName?: string;
  contentOpenClassName?: string;
  primaryClassName?: string;
  advancedClassName?: string;
  primaryGroups: FilterGroup[];
  advancedGroups?: FilterGroup[];
  showAdvancedToggle?: boolean;
  advancedToggleLabel?: string;
  showReset?: boolean;
  resetLabel?: string;
  resetOnChange?: Record<string, string[]>;
  footerText?: string;
  mobileToggle?: {
    show: boolean;
    label?: string;
    withCount?: boolean;
  };
};
