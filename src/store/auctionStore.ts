import { create } from 'zustand';

export interface AuctionCarData {
  id: string;
  image: string;
  title: string;
  currentBid: number;
  marketPrice: number;
  priceTrend: 'up' | 'down' | 'neutral';
  views5m: number;
  watchers: number;
  bids1h: number;
  endsAt: string;
  urgent?: boolean;
  live?: boolean;
}

interface AuctionStore {
  selectedAuctionId: string | null;
  auctions: AuctionCarData[];
  setSelectedAuction: (id: string) => void;
  updateAuction: (id: string, data: Partial<AuctionCarData>) => void;
  addAuction: (auction: AuctionCarData) => void;
}

// Mock data - в реальном приложении это будет приходить из API
const mockAuctions: AuctionCarData[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    title: 'BMW 520d · 2016 · 149,000 km · 190 hp',
    currentBid: 28500,
    marketPrice: 27000,
    priceTrend: 'up',
    views5m: 47,
    watchers: 12,
    bids1h: 8,
    endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    urgent: false,
    live: true,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    title: 'Mercedes-Benz E-Class · 2018 · 98,000 km · 245 hp',
    currentBid: 32000,
    marketPrice: 35000,
    priceTrend: 'down',
    views5m: 32,
    watchers: 8,
    bids1h: 5,
    endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    urgent: true,
    live: true,
  },
];

export const useAuctionStore = create<AuctionStore>((set) => ({
  selectedAuctionId: mockAuctions[0]?.id || null,
  auctions: mockAuctions,
  
  setSelectedAuction: (id) => 
    set({ selectedAuctionId: id }),
  
  updateAuction: (id, data) =>
    set((state) => ({
      auctions: state.auctions.map((auction) =>
        auction.id === id ? { ...auction, ...data } : auction
      ),
    })),
  
  addAuction: (auction) =>
    set((state) => ({
      auctions: [...state.auctions, auction],
    })),
}));

