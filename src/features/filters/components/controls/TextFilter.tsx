import type { IconComponent } from '../../types/filters.types';

type TextFilterProps = {
  value?: string | number | null;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: IconComponent;
  inputType?: 'text' | 'number' | 'search';
  disabled?: boolean;
};

const TextFilter = ({
  value,
  onChange,
  placeholder,
  icon: Icon,
  inputType = 'text',
  disabled = false,
}: TextFilterProps) => {
  const input = (
    <input
      type={inputType}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
    />
  );

  if (!Icon) return input;

  return (
    <div className="input-wrapper">
      <Icon size={16} className="input-icon" />
      {input}
    </div>
  );
};

export default TextFilter;
