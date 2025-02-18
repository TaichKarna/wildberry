import { Router } from 'express';
import { authenticateJWT, requirePermission } from '../../middleware/auth.middleware';
import { createAuditMiddleware } from '../../middleware/audit.middleware';
import { createApp, getApp, listApps, updateApp, deleteApp } from '../../database/models/app';
import { ApiResponse, App } from '../../types/api.types';

const router = Router();

// List Apps
router.get('/', 
    authenticateJWT,
    requirePermission('read:apps'),
    async (req, res) => {
        try {
            const { page, limit, search } = req.query;
            const result = await listApps({
                page: parseInt(page as string) || 1,
                limit: parseInt(limit as string) || 10,
                search: search as string
            });

            const response: ApiResponse<{ apps: App[], total: number }> = {
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
            console.error('Error listing apps:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to list apps'
                }
            });
        }
    }
);

// Create App
router.post('/',
    authenticateJWT,
    requirePermission('write:apps'),
    createAuditMiddleware({
        action: 'CREATE',
        entityType: 'app'
    }),
    async (req, res) => {
        try {
            const app = await createApp(req.body);
            
            const response: ApiResponse<App> = {
                success: true,
                data: app
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Error creating app:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to create app'
                }
            });
        }
    }
);

// Get App Details
router.get('/:id',
    authenticateJWT,
    requirePermission('read:apps'),
    async (req, res) => {
        try {
            const app = await getApp(req.params.id);
            
            if (!app) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'App not found'
                    }
                });
            }

            const response: ApiResponse<App> = {
                success: true,
                data: app
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting app:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get app details'
                }
            });
        }
    }
);

// Update App
router.put('/:id',
    authenticateJWT,
    requirePermission('write:apps'),
    createAuditMiddleware({
        action: 'UPDATE',
        entityType: 'app'
    }),
    async (req, res) => {
        try {
            const app = await updateApp(req.params.id, req.body);
            
            if (!app) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'App not found'
                    }
                });
            }

            const response: ApiResponse<App> = {
                success: true,
                data: app
            };

            res.json(response);
        } catch (error) {
            console.error('Error updating app:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to update app'
                }
            });
        }
    }
);

// Delete App
router.delete('/:id',
    authenticateJWT,
    requirePermission('write:apps'),
    createAuditMiddleware({
        action: 'DELETE',
        entityType: 'app'
    }),
    async (req, res) => {
        try {
            const deleted = await deleteApp(req.params.id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'App not found'
                    }
                });
            }

            res.json({
                success: true
            });
        } catch (error) {
            console.error('Error deleting app:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to delete app'
                }
            });
        }
    }
);

export default router;
