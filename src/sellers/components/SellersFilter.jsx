import { useMemo, useState } from 'react';
import { IconFilter, IconRotate, IconSearch } from '@tabler/icons-react';
import './SellersFilter.scss';

/* ---------- UI ATOMS ---------- */

const Section = ({ label, children }) => (
  <div className="filter-section">
    {label ? <span className="filter-label">{label}</span> : null}
    {children}
  </div>
);

const TextInput = ({
  value,
  onChange,
  placeholder,
  icon: Icon,
  className = '',
}) => (
  <div className={`input-wrapper ${className}`}>
    {Icon ? <Icon size={16} className="input-icon" /> : null}
    <input
      type="text"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

const Select = ({ value, onChange, options, placeholder }) => (
  <select value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}>
    {placeholder ? <option value="">{placeholder}</option> : null}
    {(options ?? []).map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

const Checkbox = ({ checked, onChange, label }) => (
  <label className="checkbox">
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange?.(e.target.checked)}
    />
    <span>{label}</span>
  </label>
);

/* ---------- MAIN COMPONENT ---------- */

export default function SellersFilter({
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

  const footerText = useMemo(() => {
    if (isLoading) return 'Updating sellers…';
    const n = Number.isFinite(total) ? total : 0;
    return `${n} seller${n === 1 ? '' : 's'} available`;
  }, [isLoading, total]);

  return (
    <div className="sellers-filter">
      {/* PRIMARY BAR */}
      <div className="filter-primary">
        <TextInput
          icon={IconSearch}
          placeholder="Search sellers (name, city)"
          value={safeFilters.search}
          onChange={(v) => onChange?.('search', v)}
        />

        <Select
          value={safeFilters.domain}
          onChange={(v) => onChange?.('domain', v)}
          options={safeOptions.domains}
          placeholder="All domains"
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
          <Section label="Seller type">
            <Select
              value={safeFilters.sellerType}
              onChange={(v) => onChange?.('sellerType', v)}
              options={safeOptions.sellerTypes}
              placeholder="Any type"
            />
          </Section>

          <Section label="Rating">
            <Select
              value={safeFilters.rating}
              onChange={(v) => onChange?.('rating', v)}
              options={safeOptions.ratings}
              placeholder="Any rating"
            />
          </Section>

          <Section label="Listings">
            <Select
              value={safeFilters.listings}
              onChange={(v) => onChange?.('listings', v)}
              options={safeOptions.listings}
              placeholder="Any"
            />
          </Section>

          <Section label="City">
            <Select
              value={safeFilters.city}
              onChange={(v) => onChange?.('city', v)}
              options={safeOptions.cities}
              placeholder="Any city"
            />
          </Section>

          <Section label="Sort by">
            <Select
              value={safeFilters.sort}
              onChange={(v) => onChange?.('sort', v)}
              options={safeOptions.sorts}
            />
          </Section>

          <Section label="">
            <Checkbox
              checked={safeFilters.verifiedOnly}
              onChange={(v) => onChange?.('verifiedOnly', v)}
              label="Verified sellers only"
            />
          </Section>
        </div>
      )}

      {/* FOOTER */}
      <div className="filter-footer">{footerText}</div>
    </div>
  );
}
