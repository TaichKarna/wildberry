import { Router } from 'express';
import { authenticateJWT, requirePermission } from '../../middleware/auth.middleware';
import { createAuditMiddleware } from '../../middleware/audit.middleware';
import { createProduct, getProduct, listProducts, updateProduct, deleteProduct } from '../../database/models/product';
import { ApiResponse, Product } from '../../types/api.types';

const router = Router();

// List Products
router.get('/', 
    authenticateJWT,
    requirePermission('read:products'),
    async (req, res) => {
        try {
            const { page, limit, search, appId } = req.query;
            const result = await listProducts({
                page: parseInt(page as string) || 1,
                limit: parseInt(limit as string) || 10,
                search: search as string,
                appId: appId as string
            });

            const response: ApiResponse<{ products: Product[], total: number }> = {
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
            console.error('Error listing products:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to list products'
                }
            });
        }
    }
);

// Create Product
router.post('/',
    authenticateJWT,
    requirePermission('write:products'),
    createAuditMiddleware({
        action: 'CREATE',
        entityType: 'product'
    }),
    async (req, res) => {
        try {
            const product = await createProduct(req.body);
            
            const response: ApiResponse<Product> = {
                success: true,
                data: product
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to create product'
                }
            });
        }
    }
);

// Get Product Details
router.get('/:id',
    authenticateJWT,
    requirePermission('read:products'),
    async (req, res) => {
        try {
            const product = await getProduct(req.params.id);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Product not found'
                    }
                });
            }

            const response: ApiResponse<Product> = {
                success: true,
                data: product
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting product:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get product details'
                }
            });
        }
    }
);

// Update Product
router.put('/:id',
    authenticateJWT,
    requirePermission('write:products'),
    createAuditMiddleware({
        action: 'UPDATE',
        entityType: 'product'
    }),
    async (req, res) => {
        try {
            const product = await updateProduct(req.params.id, req.body);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Product not found'
                    }
                });
            }

            const response: ApiResponse<Product> = {
                success: true,
                data: product
            };

            res.json(response);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to update product'
                }
            });
        }
    }
);

// Delete Product
router.delete('/:id',
    authenticateJWT,
    requirePermission('write:products'),
    createAuditMiddleware({
        action: 'DELETE',
        entityType: 'product'
    }),
    async (req, res) => {
        try {
            const deleted = await deleteProduct(req.params.id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Product not found'
                    }
                });
            }

            res.json({
                success: true
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to delete product'
                }
            });
        }
    }
);

export default router;
