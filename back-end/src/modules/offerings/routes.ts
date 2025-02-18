import { Router } from 'express';
import { authenticateJWT, requirePermission } from '../../middleware/auth.middleware';
import { createAuditMiddleware } from '../../middleware/audit.middleware';
import { createOffering, getOffering, listOfferings, updateOffering, deleteOffering } from '../../database/models/offering';
import { ApiResponse, Offering } from '../../types/api.types';

const router = Router();

// List Offerings
router.get('/', 
    authenticateJWT,
    requirePermission('read:offerings'),
    async (req, res) => {
        try {
            const { page, limit, search, appId } = req.query;
            const result = await listOfferings({
                page: parseInt(page as string) || 1,
                limit: parseInt(limit as string) || 10,
                search: search as string,
                appId: appId as string
            });

            const response: ApiResponse<{ offerings: Offering[], total: number }> = {
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
            console.error('Error listing offerings:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to list offerings'
                }
            });
        }
    }
);

// Create Offering
router.post('/',
    authenticateJWT,
    requirePermission('write:offerings'),
    createAuditMiddleware({
        action: 'CREATE',
        entityType: 'offering'
    }),
    async (req, res) => {
        try {
            const offering = await createOffering(req.body);
            
            const response: ApiResponse<Offering> = {
                success: true,
                data: offering
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Error creating offering:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to create offering'
                }
            });
        }
    }
);

// Get Offering Details
router.get('/:id',
    authenticateJWT,
    requirePermission('read:offerings'),
    async (req, res) => {
        try {
            const offering = await getOffering(req.params.id);
            
            if (!offering) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Offering not found'
                    }
                });
            }

            const response: ApiResponse<Offering> = {
                success: true,
                data: offering
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting offering:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get offering details'
                }
            });
        }
    }
);

// Update Offering
router.put('/:id',
    authenticateJWT,
    requirePermission('write:offerings'),
    createAuditMiddleware({
        action: 'UPDATE',
        entityType: 'offering'
    }),
    async (req, res) => {
        try {
            const offering = await updateOffering(req.params.id, req.body);
            
            if (!offering) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Offering not found'
                    }
                });
            }

            const response: ApiResponse<Offering> = {
                success: true,
                data: offering
            };

            res.json(response);
        } catch (error) {
            console.error('Error updating offering:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to update offering'
                }
            });
        }
    }
);

// Delete Offering
router.delete('/:id',
    authenticateJWT,
    requirePermission('write:offerings'),
    createAuditMiddleware({
        action: 'DELETE',
        entityType: 'offering'
    }),
    async (req, res) => {
        try {
            const deleted = await deleteOffering(req.params.id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Offering not found'
                    }
                });
            }

            res.json({
                success: true
            });
        } catch (error) {
            console.error('Error deleting offering:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to delete offering'
                }
            });
        }
    }
);

export default router;
