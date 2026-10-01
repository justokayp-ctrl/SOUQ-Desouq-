import { Request, Response } from 'express';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    totalCount?: number;
    totalPages?: number;
    hasMore?: boolean;
    isIdempotentReplay?: boolean;
    timestamp?: string;
    [key: string]: any;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

/**
 * Standard Unified API Success Response Sender
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  meta?: ApiSuccessResponse<T>['meta'],
  statusCode = 200
): void {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
  res.status(statusCode).json(payload);
}

/**
 * Standard Unified API Error Response Sender
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errorCode?: string,
  details?: any
): void {
  const payload: ApiErrorResponse = {
    success: false,
    error: message,
    code: errorCode,
    details,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(payload);
}

/**
 * Extract Idempotency Key from standard headers or request payload
 */
export function getIdempotencyKey(req: Request): string | undefined {
  const key = 
    req.headers['idempotency-key'] ||
    req.headers['x-idempotency-key'] ||
    req.body?.idempotencyKey ||
    req.query?.idempotencyKey;

  if (Array.isArray(key)) {
    return key[0]?.trim();
  }
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : undefined;
}

/**
 * Set header when an operation was an idempotent replay
 */
export function markIdempotentReplay(res: Response, isReplay?: boolean): void {
  if (isReplay) {
    res.setHeader('X-Idempotent-Replay', 'true');
  }
}

/**
 * Parse standard pagination, filtering and sorting parameters
 */
export function parsePaginationParams(req: Request) {
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
  const offset = (page - 1) * limit;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = ((req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
  const search = (req.query.search as string)?.trim() || '';

  return {
    page,
    limit,
    offset,
    sortBy,
    sortOrder,
    search,
  };
}
