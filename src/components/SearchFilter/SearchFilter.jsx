// src/components/SearchFilter/SearchFilter.jsx

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  IconCar,
  IconBike,
  IconCamper,
  IconTruck,
  IconDeviceDesktop,
} from '@tabler/icons-react';

import {
  makesByCategory,
  priceRanges,
  registrationYears,
} from '../../data/options';

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

export default function SearchFilter({
  variant = 'hero', // 👈 hero | compact
  resultsCount = 0,
}) {
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

  const currentMakes = useMemo(() => {
    return makesByCategory[activeVehicleType] || [];
  }, [activeVehicleType]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, make: '' }));
  }, [activeVehicleType]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    params.set('type', activeVehicleType);
    if (filters.make) params.set('brand', filters.make);
    if (filters.model) params.set('model', filters.model);
    if (filters.price) params.set('priceTo', filters.price);
    if (filters.registration) params.set('yearFrom', filters.registration);
    if (filters.region) params.set('region', filters.region);
    if (filters.city) params.set('city', filters.city);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className={`search-filter search-filter--${variant} mb-3`}>
      <div className="search-filter__container">

        {/* VEHICLE TYPES */}
        <div className="search-filter__nav">
          {vehicleTypes.map((type) => {
            const Icon = type.icon;
            const active = activeVehicleType === type.id;

            return (
              <button
                key={type.id}
                className={`search-filter__nav-item ${active ? 'is-active' : ''}`}
                onClick={() => setActiveVehicleType(type.id)}
                type="button"
              >
                <Icon size={variant === 'compact' ? 18 : 22} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* FORM */}
        <div className="search-filter__form">

          {/* ROW 1 */}
          <div className="search-filter__row">
            <select value={filters.make} onChange={(e) => handleFilterChange('make', e.target.value)}>
              {currentMakes.map((make) => (
                <option key={make} value={make === 'All Makes' ? '' : make}>
                  {make}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Model"
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
            />

            <select value={filters.price} onChange={(e) => handleFilterChange('price', e.target.value)}>
              {priceRanges.map((price) => (
                <option key={price} value={price === 'No limit' ? '' : price}>
                  {price}
                </option>
              ))}
            </select>

            {variant === 'compact' && (
              <button className="search-filter__button" onClick={handleSearch}>
                {resultsCount} results
              </button>
            )}
          </div>

          {/* ROW 2 (только hero) */}
          {variant === 'hero' && (
            <div className="search-filter__row">
              <select value={filters.registration} onChange={(e) => handleFilterChange('registration', e.target.value)}>
                {registrationYears.map((year) => (
                  <option key={year} value={year === 'Any year' ? '' : year}>
                    {year}
                  </option>
                ))}
              </select>

              <select value={filters.region} onChange={(e) => handleFilterChange('region', e.target.value)}>
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.flag} {r.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="City / ZIP"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />

              <button className="search-filter__button" onClick={handleSearch}>
                {resultsCount} results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
