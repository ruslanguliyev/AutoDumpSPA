import type { FilterOption } from '../../types/filters.types';

type SelectFilterProps = {
  value?: string | number | boolean | Array<string | number> | null;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  disabled?: boolean;
};

const SelectFilter = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: SelectFilterProps) => (
  <select
    value={Array.isArray(value) || typeof value === 'boolean' ? '' : (value ?? '')}
    onChange={(event) => onChange(event.target.value)}
    disabled={disabled}
  >
    {placeholder ? <option value="">{placeholder}</option> : null}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export default SelectFilter;
