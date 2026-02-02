import { useMemo } from 'react';
import AutoCard from '@/vehicles/components/AutoCardComponent/AutoCard.jsx';
import HeroSlider from '@/vehicles/components/Hero/HeroSlider.jsx';
import FiltersPanel from '@/features/filters/components/FiltersPanel';
import { createCarsFiltersConfig } from '@/features/filters/config/cars.filters';
import { useAutos } from '@/vehicles/hooks/useAutos';
import './Home.scss';

export default function Home() {
  const { autos } = useAutos();

  const filtersConfig = useMemo(
    () => createCarsFiltersConfig({ variant: 'hero' }),
    []
  );

  return (
    <div className="home">
      <div className="home__container">
        <HeroSlider />
        <FiltersPanel domain="cars" config={filtersConfig} total={autos.length} />
        <h2 className="home__section-title">Available Vehicles</h2>
        <div className="home__grid">
          {autos.map((car) => (
            <AutoCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}
