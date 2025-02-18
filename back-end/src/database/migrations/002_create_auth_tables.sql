CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE apps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bundle_id VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    key_value VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    permissions TEXT[] NOT NULL,
    expires_at TIMESTAMP,
    last_used TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_app FOREIGN KEY (app_id) REFERENCES apps(id)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    trial_period VARCHAR(50),
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_app FOREIGN KEY (app_id) REFERENCES apps(id)
);

CREATE TABLE entitlements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    description TEXT,
    features TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_app FOREIGN KEY (app_id) REFERENCES apps(id)
);

CREATE TABLE offerings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_app FOREIGN KEY (app_id) REFERENCES apps(id)
);

CREATE TABLE offering_products (
    offering_id INTEGER NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (offering_id, product_id),
    CONSTRAINT fk_offering FOREIGN KEY (offering_id) REFERENCES offerings(id),
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE offering_entitlements (
    offering_id INTEGER NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
    entitlement_id INTEGER NOT NULL REFERENCES entitlements(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (offering_id, entitlement_id),
    CONSTRAINT fk_offering FOREIGN KEY (offering_id) REFERENCES offerings(id),
    CONSTRAINT fk_entitlement FOREIGN KEY (entitlement_id) REFERENCES entitlements(id)
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    app_id INTEGER REFERENCES apps(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_app FOREIGN KEY (app_id) REFERENCES apps(id)
);
