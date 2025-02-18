import { query } from '..';
import { CustomerInfo } from '../../types/wildberry.types';

export async function createCustomer(appUserId: string): Promise<CustomerInfo> {
    const result = await query(
        `INSERT INTO customers (app_user_id, first_seen, request_date)
         VALUES ($1, NOW(), NOW())
         RETURNING *`,
        [appUserId]
    );
    return mapToCustomerInfo(result.rows[0]);
}

export async function getCustomer(appUserId: string): Promise<CustomerInfo | null> {
    const result = await query(
        `SELECT * FROM customers WHERE app_user_id = $1`,
        [appUserId]
    );
    return result.rows.length > 0 ? mapToCustomerInfo(result.rows[0]) : null;
}

export async function updateCustomer(appUserId: string, customerInfo: Partial<CustomerInfo>): Promise<CustomerInfo> {
    const result = await query(
        `UPDATE customers 
         SET 
            entitlements = $2,
            active_subscriptions = $3,
            latest_expiration_date = $4,
            all_expiration_dates = $5,
            all_purchase_dates = $6,
            management_url = $7
         WHERE app_user_id = $1
         RETURNING *`,
        [
            appUserId,
            customerInfo.entitlements,
            customerInfo.activeSubscriptions,
            customerInfo.latestExpirationDate,
            customerInfo.allExpirationDates,
            customerInfo.allPurchaseDates,
            customerInfo.managementURL
        ]
    );
    return mapToCustomerInfo(result.rows[0]);
}

function mapToCustomerInfo(row: any): CustomerInfo {
    return {
        entitlements: row.entitlements || { all: {}, active: {}, verification: "NOT_REQUESTED" },
        activeSubscriptions: row.active_subscriptions || [],
        allPurchasedProductIdentifiers: row.all_purchased_product_identifiers || [],
        latestExpirationDate: row.latest_expiration_date,
        firstSeen: row.first_seen,
        originalAppUserId: row.app_user_id,
        requestDate: row.request_date,
        allExpirationDates: row.all_expiration_dates || {},
        allPurchaseDates: row.all_purchase_dates || {},
        originalApplicationVersion: row.original_application_version,
        originalPurchaseDate: row.original_purchase_date,
        managementURL: row.management_url,
        nonSubscriptionTransactions: row.non_subscription_transactions || []
    };
}
