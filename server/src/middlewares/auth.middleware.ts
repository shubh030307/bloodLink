import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
  env?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const JWT_SECRET = req.env?.JWT_SECRET || process.env.JWT_SECRET;
  const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

  const authHeader = req.headers?.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: 'Access denied. No token provided.'
    });
    return;
  }

  const token = authHeader
    .replace(/^Bearer\s+/i, '')
    .trim();

  if (!token) {
    res.status(401).json({
      error: 'Access denied. No token provided.'
    });
    return;
  }

  try {
    const secret = req.env?.JWT_SECRET;

    if (!secret) {
      console.error('JWT_SECRET is not configured');

      res.status(500).json({
        error: 'Authentication configuration error'
      });
      return;
    }

    const SECRET_KEY = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(
      token,
      SECRET_KEY,
      {
        algorithms: ['HS256']
      }
    );

    if (
      typeof payload.userId !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      res.status(401).json({
        error: 'Invalid token.'
      });
      return;
    }

    req.user = {
      userId: payload.userId,
      role: payload.role
    };

    next();
  } catch (error) {
    console.error('JWT VERIFY ERROR:', error);

    res.status(401).json({
      error: 'Invalid token.'
    });
  }
};

export const authorize = (roles: string[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (
      !req.user ||
      !roles.includes(req.user.role)
    ) {
      res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
      return;
    }

    next();
  };
};