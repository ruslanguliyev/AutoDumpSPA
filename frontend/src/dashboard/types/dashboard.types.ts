export type ActiveProfile =
  | { type: 'user' }
  | { type: 'seller'; id: string }
  | { type: 'service'; id: string };

export type DashboardStatId =
  | 'activeListings'
  | 'totalViews'
  | 'pendingModeration'
  | 'favorites'
  | 'messages'
  | 'revenue';

export type DashboardStat = {
  id: DashboardStatId;
  labelKey: string;
  value: number;
  change?: number; // percent change vs previous period
  changeLabelKey?: string;
  icon: string;
};

export type ActivityItem = {
  id: string;
  type: 'listing' | 'view' | 'bid' | 'message' | 'moderation' | 'favorite' | 'booking';
  title: string;
  subtitle?: string;
  timestamp: string;
  meta?: Record<string, string | number>;
};

export type ChartDataPoint = {
  date: string;
  value: number;
  label?: string;
};

export type DashboardStats = {
  stats: DashboardStat[];
};

export type DashboardActivity = {
  items: ActivityItem[];
};

export type PerformanceChartData = {
  series: ChartDataPoint[];
};

export type RevenueData = {
  total: number;
  period: string;
  breakdown?: { label: string; value: number }[];
};

export type ServiceBookingsData = {
  upcoming: number;
  completed: number;
  cancelled: number;
};
