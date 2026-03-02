import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

// Extend Express Request to include user payload
export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                 res.status(403).json({ error: 'Forbidden - Invalid or expired token' });
                 return;
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
};