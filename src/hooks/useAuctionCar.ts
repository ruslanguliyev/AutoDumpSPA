import { useAuctionStore, type AuctionCarData } from '@/store/auctionStore';

interface UseAuctionCarOptions {
  auctionId?: string;
}

export function useAuctionCar(options?: UseAuctionCarOptions) {
  const { selectedAuctionId, auctions, setSelectedAuction } = useAuctionStore();
  
  const auctionId = options?.auctionId || selectedAuctionId;
  
  const auction: AuctionCarData | undefined = auctions.find(
    (a) => a.id === auctionId
  );

  if (!auction) {
    // Fallback to first auction if no auction found
    const fallbackAuction = auctions[0];
    return {
      auction: fallbackAuction,
      setSelectedAuction,
      isLoading: false,
      error: null,
    };
  }

  return {
    auction,
    setSelectedAuction,
    isLoading: false,
    error: null,
  };
}

