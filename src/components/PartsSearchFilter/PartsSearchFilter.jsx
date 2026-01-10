import { IconSearch, IconRotate } from '@tabler/icons-react';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none';

const labelClass = 'text-xs font-semibold text-slate-500';

const Section = ({ title, children }) => (
  <div className="flex flex-col gap-2">
    <span className={labelClass}>{title}</span>
    {children}
  </div>
);

const Select = ({ value, onChange, options, placeholder }) => (
  <select
    className={inputClass}
    value={value}
    onChange={(event) => onChange(event.target.value)}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const NumberInput = ({ value, onChange, placeholder }) => (
  <input
    type="number"
    className={inputClass}
    value={value}
    placeholder={placeholder}
    onChange={(event) => onChange(event.target.value)}
    min="0"
    inputMode="numeric"
  />
);

const TextInput = ({ value, onChange, placeholder, icon: Icon }) => (
  <div className="relative">
    {Icon ? (
      <Icon
        size={16}
        stroke={2}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    ) : null}
    <input
      type="text"
      className={`${inputClass} ${Icon ? 'pl-9' : ''}`}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const ActionBar = ({ total, isLoading, onReset, onSubmit }) => (
  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-xs text-slate-500">
      {isLoading ? 'Updating inventory…' : `${total} parts available`}
    </div>

    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <IconRotate size={16} />
        Reset
      </button>

      <button
        type="button"
        onClick={onSubmit}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        <IconSearch size={16} />
        Apply filters
      </button>
    </div>
  </div>
);

const PartsSearchFilter = ({
  filters,
  options,
  onChange,
  onReset,
  onSubmit,
  isLoading,
  total,
}) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Section title="What do you need?">
          <TextInput
            placeholder="Search by name or OEM"
            value={filters.search}
            onChange={(value) => onChange('search', value)}
            icon={IconSearch}
          />
        </Section>

        <Section title="Category">
          <Select
            value={filters.category}
            onChange={(value) => onChange('category', value)}
            options={options.categories}
          />
        </Section>

        <Section title="Condition">
          <Select
            value={filters.condition}
            onChange={(value) => onChange('condition', value)}
            options={options.conditions}
          />
        </Section>

        <Section title="Brand">
          <TextInput
            placeholder="e.g. BMW"
            value={filters.brand}
            onChange={(value) => onChange('brand', value)}
          />
        </Section>

        <Section title="Model">
          <TextInput
            placeholder="e.g. X5"
            value={filters.model}
            onChange={(value) => onChange('model', value)}
          />
        </Section>

        <Section title="Location">
          <TextInput
            placeholder="City or region"
            value={filters.location}
            onChange={(value) => onChange('location', value)}
          />
        </Section>

        <Section title="Price from">
          <NumberInput
            placeholder="$"
            value={filters.priceFrom}
            onChange={(value) => onChange('priceFrom', value)}
          />
        </Section>

        <Section title="Price to">
          <NumberInput
            placeholder="$"
            value={filters.priceTo}
            onChange={(value) => onChange('priceTo', value)}
          />
        </Section>

        <Section title="Sort by">
          <Select
            value={filters.sort}
            onChange={(value) => onChange('sort', value)}
            options={options.sorts}
          />
        </Section>
      </div>

      <ActionBar
        total={total}
        isLoading={isLoading}
        onReset={onReset}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default PartsSearchFilter;

