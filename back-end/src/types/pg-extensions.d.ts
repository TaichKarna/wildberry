import { QueryResult } from 'pg';

// Extend the QueryResult interface to allow accessing properties dynamically
declare module 'pg' {
  interface QueryResultRow {
    [key: string]: any;
    id?: number | string;
    username?: string;
    password_hash?: string;
    role?: string;
    user_id?: number | string;
    date?: string;
    revenue?: string | number;
    subscriptions?: string | number;
    one_time_revenue?: string | number;
    refunds?: string | number;
    net_revenue?: string | number;
    total_revenue?: string | number;
    active_subscriptions?: string | number;
    new_customers?: string | number;
    churn_rate?: string | number;
    mrr?: string | number;
    total_subscribers?: string | number;
    active_subscribers?: string | number;
    churned?: string | number;
    recovered?: string | number;
    upgrades?: string | number;
    downgrades?: string | number;
    average_revenue?: string | number;
    lifetime_value?: string | number;
    count?: string | number;
    product_id?: string | number;
    entitlement_id?: string | number;
  }

  interface QueryResult<T = any> {
    rows: QueryResultRow[];
    rowCount: number;
    command: string;
    oid: number;
    fields: any[];
    query?: (text: string, values?: any[]) => Promise<QueryResult<any>>;
  }
}
