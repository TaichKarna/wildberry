import { Request, Response, NextFunction } from 'express';
import { query } from '../database';
import { AuthRequest } from './auth.middleware';

export interface AuditLogData {
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, any>;
}

export async function auditLog(
    req: AuthRequest,
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, any>
) {
    try {
        await query(
            `INSERT INTO audit_logs (user_id, app_id, action, entity_type, entity_id, details, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                req.user?.id || null,
                req.apiKey?.appId || null,
                action,
                entityType,
                entityId,
                details ? JSON.stringify(details) : null,
                req.ip
            ]
        );
    } catch (error) {
        console.error('Error creating audit log:', error);
    }
}

export function createAuditMiddleware(data: AuditLogData) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const originalJson = res.json;
        res.json = function(body) {
            const entityId = data.entityId || body?.data?.id;
            auditLog(req, data.action, data.entityType, entityId, {
                ...data.details,
                success: body.success
            });
            return originalJson.call(this, body);
        };
        next();
    };
}
