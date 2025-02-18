import { query } from '..';
import { Product, PaginationQuery } from '../../types/api.types';

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const result = await query(
        `INSERT INTO products (name, app_id, type, price, currency, trial_period, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
            product.name,
            product.appId,
            product.type,
            product.price,
            product.currency,
            product.trialPeriod,
            product.description,
            product.status
        ]
    );
    return mapProductFromDb(result.rows[0]);
}

export async function getProduct(id: string): Promise<Product | null> {
    const result = await query(
        'SELECT * FROM products WHERE id = $1',
        [id]
    );
    return result.rows.length > 0 ? mapProductFromDb(result.rows[0]) : null;
}

export async function listProducts(params: PaginationQuery & { appId?: string } = {}): Promise<{ products: Product[], total: number }> {
    const { page = 1, limit = 10, search, appId } = params;
    const offset = (page - 1) * limit;

    let queryString = 'SELECT * FROM products';
    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (search) {
        conditions.push('name ILIKE $' + (queryParams.length + 1));
        queryParams.push(`%${search}%`);
    }

    if (appId) {
        conditions.push('app_id = $' + (queryParams.length + 1));
        queryParams.push(appId);
    }

    if (conditions.length > 0) {
        queryString += ' WHERE ' + conditions.join(' AND ');
    }

    queryString += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const result = await query(queryString, queryParams);
    
    let countQuery = 'SELECT COUNT(*) FROM products';
    if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await query(countQuery, queryParams.slice(0, -2));

    return {
        products: result.rows.map(mapProductFromDb),
        total: parseInt(countResult.rows[0].count)
    };
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
    const updateFields: string[] = [];
    const queryParams: any[] = [id];
    let paramCount = 2;

    if (product.name) {
        updateFields.push(`name = $${paramCount++}`);
        queryParams.push(product.name);
    }
    if (product.price !== undefined) {
        updateFields.push(`price = $${paramCount++}`);
        queryParams.push(product.price);
    }
    if (product.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        queryParams.push(product.description);
    }
    if (product.status) {
        updateFields.push(`status = $${paramCount++}`);
        queryParams.push(product.status);
    }
    if (product.trialPeriod !== undefined) {
        updateFields.push(`trial_period = $${paramCount++}`);
        queryParams.push(product.trialPeriod);
    }
    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 0) return null;

    const result = await query(
        `UPDATE products SET ${updateFields.join(', ')}
         WHERE id = $1
         RETURNING *`,
        queryParams
    );

    return result.rows.length > 0 ? mapProductFromDb(result.rows[0]) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
    const result = await query(
        'DELETE FROM products WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows.length > 0;
}

function mapProductFromDb(row: any): Product {
    return {
        id: row.id.toString(),
        name: row.name,
        appId: row.app_id.toString(),
        type: row.type,
        price: parseFloat(row.price),
        currency: row.currency,
        trialPeriod: row.trial_period,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
