import type {
  ActiveProfile,
  DashboardStats,
  DashboardActivity,
  PerformanceChartData,
  RevenueData,
  ServiceBookingsData,
} from '@/dashboard/types/dashboard.types';

const GQL_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/graphql';

const getToken = () => localStorage.getItem('autobaz-token');

async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = getToken();
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

const GET_LISTINGS_STATS = `
  query GetListingsStats($filter: ListingsFilterInput) {
    listings(filter: $filter, page: 1, perPage: 1000) {
      items {
        id
        status
      }
      total
    }
  }
`;

const MY_SELLER = `
  query MySeller {
    mySeller {
      id
    }
  }
`;

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

type ListingsStatsResponse = {
  listings: {
    items: Array<{ id: string; status: string }>;
    total: number;
  };
};

type MySellerResponse = {
  mySeller: { id: string } | null;
};

type MyBidsResponse = {
  myBids: Array<{
    id: string;
    auctionId: string;
    amount: number;
    createdAt: string;
  }>;
};

function buildStats(activeCount: number, draftCount: number): DashboardStats {
  return {
    stats: [
      {
        id: 'activeListings',
        labelKey: 'stats.activeListings',
        value: activeCount,
        icon: 'car',
      },
      {
        id: 'pendingModeration',
        labelKey: 'stats.pendingModeration',
        value: draftCount,
        icon: 'clock',
      },
      {
        id: 'totalViews',
        labelKey: 'stats.totalViews',
        value: 0,
        icon: 'eye',
      },
      {
        id: 'favorites',
        labelKey: 'stats.favorites',
        value: 0,
        icon: 'heart',
      },
      {
        id: 'messages',
        labelKey: 'stats.messages',
        value: 0,
        icon: 'message',
      },
    ],
  };
}

const mockChartData = (): PerformanceChartData => {
  const days = 14;
  const series: PerformanceChartData['series'] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    series.push({
      date: d.toISOString().slice(0, 10),
      value: Math.round(80 + Math.random() * 120 + Math.sin(i * 0.5) * 30),
    });
  }
  return { series };
};

export const dashboardApi = {
  async getStats(profile: ActiveProfile): Promise<DashboardStats> {
    try {
      let sellerId: string | null = null;

      if (profile.type === 'seller' || profile.type === 'service') {
        sellerId = profile.id;
      } else {
        const sellerData = await gqlRequest<MySellerResponse>(MY_SELLER);
        sellerId = sellerData.mySeller?.id ?? null;
        if (!sellerId) {
          return { stats: [] };
        }
      }

      const data = await gqlRequest<ListingsStatsResponse>(GET_LISTINGS_STATS, {
        filter: { sellerId },
      });

      const items = data.listings?.items ?? [];
      const activeCount = items.filter((i) => i.status === 'ACTIVE').length;
      const draftCount = items.filter((i) => i.status === 'DRAFT').length;

      return buildStats(activeCount, draftCount);
    } catch {
      return { stats: [] };
    }
  },

  async getActivity(_profile: ActiveProfile): Promise<DashboardActivity> {
    try {
      const data = await gqlRequest<MyBidsResponse>(MY_BIDS);
      const bids = data.myBids ?? [];
      return {
        items: bids.map((bid) => ({
          id: bid.id,
          type: 'bid' as const,
          title: 'activity.newBid',
          subtitle: `${bid.amount} AZN`,
          timestamp:
            typeof bid.createdAt === 'string'
              ? bid.createdAt
              : new Date(bid.createdAt).toISOString(),
        })),
      };
    } catch {
      return { items: [] };
    }
  },

  async getPerformanceChart(_profile: ActiveProfile): Promise<PerformanceChartData> {
    try {
      return mockChartData();
    } catch {
      return { series: [] };
    }
  },

  async getRevenue(_profile: ActiveProfile): Promise<RevenueData> {
    try {
      return { total: 0, period: 'month' };
    } catch {
      return { total: 0, period: 'month' };
    }
  },

  async getServiceBookings(_profile: ActiveProfile): Promise<ServiceBookingsData> {
    try {
      return { upcoming: 0, completed: 0, cancelled: 0 };
    } catch {
      return { upcoming: 0, completed: 0, cancelled: 0 };
    }
  },
};
