import clsx from 'clsx';
import TextFilter from './TextFilter';
import type { FilterOption, FilterValue, IconComponent } from '../../types/filters.types';

type ChipsFilterProps = {
  options: FilterOption[];
  selected?: FilterValue;
  multiple?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchIcon?: IconComponent;
  maxVisible?: number;
  showAll?: boolean;
  onShowAll?: () => void;
  showMoreLabel?: (hiddenCount: number) => string;
  listClassName?: string;
  itemClassName?: string;
  itemActiveClassName?: string;
  onToggle: (value: string | number, isSelected: boolean) => void;
  disabled?: boolean;
};

const normalize = (value: string) => value.toLowerCase().trim();

const isSelectedValue = (
  selected: FilterValue | undefined,
  value: string | number,
  multiple?: boolean
) => {
  if (multiple) {
    return Array.isArray(selected) ? selected.includes(value) : false;
  }
  return selected === value;
};

const renderIcon = (Icon: IconComponent | undefined) =>
  Icon ? <Icon size={18} /> : null;

const ChipsFilter = ({
  options,
  selected,
  multiple = false,
  searchable = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchIcon,
  maxVisible,
  showAll = false,
  onShowAll,
  showMoreLabel,
  listClassName,
  itemClassName,
  itemActiveClassName,
  onToggle,
  disabled = false,
}: ChipsFilterProps) => {
  const filteredOptions = searchable
    ? options.filter((option) =>
        normalize(option.label).includes(normalize(searchValue))
      )
    : options;

  const visibleOptions =
    maxVisible && !showAll ? filteredOptions.slice(0, maxVisible) : filteredOptions;
  const hiddenCount =
    maxVisible && filteredOptions.length > maxVisible
      ? filteredOptions.length - maxVisible
      : 0;

  return (
    <div>
      {searchable ? (
        <TextFilter
          value={searchValue}
          onChange={(value) => onSearchChange?.(value)}
          placeholder={searchPlaceholder}
          icon={searchIcon}
          disabled={disabled}
        />
      ) : null}

      <div className={listClassName}>
        {visibleOptions.map((option) => {
          const active = isSelectedValue(selected, option.value, multiple);
          const classes = clsx(itemClassName, active && itemActiveClassName);

          return (
            <button
              key={option.value}
              type="button"
              className={classes}
              onClick={() => onToggle(option.value, active)}
              aria-pressed={active}
              disabled={disabled}
            >
              {renderIcon(option.icon)}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {!showAll && hiddenCount > 0 ? (
        <button type="button" className="btn-link" onClick={onShowAll}>
          {showMoreLabel?.(hiddenCount) ?? `Show more (${hiddenCount} more)`}
        </button>
      ) : null}
    </div>
  );
};

export default ChipsFilter;
