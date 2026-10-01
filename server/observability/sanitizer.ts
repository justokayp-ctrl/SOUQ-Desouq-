/**
 * Sensitive Data Redactor & Sanitizer
 * Ensures secrets, passwords, national IDs, and payment tokens never leak into logs or telemetry.
 */

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /bearer/i,
  /cookie/i,
  /api[_-]?key/i,
  /national[_-]?id/i,
  /id[_-]?number/i,
  /card[_-]?number/i,
  /cvv/i,
  /cvc/i,
  /pin/i,
  /private[_-]?key/i,
  /passcode/i,
  /ssn/i,
  /tax[_-]?registration/i,
  /commercial[_-]?record/i
];

/**
 * Mask sensitive string value (e.g. "01012345678" -> "010****5678" or "secret123" -> "[REDACTED]")
 */
export function maskSensitiveValue(key: string, value: any): any {
  if (value === null || value === undefined) return value;
  
  if (typeof value === 'string') {
    if (key.toLowerCase().includes('phone')) {
      if (value.length >= 8) {
        return `${value.slice(0, 3)}****${value.slice(-4)}`;
      }
      return '***REDACTED***';
    }
    
    if (key.toLowerCase().includes('email')) {
      const parts = value.split('@');
      if (parts.length === 2 && parts[0].length > 2) {
        return `${parts[0].slice(0, 2)}***@${parts[1]}`;
      }
      return '***@***.***';
    }

    if (key.toLowerCase().includes('national') || key.toLowerCase().includes('card')) {
      if (value.length >= 4) {
        return `****${value.slice(-4)}`;
      }
      return '****';
    }

    return '[REDACTED_SECRET]';
  }

  if (typeof value === 'number') {
    return '[REDACTED_NUMBER]';
  }

  return '[REDACTED]';
}

/**
 * Recursively sanitize an object, array, or primitive for safe logging and error rendering.
 */
export function sanitizeData<T = any>(input: T, seen = new WeakSet()): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input !== 'object') {
    return input;
  }

  // Handle circular references safely
  if (seen.has(input as any)) {
    return '[CIRCULAR_REF]' as any;
  }
  seen.add(input as any);

  if (Array.isArray(input)) {
    return input.map(item => sanitizeData(item, seen)) as any;
  }

  if (input instanceof Error) {
    return {
      name: input.name,
      message: input.message,
      code: (input as any).code,
      stack: process.env.NODE_ENV === 'development' ? input.stack : undefined
    } as any;
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some(pattern => pattern.test(key));

    if (isSensitive) {
      result[key] = maskSensitiveValue(key, value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeData(value, seen);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
