import { query } from '..';
import { Offering, PaginationQuery } from '../../types/api.types';

export async function createOffering(offering: Omit<Offering, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offering> {
    const client = await query('BEGIN');
    try {
        const result = await client.query(
            `INSERT INTO offerings (name, app_id, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [offering.name, offering.appId, offering.description]
        );

        // Add products to offering
        if (offering.products.length > 0) {
            const productValues = offering.products.map((productId, index) => 
                `($1, $${index + 2})`
            ).join(',');
            await client.query(
                `INSERT INTO offering_products (offering_id, product_id)
                 VALUES ${productValues}`,
                [result.rows[0].id, ...offering.products]
            );
        }

        // Add entitlements to offering
        if (offering.entitlements.length > 0) {
            const entitlementValues = offering.entitlements.map((entitlementId, index) => 
                `($1, $${index + 2})`
            ).join(',');
            await client.query(
                `INSERT INTO offering_entitlements (offering_id, entitlement_id)
                 VALUES ${entitlementValues}`,
                [result.rows[0].id, ...offering.entitlements]
            );
        }

        await client.query('COMMIT');
        return await getOffering(result.rows[0].id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

export async function getOffering(id: string): Promise<Offering | null> {
    const offeringResult = await query(
        'SELECT * FROM offerings WHERE id = $1',
        [id]
    );

    if (offeringResult.rows.length === 0) return null;

    const productsResult = await query(
        'SELECT product_id FROM offering_products WHERE offering_id = $1',
        [id]
    );

    const entitlementsResult = await query(
        'SELECT entitlement_id FROM offering_entitlements WHERE offering_id = $1',
        [id]
    );

    return mapOfferingFromDb(
        offeringResult.rows[0],
        productsResult.rows.map(row => row.product_id.toString()),
        entitlementsResult.rows.map(row => row.entitlement_id.toString())
    );
}

export async function listOfferings(params: PaginationQuery & { appId?: string } = {}): Promise<{ offerings: Offering[], total: number }> {
    const { page = 1, limit = 10, search, appId } = params;
    const offset = (page - 1) * limit;

    let queryString = 'SELECT * FROM offerings';
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
    
    const offerings = await Promise.all(result.rows.map(async (row) => {
        const productsResult = await query(
            'SELECT product_id FROM offering_products WHERE offering_id = $1',
            [row.id]
        );

        const entitlementsResult = await query(
            'SELECT entitlement_id FROM offering_entitlements WHERE offering_id = $1',
            [row.id]
        );

        return mapOfferingFromDb(
            row,
            productsResult.rows.map(r => r.product_id.toString()),
            entitlementsResult.rows.map(r => r.entitlement_id.toString())
        );
    }));

    let countQuery = 'SELECT COUNT(*) FROM offerings';
    if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await query(countQuery, queryParams.slice(0, -2));

    return {
        offerings,
        total: parseInt(countResult.rows[0].count)
    };
}

export async function updateOffering(id: string, offering: Partial<Offering>): Promise<Offering | null> {
    const client = await query('BEGIN');
    try {
        const updateFields: string[] = [];
        const queryParams: any[] = [id];
        let paramCount = 2;

        if (offering.name) {
            updateFields.push(`name = $${paramCount++}`);
            queryParams.push(offering.name);
        }
        if (offering.description !== undefined) {
            updateFields.push(`description = $${paramCount++}`);
            queryParams.push(offering.description);
        }
        updateFields.push('updated_at = NOW()');

        if (updateFields.length > 0) {
            await client.query(
                `UPDATE offerings SET ${updateFields.join(', ')}
                 WHERE id = $1`,
                queryParams
            );
        }

        if (offering.products) {
            await client.query(
                'DELETE FROM offering_products WHERE offering_id = $1',
                [id]
            );
            if (offering.products.length > 0) {
                const productValues = offering.products.map((productId, index) => 
                    `($1, $${index + 2})`
                ).join(',');
                await client.query(
                    `INSERT INTO offering_products (offering_id, product_id)
                     VALUES ${productValues}`,
                    [id, ...offering.products]
                );
            }
        }

        if (offering.entitlements) {
            await client.query(
                'DELETE FROM offering_entitlements WHERE offering_id = $1',
                [id]
            );
            if (offering.entitlements.length > 0) {
                const entitlementValues = offering.entitlements.map((entitlementId, index) => 
                    `($1, $${index + 2})`
                ).join(',');
                await client.query(
                    `INSERT INTO offering_entitlements (offering_id, entitlement_id)
                     VALUES ${entitlementValues}`,
                    [id, ...offering.entitlements]
                );
            }
        }

        await client.query('COMMIT');
        return await getOffering(id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

export async function deleteOffering(id: string): Promise<boolean> {
    const result = await query(
        'DELETE FROM offerings WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows.length > 0;
}

function mapOfferingFromDb(row: any, products: string[], entitlements: string[]): Offering {
    return {
        id: row.id.toString(),
        name: row.name,
        appId: row.app_id.toString(),
        description: row.description,
        products,
        entitlements,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
