import { query } from '..';
import { App, PaginationQuery } from '../../types/api.types';
import { getRow, getRows } from '../utils';

export async function createApp(app: Omit<App, 'id' | 'createdAt' | 'updatedAt'>): Promise<App> {
    const result = await query(
        `INSERT INTO apps (name, bundle_id, platform, description, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, bundle_id, platform, description, status, created_at, updated_at`,
        [app.name, app.bundleId, app.platform, app.description, app.status]
    );
    return mapAppFromDb(getRow(result));
}

export async function getApp(id: string): Promise<App | null> {
    const result = await query(
        'SELECT * FROM apps WHERE id = $1',
        [id]
    );
    return getRow(result) ? mapAppFromDb(getRow(result)) : null;
}

export async function listApps(params: PaginationQuery = {}): Promise<{ apps: App[], total: number }> {
    const { page = 1, limit = 10, search } = params;
    const offset = (page - 1) * limit;

    let queryString = 'SELECT * FROM apps';
    const queryParams: any[] = [];

    if (search) {
        queryString += ' WHERE name ILIKE $1 OR bundle_id ILIKE $1';
        queryParams.push(`%${search}%`);
    }

    queryString += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const result = await query(queryString, queryParams);
    const countResult = await query(
        'SELECT COUNT(*) FROM apps' + (search ? ' WHERE name ILIKE $1 OR bundle_id ILIKE $1' : ''),
        search ? [`%${search}%`] : []
    );

    return {
        apps: getRows(result).map(mapAppFromDb),
        total: parseInt(getRow(countResult).count)
    };
}

export async function updateApp(id: string, app: Partial<App>): Promise<App | null> {
    const updateFields: string[] = [];
    const queryParams: any[] = [id];
    let paramCount = 2;

    if (app.name) {
        updateFields.push(`name = $${paramCount++}`);
        queryParams.push(app.name);
    }
    if (app.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        queryParams.push(app.description);
    }
    if (app.status) {
        updateFields.push(`status = $${paramCount++}`);
        queryParams.push(app.status);
    }
    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 0) return null;

    const result = await query(
        `UPDATE apps SET ${updateFields.join(', ')}
         WHERE id = $1
         RETURNING *`,
        queryParams
    );

    return getRow(result) ? mapAppFromDb(getRow(result)) : null;
}

export async function deleteApp(id: string): Promise<boolean> {
    const result = await query(
        'DELETE FROM apps WHERE id = $1 RETURNING id',
        [id]
    );
    return getRow(result) !== undefined;
}

function mapAppFromDb(row: any): App {
    return {
        id: row.id.toString(),
        name: row.name,
        bundleId: row.bundle_id,
        platform: row.platform,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
