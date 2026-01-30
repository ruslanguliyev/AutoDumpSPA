import { useMemo, useState } from 'react';
import { IconFilter, IconMapPin, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';
import './ServicesFilter.scss';

const SERVICE_TYPES = [
  { value: 'garage', label: 'Garage' },
  { value: 'official', label: 'Official' },
  { value: 'detailing', label: 'Detailing' },
  { value: 'tire', label: 'Tire' },
  { value: 'electric', label: 'Electric' },
  { value: 'body', label: 'Body' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '3', label: '3.0+' },
  { value: '3.5', label: '3.5+' },
  { value: '4', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
];

const RADIUS_OPTIONS = [
  { value: '', label: 'Any distance' },
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '25', label: '25 km' },
  { value: '50', label: '50 km' },
  { value: '100', label: '100 km' },
];

const POPULAR_SERVICES_LIMIT = 6;

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

const Select = ({ value, onChange, options }) => (
  <select value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    className={`toggle ${checked ? 'toggle-active' : ''}`}
    onClick={() => onChange?.(!checked)}
  >
    <span className="toggle-label">{label}</span>
    <span className="toggle-switch">
      <span className="toggle-slider" />
    </span>
  </button>
);

const Chip = ({ selected, onClick, children }) => (
  <button
    type="button"
    className={`chip ${selected ? 'chip-selected' : ''}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const CollapsibleSection = ({ label, children, defaultCollapsed = true }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  
  return (
    <div className="collapsible-section">
      <button
        type="button"
        className="collapsible-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="filter-label">{label}</span>
        {collapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
      </button>
      {!collapsed && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

export default function ServicesFilter({
  filters,
  options,
  onChange,
  onReset,
  total,
  isLoading,
}) {
  const [open, setOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [showAllServices, setShowAllServices] = useState(false);

  const safeFilters = filters ?? {};
  const safeOptions = {
    serviceCodes: options?.serviceCodes ?? [],
    brands: options?.brands ?? [],
  };

  // Get popular services (first 6 by default)
  const popularServices = useMemo(() => {
    return safeOptions.serviceCodes.slice(0, POPULAR_SERVICES_LIMIT);
  }, [safeOptions.serviceCodes]);

  const allServices = useMemo(() => {
    return safeOptions.serviceCodes;
  }, [safeOptions.serviceCodes]);

  // Filter brands by search
  const filteredBrands = useMemo(() => {
    if (!brandSearch) return safeOptions.brands;
    const searchLower = brandSearch.toLowerCase();
    return safeOptions.brands.filter((brand) =>
      brand.label.toLowerCase().includes(searchLower)
    );
  }, [safeOptions.brands, brandSearch]);

  const footerText = useMemo(() => {
    if (isLoading) return 'Updating services…';
    const n = Number.isFinite(total) ? total : 0;
    return `${n} service${n === 1 ? '' : 's'} available`;
  }, [isLoading, total]);

  const selectedServiceTypes = safeFilters.serviceTypes || [];
  const selectedBrands = safeFilters.brands || [];
  const selectedServices = safeFilters.serviceCodes || [];

  return (
    <div className="services-filter">
      {/* TOP BAR - Always visible */}
      <div className="filter-top-bar">
        <TextInput
          icon={IconMapPin}
          placeholder="City"
          value={safeFilters.city}
          onChange={(v) => onChange?.('city', v)}
        />

        <Select
          value={safeFilters.radiusKm}
          onChange={(v) => onChange?.('radiusKm', v)}
          options={RADIUS_OPTIONS}
        />

        <Toggle
          checked={safeFilters.openNow || false}
          onChange={(v) => onChange?.('openNow', v)}
          label="Open now"
        />

        <Toggle
          checked={safeFilters.verifiedOnly || false}
          onChange={(v) => onChange?.('verifiedOnly', v)}
          label="Verified"
        />

        <button
          type="button"
          className="btn secondary"
          onClick={() => setOpen((v) => !v)}
        >
          <IconFilter size={16} />
          Filters
        </button>
      </div>

      {/* FILTER PANEL - Expandable */}
      {open && (
        <div className="filter-panel">
          {/* Service Type */}
          <Section label="Service Type">
            <div className="chips-row">
              {SERVICE_TYPES.map((type) => {
                const isSelected = selectedServiceTypes.includes(type.value);
                return (
                  <Chip
                    key={type.value}
                    selected={isSelected}
                    onClick={() => onChange?.('toggleServiceType', type.value)}
                  >
                    {type.label}
                  </Chip>
                );
              })}
            </div>
          </Section>

          {/* Brands - Collapsible with search */}
          <CollapsibleSection label="Brands" defaultCollapsed={true}>
            <div className="brands-section">
              <div className="input-wrapper">
                <IconSearch size={16} className="input-icon" />
                <input
                  type="text"
                  value={brandSearch}
                  placeholder="Search brands..."
                  onChange={(e) => setBrandSearch(e.target.value)}
                />
              </div>
              <div className="chips-grid">
                {filteredBrands.map((brand) => {
                  const isSelected = selectedBrands.includes(brand.value);
                  return (
                    <Chip
                      key={brand.value}
                      selected={isSelected}
                      onClick={() => onChange?.('toggleBrand', brand.value)}
                    >
                      {brand.label}
                    </Chip>
                  );
                })}
              </div>
            </div>
          </CollapsibleSection>

          {/* Services - Popular first, then "Show more" */}
          <Section label="Services">
            <div className="chips-grid">
              {(showAllServices ? allServices : popularServices).map((service) => {
                const isSelected = selectedServices.includes(service.value);
                return (
                  <Chip
                    key={service.value}
                    selected={isSelected}
                    onClick={() => onChange?.('toggleServiceCode', service.value)}
                  >
                    {service.label}
                  </Chip>
                );
              })}
            </div>
            {!showAllServices && allServices.length > POPULAR_SERVICES_LIMIT && (
              <button
                type="button"
                className="btn-link"
                onClick={() => setShowAllServices(true)}
              >
                Show more ({allServices.length - POPULAR_SERVICES_LIMIT} more)
              </button>
            )}
          </Section>

          {/* Rating */}
          <Section label="Rating">
            <Select
              value={safeFilters.ratingFrom || ''}
              onChange={(v) => onChange?.('ratingFrom', v)}
              options={RATING_OPTIONS}
            />
          </Section>
        </div>
      )}

      {/* FOOTER */}
      <div className="filter-footer">{footerText}</div>
    </div>
  );
}
