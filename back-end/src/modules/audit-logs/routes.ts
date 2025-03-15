import { Router } from 'express';
import { authenticateJWT, requirePermission } from '../../middleware/auth.middleware';
import { listAuditLogs, getAuditLog } from '../../database/models/auditLog';
import { ApiResponse } from '../../types/api.types';
import { query } from '../../database';

const router = Router();

// List Audit Logs
router.get('/',
    authenticateJWT,
    requirePermission('read:audit_logs'),
    async (req, res) => {
        try {
            const {
                page,
                limit,
                startDate,
                endDate,
                type,
                appId,
                userId,
                action,
                search
            } = req.query;

            const result = await listAuditLogs({
                page: parseInt(page as string) || 1,
                limit: parseInt(limit as string) || 10,
                startDate: startDate as string,
                endDate: endDate as string,
                type: type as string,
                appId: appId as string,
                userId: userId as string,
                action: action as string,
                search: search as string
            });

            const response: ApiResponse = {
                success: true,
                data: result.logs,
                meta: {
                    page: parseInt(page as string) || 1,
                    limit: parseInt(limit as string) || 10,
                    total: result.total
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Error listing audit logs:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to list audit logs'
                }
            });
        }
    }
);

// Get Audit Log Details
router.get('/:id',
    authenticateJWT,
    requirePermission('read:audit_logs'),
    async (req, res) => {
        try {
            const log = await getAuditLog(req.params.id);

            if (!log) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Audit log entry not found'
                    }
                });
            }

            const response: ApiResponse = {
                success: true,
                data: log
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting audit log:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get audit log details'
                }
            });
        }
    }
);

// Get Audit Log Summary
router.get('/summary/actions',
    authenticateJWT,
    requirePermission('read:audit_logs'),
    async (req, res) => {
        try {
            const { startDate, endDate, appId } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'startDate and endDate are required'
                    }
                });
            }

            const result = await query(
                `SELECT 
                    action,
                    entity_type,
                    COUNT(*) as count
                 FROM audit_logs
                 WHERE created_at BETWEEN $1 AND $2
                 ${appId ? 'AND app_id = $3' : ''}
                 GROUP BY action, entity_type
                 ORDER BY count DESC`,
                appId ? [startDate, endDate, appId] : [startDate, endDate]
            );

            const response: ApiResponse = {
                success: true,
                data: result.rows
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting audit log summary:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get audit log summary'
                }
            });
        }
    }
);

// Get User Activity
router.get('/summary/users',
    authenticateJWT,
    requirePermission('read:audit_logs'),
    async (req, res) => {
        try {
            const { startDate, endDate, appId } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'startDate and endDate are required'
                    }
                });
            }

            const result = await query(
                `SELECT 
                    u.username,
                    COUNT(*) as action_count,
                    STRING_AGG(DISTINCT al.action, ', ') as actions,
                    MAX(al.created_at) as last_action
                 FROM audit_logs al
                 JOIN users u ON al.user_id = u.id
                 WHERE al.created_at BETWEEN $1 AND $2
                 ${appId ? 'AND app_id = $3' : ''}
                 GROUP BY u.username
                 ORDER BY action_count DESC`,
                appId ? [startDate, endDate, appId] : [startDate, endDate]
            );

            const response: ApiResponse = {
                success: true,
                data: result.rows
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting user activity summary:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get user activity summary'
                }
            });
        }
    }
);

export default router;
