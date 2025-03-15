import { query } from '..';
import { Offering, PaginationQuery } from '../../types/api.types';
import { getRow, getRows, clientQuery, commitTransaction, rollbackTransaction } from '../utils';

export async function createOffering(offering: Omit<Offering, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offering> {
    const client = await query('BEGIN');
    try {
        const result = await clientQuery(client,
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
            await clientQuery(client,
                `INSERT INTO offering_products (offering_id, product_id)
                 VALUES ${productValues}`,
                [getRow(result).id, ...offering.products]
            );
        }

        // Add entitlements to offering
        if (offering.entitlements.length > 0) {
            const entitlementValues = offering.entitlements.map((entitlementId, index) => 
                `($1, $${index + 2})`
            ).join(',');
            await clientQuery(client,
                `INSERT INTO offering_entitlements (offering_id, entitlement_id)
                 VALUES ${entitlementValues}`,
                [getRow(result).id, ...offering.entitlements]
            );
        }

        await commitTransaction(client);
        const newOffering = await getOffering(getRow(result).id);
        if (!newOffering) {
            throw new Error('Failed to retrieve newly created offering');
        }
        return newOffering;
    } catch (error) {
        await rollbackTransaction(client);
        throw error;
    }
}

export async function getOffering(id: string): Promise<Offering | null> {
    const result = await query(
        `SELECT * FROM offerings WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const productsResult = await query(
        `SELECT product_id FROM offering_products WHERE offering_id = $1`,
        [id]
    );

    const entitlementsResult = await query(
        `SELECT entitlement_id FROM offering_entitlements WHERE offering_id = $1`,
        [id]
    );

    return mapOfferingFromDb(
        getRow(result),
        getRows(productsResult).map(row => row.product_id.toString()),
        getRows(entitlementsResult).map(row => row.entitlement_id.toString())
    );
}

export async function listOfferings(params: PaginationQuery & { appId?: string } = {}): Promise<{ offerings: Offering[], total: number }> {
    const { page = 1, limit = 20, appId } = params;
    const offset = (page - 1) * limit;

    let queryText = `SELECT * FROM offerings`;
    let countQueryText = `SELECT COUNT(*) as count FROM offerings`;
    const queryParams: any[] = [];
    const whereConditions: string[] = [];

    if (appId) {
        whereConditions.push(`app_id = $${queryParams.length + 1}`);
        queryParams.push(appId);
    }

    if (whereConditions.length > 0) {
        queryText += ` WHERE ${whereConditions.join(' AND ')}`;
        countQueryText += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const [result, countResult] = await Promise.all([
        query(queryText, queryParams),
        query(countQueryText, queryParams.slice(0, -2))
    ]);

    const offerings = await Promise.all(
        getRows(result).map(async row => {
            const productsResult = await query(
                `SELECT product_id FROM offering_products WHERE offering_id = $1`,
                [row.id]
            );

            const entitlementsResult = await query(
                `SELECT entitlement_id FROM offering_entitlements WHERE offering_id = $1`,
                [row.id]
            );

            return mapOfferingFromDb(
                row,
                getRows(productsResult).map(r => r.product_id.toString()),
                getRows(entitlementsResult).map(r => r.entitlement_id.toString())
            );
        })
    );

    return {
        offerings,
        total: parseInt(getRow(countResult).count)
    };
}

export async function updateOffering(id: string, offering: Partial<Offering>): Promise<Offering | null> {
    const existingOffering = await getOffering(id);
    if (!existingOffering) {
        return null;
    }

    const client = await query('BEGIN');
    try {
        // Update basic offering details if provided
        if (offering.name || offering.description) {
            const updateFields: string[] = [];
            const updateValues: any[] = [];
            let paramIndex = 1;

            if (offering.name) {
                updateFields.push(`name = $${paramIndex++}`);
                updateValues.push(offering.name);
            }

            if (offering.description) {
                updateFields.push(`description = $${paramIndex++}`);
                updateValues.push(offering.description);
            }

            updateFields.push(`updated_at = NOW()`);
            updateValues.push(id);

            await clientQuery(client,
                `UPDATE offerings SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
                updateValues
            );
        }

        // Update products if provided
        if (offering.products) {
            // Delete existing product associations
            await clientQuery(client,
                `DELETE FROM offering_products WHERE offering_id = $1`,
                [id]
            );

            // Add new product associations
            if (offering.products.length > 0) {
                const productValues = offering.products.map((productId, index) => 
                    `($1, $${index + 2})`
                ).join(',');
                await clientQuery(client,
                    `INSERT INTO offering_products (offering_id, product_id)
                     VALUES ${productValues}`,
                    [id, ...offering.products]
                );
            }
        }

        // Update entitlements if provided
        if (offering.entitlements) {
            // Delete existing entitlement associations
            await clientQuery(client,
                `DELETE FROM offering_entitlements WHERE offering_id = $1`,
                [id]
            );

            // Add new entitlement associations
            if (offering.entitlements.length > 0) {
                const entitlementValues = offering.entitlements.map((entitlementId, index) => 
                    `($1, $${index + 2})`
                ).join(',');
                await clientQuery(client,
                    `INSERT INTO offering_entitlements (offering_id, entitlement_id)
                     VALUES ${entitlementValues}`,
                    [id, ...offering.entitlements]
                );
            }
        }

        await commitTransaction(client);
        return await getOffering(id);
    } catch (error) {
        await rollbackTransaction(client);
        throw error;
    }
}

export async function deleteOffering(id: string): Promise<boolean> {
    const result = await query(
        `DELETE FROM offerings WHERE id = $1 RETURNING id`,
        [id]
    );
    return result.rows.length > 0;
}

export function mapOfferingFromDb(row: any, products: string[], entitlements: string[]): Offering {
    return {
        id: row.id,
        name: row.name,
        appId: row.app_id,
        description: row.description || '',
        products,
        entitlements,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
