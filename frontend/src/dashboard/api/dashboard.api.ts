import { gqlRequest } from '@/lib/graphql';
import { listingsApi } from '@/dashboard/api/listings.api';
import { listingMatchesProfile } from '@/dashboard/config/profileScope';
import { inquiriesApi } from '@/features/inquiries/api/inquiries.api';
import type {
  ActivityItem,
  ActiveProfile,
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
  /** Counts come from `myListings` / inquiries; scoped to listing kinds the profile can own. */
  async getStats(profile: ActiveProfile): Promise<DashboardStats> {
    const [listings, unreadInquiries, received] = await Promise.all([
      listingsApi.mine(),
      inquiriesApi.unreadCount(),
      profile.type === 'service' ? inquiriesApi.received().catch(() => []) : Promise.resolve(null),
    ]);

    const scoped = listings.filter((l) => listingMatchesProfile(l.kind, profile));
    const activeListings = scoped.filter((l) => l.status === 'ACTIVE').length;
    const drafts = scoped.filter((l) => l.status === 'DRAFT').length;
    const favorites = scoped.reduce((sum, l) => sum + l.favoritesCount, 0);

    let unread = unreadInquiries;
    if (received) {
      const ids = new Set(scoped.map((l) => l.id));
      unread = received.filter((i) => i.status === 'NEW' && ids.has(i.listingId)).length;
    }

    const stats: DashboardStats['stats'] = [
      { id: 'activeListings', labelKey: 'stats.activeListings', value: activeListings, icon: 'car' },
      { id: 'drafts', labelKey: 'stats.drafts', value: drafts, icon: 'file-pen' },
    ];
    if (profile.type !== 'service') {
      stats.push({ id: 'favorites', labelKey: 'stats.favorites', value: favorites, icon: 'heart' });
    }
    stats.push({ id: 'unreadInquiries', labelKey: 'stats.unreadInquiries', value: unread, icon: 'message' });

    return { stats };
  },

  /** Inquiries on this profile's listing kinds; own bids only on the personal profile. */
  async getActivity(profile: ActiveProfile): Promise<DashboardActivity> {
    const [listings, inquiries, bids] = await Promise.all([
      listingsApi.mine().catch(() => []),
      inquiriesApi.received().catch(() => []),
      profile.type === 'user'
        ? gqlRequest<MyBidsResponse>(MY_BIDS)
            .then((data) => data.myBids ?? [])
            .catch(() => [])
        : Promise.resolve([]),
    ]);

    const listingIds = new Set(
      listings.filter((l) => listingMatchesProfile(l.kind, profile)).map((l) => l.id),
    );
    const scopedInquiries = inquiries.filter((inquiry) => listingIds.has(inquiry.listingId));

    const items: ActivityItem[] = [
      ...scopedInquiries.map<ActivityItem>((inquiry) => ({
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
