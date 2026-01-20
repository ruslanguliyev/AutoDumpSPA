import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard.jsx';
import AutoSearchFilter from '@/vehicles/components/AutoSearchFilter/AutoSearchFilter.jsx';
import { useAuto } from '@/vehicles/store/AutoContext';
import HeroSlider from '@/vehicles/components/Hero/HeroSlider.jsx';
import './Home.scss';

export default function Home() {
  const { filteredAutos, updateFilters } = useAuto();

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  return (
    <div className="home">
      <div className="home__container">
        <HeroSlider />
        <AutoSearchFilter
          onFilterChange={handleFilterChange}
          resultsCount={filteredAutos.length}
        />
        <h2 className="home__section-title">Available Vehicles</h2>
        <div className="home__grid">
          {filteredAutos.map((car) => (
            <AutoCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}
