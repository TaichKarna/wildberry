import { Router } from 'express';
import { LoginRequest, TokenResponse, RefreshTokenRequest, ApiResponse } from '../../types/api.types';
import { authenticateJWT, AuthRequest } from '../../middleware/auth.middleware';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { tokenInfo } from '../../config';
import { query } from '../../database';
import { DbUser } from '../../types/database.types';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password }: LoginRequest = req.body;

        // Validate user credentials
        const result = await query(
            'SELECT id, username, password_hash, role FROM users WHERE username = $1 AND status = $2',
            [username, 'active']
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password'
                }
            } as ApiResponse);
        }

        // Get user from result
        const user = result.rows[0] as unknown as DbUser;
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid username or password'
                }
            } as ApiResponse);
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            // Using issuer as a temporary secret - this should be replaced with proper JWT secret
            tokenInfo.issuer,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            // Using audience as a temporary refresh secret - this should be replaced with proper refresh token secret
            tokenInfo.audience,
            { expiresIn: '7d' }
        );

        // Store refresh token in database
        await query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 day\')',
            [user.id, refreshToken]
        );

        // Return tokens
        const response: ApiResponse<TokenResponse> = {
            success: true,
            data: {
                accessToken,
                refreshToken,
                expiresIn: 3600
            }
        };

        res.json(response);
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred during login'
            }
        });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken }: RefreshTokenRequest = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REFRESH_TOKEN',
                    message: 'Refresh token is required'
                }
            });
        }

        // Verify refresh token in database
        const result = await query(
            'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
            [refreshToken]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_REFRESH_TOKEN',
                    message: 'Invalid or expired refresh token'
                }
            } as ApiResponse);
        }

        const userId = (result.rows[0] as any).user_id;

        // Get user details
        const userResult = await query(
            'SELECT id, username, role FROM users WHERE id = $1 AND status = $2',
            [userId, 'active']
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_USER',
                    message: 'User not found or inactive'
                }
            } as ApiResponse);
        }

        const user = userResult.rows[0] as unknown as DbUser;

        // Generate new tokens
        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            // Using issuer as a temporary secret - this should be replaced with proper JWT secret
            tokenInfo.issuer,
            { expiresIn: '1h' }
        );

        const newRefreshToken = jwt.sign(
            { id: user.id },
            // Using audience as a temporary refresh secret - this should be replaced with proper refresh token secret
            tokenInfo.audience,
            { expiresIn: '7d' }
        );

        // Update refresh token in database
        await query(
            'UPDATE refresh_tokens SET token = $1, expires_at = NOW() + INTERVAL \'7 day\' WHERE token = $2',
            [newRefreshToken, refreshToken]
        );

        // Return new tokens
        const response: ApiResponse<TokenResponse> = {
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn: 3600
            }
        };

        res.json(response);
    } catch (error: any) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred while refreshing token'
            }
        });
    }
});

router.post('/logout', authenticateJWT, async (req: AuthRequest, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated'
                }
            });
        }

        // Delete refresh tokens for user
        await query(
            'DELETE FROM refresh_tokens WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            success: true
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'An error occurred during logout'
            }
        });
    }
});

export default router;
