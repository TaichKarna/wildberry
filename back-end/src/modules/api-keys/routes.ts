import { Router } from 'express';
import { authenticateJWT, requirePermission } from '../../middleware/auth.middleware';
import { createAuditMiddleware } from '../../middleware/audit.middleware';
import { 
    createApiKey, 
    getApiKey, 
    listApiKeys, 
    updateApiKey, 
    rotateApiKey,
    revokeApiKey 
} from '../../database/models/apiKey';
import { ApiResponse, ApiKeyResponse } from '../../types/api.types';

const router = Router();

// List API Keys
router.get('/', 
    authenticateJWT,
    requirePermission('manage:api_keys'),
    async (req, res) => {
        try {
            const { page, limit, search, appId, type } = req.query;
            const result = await listApiKeys({
                page: parseInt(page as string) || 1,
                limit: parseInt(limit as string) || 10,
                search: search as string,
                appId: appId as string,
                type: type as 'public' | 'private'
            });

            const response: ApiResponse<{ keys: ApiKeyResponse[], total: number }> = {
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
            console.error('Error listing API keys:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to list API keys'
                }
            });
        }
    }
);

// Create Public API Key
router.post('/public',
    authenticateJWT,
    requirePermission('manage:api_keys'),
    createAuditMiddleware({
        action: 'CREATE',
        entityType: 'api_key'
    }),
    async (req, res) => {
        try {
            const apiKey = await createApiKey({
                ...req.body,
                type: 'public'
            });
            
            const response: ApiResponse<ApiKeyResponse> = {
                success: true,
                data: apiKey
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Error creating public API key:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to create public API key'
                }
            });
        }
    }
);

// Create Private API Key
router.post('/private',
    authenticateJWT,
    requirePermission('manage:api_keys'),
    createAuditMiddleware({
        action: 'CREATE',
        entityType: 'api_key'
    }),
    async (req, res) => {
        try {
            const apiKey = await createApiKey({
                ...req.body,
                type: 'private'
            });
            
            const response: ApiResponse<ApiKeyResponse> = {
                success: true,
                data: apiKey
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Error creating private API key:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to create private API key'
                }
            });
        }
    }
);

// Get API Key Details
router.get('/:id',
    authenticateJWT,
    requirePermission('manage:api_keys'),
    async (req, res) => {
        try {
            const apiKey = await getApiKey(req.params.id);
            
            if (!apiKey) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
            }

            const response: ApiResponse<ApiKeyResponse> = {
                success: true,
                data: apiKey
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting API key:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get API key details'
                }
            });
        }
    }
);

// Update API Key
router.patch('/:id',
    authenticateJWT,
    requirePermission('manage:api_keys'),
    createAuditMiddleware({
        action: 'UPDATE',
        entityType: 'api_key'
    }),
    async (req, res) => {
        try {
            const apiKey = await updateApiKey(req.params.id, req.body);
            
            if (!apiKey) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
            }

            const response: ApiResponse<ApiKeyResponse> = {
                success: true,
                data: apiKey
            };

            res.json(response);
        } catch (error) {
            console.error('Error updating API key:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to update API key'
                }
            });
        }
    }
);

// Rotate API Key
router.post('/:id/rotate',
    authenticateJWT,
    requirePermission('manage:api_keys'),
    createAuditMiddleware({
        action: 'ROTATE',
        entityType: 'api_key'
    }),
    async (req, res) => {
        try {
            const apiKey = await rotateApiKey(req.params.id);
            
            if (!apiKey) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
            }

            const response: ApiResponse<ApiKeyResponse> = {
                success: true,
                data: apiKey
            };

            res.json(response);
        } catch (error) {
            console.error('Error rotating API key:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to rotate API key'
                }
            });
        }
    }
);

// Revoke API Key
router.delete('/:id',
    authenticateJWT,
    requirePermission('manage:api_keys'),
    createAuditMiddleware({
        action: 'REVOKE',
        entityType: 'api_key'
    }),
    async (req, res) => {
        try {
            const revoked = await revokeApiKey(req.params.id);
            
            if (!revoked) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
            }

            res.json({
                success: true
            });
        } catch (error) {
            console.error('Error revoking API key:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to revoke API key'
                }
            });
        }
    }
);

export default router;
