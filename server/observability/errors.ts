import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from './logger';
import { sanitizeData } from './sanitizer';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly retryable: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any, retryable = false) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    this.retryable = retryable;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details, false);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'غير مصرح بالدخول، يرجى تسجيل الدخول أولاً') {
    super(message, 401, 'UNAUTHORIZED', undefined, false);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'ليس لديك صلاحية لتنفيذ هذا الإجراء') {
    super(message, 403, 'FORBIDDEN', undefined, false);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'العنصر المطلوب') {
    super(`${resource} غير موجود`, 404, 'NOT_FOUND', undefined, false);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details, false);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'تجاوزت الحد المسموح من الطلبات، يرجى المحاولة لاحقاً', retryAfterSeconds = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfterSeconds }, true);
  }
}

export class TimeoutError extends AppError {
  constructor(message = 'استغرقت معالجة الطلب وقتاً أطول من المسموح (Request Timeout)') {
    super(message, 408, 'REQUEST_TIMEOUT', undefined, true);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(serviceName = 'الخدمة المطلوبة', message?: string) {
    super(message || `${serviceName} غير متاحة حالياً بسبب أعمال الصيانة أو ضغط العمليات`, 503, 'SERVICE_UNAVAILABLE', { serviceName }, true);
  }
}

export class CircuitBreakerError extends AppError {
  constructor(serviceName: string) {
    super(`تم حظر الاتصال بخدمة (${serviceName}) مؤقتاً لحماية استقرار النظام (Circuit Breaker OPEN)`, 503, 'CIRCUIT_BREAKER_OPEN', { serviceName }, true);
  }
}

export class DependencyError extends AppError {
  constructor(serviceName: string, originalError?: any) {
    super(`فشل الاتصال بالخدمة الخارجية: ${serviceName}`, 502, 'DEPENDENCY_FAILURE', {
      service: serviceName,
      reason: originalError?.message || 'Unknown network/API error'
    }, true);
  }
}

/**
 * Centralized Express Error Handling Middleware
 * Sanitizes errors, logs diagnostics with correlation IDs, and renders safe Arabic client responses.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const errorId = `err_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const traceId = (req as any).traceId || (req.headers['x-trace-id'] as string) || `trc_${Date.now()}`;

  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let clientMessage = 'حدث خطأ داخلي غير متوقع في الخادم، يرجى إعادة المحاولة لاحقاً.';
  let details = undefined;
  let retryable = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    clientMessage = err.message;
    details = err.details;
    retryable = err.retryable;
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    statusCode = 400;
    errorCode = 'INVALID_JSON_BODY';
    clientMessage = 'صيغة البيانات المرسلة غير صحيحة (Invalid JSON Body)';
  } else if (err.type === 'entity.too.large' || err.statusCode === 413) {
    statusCode = 413;
    errorCode = 'PAYLOAD_TOO_LARGE';
    clientMessage = 'حجم البيانات أو الملف المرسل يتجاوز الحد الأقصى المسموح به.';
  } else if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
    statusCode = 409;
    errorCode = 'DUPLICATE_RESOURCE';
    clientMessage = 'القيمة أو المعرف المرسل مسجل مسبقاً في النظام ولا يمكن تكراره.';
  } else if (err.code === 'SQLITE_CONSTRAINT_CHECK' || (err.message && err.message.includes('CHECK constraint failed'))) {
    statusCode = 400;
    errorCode = 'CONSTRAINT_VIOLATION';
    clientMessage = 'البيانات المدخلة تخالف قيود التحقق الصارمة (مثل الكميات أو الأسعار السالبة).';
  } else if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || (err.message && err.message.includes('FOREIGN KEY constraint failed'))) {
    statusCode = 400;
    errorCode = 'REFERENTIAL_INTEGRITY_ERROR';
    clientMessage = 'المعرف المرجعي المرتبط (مثل التاجر أو المنتج) غير موجود في قاعدة البيانات.';
  } else if (err.code === 'SQLITE_BUSY') {
    statusCode = 503;
    errorCode = 'DATABASE_BUSY';
    clientMessage = 'قاعدة البيانات مشغولة حالياً بمعالجة طلبات أخرى، يرجى المحاولة بعد قليل.';
    retryable = true;
  }

  // Structured logging of the error with stack trace (kept server-side)
  logger.error(err.message || 'Unhandled Express Error', {
    service: 'api_gateway',
    traceId,
    action: `${req.method} ${req.path}`,
    statusCode,
    clientIp: req.ip || req.socket.remoteAddress,
    metadata: {
      errorId,
      errorCode,
      params: req.params,
      query: req.query,
      body: sanitizeData(req.body)
    },
    error: {
      name: err.name || 'Error',
      message: err.message,
      code: errorCode,
      stack: err.stack
    }
  });

  // Client response safe payload
  res.status(statusCode).json({
    success: false,
    error: {
      id: errorId,
      code: errorCode,
      message: clientMessage,
      details: sanitizeData(details),
      retryable,
      traceId,
      timestamp: new Date().toISOString()
    }
  });
}
