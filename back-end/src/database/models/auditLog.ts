import { query } from '..';
import { PaginationQuery } from '../../types/api.types';
import { getRow, getRows } from '../utils';

export interface AuditLogEntry {
    id: string;
    userId: string | null;
    appId: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    details: Record<string, any> | null;
    ipAddress: string;
    createdAt: string;
    username?: string;
    appName?: string;
}

export interface AuditLogQuery extends PaginationQuery {
    startDate?: string;
    endDate?: string;
    type?: string;
    appId?: string;
    userId?: string;
    action?: string;
}

export async function createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'createdAt' | 'username' | 'appName'>): Promise<AuditLogEntry> {
    const result = await query(
        `INSERT INTO audit_logs (
            user_id, app_id, action, entity_type, entity_id, details, ip_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
            entry.userId,
            entry.appId,
            entry.action,
            entry.entityType,
            entry.entityId,
            entry.details ? JSON.stringify(entry.details) : null,
            entry.ipAddress
        ]
    );

    return await enrichAuditLog(getRow(result));
}

export async function listAuditLogs(params: AuditLogQuery = {}): Promise<{ logs: AuditLogEntry[], total: number }> {
    const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        type,
        appId,
        userId,
        action,
        search
    } = params;

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const queryParams: any[] = [];

    if (startDate) {
        conditions.push('al.created_at >= $' + (queryParams.length + 1));
        queryParams.push(startDate);
    }

    if (endDate) {
        conditions.push('al.created_at <= $' + (queryParams.length + 1));
        queryParams.push(endDate);
    }

    if (type) {
        conditions.push('al.entity_type = $' + (queryParams.length + 1));
        queryParams.push(type);
    }

    if (appId) {
        conditions.push('al.app_id = $' + (queryParams.length + 1));
        queryParams.push(appId);
    }

    if (userId) {
        conditions.push('al.user_id = $' + (queryParams.length + 1));
        queryParams.push(userId);
    }

    if (action) {
        conditions.push('al.action = $' + (queryParams.length + 1));
        queryParams.push(action);
    }

    if (search) {
        conditions.push(`(
            al.entity_type ILIKE $${queryParams.length + 1} OR
            al.action ILIKE $${queryParams.length + 1} OR
            COALESCE(u.username, '') ILIKE $${queryParams.length + 1} OR
            COALESCE(a.name, '') ILIKE $${queryParams.length + 1}
        )`);
        queryParams.push(`%${search}%`);
    }

    const whereClause = conditions.length > 0 
        ? 'WHERE ' + conditions.join(' AND ')
        : '';

    const result = await query(
        `SELECT 
            al.*,
            u.username,
            a.name as app_name
         FROM audit_logs al
         LEFT JOIN users u ON al.user_id = u.id
         LEFT JOIN apps a ON al.app_id = a.id
         ${whereClause}
         ORDER BY al.created_at DESC
         LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
        [...queryParams, limit, offset]
    );

    const countResult = await query(
        `SELECT COUNT(*) 
         FROM audit_logs al
         LEFT JOIN users u ON al.user_id = u.id
         LEFT JOIN apps a ON al.app_id = a.id
         ${whereClause}`,
        queryParams
    );

    return {
        logs: getRows(result).map(mapAuditLogFromDb),
        total: parseInt(getRow(countResult).count)
    };
}

export async function getAuditLog(id: string): Promise<AuditLogEntry | null> {
    const result = await query(
        `SELECT 
            al.*,
            u.username,
            a.name as app_name
         FROM audit_logs al
         LEFT JOIN users u ON al.user_id = u.id
         LEFT JOIN apps a ON al.app_id = a.id
         WHERE al.id = $1`,
        [id]
    );

    return getRow(result) ? mapAuditLogFromDb(getRow(result)) : null;
}

async function enrichAuditLog(row: any): Promise<AuditLogEntry> {
    const enriched = { ...row };

    if (row.user_id) {
        const userResult = await query(
            'SELECT username FROM users WHERE id = $1',
            [row.user_id]
        );
        if (getRow(userResult)) {
            enriched.username = getRow(userResult).username;
        }
    }

    if (row.app_id) {
        const appResult = await query(
            'SELECT name FROM apps WHERE id = $1',
            [row.app_id]
        );
        if (getRow(appResult)) {
            enriched.app_name = getRow(appResult).name;
        }
    }

    return mapAuditLogFromDb(enriched);
}

function mapAuditLogFromDb(row: any): AuditLogEntry {
    return {
        id: row.id.toString(),
        userId: row.user_id ? row.user_id.toString() : null,
        appId: row.app_id ? row.app_id.toString() : null,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        details: row.details,
        ipAddress: row.ip_address,
        createdAt: row.created_at,
        username: row.username,
        appName: row.app_name
    };
}
