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

  return (
    <div className="home">
      <SearchFilter
        onFilterChange={handleFilterChange}
        resultsCount={filteredAutos.length}
      />

      <div className="home__container">
        <h2 className="home__section-title">Available Vehicles</h2>
        <div className="home__grid">
          {filteredAutos.map((car) => (
            <AutoCard key={car.id} car={car} />
          ))}
        </div>
      </div>

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
    </div>
  );
}

