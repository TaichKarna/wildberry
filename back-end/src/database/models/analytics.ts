import { query } from '..';
import { DateRangeQuery, AnalyticsQuery } from '../../types/api.types';
import { getRow, getRows } from '../utils';

export interface OverviewStats {
    totalRevenue: number;
    activeSubscriptions: number;
    newCustomers: number;
    churnRate: number;
    mrr: number;
    arr: number;
}

export interface RevenueMetrics {
    date: string;
    revenue: number;
    subscriptions: number;
    oneTimeRevenue: number;
    refunds: number;
    netRevenue: number;
}

export interface SubscriptionMetrics {
    totalSubscribers: number;
    activeSubscribers: number;
    churned: number;
    recovered: number;
    upgrades: number;
    downgrades: number;
    averageRevenue: number;
    lifetimeValue: number;
}

export async function getOverviewStats(params: DateRangeQuery): Promise<OverviewStats> {
    const { startDate, endDate, appId } = params;

    // Base conditions for queries
    const conditions = ['created_at BETWEEN $1 AND $2'];
    const queryParams = [startDate, endDate];
    
    if (appId) {
        conditions.push('app_id = $3');
        queryParams.push(appId);
    }

    const whereClause = conditions.join(' AND ');

    // Get total revenue
    const revenueResult = await query(
        `SELECT COALESCE(SUM(amount), 0) as total_revenue
         FROM transactions
         WHERE ${whereClause}`,
        queryParams
    );

    // Get subscription metrics
    const subscriptionResult = await query(
        `SELECT 
            COUNT(DISTINCT customer_id) as active_subscriptions,
            COUNT(DISTINCT CASE WHEN created_at BETWEEN $1 AND $2 THEN customer_id END) as new_customers,
            COALESCE(
                NULLIF(
                    COUNT(DISTINCT CASE WHEN status = 'churned' THEN customer_id END)::float / 
                    NULLIF(COUNT(DISTINCT customer_id), 0), 
                    0
                ) * 100,
                0
            ) as churn_rate
         FROM subscriptions
         WHERE ${whereClause}`,
        queryParams
    );

    // Get MRR and ARR
    const recurringResult = await query(
        `SELECT 
            COALESCE(SUM(CASE WHEN interval = 'month' THEN amount ELSE amount/12 END), 0) as mrr
         FROM subscriptions
         WHERE status = 'active' AND ${whereClause}`,
        queryParams
    );

    return {
        totalRevenue: parseFloat(getRow(revenueResult).total_revenue),
        activeSubscriptions: parseInt(getRow(subscriptionResult).active_subscriptions),
        newCustomers: parseInt(getRow(subscriptionResult).new_customers),
        churnRate: parseFloat(getRow(subscriptionResult).churn_rate),
        mrr: parseFloat(getRow(recurringResult).mrr),
        arr: parseFloat(getRow(recurringResult).mrr) * 12
    };
}

export async function getRevenueMetrics(params: AnalyticsQuery): Promise<RevenueMetrics[]> {
    const { startDate, endDate, appId, interval = 'day' } = params;

    const timeGroup = interval === 'month' ? 
        'DATE_TRUNC(\'month\', created_at)' :
        interval === 'week' ?
        'DATE_TRUNC(\'week\', created_at)' :
        'DATE_TRUNC(\'day\', created_at)';

    const conditions = ['created_at BETWEEN $1 AND $2'];
    const queryParams = [startDate, endDate];
    
    if (appId) {
        conditions.push('app_id = $3');
        queryParams.push(appId);
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
        `SELECT 
            ${timeGroup} as date,
            COALESCE(SUM(amount), 0) as revenue,
            COUNT(DISTINCT CASE WHEN type = 'subscription' THEN id END) as subscriptions,
            COALESCE(SUM(CASE WHEN type = 'one_time' THEN amount ELSE 0 END), 0) as one_time_revenue,
            COALESCE(SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END), 0) as refunds,
            COALESCE(SUM(CASE WHEN type != 'refund' THEN amount ELSE -amount END), 0) as net_revenue
         FROM transactions
         WHERE ${whereClause}
         GROUP BY ${timeGroup}
         ORDER BY date ASC`,
        queryParams
    );

    return getRows(result).map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue),
        subscriptions: parseInt(row.subscriptions),
        oneTimeRevenue: parseFloat(row.one_time_revenue),
        refunds: parseFloat(row.refunds),
        netRevenue: parseFloat(row.net_revenue)
    }));
}

export async function getSubscriptionMetrics(params: DateRangeQuery): Promise<SubscriptionMetrics> {
    const { startDate, endDate, appId } = params;

    const conditions = ['created_at BETWEEN $1 AND $2'];
    const queryParams = [startDate, endDate];
    
    if (appId) {
        conditions.push('app_id = $3');
        queryParams.push(appId);
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
        `WITH metrics AS (
            SELECT 
                COUNT(DISTINCT customer_id) as total_subscribers,
                COUNT(DISTINCT CASE WHEN status = 'active' THEN customer_id END) as active_subscribers,
                COUNT(DISTINCT CASE WHEN status = 'churned' THEN customer_id END) as churned,
                COUNT(DISTINCT CASE WHEN status = 'recovered' THEN customer_id END) as recovered,
                COUNT(DISTINCT CASE WHEN change_type = 'upgrade' THEN id END) as upgrades,
                COUNT(DISTINCT CASE WHEN change_type = 'downgrade' THEN id END) as downgrades,
                COALESCE(AVG(amount), 0) as average_revenue,
                COALESCE(
                    SUM(amount) / NULLIF(COUNT(DISTINCT customer_id), 0),
                    0
                ) as lifetime_value
            FROM subscriptions
            WHERE ${whereClause}
        )
        SELECT *
        FROM metrics`,
        queryParams
    );

    return {
        totalSubscribers: parseInt(getRow(result).total_subscribers),
        activeSubscribers: parseInt(getRow(result).active_subscribers),
        churned: parseInt(getRow(result).churned),
        recovered: parseInt(getRow(result).recovered),
        upgrades: parseInt(getRow(result).upgrades),
        downgrades: parseInt(getRow(result).downgrades),
        averageRevenue: parseFloat(getRow(result).average_revenue),
        lifetimeValue: parseFloat(getRow(result).lifetime_value)
    };
}
