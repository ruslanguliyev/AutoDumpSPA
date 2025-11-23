// src/components/SearchFilter/SearchFilter.jsx (примерный путь)

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  IconCar,
  IconBike,
  IconCamper,
  IconTruck,
  IconDeviceDesktop,
} from '@tabler/icons-react';

// ✅ ВАЖНО: поправь путь, если у тебя другая структура
import {
  makesByCategory,
  priceRanges,
  registrationYears,
} from '../../data/options';
// если alias @ не настроен, сделай так, например:
// import { makesByCategory, priceRanges, registrationYears } from '../../data/searchFilterOptions';

import './SearchFilter.scss';

const vehicleTypes = [
  { id: 'car', label: 'Car', icon: IconCar, color: '#dc2626' },
  { id: 'motorcycle', label: 'Motorcycle', icon: IconBike, color: '#dc2626' },
  { id: 'camper', label: 'Camper', icon: IconCamper, color: '#2563eb' },
  { id: 'truck', label: 'Truck', icon: IconTruck, color: '#dc2626' },
  { id: 'commercial', label: 'Commercial', icon: IconDeviceDesktop, color: '#000000' },
];

const regions = [
  { value: 'europe', label: 'EU Europe', flag: '🇪🇺' },
  { value: 'germany', label: 'Germany', flag: '🇩🇪' },
  { value: 'france', label: 'France', flag: '🇫🇷' },
  { value: 'italy', label: 'Italy', flag: '🇮🇹' },
  { value: 'spain', label: 'Spain', flag: '🇪🇸' },
  { value: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
];

export default function SearchFilter({ onFilterChange, resultsCount = 0 }) {
  const navigate = useNavigate();

  const [activeVehicleType, setActiveVehicleType] = useState('car');
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    price: '',
    registration: '',
    region: 'europe',
    city: '',
  });

  // Марки для выбранного типа (car / motorcycle / camper / truck / commercial)
  const currentMakes = useMemo(() => {
    return makesByCategory[activeVehicleType] || makesByCategory.car || [];
  }, [activeVehicleType]);

  // При смене типа транспорта — сбрасываем марку
  useEffect(() => {
    setFilters((prev) => ({ ...prev, make: '' }));
  }, [activeVehicleType]);

  const handleVehicleTypeChange = (typeId) => {
    setActiveVehicleType(typeId);
    const newFilters = { ...filters, make: '', vehicleType: typeId };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange?.({ ...newFilters, vehicleType: activeVehicleType });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (activeVehicleType) params.set('type', activeVehicleType);
    if (filters.make) params.set('brand', filters.make);
    if (filters.model) params.set('model', filters.model);
    if (filters.price) params.set('priceTo', filters.price);
    if (filters.registration) params.set('yearFrom', filters.registration);
    if (filters.region) params.set('region', filters.region);
    if (filters.city) params.set('city', filters.city);

    onFilterChange?.({ ...filters, vehicleType: activeVehicleType });

    navigate(`/search?${params.toString()}`);
  };

  const formatResultsCount = (count) =>
    new Intl.NumberFormat('en-US').format(count);

  return (
    <div className="search-filter">
      <div className="search-filter__container">
        {/* Навигация по типам транспорта */}
        <div className="search-filter__nav">
          {vehicleTypes.map((type) => {
            const IconComponent = type.icon;
            const isActive = activeVehicleType === type.id;
            return (
              <button
                key={type.id}
                className={`search-filter__nav-item ${isActive ? 'search-filter__nav-item--active' : ''
                  }`}
                onClick={() => handleVehicleTypeChange(type.id)}
                aria-label={type.label}
                type="button"
              >
                <IconComponent
                  className="search-filter__nav-icon"
                  style={{ color: type.color }}
                  size={24}
                />
                <span className="search-filter__nav-label">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Основная форма поиска */}
        <div className="search-filter__form-wrapper">
          <h2 className="search-filter__title">
            Find used vehicles and new vehicles
          </h2>

          <div className="search-filter__form">
            {/* Первая строка */}
            <div className="search-filter__row">
              <div className="search-filter__field">
                <label htmlFor="make" className="search-filter__label">
                  Make
                </label>
                <div className="search-filter__select-wrapper">
                  <select
                    id="make"
                    className="search-filter__select"
                    value={filters.make}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                  >
                    {currentMakes.map((make) => (
                      <option key={make} value={make === 'All Makes' ? '' : make}>
                        {make}
                      </option>
                    ))}
                  </select>
                  <span className="search-filter__chevron">▼</span>
                </div>
              </div>

              <div className="search-filter__field">
                <label htmlFor="model" className="search-filter__label">
                  Model
                </label>
                <input
                  id="model"
                  type="text"
                  className="search-filter__input"
                  placeholder="Model"
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                />
              </div>

              <div className="search-filter__field">
                <label htmlFor="price" className="search-filter__label">
                  Price up to (€)
                </label>
                <div className="search-filter__select-wrapper">
                  <select
                    id="price"
                    className="search-filter__select"
                    value={filters.price}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                  >
                    {priceRanges.map((price) => (
                      <option
                        key={price}
                        value={price === 'No limit' ? '' : price}
                      >
                        {price}
                      </option>
                    ))}
                  </select>
                  <span className="search-filter__chevron">▼</span>
                </div>
              </div>
            </div>

            {/* Вторая строка */}
            <div className="search-filter__row">
              <div className="search-filter__field">
                <label htmlFor="registration" className="search-filter__label">
                  First registration from
                </label>
                <div className="search-filter__select-wrapper">
                  <select
                    id="registration"
                    className="search-filter__select"
                    value={filters.registration}
                    onChange={(e) =>
                      handleFilterChange('registration', e.target.value)
                    }
                  >
                    {registrationYears.map((year) => (
                      <option
                        key={year}
                        value={year === 'Any year' ? '' : year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                  <span className="search-filter__chevron">▼</span>
                </div>
              </div>

              <div className="search-filter__field">
                <label htmlFor="region" className="search-filter__label">
                  Region
                </label>
                <div className="search-filter__select-wrapper">
                  <select
                    id="region"
                    className="search-filter__select"
                    value={filters.region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                  >
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.flag} {region.label}
                      </option>
                    ))}
                  </select>
                  <span className="search-filter__chevron">▼</span>
                </div>
              </div>

              <div className="search-filter__field">
                <label htmlFor="city" className="search-filter__label">
                  Location
                </label>
                <input
                  id="city"
                  type="text"
                  className="search-filter__input"
                  placeholder="City/ZIP"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="search-filter__actions">
            <button
              className="search-filter__refine"
              type="button"
            // сюда позже можно повесить открытие "доп. фильтров"
            >
              Refine search
            </button>
            <button
              className="search-filter__button"
              onClick={handleSearch}
              type="button"
            >
              {formatResultsCount(resultsCount)} results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
