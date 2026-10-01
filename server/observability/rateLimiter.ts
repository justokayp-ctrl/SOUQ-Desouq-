import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from './errors';
import { logger } from './logger';
import { auditLogger } from './auditLogger';

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private ipBuckets = new Map<string, RateLimitBucket>();
  private totalBlockedRequests = 0;

  constructor() {
    // Periodically clean up expired buckets to prevent memory leaks
    setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of this.ipBuckets.entries()) {
        if (now > bucket.resetTime) {
          this.ipBuckets.delete(key);
        }
      }
    }, 60000);
  }

  public getStats() {
    return {
      totalBlocked: this.totalBlockedRequests,
      activeTrackedIps: this.ipBuckets.size
    };
  }

  /**
   * Middleware factory for rate limiting
   */
  public limit(options: {
    maxRequests: number;
    windowSeconds: number;
    bucketName?: string;
    keyGenerator?: (req: Request) => string;
  }) {
    const { maxRequests, windowSeconds, bucketName = 'default' } = options;
    const windowMs = windowSeconds * 1000;

    return (req: Request, res: Response, next: NextFunction): void => {
      const clientKey = options.keyGenerator 
        ? options.keyGenerator(req) 
        : `${bucketName}_${req.ip || req.socket.remoteAddress || '127.0.0.1'}`;

      const now = Date.now();
      let bucket = this.ipBuckets.get(clientKey);

      if (!bucket || now > bucket.resetTime) {
        bucket = {
          count: 1,
          resetTime: now + windowMs
        };
        this.ipBuckets.set(clientKey, bucket);
      } else {
        bucket.count++;
      }

      const remaining = Math.max(0, maxRequests - bucket.count);
      const resetSeconds = Math.ceil((bucket.resetTime - now) / 1000);

      // Set standard RFC rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetSeconds);

      if (bucket.count > maxRequests) {
        this.totalBlockedRequests++;

        logger.warn(`[RATE LIMIT EXCEEDED] IP/Key: ${clientKey} on ${req.method} ${req.path} (${bucket.count}/${maxRequests})`, {
          service: 'rate_limiter',
          action: 'limit_exceeded',
          clientIp: req.ip || req.socket.remoteAddress,
          metadata: {
            bucketName,
            clientKey,
            count: bucket.count,
            limit: maxRequests,
            path: req.path
          }
        });

        // If it's a security-critical endpoint, record an audit event
        if (req.path.includes('/auth') || req.path.includes('/checkout')) {
          auditLogger.log({
            actorId: 'anonymous_client',
            actorRole: 'unauthenticated',
            action: 'RATE_LIMIT_BLOCKED',
            resourceType: 'api_endpoint',
            resourceId: req.path,
            status: 'denied',
            severity: 'medium',
            details: { clientKey, path: req.path, count: bucket.count, limit: maxRequests }
          });
        }

        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `تم تجاوز الحد الأقصى من الطلبات المسموحة (${maxRequests} طلب كل ${windowSeconds} ثانية). يرجى الانتظار ${resetSeconds} ثانية.`,
            retryAfterSeconds: resetSeconds,
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      next();
    };
  }
}

export const rateLimiter = new RateLimiter();

// Standard rate limit profiles
export const standardApiLimiter = rateLimiter.limit({
  maxRequests: 120,
  windowSeconds: 60,
  bucketName: 'standard_api'
});

export const strictAuthLimiter = rateLimiter.limit({
  maxRequests: 20,
  windowSeconds: 60,
  bucketName: 'auth_security'
});

export const orderCheckoutLimiter = rateLimiter.limit({
  maxRequests: 30,
  windowSeconds: 60,
  bucketName: 'order_checkout'
});
