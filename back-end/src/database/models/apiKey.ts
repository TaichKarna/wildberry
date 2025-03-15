import { query } from '..';
import { ApiKeyResponse, CreateApiKeyRequest, PaginationQuery } from '../../types/api.types';
import crypto from 'crypto';
import { getRow, getRows } from '../utils';

function generateApiKey(type: 'public' | 'private'): string {
    const prefix = type === 'public' ? 'pub_' : 'priv_';
    const randomBytes = crypto.randomBytes(24).toString('base64url');
    return `${prefix}${randomBytes}`;
}

export async function createApiKey(request: CreateApiKeyRequest & { type: 'public' | 'private' }): Promise<ApiKeyResponse> {
    const keyValue = generateApiKey(request.type);
    const expiresAt = request.expiresIn ? 
        `NOW() + INTERVAL '${request.expiresIn}'` : 
        'NULL';

    const result = await query(
        `INSERT INTO api_keys (key_value, name, app_id, type, permissions, expires_at)
         VALUES ($1, $2, $3, $4, $5, ${expiresAt})
         RETURNING id, key_value, name, type, permissions, created_at, expires_at, status`,
        [keyValue, request.name, request.appId, request.type, request.permissions]
    );

    return mapApiKeyFromDb(getRow(result));
}

export async function getApiKey(id: string): Promise<ApiKeyResponse | null> {
    const result = await query(
        'SELECT * FROM api_keys WHERE id = $1',
        [id]
    );
    return getRow(result) ? mapApiKeyFromDb(getRow(result)) : null;
}

export async function validateApiKey(keyValue: string): Promise<ApiKeyResponse | null> {
    const result = await query(
        `SELECT * FROM api_keys 
         WHERE key_value = $1 
         AND status = 'active' 
         AND (expires_at IS NULL OR expires_at > NOW())`,
        [keyValue]
    );

    if (getRow(result)) {
        // Update last used timestamp
        await query(
            'UPDATE api_keys SET last_used = NOW() WHERE id = $1',
            [getRow(result).id]
        );

        return mapApiKeyFromDb(getRow(result));
    }

    return null;
}

export async function listApiKeys(params: PaginationQuery & { 
    appId?: string, 
    type?: 'public' | 'private' 
} = {}): Promise<{ keys: ApiKeyResponse[], total: number }> {
    const { page = 1, limit = 10, search, appId, type } = params;
    const offset = (page - 1) * limit;

    let queryString = 'SELECT * FROM api_keys';
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

    if (type) {
        conditions.push('type = $' + (queryParams.length + 1));
        queryParams.push(type);
    }

    if (conditions.length > 0) {
        queryString += ' WHERE ' + conditions.join(' AND ');
    }

    queryString += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(limit, offset);

    const result = await query(queryString, queryParams);
    
    let countQuery = 'SELECT COUNT(*) FROM api_keys';
    if (conditions.length > 0) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await query(countQuery, queryParams.slice(0, -2));

    return {
        keys: getRows(result).map(mapApiKeyFromDb),
        total: parseInt(getRow(countResult).count)
    };
}

export async function updateApiKey(id: string, updates: {
    name?: string;
    permissions?: string[];
    status?: 'active' | 'revoked';
}): Promise<ApiKeyResponse | null> {
    const updateFields: string[] = [];
    const queryParams: any[] = [id];
    let paramCount = 2;

    if (updates.name) {
        updateFields.push(`name = $${paramCount++}`);
        queryParams.push(updates.name);
    }
    if (updates.permissions) {
        updateFields.push(`permissions = $${paramCount++}`);
        queryParams.push(updates.permissions);
    }
    if (updates.status) {
        updateFields.push(`status = $${paramCount++}`);
        queryParams.push(updates.status);
    }
    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 0) return null;

    const result = await query(
        `UPDATE api_keys SET ${updateFields.join(', ')}
         WHERE id = $1
         RETURNING *`,
        queryParams
    );

    return getRow(result) ? mapApiKeyFromDb(getRow(result)) : null;
}

export async function rotateApiKey(id: string): Promise<ApiKeyResponse | null> {
    const currentKey = await getApiKey(id);
    if (!currentKey) return null;

    const newKeyValue = generateApiKey(currentKey.type);
    const result = await query(
        `UPDATE api_keys SET key_value = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [newKeyValue, id]
    );

    return getRow(result) ? mapApiKeyFromDb(getRow(result)) : null;
}

export async function revokeApiKey(id: string): Promise<boolean> {
    const result = await query(
        `UPDATE api_keys SET status = 'revoked', updated_at = NOW()
         WHERE id = $1
         RETURNING id`,
        [id]
    );
    return getRow(result) ? true : false;
}

function mapApiKeyFromDb(row: any): ApiKeyResponse {
    return {
        id: row.id.toString(),
        key: row.key_value,
        name: row.name,
        type: row.type,
        permissions: row.permissions,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        lastUsed: row.last_used,
        status: row.status
    };
}
