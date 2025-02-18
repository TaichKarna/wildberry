import { Router } from 'express';
import { authenticateJWT, requirePermission } from '../../middleware/auth.middleware';
import { 
    getOverviewStats, 
    getRevenueMetrics, 
    getSubscriptionMetrics 
} from '../../database/models/analytics';
import { ApiResponse } from '../../types/api.types';

const router = Router();

// Get Overview Stats
router.get('/overview',
    authenticateJWT,
    requirePermission('read:analytics'),
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

            const stats = await getOverviewStats({
                startDate: startDate as string,
                endDate: endDate as string,
                appId: appId as string
            });

            const response: ApiResponse = {
                success: true,
                data: stats
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting overview stats:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get overview stats'
                }
            });
        }
    }
);

// Get Revenue Metrics
router.get('/revenue',
    authenticateJWT,
    requirePermission('read:analytics'),
    async (req, res) => {
        try {
            const { startDate, endDate, appId, interval } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_REQUEST',
                        message: 'startDate and endDate are required'
                    }
                });
            }

            const metrics = await getRevenueMetrics({
                startDate: startDate as string,
                endDate: endDate as string,
                appId: appId as string,
                interval: interval as 'day' | 'week' | 'month'
            });

            const response: ApiResponse = {
                success: true,
                data: metrics
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting revenue metrics:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get revenue metrics'
                }
            });
        }
    }
);

// Get Subscription Metrics
router.get('/subscriptions',
    authenticateJWT,
    requirePermission('read:analytics'),
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

            const metrics = await getSubscriptionMetrics({
                startDate: startDate as string,
                endDate: endDate as string,
                appId: appId as string
            });

            const response: ApiResponse = {
                success: true,
                data: metrics
            };

            res.json(response);
        } catch (error) {
            console.error('Error getting subscription metrics:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to get subscription metrics'
                }
            });
        }
    }
);

export default router;
