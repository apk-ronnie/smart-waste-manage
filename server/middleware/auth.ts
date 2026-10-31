import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, type User } from '../db.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'smart-waste-monitor-super-secret-jwt-key-2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied: No authorization header provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Access denied: Malformed token format (Bearer <token>)' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Access denied: User does not exist or was deleted' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Access denied: Invalid or expired token' });
  }
}
