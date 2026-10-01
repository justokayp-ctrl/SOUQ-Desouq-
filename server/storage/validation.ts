import crypto from 'crypto';
import path from 'path';
import { FilePurpose, StorageBucket } from './types';

// Strict Whitelists
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg'
]);

export const ALLOWED_KYC_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
]);

export const ALLOWED_KYC_EXTENSIONS = new Set([
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp'
]);

export const FORBIDDEN_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.js', '.jsx', '.ts', '.tsx',
  '.html', '.htm', '.php', '.phtml', '.py', '.rb', '.pl', '.cgi',
  '.vbs', '.vbe', '.wsf', '.wsh', '.scr', '.com', '.pif', '.jar', '.war',
  '.msi', '.msp', '.reg', '.ps1', '.psm1', '.apk', '.bin', '.dll', '.so'
]);

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename: string;
  mimeType: string;
  sizeBytes: number;
  sha256Checksum: string;
  bucket: StorageBucket;
  imageDimensions?: { width: number; height: number };
}

/**
 * Validates magic bytes against claimed MIME type to prevent extension/MIME spoofing
 */
export function validateMagicBytes(buffer: Buffer, claimedMime: string): { matches: boolean; detectedMime?: string } {
  if (!buffer || buffer.length < 4) {
    return { matches: false };
  }

  // Check JPEG (FF D8 FF)
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { matches: claimedMime === 'image/jpeg', detectedMime: 'image/jpeg' };
  }

  // Check PNG (89 50 4E 47 0D 0A 1A 0A)
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A
  ) {
    return { matches: claimedMime === 'image/png', detectedMime: 'image/png' };
  }

  // Check PDF (%PDF-)
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46 && buffer[4] === 0x2D
  ) {
    return { matches: claimedMime === 'application/pdf', detectedMime: 'application/pdf' };
  }

  // Check GIF (GIF87a or GIF89a)
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61
  ) {
    return { matches: claimedMime === 'image/gif', detectedMime: 'image/gif' };
  }

  // Check WebP (RIFF....WEBP)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { matches: claimedMime === 'image/webp', detectedMime: 'image/webp' };
  }

  // Check SVG (XML / SVG text header)
  if (claimedMime === 'image/svg+xml') {
    const headerStr = buffer.slice(0, Math.min(buffer.length, 512)).toString('utf-8').trim();
    if (headerStr.includes('<svg') || (headerStr.includes('<?xml') && headerStr.includes('<svg'))) {
      return { matches: true, detectedMime: 'image/svg+xml' };
    }
  }

  return { matches: false };
}

/**
 * Sanitizes and strips dangerous script tags or event handlers from SVG data
 */
export function sanitizeSvg(buffer: Buffer): { safe: boolean; sanitized?: Buffer; error?: string } {
  const content = buffer.toString('utf-8');
  const lower = content.toLowerCase();

  // Strict check for active executable payloads in SVGs
  const forbiddenPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /onclick\s*=/i,
    /onmouseover\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(lower)) {
      return { safe: false, error: 'الملف يحتوي على عناصر برمجية غير مصرح بها (SVG Script/Event Disallowed)' };
    }
  }

  return { safe: true, sanitized: buffer };
}

/**
 * Sanitizes original filename to prevent path traversal, null bytes, and malicious characters
 */
export function sanitizeFilename(rawFilename: string): string {
  if (!rawFilename) return `file_${Date.now()}`;

  // Strip null bytes and control chars
  let clean = rawFilename.replace(/\0/g, '').replace(/[\x00-\x1f\x80-\x9f]/g, '');
  
  // Extract basename without directories
  const basename = path.basename(clean);
  const ext = path.extname(basename).toLowerCase();
  const nameWithoutExt = basename.slice(0, basename.length - ext.length);

  // Allow alphanumeric, Arabic letters, hyphens, and underscores
  const safeName = nameWithoutExt
    .replace(/[^\w\s\u0600-\u06FF-]/gi, '_')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 60);

  return `${safeName || 'file'}${ext}`;
}

/**
 * Extracts width and height from PNG / JPEG / GIF / WebP buffers safely
 */
export function extractImageDimensions(buffer: Buffer, mimeType: string): { width: number; height: number } | undefined {
  try {
    if (mimeType === 'image/png' && buffer.length >= 24) {
      // PNG IHDR width is at offset 16-19, height at 20-23
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      if (width > 0 && height > 0) return { width, height };
    }

    if (mimeType === 'image/gif' && buffer.length >= 10) {
      // GIF width at offset 6-7, height at 8-9 (little-endian)
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      if (width > 0 && height > 0) return { width, height };
    }

    if (mimeType === 'image/jpeg' && buffer.length >= 4) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xFF) break;
        const marker = buffer[offset + 1];
        // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
        if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
          if (offset + 8 < buffer.length) {
            const height = buffer.readUInt16BE(offset + 5);
            const width = buffer.readUInt16BE(offset + 7);
            if (width > 0 && height > 0) return { width, height };
          }
          break;
        }
        // Move to next marker
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }

    if (mimeType === 'image/webp' && buffer.length >= 30) {
      // Simple VP8 / VP8L parsing
      const format = buffer.toString('utf-8', 12, 16);
      if (format === 'VP8 ' && buffer.length >= 30) {
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        if (width > 0 && height > 0) return { width, height };
      } else if (format === 'VP8L' && buffer.length >= 25) {
        const b0 = buffer[21];
        const b1 = buffer[22];
        const b2 = buffer[23];
        const b3 = buffer[24];
        const width = 1 + (((b1 & 0x3f) << 8) | b0);
        const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        if (width > 0 && height > 0) return { width, height };
      }
    }
  } catch {
    // Graceful fallback if dimension parsing fails
  }
  return undefined;
}

/**
 * Comprehensive File Validation Engine
 */
export function validateFile(
  buffer: Buffer,
  rawFilename: string,
  claimedMime: string,
  purpose: FilePurpose
): ValidationResult {
  const isKyc = purpose.startsWith('kyc_');
  const bucket: StorageBucket = isKyc ? 'private' : 'public';
  const maxSize = isKyc ? MAX_DOCUMENT_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;

  // 1. Size Validation
  if (!buffer || buffer.length === 0) {
    return {
      valid: false,
      error: 'الملف فارغ أو غير صالح (Empty File)',
      sanitizedFilename: sanitizeFilename(rawFilename),
      mimeType: claimedMime,
      sizeBytes: 0,
      sha256Checksum: '',
      bucket,
    };
  }

  if (buffer.length > maxSize) {
    const maxMb = (maxSize / 1024 / 1024).toFixed(0);
    return {
      valid: false,
      error: `حجم الملف يتجاوز الحد الأقصى المسموح به (${maxMb} ميجابايت)`,
      sanitizedFilename: sanitizeFilename(rawFilename),
      mimeType: claimedMime,
      sizeBytes: buffer.length,
      sha256Checksum: '',
      bucket,
    };
  }

  // 2. Extension Validation
  const ext = path.extname(rawFilename).toLowerCase();
  if (FORBIDDEN_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `نوع الملف مرفوض لأسباب أمنية (${ext})`,
      sanitizedFilename: sanitizeFilename(rawFilename),
      mimeType: claimedMime,
      sizeBytes: buffer.length,
      sha256Checksum: '',
      bucket,
    };
  }

  const allowedExts = isKyc ? ALLOWED_KYC_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS;
  if (!allowedExts.has(ext)) {
    return {
      valid: false,
      error: `الامتداد (${ext}) غير مدعوم لهذا النوع من الملفات`,
      sanitizedFilename: sanitizeFilename(rawFilename),
      mimeType: claimedMime,
      sizeBytes: buffer.length,
      sha256Checksum: '',
      bucket,
    };
  }

  // 3. MIME Validation
  const allowedMimes = isKyc ? ALLOWED_KYC_MIME_TYPES : ALLOWED_IMAGE_MIME_TYPES;
  const inferredMime = ext === '.pdf' ? 'application/pdf' : (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'application/octet-stream';
  const cleanMime = (claimedMime || inferredMime).toLowerCase().trim();
  if (!allowedMimes.has(cleanMime)) {
    return {
      valid: false,
      error: `نوع الوسائط (${cleanMime}) غير مسموح به`,
      sanitizedFilename: sanitizeFilename(rawFilename),
      mimeType: cleanMime,
      sizeBytes: buffer.length,
      sha256Checksum: '',
      bucket,
    };
  }

  // 4. Magic Bytes Validation
  const magicCheck = validateMagicBytes(buffer, cleanMime);
  if (!magicCheck.matches) {
    return {
      valid: false,
      error: `محتوى الملف لا يتطابق مع نوعه المعلن (${cleanMime}) - فحص البصمة الثنائية فشل`,
      sanitizedFilename: sanitizeFilename(rawFilename),
      mimeType: cleanMime,
      sizeBytes: buffer.length,
      sha256Checksum: '',
      bucket,
    };
  }

  // 5. SVG Sanitization
  if (cleanMime === 'image/svg+xml') {
    const svgCheck = sanitizeSvg(buffer);
    if (!svgCheck.safe) {
      return {
        valid: false,
        error: svgCheck.error || 'الملف يحتوي على نصوص برمجية خطيرة',
        sanitizedFilename: sanitizeFilename(rawFilename),
        mimeType: cleanMime,
        sizeBytes: buffer.length,
        sha256Checksum: '',
        bucket,
      };
    }
  }

  // 6. SHA-256 Checksum Calculation
  const sha256Checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  const sanitizedFilename = sanitizeFilename(rawFilename);
  const imageDimensions = extractImageDimensions(buffer, cleanMime);

  return {
    valid: true,
    sanitizedFilename,
    mimeType: cleanMime,
    sizeBytes: buffer.length,
    sha256Checksum,
    bucket,
    imageDimensions,
  };
}
