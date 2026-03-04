import {
  IconChevronDown,
  IconChevronUp,
  IconFilter,
  IconRotate,
} from '@tabler/icons-react';

import '../styles/filters.shared.scss';
import FilterBar from './FilterBar';
import TextFilter from './controls/TextFilter';
import SelectFilter from './controls/SelectFilter';
import RangeFilter from './controls/RangeFilter';
import ToggleFilter from './controls/ToggleFilter';
import ChipsFilter from './controls/ChipsFilter';
import { useFiltersStore, useFilters, useFiltersUi } from '../store/useFiltersStore';
import { Fragment, useEffect, useMemo, useRef } from 'react';
import type {
  FilterControlConfig,
  FilterOption,
  FilterGroup,
  FiltersConfig,
  FilterValue,
} from '../types/filters.types';

type FiltersPanelProps = {
  domain: FiltersConfig['domain'];
  config: FiltersConfig;
  total?: number;
  hiddenKeys?: string[];
  showHeader?: boolean;
  forceExpanded?: boolean;
  disableAutoCollapse?: boolean;
};

const isEmptyValue = (value: FilterValue) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const resolveOptions = (
  options: unknown,
  filters: Record<string, FilterValue>
) => (typeof options === 'function' ? options(filters) : options || []);

const normalizeText = (value: FilterValue) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const normalizeArray = (value: FilterValue) =>
  Array.isArray(value)
    ? value
        .map((item) => normalizeText(item))
        .filter((item) => item !== null && item !== undefined && item !== '')
        .sort()
    : [];

const isSameValue = (value: FilterValue, defaultValue: FilterValue) => {
  if (Array.isArray(value) || Array.isArray(defaultValue)) {
    const normalizedValue = normalizeArray(value);
    const normalizedDefault = normalizeArray(defaultValue);
    if (!normalizedValue.length && !normalizedDefault.length) return true;
    if (normalizedValue.length !== normalizedDefault.length) return false;
    return normalizedValue.every((item, index) => item === normalizedDefault[index]);
  }

  const normalizedValue = normalizeText(value);
  const normalizedDefault = normalizeText(defaultValue);

  if (
    normalizedValue === '' ||
    normalizedValue === null ||
    normalizedValue === undefined
  ) {
    return (
      normalizedDefault === '' ||
      normalizedDefault === null ||
      normalizedDefault === undefined
    );
  }

  return normalizedValue === normalizedDefault;
};

const isActiveValue = (value: FilterValue, defaultValue: FilterValue) =>
  !isSameValue(value, defaultValue);

const getActiveFiltersCount = (
  filters: Record<string, FilterValue>,
  defaults: Record<string, FilterValue>
) =>
  Object.entries(filters).reduce((count, [key, value]) => {
    const defaultValue = defaults[key];
    return count + (isActiveValue(value, defaultValue) ? 1 : 0);
  }, 0);

const getOptionLabel = (options: FilterOption[], value: string | number) =>
  options.find((option) => String(option.value) === String(value))?.label ??
  String(value);

const getRangeSummary = (
  label: string | undefined,
  minValue: FilterValue,
  maxValue: FilterValue
) => {
  const minText = minValue === null || minValue === undefined ? '' : String(minValue);
  const maxText = maxValue === null || maxValue === undefined ? '' : String(maxValue);
  const prefix = label ? `${label}: ` : '';

  if (minText && maxText) return `${prefix}${minText}–${maxText}`;
  if (minText) return `${prefix}≥${minText}`;
  if (maxText) return `${prefix}≤${maxText}`;
  return '';
};

const buildSummaryItems = (
  filters: Record<string, FilterValue>,
  defaults: Record<string, FilterValue>,
  config: FiltersConfig,
  hiddenKeys: Set<string>
) => {
  const items: string[] = [];
  const groups = [...config.primaryGroups, ...(config.advancedGroups ?? [])];

  const pushItem = (value: string) => {
    if (!value) return;
    items.push(value);
  };

  groups.forEach((group) => {
    group.controls.forEach((control) => {
      if (hiddenKeys.has(control.id)) return;
      if (control.type === 'range') {
        if (hiddenKeys.has(control.minKey) || hiddenKeys.has(control.maxKey)) return;
        const minValue = filters[control.minKey];
        const maxValue = filters[control.maxKey];
        const minActive = isActiveValue(minValue, defaults[control.minKey]);
        const maxActive = isActiveValue(maxValue, defaults[control.maxKey]);
        if (!minActive && !maxActive) return;
        pushItem(getRangeSummary(control.label, minValue, maxValue));
        return;
      }

      const value = filters[control.id];
      if (!isActiveValue(value, defaults[control.id])) return;

      if (control.type === 'toggle') {
        pushItem(control.label);
        return;
      }

      if (control.type === 'chips') {
        const options = resolveOptions(control.options, filters) as FilterOption[];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item === null || item === undefined || item === '') return;
            pushItem(getOptionLabel(options, item));
          });
          return;
        }

        if (value !== null && value !== undefined && value !== '') {
          pushItem(getOptionLabel(options, value));
        }
        return;
      }

      if (control.type === 'select') {
        const options = resolveOptions(control.options, filters) as FilterOption[];
        if (value !== null && value !== undefined && value !== '') {
          const optionLabel = getOptionLabel(options, value as string | number);
          pushItem(control.label ? `${control.label}: ${optionLabel}` : optionLabel);
        }
        return;
      }

      if (control.type === 'text') {
        const text = typeof value === 'string' ? value.trim() : String(value ?? '');
        if (!text) return;
        pushItem(control.label ? `${control.label}: ${text}` : text);
      }
    });
  });

  return Array.from(new Set(items));
};

const FiltersPanel = (props: FiltersPanelProps) => {
  const {
    domain,
    config,
    hiddenKeys = [],
    showHeader = true,
    forceExpanded = false,
    disableAutoCollapse = false,
  } = props;
  const filters = useFilters(domain);
  const ui = useFiltersUi(domain);
  const setFilter = useFiltersStore((state) => state.setFilter);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const toggleFilterValue = useFiltersStore((state) => state.toggleFilterValue);
  const resetFilters = useFiltersStore((state) => state.resetFilters);
  const togglePanel = useFiltersStore((state) => state.togglePanel);
  const setCollapsed = useFiltersStore((state) => state.setCollapsed);
  const toggleCollapsed = useFiltersStore((state) => state.toggleCollapsed);
  const setGroupCollapsed = useFiltersStore((state) => state.setGroupCollapsed);
  const setChipsSearch = useFiltersStore((state) => state.setChipsSearch);
  const setChipsShowAll = useFiltersStore((state) => state.setChipsShowAll);

  const panelOpen = ui.panelOpen;
  const isCollapsed = forceExpanded ? false : ui.isCollapsed;
  const defaults = config.defaults;
  const didSetMobileDefault = useRef(false);
  const hiddenKeysSet = useMemo(() => new Set(hiddenKeys), [hiddenKeys]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      didSetMobileDefault.current ||
      disableAutoCollapse ||
      forceExpanded
    )
      return;
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    const stored = useFiltersStore.getState().ui[domain];
    if (stored?.isCollapsed !== undefined) return;
    didSetMobileDefault.current = true;
    setCollapsed(domain, true);
  }, [domain, setCollapsed]);

  const activeFiltersCount = useMemo(
    () => getActiveFiltersCount(filters, defaults),
    [filters, defaults]
  );

  const summaryItems = useMemo(
    () => buildSummaryItems(filters, defaults, config, hiddenKeysSet),
    [filters, defaults, config, hiddenKeysSet]
  );

  const applyValueChange = (key: string, value: FilterValue) => {
    const resets = config.resetOnChange?.[key];
    if (!resets?.length) {
      setFilter(domain, key, value);
      return;
    }

    const next: Record<string, FilterValue> = { [key]: value };
    resets.forEach((resetKey) => {
      next[resetKey] = config.defaults[resetKey] ?? '';
    });

    setFilters(domain, next);
  };

  const isDisabled = (control: FilterControlConfig) => {
    if (control.disabledWhen?.(filters)) return true;
    if (!control.dependsOn) return false;
    const dependencies = Array.isArray(control.dependsOn)
      ? control.dependsOn
      : [control.dependsOn];

    return dependencies.some((key) => isEmptyValue(filters[key]));
  };

  const isControlHidden = (control: FilterControlConfig) => {
    if (hiddenKeysSet.has(control.id)) return true;
    if (control.type === 'range') {
      return hiddenKeysSet.has(control.minKey) || hiddenKeysSet.has(control.maxKey);
    }
    return false;
  };

  const renderControl = (control: FilterControlConfig) => {
    if (isControlHidden(control)) return null;
    const disabled = isDisabled(control);

    if (control.type === 'text') {
      return (
        <TextFilter
          key={control.id}
          value={filters[control.id] as string}
          placeholder={control.placeholder}
          icon={control.icon}
          inputType={control.inputType}
          onChange={(value) => applyValueChange(control.id, value)}
          disabled={disabled}
        />
      );
    }

    if (control.type === 'select') {
      const options = resolveOptions(control.options, filters) as FilterOption[];
      return (
        <SelectFilter
          key={control.id}
          value={filters[control.id] as string}
          placeholder={control.placeholder}
          options={options}
          onChange={(value) => applyValueChange(control.id, value)}
          disabled={disabled}
        />
      );
    }

    if (control.type === 'range') {
      return (
        <RangeFilter
          key={control.id}
          minValue={filters[control.minKey] as string}
          maxValue={filters[control.maxKey] as string}
          minPlaceholder={control.minPlaceholder}
          maxPlaceholder={control.maxPlaceholder}
          inputType={control.inputType}
          onMinChange={(value) => applyValueChange(control.minKey, value)}
          onMaxChange={(value) => applyValueChange(control.maxKey, value)}
          disabled={disabled}
        />
      );
    }

    if (control.type === 'toggle') {
      return (
        <ToggleFilter
          key={control.id}
          checked={Boolean(filters[control.id])}
          label={control.label}
          variant={control.variant}
          onChange={(value) => applyValueChange(control.id, value)}
          disabled={disabled}
        />
      );
    }

    if (control.type === 'chips') {
      const options = resolveOptions(control.options, filters) as FilterOption[];
      const selected = filters[control.id];
      const searchValue = ui.chipsSearch[control.id] ?? '';
      const showAll = ui.chipsShowAll[control.id] ?? false;

      return (
        <ChipsFilter
          key={control.id}
          options={options}
          selected={selected}
          multiple={control.multiple}
          clearable={control.clearable}
          searchable={control.searchable}
          searchValue={searchValue}
          onSearchChange={(value) => setChipsSearch(domain, control.id, value)}
          searchPlaceholder={control.placeholder}
          searchIcon={control.searchIcon}
          maxVisible={control.maxVisible}
          showAll={showAll}
          onShowAll={() => setChipsShowAll(domain, control.id, true)}
          showMoreLabel={control.showMoreLabel}
          listClassName={control.listClassName}
          itemClassName={control.itemClassName}
          itemActiveClassName={control.itemActiveClassName}
          onToggle={(value, isSelected) => {
            if (control.multiple) {
              toggleFilterValue(domain, control.id, value);
              return;
            }

            if (control.clearable && isSelected) {
              applyValueChange(control.id, config.defaults[control.id] ?? '');
              return;
            }

            applyValueChange(control.id, value);
          }}
          disabled={disabled}
        />
      );
    }

    return null;
  };

  const renderGroup = (group: FilterGroup) => {
    const labelClassName = group.labelClassName ?? 'filter-label';
    const visibleControls = group.controls.filter(
      (control) => !isControlHidden(control)
    );

    if (visibleControls.length === 0) return null;

    if (group.collapsible) {
      const collapsed = ui.collapsedGroups[group.id] ?? group.defaultCollapsed ?? false;

      return (
        <div
          key={group.id}
          className={group.containerClassName ?? 'collapsible-section'}
        >
          <button
            type="button"
            className="collapsible-header"
            onClick={() => setGroupCollapsed(domain, group.id, !collapsed)}
          >
            <span className={labelClassName}>{group.label}</span>
            {collapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
          </button>
          {!collapsed ? (
            <div className="collapsible-content">
              {visibleControls.map(renderControl)}
            </div>
          ) : null}
        </div>
      );
    }

    const content = (
      <>
        {group.label ? (
          <span className={labelClassName}>{group.label}</span>
        ) : null}
        {visibleControls.map(renderControl)}
      </>
    );

    if (!group.containerClassName) {
      return <Fragment key={group.id}>{content}</Fragment>;
    }

    return (
      <div key={group.id} className={group.containerClassName}>
        {content}
      </div>
    );
  };

  const renderGroups = (groups: FilterGroup[] = []) =>
    groups.map((group) => renderGroup(group));

  const barActions = (
    <>
      {config.showAdvancedToggle ? (
        <button type="button" className="btn secondary" onClick={() => togglePanel(domain)}>
          <IconFilter size={16} />
          {config.advancedToggleLabel ?? 'Filters'}
        </button>
      ) : null}
    </>
  );

  const primaryContent = (
    <FilterBar className={config.primaryClassName} actions={barActions}>
      {renderGroups(config.primaryGroups)}
    </FilterBar>
  );

  const hasAdvanced = Boolean(config.advancedGroups?.length);
  const showAdvanced = hasAdvanced && (config.showAdvancedToggle ? panelOpen : true);

  const advancedContent =
    showAdvanced && config.advancedGroups?.length ? (
      <div
        className={['filters-advanced', config.advancedClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {renderGroups(config.advancedGroups)}
      </div>
    ) : null;

  const content = (
    <>
      {primaryContent}
      {advancedContent}
    </>
  );

  const headerTitle =
    config.mobileToggle?.label ?? config.advancedToggleLabel ?? 'Filters';
  const summaryMax = 3;
  const summaryVisible = showHeader && isCollapsed && summaryItems.length > 0;
  const summaryOverflow =
    summaryItems.length > summaryMax ? summaryItems.length - summaryMax : 0;
  const summaryVisibleItems = summaryItems.slice(0, summaryMax);
  const contentWrapperClassName = [
    'overflow-hidden transition-all duration-300 ease-out',
    isCollapsed
      ? 'max-h-0 opacity-0 pointer-events-none'
      : 'max-h-[2000px] opacity-100',
  ].join(' ');
  const isContentOpen = panelOpen || !isCollapsed;

  return (
    <div className={config.containerClassName}>
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span>{headerTitle}</span>
            {activeFiltersCount > 0 ? (
              <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                {activeFiltersCount}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {config.showReset ? (
              <button
                type="button"
                className="btn ghost"
                onClick={() => resetFilters(domain, config.defaults)}
                title={config.resetLabel ?? 'Reset filters'}
                aria-label={config.resetLabel ?? 'Reset filters'}
              >
                <IconRotate size={16} />
              </button>
            ) : null}
            <button
              type="button"
              className="btn secondary"
              onClick={() => toggleCollapsed(domain)}
              aria-label={isCollapsed ? 'Show filters' : 'Hide filters'}
            >
              {isCollapsed ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronUp size={16} />
              )}
              <span className="sm:hidden">
                {isCollapsed ? 'Show filters' : 'Hide filters'}
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {summaryVisible ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {summaryVisibleItems.map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs text-foreground"
            >
              {item}
            </span>
          ))}
          {summaryOverflow > 0 ? (
            <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
              +{summaryOverflow}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={contentWrapperClassName}>
        {config.contentClassName ? (
          <div
            className={`${config.contentClassName} ${isContentOpen ? config.contentOpenClassName ?? '' : ''
              }`.trim()}
          >
            {config.contentInnerClassName ? (
              <div className={config.contentInnerClassName}>{content}</div>
            ) : (
              content
            )}
          </div>
        ) : (
          content
        )}

        {config.footerText ? (
          <div className="filter-footer">{config.footerText}</div>
        ) : null}
      </div>
    </div>
  );
};

export default FiltersPanel;
