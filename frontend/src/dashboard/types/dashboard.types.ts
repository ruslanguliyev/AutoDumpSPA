export type ActiveProfile =
  | { type: 'user' }
  | { type: 'seller'; id: string }
  | { type: 'service'; id: string };

export type DashboardStatId = 'activeListings' | 'drafts' | 'favorites' | 'unreadInquiries';

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
  /** Translation key inside the `dashboard` namespace. */
  title: string;
  subtitle?: string;
  timestamp: string;
  meta?: Record<string, string | number>;
};

export type DashboardStats = {
  stats: DashboardStat[];
};

export type DashboardActivity = {
  items: ActivityItem[];
};
