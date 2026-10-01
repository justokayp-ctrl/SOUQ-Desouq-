import { Request, Response, NextFunction } from 'express';
import { TimeoutError } from './errors';
import { logger } from './logger';

/**
 * Request Timeout Middleware
 * Automatically terminates and returns HTTP 408 if a request exceeds timeoutLimitMs.
 */
export function requestTimeout(timeoutLimitMs = 15000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;

      if (!res.headersSent) {
        logger.error(`[REQUEST TIMEOUT] ${req.method} ${req.path} exceeded ${timeoutLimitMs}ms`, {
          service: 'api_gateway',
          action: 'request_timeout',
          durationMs: timeoutLimitMs,
          statusCode: 408,
          clientIp: req.ip || req.socket.remoteAddress,
          metadata: {
            path: req.path,
            method: req.method,
            timeoutLimitMs
          }
        });

        res.status(408).json({
          success: false,
          error: {
            code: 'REQUEST_TIMEOUT',
            message: `استغرقت معالجة الطلب أكثر من ${Math.round(timeoutLimitMs / 1000)} ثوانٍ (Request Timeout). تم إلغاء العملية بأمان.`,
            retryable: true,
            timestamp: new Date().toISOString()
          }
        });
      }
    }, timeoutLimitMs);

    // Clear timeout on response finish or close
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    // Attach timeout checker to request
    (req as any).isTimedOut = () => timedOut;

    next();
  };
}
