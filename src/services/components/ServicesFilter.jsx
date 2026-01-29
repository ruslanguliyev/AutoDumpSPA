import { useState } from 'react';
import { IconFilter, IconRotate, IconMapPin } from '@tabler/icons-react';
import './ServicesFilter.scss';

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
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

const NumberInput = ({ value, onChange, placeholder }) => (
  <input
    type="number"
    min="0"
    value={value ?? ''}
    placeholder={placeholder}
    onChange={(e) => onChange?.(e.target.value)}
  />
);

const Select = ({ value, onChange, options, placeholder }) => (
  <select value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}>
    {placeholder && <option value="">{placeholder}</option>}
    {(options ?? []).map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const MultiSelect = ({ values, onChange, options, placeholder }) => (
  <div className="multi-select">
    {placeholder && <span className="multi-select-label">{placeholder}</span>}
    <div className="multi-select-chips">
      {(options ?? []).map((option) => {
        const isSelected = values.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={`chip ${isSelected ? 'chip-selected' : ''}`}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  </div>
);

const Checkbox = ({ checked, onChange, label }) => (
  <label className="checkbox-label">
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange?.(e.target.checked)}
    />
    <span>{label}</span>
  </label>
);

export default function ServicesFilter({
  filters,
  options,
  onChange,
  onReset,
  total,
  isLoading,
}) {
  const [open, setOpen] = useState(false);

  const safeFilters = filters ?? {};
  const safeOptions = options ?? {};

  const footerText = isLoading
    ? 'Updating services…'
    : `${total} service${total === 1 ? '' : 's'} available`;

  return (
    <div className="services-filter">
      {/* PRIMARY BAR */}
      <div className="filter-primary">
        <TextInput
          icon={IconMapPin}
          placeholder="City"
          value={safeFilters.city}
          onChange={(v) => onChange?.('city', v)}
        />

        <NumberInput
          placeholder="Radius (km)"
          value={safeFilters.radiusKm}
          onChange={(v) => onChange?.('radiusKm', v)}
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
          <Section label="Service types">
            <MultiSelect
              values={safeFilters.serviceTypes || []}
              onChange={(v) => onChange?.('toggleServiceType', v)}
              options={safeOptions.serviceTypes}
              placeholder="Select types"
            />
          </Section>

          <Section label="Service codes">
            <MultiSelect
              values={safeFilters.serviceCodes || []}
              onChange={(v) => onChange?.('toggleServiceCode', v)}
              options={safeOptions.serviceCodes}
              placeholder="Select services"
            />
          </Section>

          <Section label="Brands">
            <MultiSelect
              values={safeFilters.brands || []}
              onChange={(v) => onChange?.('toggleBrand', v)}
              options={safeOptions.brands}
              placeholder="Select brands"
            />
          </Section>

          <Section label="Categories">
            <MultiSelect
              values={safeFilters.categories || []}
              onChange={(v) => onChange?.('toggleCategory', v)}
              options={safeOptions.categories}
              placeholder="Select categories"
            />
          </Section>

          <Section label="Rating from">
            <NumberInput
              placeholder="Min rating"
              value={safeFilters.ratingFrom}
              onChange={(v) => onChange?.('ratingFrom', v)}
            />
          </Section>

          <Section label="Price range">
            <MultiSelect
              values={safeFilters.priceRange || []}
              onChange={(v) => onChange?.('togglePriceRange', v)}
              options={safeOptions.priceRanges}
              placeholder="Select price ranges"
            />
          </Section>

          <Section label="">
            <Checkbox
              checked={safeFilters.verifiedOnly}
              onChange={(v) => onChange?.('verifiedOnly', v)}
              label="Verified services only"
            />
          </Section>
        </div>
      )}

      {/* FOOTER */}
      <div className="filter-footer">{footerText}</div>
    </div>
  );
}
