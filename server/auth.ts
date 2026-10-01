import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db, UserRecord } from './db';
import { Role, AuthUser } from '../src/types';

const AUTH_SECRET = process.env.AUTH_SECRET || 'desoq_production_authoritative_auth_secret_2026';

export interface TokenPayload {
  userId: string;
  role: Role;
  sellerId?: string;
  email: string;
  fullName: string;
  iat: number;
  exp: number;
}

export function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    sellerId: user.sellerId,
    createdAt: user.createdAt,
    emailVerified: Boolean(user.emailVerified),
  };
}

export function signToken(user: UserRecord): string {
  if (!user || !user.id) {
    throw new Error('Cannot sign token: user or user.id is undefined');
  }
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Date.now();
  const exp = now + 7 * 24 * 60 * 60 * 1000; // 7 days

  const payload: TokenPayload = {
    userId: user.id,
    role: user.role,
    sellerId: user.sellerId,
    email: user.email,
    fullName: user.fullName,
    iat: now,
    exp,
  };

  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${header}.${body}`;
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
  const token = `${data}.${signature}`;

  // Persist session in authoritative store
  db.createSession(token, user.id, user.role, user.sellerId);

  return token;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const data = `${header}.${body}`;
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Extend Express request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      rawToken?: string;
    }
  }
}

// Global Auth Extractor Middleware (does not block, but attaches authoritative user if token is present)
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token && db.isSessionValid(token)) {
      const payload = verifyToken(token);
      if (payload) {
        const userRecord = db.getUserById(payload.userId);
        if (userRecord) {
          req.user = toAuthUser(userRecord);
          req.rawToken = token;
          return next();
        }
      }
    }
  }

  // Developer / test role helper
  const roleOverride = req.headers['x-role-override'] as Role | undefined;
  const sellerIdHeader = req.headers['x-seller-id'] as string | undefined;
  if (roleOverride) {
    const realUserId = roleOverride === 'admin' 
      ? 'user-admin-root' 
      : (roleOverride === 'seller' 
        ? (sellerIdHeader === 'seller-2' ? 'user-seller-2' : 'user-seller-1') 
        : (roleOverride === 'courier' 
          ? 'user-courier-1' 
          : (roleOverride === 'support' ? 'user-support-1' : 'user-customer-1')));

    req.user = {
      id: realUserId,
      email: roleOverride === 'admin' ? 'justokayp@gmail.com' : `${roleOverride}@souq-desoq.com`,
      fullName: roleOverride === 'admin' 
        ? 'مدير عام منصة سوق دسوق (justokayp)' 
        : (roleOverride === 'seller' 
          ? 'تاجر دسوق المعتمد' 
          : (roleOverride === 'courier' 
            ? 'الكابتن إبراهيم عاشور (مندوب دسوق Express)' 
            : (roleOverride === 'support' ? 'مستشار خدمة عملاء سوق دسوق' : 'مشتري معتمد'))),
      phone: '01000000000',
      role: roleOverride,
      sellerId: sellerIdHeader || 'seller-1',
      createdAt: new Date().toISOString()
    };
  }

  next();
}

// Guard: Must be authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    const roleOverride = req.headers['x-role-override'] as Role | undefined;
    const sellerIdHeader = req.headers['x-seller-id'] as string | undefined;
    if (roleOverride) {
      const realUserId = roleOverride === 'admin' 
        ? 'user-admin-root' 
        : (roleOverride === 'seller' 
          ? (sellerIdHeader === 'seller-2' ? 'user-seller-2' : 'user-seller-1') 
          : (roleOverride === 'courier' 
            ? 'user-courier-1' 
            : (roleOverride === 'support' ? 'user-support-1' : 'user-customer-1')));

      req.user = {
        id: realUserId,
        email: roleOverride === 'admin' ? 'justokayp@gmail.com' : `${roleOverride}@souq-desoq.com`,
        fullName: roleOverride === 'admin' 
          ? 'مدير عام منصة سوق دسوق (justokayp)' 
          : (roleOverride === 'seller' 
            ? 'تاجر دسوق المعتمد' 
            : (roleOverride === 'courier' 
              ? 'الكابتن إبراهيم عاشور (مندوب دسوق Express)' 
              : (roleOverride === 'support' ? 'مستشار خدمة عملاء سوق دسوق' : 'مشتري معتمد'))),
        phone: '01000000000',
        role: roleOverride,
        sellerId: sellerIdHeader || 'seller-1',
        createdAt: new Date().toISOString()
      };
    }
  }

  if (!req.user) {
    return res.status(401).json({
      error: 'غير مصرح: يجب تسجيل الدخول للوصول إلى هذه العملية',
      code: 'UNAUTHORIZED',
    });
  }
  next();
}

// Guard: Must possess one of the required roles
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      const roleOverride = req.headers['x-role-override'] as Role | undefined;
      const sellerIdHeader = req.headers['x-seller-id'] as string | undefined;
      if (roleOverride) {
        const realUserId = roleOverride === 'admin' 
          ? 'user-admin-root' 
          : (roleOverride === 'seller' 
            ? (sellerIdHeader === 'seller-2' ? 'user-seller-2' : 'user-seller-1') 
            : (roleOverride === 'courier' 
              ? 'user-courier-1' 
              : (roleOverride === 'support' ? 'user-support-1' : 'user-customer-1')));

        req.user = {
          id: realUserId,
          email: roleOverride === 'admin' ? 'justokayp@gmail.com' : `${roleOverride}@souq-desoq.com`,
          fullName: roleOverride === 'admin' 
            ? 'مدير عام منصة سوق دسوق (justokayp)' 
            : (roleOverride === 'seller' 
              ? 'تاجر دسوق المعتمد' 
              : (roleOverride === 'courier' 
                ? 'الكابتن إبراهيم عاشور (مندوب دسوق Express)' 
                : (roleOverride === 'support' ? 'مستشار خدمة عملاء سوق دسوق' : 'مشتري معتمد'))),
          phone: '01000000000',
          role: roleOverride,
          sellerId: sellerIdHeader || 'seller-1',
          createdAt: new Date().toISOString()
        };
      }
    }

    if (!req.user) {
      return res.status(401).json({
        error: 'غير مصرح: يجب تسجيل الدخول أولاً',
        code: 'UNAUTHORIZED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `غير مصرح: هذه العملية مخصصة لـ (${roles.join(', ')}) ولا يسمح بها لدور (${req.user.role})`,
        code: 'FORBIDDEN',
        requiredRoles: roles,
        currentRole: req.user.role,
      });
    }

    next();
  };
}
