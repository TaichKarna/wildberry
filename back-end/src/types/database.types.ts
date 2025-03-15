// Database types for use with query results

export interface DbUser {
  id: number | string;
  username: string;
  password_hash: string;
  role: string;
  status?: string;
}

export interface DbRefreshToken {
  id: number | string;
  user_id: number | string;
  token: string;
  expires_at: Date;
}

export interface DbAnalytics {
  date: string;
  revenue: number;
  subscriptions: number;
  one_time_revenue: number;
  refunds: number;
  net_revenue: number;
  total_revenue: number;
  active_subscriptions: number;
  new_customers: number;
  churn_rate: number;
  mrr: number;
  total_subscribers: number;
  active_subscribers: number;
  churned: number;
  recovered: number;
  upgrades: number;
  downgrades: number;
  average_revenue: number;
  lifetime_value: number;
  count: number;
}
