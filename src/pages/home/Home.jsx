import AutoCard from '../../components/CardComponents/AutoCard.jsx';
import SearchFilter from '../../components/SearchFilter/SearchFilter.jsx';
import AuctionCarCard from '../../components/AuctionCarCard/AuctionCarCard';
import { useAuto } from '../../context/AutoContext';
import { useAuctionStore } from '../../store/auctionStore';
import './Home.scss';
import HeroSlider from '../../components/Hero/HeroSlider.jsx';

export default function Home() {
  const { filteredAutos, updateFilters } = useAuto();
  const { auctions } = useAuctionStore();

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  return (
    <div className="home">



      <div className="home__container">
        <HeroSlider />

        <SearchFilter
          onFilterChange={handleFilterChange}
          resultsCount={filteredAutos.length}
        />
        <h2 className="home__section-title">Available Vehicles</h2>
        <div className="home__grid">
          {filteredAutos.map((car) => (
            <AutoCard key={car.id} car={car} />
          ))}
        </div>


        {auctions.length > 0 && (
          <div className="home__auctions">
            <h2 className="home__section-title">Live Auctions</h2>
            <div className="home__auctions-grid">
              {auctions.map((auction) => (
                <AuctionCarCard key={auction.id} auctionId={auction.id} />
              ))}
            </div>  
          </div>
        )}
      </div>


    </div>
  );
}

