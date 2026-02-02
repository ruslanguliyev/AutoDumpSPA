import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const Select = ({ value, onChange, options, placeholder, translateOptions = false, t }) => {
  const getLabel = (option) => {
    if (!translateOptions || !t) return option.label;
    
    // Translate condition values
    if (option.value === 'new') return t('filter.new');
    if (option.value === 'used') return t('filter.used');
    if (option.value === 'refurbished') return t('filter.refurbished');
    if (option.value === 'all' && option.label === 'Any condition') return t('filter.anyCondition');
    
    // Translate sort options
    if (option.value === 'RELEVANCE') return t('filter.relevance');
    if (option.value === 'PRICE_ASC') return t('filter.priceLowToHigh');
    if (option.value === 'PRICE_DESC') return t('filter.priceHighToLow');
    if (option.value === 'NEWEST') return t('filter.newestFirst');
    
    // Translate categories
    if (option.value === 'engine') return t('categories.engine');
    if (option.value === 'transmission') return t('categories.transmission');
    if (option.value === 'suspension') return t('categories.suspension');
    if (option.value === 'brakes') return t('categories.brakes');
    if (option.value === 'body') return t('categories.body');
    if (option.value === 'interior') return t('categories.interior');
    if (option.value === 'electrical') return t('categories.electrical');
    if (option.value === 'wheels') return t('categories.wheels');
    if (option.value === 'all' && option.label === 'All categories') return t('filter.allCategories');
    
    return option.label;
  };

  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {(options ?? []).map((option) => (
        <option key={option.value} value={option.value}>
          {getLabel(option)}
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
  const { t } = useTranslation('part');
  const [open, setOpen] = useState(false);

  return (
    <div className="parts-filter">
      {/* PRIMARY BAR */}
      <div className="filter-primary">
        <TextInput
          icon={IconSearch}
          placeholder={t('filter.search')}
          value={filters.search}
          onChange={(v) => onChange('search', v)}
        />

        <Select
          value={filters.category}
          onChange={(v) => onChange('category', v)}
          options={options.categories}
          placeholder={t('filter.allCategories')}
          translateOptions={true}
          t={t}
        />

        <button
          type="button"
          className="btn secondary"
          onClick={() => setOpen((v) => !v)}
        >
          <IconFilter size={16} />
          {t('filter.filters')}
        </button>

        <button
          type="button"
          className="btn ghost"
          onClick={onReset}
          title={t('filter.reset')}
        >
          <IconRotate size={16} />
        </button>
      </div>

      {/* ADVANCED */}
      {open && (
        <div className="filter-advanced">
          <Section label={t('filter.brand')}>
            <Select
              value={filters.brand}
              onChange={(v) => onChange('brand', v)}
              options={options.brands}
              placeholder={t('filter.allBrands')}
            />
          </Section>

          <Section label={t('filter.model')}>
            <Select
              value={filters.model}
              onChange={(v) => onChange('model', v)}
              options={options.models}
              placeholder={t('filter.allModels')}
            />
          </Section>

          <Section label={t('filter.condition')}>
            <Select
              value={filters.condition}
              onChange={(v) => onChange('condition', v)}
              options={options.conditions}
              placeholder={t('filter.anyCondition')}
              translateOptions={true}
              t={t}
            />
          </Section>

          <Section label={t('filter.location')}>
            <Select
              value={filters.location}
              onChange={(v) => onChange('location', v)}
              options={options.locations}
              placeholder={t('filter.anyLocation')}
            />
          </Section>

          <Section label={t('filter.priceFrom')}>
            <div className="price-row">
              <NumberInput
                placeholder={t('filter.from')}
                value={filters.priceFrom}
                onChange={(v) => onChange('priceFrom', v)}
              />
              <NumberInput
                placeholder={t('filter.to')}
                value={filters.priceTo}
                onChange={(v) => onChange('priceTo', v)}
              />
            </div>
          </Section>

          <Section label={t('filter.sortBy')}>
            <Select
              value={filters.sort}
              onChange={(v) => onChange('sort', v)}
              options={options.sorts}
              translateOptions={true}
              t={t}
            />
          </Section>
        </div>
      )}

      {/* FOOTER */}
      <div className="filter-footer">
        {isLoading ? t('list.updatingInventory') : t('list.partsAvailable', { count: total })}
      </div>
    </div>
  );
};

export default PartsSearchFilter;
