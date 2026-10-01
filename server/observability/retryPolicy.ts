import { logger } from './logger';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  jitter?: boolean;
  retryIf?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number, nextDelayMs: number) => void;
}

/**
 * Execute an async function with Exponential Backoff and Jitter
 */
export async function withSafeRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const initialDelay = options.initialDelayMs ?? 500;
  const maxDelay = options.maxDelayMs ?? 10000;
  const backoffFactor = options.backoffFactor ?? 2;
  const useJitter = options.jitter ?? true;

  let attempt = 1;

  while (true) {
    try {
      return await fn(attempt);
    } catch (error: any) {
      if (attempt >= maxAttempts) {
        logger.error(`[RETRY EXHAUSTED] Failed after ${attempt} attempts: ${error.message}`, {
          service: 'retry_policy',
          action: 'retry_exhausted',
          error: { name: error.name, message: error.message, stack: error.stack }
        });
        throw error;
      }

      // Check if the error is considered retryable
      if (options.retryIf && !options.retryIf(error)) {
        throw error;
      }

      // Calculate exponential backoff
      let delay = initialDelay * Math.pow(backoffFactor, attempt - 1);
      delay = Math.min(delay, maxDelay);

      // Apply jitter to avoid thundering herds
      if (useJitter) {
        delay = Math.floor(delay * (0.5 + Math.random() * 0.5));
      }

      if (options.onRetry) {
        options.onRetry(error, attempt, delay);
      } else {
        logger.warn(`[RETRYING] Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${delay}ms...`, {
          service: 'retry_policy',
          metadata: { attempt, maxAttempts, delayMs: delay }
        });
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
}
