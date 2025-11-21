import { useMemo } from 'react';
import AutoCard from '../../components/CardComponents/AutoCard.jsx';
import SearchFilter from '../../components/SearchFilter/SearchFilter.jsx';
import { useAuto } from '../../context/AutoContext';
import './Home.scss';

export default function Home() {
  const { filteredAutos, updateFilters } = useAuto();

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  // Генерируем уникальные ключи для карточек
  const carsWithIds = useMemo(() => {
    return filteredAutos.map((car, index) => ({
      ...car,
      id: car.id || `car-${index}-${car.brand}-${car.model}`,
    }));
  }, [filteredAutos]);

  return (
    <div className="home">
      <SearchFilter
        onFilterChange={handleFilterChange}
        resultsCount={filteredAutos.length}
      />
      <div className="home__container">
        <div className="home__grid">
          {carsWithIds.map((car) => (
            <AutoCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}
