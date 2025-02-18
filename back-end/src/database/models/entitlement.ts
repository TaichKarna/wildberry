import { query } from '..';
import { Entitlement, PaginationQuery } from '../../types/api.types';

export async function createEntitlement(entitlement: Omit<Entitlement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entitlement> {
    const result = await query(
        `INSERT INTO entitlements (name, app_id, description, features)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
            entitlement.name,
            entitlement.appId,
            entitlement.description,
            entitlement.features
        ]
    );
    return mapEntitlementFromDb(result.rows[0]);
}

export async function getEntitlement(id: string): Promise<Entitlement | null> {
    const result = await query(
        'SELECT * FROM entitlements WHERE id = $1',
        [id]
    );
    return result.rows.length > 0 ? mapEntitlementFromDb(result.rows[0]) : null;
}

export async function listEntitlements(params: PaginationQuery & { appId?: string } = {}): Promise<{ entitlements: Entitlement[], total: number }> {
    const { page = 1, limit = 10, search, appId } = params;
    const offset = (page - 1) * limit;

    let queryString = 'SELECT * FROM entitlements';
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
    
    let countQuery = 'SELECT COUNT(*) FROM entitlements';
    if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await query(countQuery, queryParams.slice(0, -2));

    return {
        entitlements: result.rows.map(mapEntitlementFromDb),
        total: parseInt(countResult.rows[0].count)
    };
}

export async function updateEntitlement(id: string, entitlement: Partial<Entitlement>): Promise<Entitlement | null> {
    const updateFields: string[] = [];
    const queryParams: any[] = [id];
    let paramCount = 2;

    if (entitlement.name) {
        updateFields.push(`name = $${paramCount++}`);
        queryParams.push(entitlement.name);
    }
    if (entitlement.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        queryParams.push(entitlement.description);
    }
    if (entitlement.features) {
        updateFields.push(`features = $${paramCount++}`);
        queryParams.push(entitlement.features);
    }
    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 0) return null;

    const result = await query(
        `UPDATE entitlements SET ${updateFields.join(', ')}
         WHERE id = $1
         RETURNING *`,
        queryParams
    );

    return result.rows.length > 0 ? mapEntitlementFromDb(result.rows[0]) : null;
}

export async function deleteEntitlement(id: string): Promise<boolean> {
    const result = await query(
        'DELETE FROM entitlements WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rows.length > 0;
}

function mapEntitlementFromDb(row: any): Entitlement {
    return {
        id: row.id.toString(),
        name: row.name,
        appId: row.app_id.toString(),
        description: row.description,
        features: row.features,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
