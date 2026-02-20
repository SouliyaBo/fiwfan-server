import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is required');
}

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};


export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (err) {
        // Continue even if token is invalid, but don't set req.user
        next();
    }
};

export const requirePermission = (permission: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // If SUPER_ADMIN, bypass permission check
            if (req.user.role === 'SUPER_ADMIN') {
                return next();
            }

            // Fetch full user to check permissions
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            if (user.role === 'SUPER_ADMIN') {
                return next();
            }

            if (!user.permissions || !user.permissions.includes(permission)) {
                return res.status(403).json({ error: `Access denied: Requires ${permission} permission` });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

