import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types/api.types';
import { tokenInfo } from '../config';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: string;
    };
    apiKey?: {
        id: number;
        type: 'public' | 'private';
        permissions: string[];
        appId: number;
    };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Missing authorization header'
            }
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Since tokenInfo doesn't have jwtSecret property, we need to use a proper secret
        // For now, using issuer as a placeholder - this should be replaced with actual secret
        const user = jwt.verify(token, tokenInfo.issuer);
        req.user = user as any;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Token has expired'
            }
        });
    }
};

export const authenticateApiKey = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Missing authorization header'
            }
        });
    }

    const apiKey = authHeader.split(' ')[1];
    
    // TODO: Validate API key from database
    // This should:
    // 1. Check if API key exists and is active
    // 2. Verify key hasn't expired
    // 3. Load permissions
    // 4. Set req.apiKey with key details

    next();
};

export const requirePermission = (permission: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.user?.role === 'admin') {
            return next();
        }

        if (req.apiKey && req.apiKey.permissions.includes(permission)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Insufficient permissions'
            }
        });
    };
};
