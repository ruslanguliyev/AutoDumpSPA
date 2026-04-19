type RangeFilterProps = {
  minValue?: string | number | null;
  maxValue?: string | number | null;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  inputType?: 'text' | 'number';
  disabled?: boolean;
};

const RangeFilter = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder,
  maxPlaceholder,
  inputType = 'number',
  disabled = false,
}: RangeFilterProps) => (
  <div className="price-row">
    <input
      type={inputType}
      min={inputType === 'number' ? '0' : undefined}
      value={minValue ?? ''}
      placeholder={minPlaceholder}
      onChange={(event) => onMinChange(event.target.value)}
      disabled={disabled}
    />
    <input
      type={inputType}
      min={inputType === 'number' ? '0' : undefined}
      value={maxValue ?? ''}
      placeholder={maxPlaceholder}
      onChange={(event) => onMaxChange(event.target.value)}
      disabled={disabled}
    />
  </div>
);

export default RangeFilter;
