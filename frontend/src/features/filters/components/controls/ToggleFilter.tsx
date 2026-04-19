type ToggleFilterProps = {
  checked?: boolean;
  onChange: (value: boolean) => void;
  label: string;
  variant?: 'switch' | 'checkbox';
  disabled?: boolean;
};

const ToggleFilter = ({
  checked = false,
  onChange,
  label,
  variant = 'switch',
  disabled = false,
}: ToggleFilterProps) => {
  if (variant === 'checkbox') {
    return (
      <label className="checkbox">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
        />
        <span>{label}</span>
      </label>
    );
  }

  return (
    <button
      type="button"
      className={`toggle ${checked ? 'toggle-active' : ''}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="toggle-label">{label}</span>
      <span className="toggle-switch">
        <span className="toggle-slider" />
      </span>
    </button>
  );
};

export default ToggleFilter;
