import { useState } from 'react';
import { IconSearch, IconFilter, IconRotate } from '@tabler/icons-react';
import './PartsSearchFilter.scss';

const Section = ({ label, children }) => (
  <div className="filter-section">
    {label && <span className="filter-label">{label}</span>}
    {children}
  </div>
);

const TextInput = ({ value, onChange, placeholder, icon: Icon }) => (
  <div className="input-wrapper">
    {Icon && <Icon size={16} className="input-icon" />}
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const NumberInput = ({ value, onChange, placeholder }) => (
  <input
    type="number"
    min="0"
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
  />
);

const Select = ({ value, onChange, options, placeholder }) => {
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {(options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

const PartsSearchFilter = ({
  filters,
  options,
  onChange,
  onReset,
  total,
  isLoading,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="parts-filter">
      {/* PRIMARY BAR */}
      <div className="filter-primary">
        <TextInput
          icon={IconSearch}
          placeholder="Search by OEM or name"
          value={filters.search}
          onChange={(v) => onChange('search', v)}
        />

        <Select
          value={filters.category}
          onChange={(v) => onChange('category', v)}
          options={options.categories}
          placeholder="All categories"
        />

        <button
          type="button"
          className="btn secondary"
          onClick={() => setOpen((v) => !v)}
        >
          <IconFilter size={16} />
          Filters
        </button>

        <button
          type="button"
          className="btn ghost"
          onClick={onReset}
          title="Reset filters"
        >
          <IconRotate size={16} />
        </button>
      </div>

      {/* ADVANCED */}
      {open && (
        <div className="filter-advanced">
          <Section label="Brand">
            <Select
              value={filters.brand}
              onChange={(v) => onChange('brand', v)}
              options={options.brands}
              placeholder="All brands"
            />
          </Section>

          <Section label="Model">
            <Select
              value={filters.model}
              onChange={(v) => onChange('model', v)}
              options={options.models}
              placeholder="All models"
            />
          </Section>

          <Section label="Condition">
            <Select
              value={filters.condition}
              onChange={(v) => onChange('condition', v)}
              options={options.conditions}
              placeholder="Any condition"
            />
          </Section>

          <Section label="Location">
            <Select
              value={filters.location}
              onChange={(v) => onChange('location', v)}
              options={options.locations}
              placeholder="Any location"
            />
          </Section>

          <Section label="Price">
            <div className="price-row">
              <NumberInput
                placeholder="From"
                value={filters.priceFrom}
                onChange={(v) => onChange('priceFrom', v)}
              />
              <NumberInput
                placeholder="To"
                value={filters.priceTo}
                onChange={(v) => onChange('priceTo', v)}
              />
            </div>
          </Section>

          <Section label="Sort by">
            <Select
              value={filters.sort}
              onChange={(v) => onChange('sort', v)}
              options={options.sorts}
            />
          </Section>
        </div>
      )}

      {/* FOOTER */}
      <div className="filter-footer">
        {isLoading ? 'Updating inventory…' : `${total} parts available`}
      </div>
    </div>
  );
};

export default PartsSearchFilter;
