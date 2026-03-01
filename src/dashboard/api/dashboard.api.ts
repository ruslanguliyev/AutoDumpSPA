import type {
  ActiveProfile,
  DashboardStats,
  DashboardActivity,
  PerformanceChartData,
  RevenueData,
  ServiceBookingsData,
} from '@/dashboard/types/dashboard.types';

const MOCK_DELAY_MS = 400;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockStatsByProfile = (profile: ActiveProfile): DashboardStats => {
  const base = {
    stats: [
      { id: 'activeListings', labelKey: 'stats.activeListings', value: 12, change: 2, icon: 'car' },
      { id: 'totalViews', labelKey: 'stats.totalViews', value: 1847, change: 14, icon: 'eye' },
      { id: 'pendingModeration', labelKey: 'stats.pendingModeration', value: 2, change: -1, icon: 'clock' },
      { id: 'favorites', labelKey: 'stats.favorites', value: 34, change: 5, icon: 'heart' },
      { id: 'messages', labelKey: 'stats.messages', value: 8, icon: 'message' },
    ],
  };

  if (profile.type === 'seller') {
    base.stats.push({
      id: 'revenue',
      labelKey: 'stats.revenue',
      value: 12450,
      change: 18,
      changeLabelKey: 'stats.vsLastMonth',
      icon: 'dollar',
    });
  }

  if (profile.type === 'service') {
    base.stats.push({
      id: 'revenue',
      labelKey: 'stats.revenue',
      value: 8920,
      change: 12,
      changeLabelKey: 'stats.vsLastMonth',
      icon: 'dollar',
    });
  }

  return base;
};

const mockActivityByProfile = (profile: ActiveProfile): DashboardActivity => ({
  items: [
    { id: '1', type: 'view', title: 'activity.viewedListing', subtitle: 'BMW X5 2020', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: '2', type: 'bid', title: 'activity.newBid', subtitle: 'Audi A4 — 24,500 AZN', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { id: '3', type: 'message', title: 'activity.newMessage', subtitle: 'John D.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: '4', type: 'moderation', title: 'activity.listingApproved', subtitle: 'Toyota Camry 2019', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: '5', type: 'listing', title: 'activity.listingPublished', subtitle: 'Mercedes C200', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
    { id: '6', type: 'favorite', title: 'activity.addedToFavorites', subtitle: 'Ford Focus 2018', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  ],
});

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

const mockRevenue = (profile: ActiveProfile): RevenueData => {
  if (profile.type === 'user') {
    return { total: 0, period: 'month' };
  }
  return {
    total: profile.type === 'seller' ? 12450 : 8920,
    period: 'month',
    breakdown: [
      { label: 'Vehicles', value: 8000 },
      { label: 'Parts', value: 2450 },
      { label: 'Services', value: 2000 },
    ],
  };
};

const mockServiceBookings = (): ServiceBookingsData => ({
  upcoming: 5,
  completed: 23,
  cancelled: 2,
});

export const dashboardApi = {
  async getStats(profile: ActiveProfile): Promise<DashboardStats> {
    await delay(MOCK_DELAY_MS);
    return mockStatsByProfile(profile);
  },

  async getActivity(profile: ActiveProfile): Promise<DashboardActivity> {
    await delay(MOCK_DELAY_MS);
    return mockActivityByProfile(profile);
  },

  async getPerformanceChart(profile: ActiveProfile): Promise<PerformanceChartData> {
    await delay(MOCK_DELAY_MS);
    return mockChartData();
  },

  async getRevenue(profile: ActiveProfile): Promise<RevenueData> {
    await delay(MOCK_DELAY_MS);
    return mockRevenue(profile);
  },

  async getServiceBookings(profile: ActiveProfile): Promise<ServiceBookingsData> {
    await delay(MOCK_DELAY_MS);
    if (profile.type === 'service') return mockServiceBookings();
    return { upcoming: 0, completed: 0, cancelled: 0 };
  },
};
