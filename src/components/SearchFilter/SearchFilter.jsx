import { useState, useMemo, useEffect } from 'react';
import {
  IconCar,
  IconBike,
  IconCamper,
  IconTruck,
  IconDeviceDesktop,
} from '@tabler/icons-react';
import './SearchFilter.scss';

const vehicleTypes = [
  { id: 'car', label: 'Car', icon: IconCar, color: '#dc2626' },
  { id: 'motorcycle', label: 'Motorcycle', icon: IconBike, color: '#dc2626' },
  { id: 'camper', label: 'Camper', icon: IconCamper, color: '#2563eb' },
  { id: 'truck', label: 'Truck', icon: IconTruck, color: '#dc2626' },
  { id: 'commercial', label: 'Commercial', icon: IconDeviceDesktop, color: '#000000' },
];

// Марки для каждой категории транспорта
const makesByCategory = {
  car: [
    'All Makes',
    'Mercedes-Benz',
    'BMW',
    'Audi',
    'Rolls Royce',
    'Bentley',
    'Porsche',
    'Ferrari',
    'Lamborghini',
    'Volkswagen',
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'Nissan',
    'Hyundai',
    'Kia',
    'Mazda',
    'Subaru',
    'Lexus',
  ],
  motorcycle: [
    'All Makes',
    'Harley-Davidson',
    'Honda',
    'Yamaha',
    'Kawasaki',
    'Suzuki',
    'Ducati',
    'BMW',
    'Triumph',
    'Indian',
    'KTM',
    'Aprilia',
    'Moto Guzzi',
    'Royal Enfield',
    'MV Agusta',
  ],
  camper: [
    'All Makes',
    'Winnebago',
    'Airstream',
    'Forest River',
    'Thor Industries',
    'Fleetwood',
    'Newmar',
    'Tiffin',
    'Jayco',
    'Coachmen',
    'Keystone',
    'Dutchmen',
    'Grand Design',
    'Entegra',
  ],
  truck: [
    'All Makes',
    'Ford',
    'Chevrolet',
    'Ram',
    'GMC',
    'Toyota',
    'Nissan',
    'Dodge',
    'Mercedes-Benz',
    'Volvo',
    'Peterbilt',
    'Kenworth',
    'Freightliner',
    'Mack',
    'International',
  ],
  commercial: [
    'All Makes',
    'Mercedes-Benz',
    'Ford',
    'Volkswagen',
    'Fiat',
    'Peugeot',
    'Citroën',
    'Renault',
    'Iveco',
    'MAN',
    'Scania',
    'DAF',
    'Isuzu',
    'Mitsubishi',
  ],
};

const priceRanges = [
  'No limit',
  '€5,000',
  '€10,000',
  '€20,000',
  '€30,000',
  '€50,000',
  '€75,000',
  '€100,000',
  '€150,000',
  '€200,000',
  '€300,000',
  '€500,000',
];

const registrationYears = [
  'Any year',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018',
  '2017',
  '2016',
  '2015',
  'Older',
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
  const [activeVehicleType, setActiveVehicleType] = useState('car');
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    price: '',
    registration: '',
    region: 'europe',
    city: '',
  });

  // Получаем список марок для текущей категории транспорта
  const currentMakes = useMemo(() => {
    return makesByCategory[activeVehicleType] || makesByCategory.car;
  }, [activeVehicleType]);

  // Сбрасываем марку при смене категории транспорта
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
    onFilterChange?.({ ...filters, vehicleType: activeVehicleType });
  };

  const formatResultsCount = (count) => {
    return new Intl.NumberFormat('en-US').format(count);
  };

  return (
    <div className="search-filter">
      <div className="search-filter__container">
        {/* Vehicle Type Navigation */}
        <div className="search-filter__nav">
          {vehicleTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                className={`search-filter__nav-item ${
                  activeVehicleType === type.id ? 'search-filter__nav-item--active' : ''
                }`}
                onClick={() => handleVehicleTypeChange(type.id)}
                aria-label={type.label}
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

        {/* Main Search Form */}
        <div className="search-filter__form-wrapper">
          <h2 className="search-filter__title">
            Find used vehicles and new vehicles
          </h2>

          <div className="search-filter__form">
            {/* First Row */}
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

            {/* Second Row */}
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
            <a href="#" className="search-filter__refine">
              Refine search
            </a>
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

