import { Router } from 'express';
import { authenticateJWT, requirePermission } from '../../middleware/auth.middleware';
import { createAuditMiddleware } from '../../middleware/audit.middleware';
import { createEntitlement, getEntitlement, listEntitlements, updateEntitlement, deleteEntitlement } from '../../database/models/entitlement';
import { ApiResponse, Entitlement } from '../../types/api.types';

const router = Router();

// List Entitlements
router.get('/', 
    authenticateJWT,
    requirePermission('read:entitlements'),
    async (req, res) => {
        try {
            const { page, limit, search, appId } = req.query;
            const result = await listEntitlements({
                page: parseInt(page as string) || 1,
                limit: parseInt(limit as string) || 10,
                search: search as string,
                appId: appId as string
            });

            const response: ApiResponse<{ entitlements: Entitlement[], total: number }> = {
                success: true,
                data: result,
                meta: {
                    page: parseInt(page as string) || 1,
                    limit: parseInt(limit as string) || 10,
                    total: result.total
                }
            };

            res.json(response);
        } catch (error) {
            console.error('Error listing entitlements:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to list entitlements'
                }
            });
        }
    }
);

// Create Entitlement
router.post('/',
    authenticateJWT,
    requirePermission('write:entitlements'),
    createAuditMiddleware({
        action: 'CREATE',
        entityType: 'entitlement'
    }),
    async (req, res) => {
        try {
            const entitlement = await createEntitlement(req.body);
            
            const response: ApiResponse<Entitlement> = {
                success: true,
                data: entitlement
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Error creating entitlement:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to create entitlement'
                }
            });
        }
    }
);

// Get Entitlement Details
router.get('/:id',
    authenticateJWT,
    requirePermission('read:entitlements'),
    async (req, res) => {
        try {
            const entitlement = await getEntitlement(req.params.id);
            
            if (!entitlement) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Entitlement not found'
                    }
                });
            }

            const response: ApiResponse<Entitlement> = {
                success: true,
                data: entitlement
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting entitlement:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get entitlement details'
                }
            });
        }
    }
);

// Update Entitlement
router.put('/:id',
    authenticateJWT,
    requirePermission('write:entitlements'),
    createAuditMiddleware({
        action: 'UPDATE',
        entityType: 'entitlement'
    }),
    async (req, res) => {
        try {
            const entitlement = await updateEntitlement(req.params.id, req.body);
            
            if (!entitlement) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Entitlement not found'
                    }
                });
            }

            const response: ApiResponse<Entitlement> = {
                success: true,
                data: entitlement
            };

            res.json(response);
        } catch (error) {
            console.error('Error updating entitlement:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to update entitlement'
                }
            });
        }
    }
);

// Delete Entitlement
router.delete('/:id',
    authenticateJWT,
    requirePermission('write:entitlements'),
    createAuditMiddleware({
        action: 'DELETE',
        entityType: 'entitlement'
    }),
    async (req, res) => {
        try {
            const deleted = await deleteEntitlement(req.params.id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Entitlement not found'
                    }
                });
            }

            res.json({
                success: true
            });
        } catch (error) {
            console.error('Error deleting entitlement:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to delete entitlement'
                }
            });
        }
    }
);

export default router;
