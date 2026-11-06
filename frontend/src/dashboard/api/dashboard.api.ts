import { gqlRequest } from '@/lib/graphql';
import { listingsApi } from '@/dashboard/api/listings.api';
import { inquiriesApi } from '@/features/inquiries/api/inquiries.api';
import type {
  ActivityItem,
  DashboardActivity,
  DashboardStats,
} from '@/dashboard/types/dashboard.types';

const MY_BIDS = `
  query MyBids {
    myBids {
      id
      auctionId
      amount
      createdAt
    }
  }
`;

type MyBidsResponse = {
  myBids: Array<{
    id: string;
    auctionId: string;
    amount: number;
    createdAt: string;
  }>;
};

const toIso = (value: string | number | Date): string =>
  typeof value === 'string' ? value : new Date(value).toISOString();

const snippet = (text: string, max = 60): string =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

export const dashboardApi = {
  /** Every number comes from the backend; nothing here is estimated. */
  async getStats(): Promise<DashboardStats> {
    const [listings, unreadInquiries] = await Promise.all([
      listingsApi.mine(),
      inquiriesApi.unreadCount(),
    ]);

    const activeListings = listings.filter((l) => l.status === 'ACTIVE').length;
    const drafts = listings.filter((l) => l.status === 'DRAFT').length;
    const favorites = listings.reduce((sum, l) => sum + l.favoritesCount, 0);

    return {
      stats: [
        { id: 'activeListings', labelKey: 'stats.activeListings', value: activeListings, icon: 'car' },
        { id: 'drafts', labelKey: 'stats.drafts', value: drafts, icon: 'clock' },
        { id: 'favorites', labelKey: 'stats.favorites', value: favorites, icon: 'heart' },
        { id: 'unreadInquiries', labelKey: 'stats.unreadInquiries', value: unreadInquiries, icon: 'message' },
      ],
    };
  },

  /** Latest inquiries received by the seller plus the user's own bids, newest first. */
  async getActivity(): Promise<DashboardActivity> {
    const [inquiries, bids] = await Promise.all([
      inquiriesApi.received().catch(() => []),
      gqlRequest<MyBidsResponse>(MY_BIDS)
        .then((data) => data.myBids ?? [])
        .catch(() => []),
    ]);

    const items: ActivityItem[] = [
      ...inquiries.map<ActivityItem>((inquiry) => ({
        id: `inquiry-${inquiry.id}`,
        type: 'message' as const,
        title: 'activity.newInquiry',
        subtitle: `${inquiry.listingTitle}: ${snippet(inquiry.message)}`,
        timestamp: toIso(inquiry.createdAt),
      })),
      ...bids.map<ActivityItem>((bid) => ({
        id: `bid-${bid.id}`,
        type: 'bid' as const,
        title: 'activity.newBid',
        subtitle: `${bid.amount} AZN`,
        timestamp: toIso(bid.createdAt),
      })),
    ];

    return {
      items: items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    };
  },
};
