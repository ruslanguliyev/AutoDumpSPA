// Example usage of AuctionCarCard component
// The component now uses Zustand store and custom hook instead of props
import AuctionCarCard from './AuctionCarCard';

export default function AuctionCarCardExample() {
  return (
    <div className="max-w-md mx-auto p-4 bg-[#0a0a0a] min-h-screen">
      {/* Uses selected auction from store by default */}
      <AuctionCarCard />
      
      {/* Or specify a specific auction ID */}
      {/* <AuctionCarCard auctionId="2" /> */}
    </div>
  );
}

