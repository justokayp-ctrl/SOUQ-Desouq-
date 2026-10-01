/**
 * Client-Side Security & Data Sanitization Engine
 * Implements strict sanitization, anti-XSS protection, PII masking, 
 * and Egyptian mobile validation without relying on external heavy dependencies.
 */

// Basic HTML entity encoding to prevent stored/reflected XSS in review comments, addresses, and Q&A
export function sanitizeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Strip malicious script injection patterns and SQL injection keywords from text fields
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onclick\s*=/gi, '')
    .replace(/(\b(union|select|insert|update|delete|drop|alter|create|truncate)\b\s+)/gi, '')
    .trim();
}

// Egyptian Mobile Number Validator (Vodafone, Orange, Etisalat, WE)
export function isValidEgyptianPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  // Matches 010, 011, 012, 015 followed by 8 digits, or with country code 2010, 2011, 2012, 2015
  const egPhoneRegex = /^(?:(?:\+?20)|0)?1[0125][0-9]{8}$/;
  return egPhoneRegex.test(cleaned);
}

// Format and normalize Egyptian phone number to standard 01XXXXXXXXX
export function normalizeEgyptianPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\+]/g, '');
  if (cleaned.startsWith('20') && cleaned.length === 12) {
    cleaned = '0' + cleaned.substring(2);
  } else if (!cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

// Mask sensitive phone numbers for public display (e.g. in reviews or order confirmations)
export function maskPhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.trim();
  if (cleaned.length >= 8) {
    return `${cleaned.slice(0, 3)}****${cleaned.slice(-4)}`;
  }
  return '***REDACTED***';
}

// Mask national ID (14 digits)
export function maskNationalId(id: string): string {
  if (!id || typeof id !== 'string') return '';
  if (id.length === 14) {
    return `${id.slice(0, 3)}********${id.slice(-3)}`;
  }
  return '**************';
}

// Generate client-side anti-replay / trace header
export function generateSecurityHeaders(): Record<string, string> {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2, 12);
  return {
    'X-Client-Timestamp': timestamp,
    'X-Client-Nonce': nonce,
    'X-Requested-With': 'DesoqMarketplaceApp'
  };
}
