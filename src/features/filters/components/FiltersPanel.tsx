import {
  IconChevronDown,
  IconChevronUp,
  IconFilter,
  IconRotate,
  IconSearch,
} from '@tabler/icons-react';

import '../styles/filters.shared.scss';
import FilterBar from './FilterBar';
import TextFilter from './controls/TextFilter';
import SelectFilter from './controls/SelectFilter';
import RangeFilter from './controls/RangeFilter';
import ToggleFilter from './controls/ToggleFilter';
import ChipsFilter from './controls/ChipsFilter';
import { useFiltersStore } from '../store/useFiltersStore';
import { Fragment } from 'react';
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

const FiltersPanel = ({ domain, config, total }: FiltersPanelProps) => {
  const filters = useFiltersStore((state) => state.filters[domain]);
  const ui = useFiltersStore((state) => state.ui[domain]);
  const setFilter = useFiltersStore((state) => state.setFilter);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const toggleFilterValue = useFiltersStore((state) => state.toggleFilterValue);
  const resetFilters = useFiltersStore((state) => state.resetFilters);
  const togglePanel = useFiltersStore((state) => state.togglePanel);
  const setGroupCollapsed = useFiltersStore((state) => state.setGroupCollapsed);
  const setChipsSearch = useFiltersStore((state) => state.setChipsSearch);
  const setChipsShowAll = useFiltersStore((state) => state.setChipsShowAll);

  const panelOpen = ui?.panelOpen ?? false;

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

    return dependencies.some((key) => isEmptyValue(filters?.[key]));
  };

  const renderControl = (control: FilterControlConfig) => {
    const disabled = isDisabled(control);

    if (control.type === 'text') {
      return (
        <TextFilter
          key={control.id}
          value={filters?.[control.id] as string}
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
          value={filters?.[control.id] as string}
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
          minValue={filters?.[control.minKey] as string}
          maxValue={filters?.[control.maxKey] as string}
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
          checked={Boolean(filters?.[control.id])}
          label={control.label}
          variant={control.variant}
          onChange={(value) => applyValueChange(control.id, value)}
          disabled={disabled}
        />
      );
    }

    if (control.type === 'chips') {
      const options = resolveOptions(control.options, filters) as FilterOption[];
      const selected = filters?.[control.id];
      const searchValue = ui?.chipsSearch?.[control.id] ?? '';
      const showAll = ui?.chipsShowAll?.[control.id] ?? false;

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

    if (group.collapsible) {
      const collapsed = ui?.collapsedGroups?.[group.id] ?? group.defaultCollapsed ?? false;

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
              {group.controls.map(renderControl)}
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
        {group.controls.map(renderControl)}
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

  return (
    <div className={config.containerClassName}>
      {config.mobileToggle?.show ? (
        <div className="search-filter__mobile-toggle">
          <button type="button" onClick={() => togglePanel(domain)}>
            <span className="left">
              <IconSearch size={18} />
              {config.mobileToggle.label ?? 'Filters'}
            </span>

            <span className="right">
              {config.mobileToggle.withCount && typeof total === 'number' ? (
                <span className="count">{total}</span>
              ) : null}
              <span className={`arrow ${panelOpen ? 'up' : ''}`}>
                <IconChevronDown size={18} stroke={2} />
              </span>
            </span>
          </button>
        </div>
      ) : null}

      {config.contentClassName ? (
        <div
          className={`${config.contentClassName} ${panelOpen ? config.contentOpenClassName ?? '' : ''
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
  );
};

export default FiltersPanel;
