CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    app_user_id VARCHAR(255) UNIQUE NOT NULL,
    entitlements JSONB DEFAULT '{"all": {}, "active": {}, "verification": "NOT_REQUESTED"}',
    active_subscriptions TEXT[] DEFAULT '{}',
    all_purchased_product_identifiers TEXT[] DEFAULT '{}',
    latest_expiration_date TIMESTAMP,
    first_seen TIMESTAMP NOT NULL DEFAULT NOW(),
    request_date TIMESTAMP NOT NULL DEFAULT NOW(),
    all_expiration_dates JSONB DEFAULT '{}',
    all_purchase_dates JSONB DEFAULT '{}',
    original_application_version VARCHAR(255),
    original_purchase_date TIMESTAMP,
    management_url TEXT,
    non_subscription_transactions JSONB DEFAULT '[]'
);

CREATE INDEX idx_customers_app_user_id ON customers(app_user_id);
