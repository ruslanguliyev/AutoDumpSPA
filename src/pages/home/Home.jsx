import { useMemo } from 'react';
import AutoCard from '../../components/CardComponents/AutoCard.jsx';
import SearchFilter from '../../components/SearchFilter/SearchFilter.jsx';
import AuctionCarCard from '../../components/AuctionCarCard/AuctionCarCard';
import { useAuto } from '../../context/AutoContext';
import { useAuctionStore } from '../../store/auctionStore';
import './Home.scss';

export default function Home() {
  const { filteredAutos, updateFilters } = useAuto();
  const { auctions } = useAuctionStore();

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
      
      {/* Auction Cards Section */}
      {auctions.length > 0 && (
        <div className="home__auctions">
          <div className="home__container">
            <h2 className="home__section-title">Live Auctions</h2>
            <div className="home__auctions-grid">
              {auctions.map((auction) => (
                <AuctionCarCard key={auction.id} auctionId={auction.id} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Regular Cars Section */}
      <div className="home__container">
        <h2 className="home__section-title">Available Vehicles</h2>
        <div className="home__grid">
          {carsWithIds.map((car) => (
            <AutoCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
}
