import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  IStorageProvider, 
  PutObjectOptions, 
  StorageObjectMeta, 
  StorageObjectResult 
} from '../types';

const SIGNED_URL_SECRET = process.env.STORAGE_SIGNING_SECRET || 'desoq_storage_hmac_secret_key_2026';

export class DiskObjectStorageProvider implements IStorageProvider {
  public name = 'disk_object_storage';
  private baseDir: string;
  private publicDir: string;
  private privateDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), 'server', 'data', 'storage');
    this.publicDir = path.join(this.baseDir, 'public');
    this.privateDir = path.join(this.baseDir, 'private');
    this.initDirectories();
  }

  private initDirectories() {
    if (!fs.existsSync(this.publicDir)) {
      fs.mkdirSync(this.publicDir, { recursive: true });
    }
    if (!fs.existsSync(this.privateDir)) {
      fs.mkdirSync(this.privateDir, { recursive: true });
    }
  }

  private resolvePath(key: string): string {
    // Prevent directory traversal attacks
    const normalized = path.normalize(key).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(this.baseDir, normalized);
    
    // Ensure the resolved path remains inside baseDir
    if (!fullPath.startsWith(this.baseDir)) {
      throw new Error(`Security Violation: Storage key traversal detected (${key})`);
    }

    return fullPath;
  }

  public async putObject(key: string, data: Buffer, options: PutObjectOptions): Promise<StorageObjectMeta> {
    const filePath = this.resolvePath(key);
    const parentDir = path.dirname(filePath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Atomic write via temporary file
    const tempPath = `${filePath}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;
    await fs.promises.writeFile(tempPath, data);
    await fs.promises.rename(tempPath, filePath);

    const sha256Checksum = crypto.createHash('sha256').update(data).digest('hex');
    const etag = `"${sha256Checksum.slice(0, 32)}"`;

    return {
      key,
      bucket: options.bucket,
      sizeBytes: data.length,
      mimeType: options.mimeType,
      sha256Checksum,
      etag,
      lastModified: new Date(),
    };
  }

  public async getObject(key: string): Promise<StorageObjectResult> {
    const filePath = this.resolvePath(key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Object not found in storage: ${key}`);
    }

    const stat = await fs.promises.stat(filePath);
    const buffer = await fs.promises.readFile(filePath);
    const sha256Checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    const meta: StorageObjectMeta = {
      key,
      bucket: key.startsWith('public/') ? 'public' : 'private',
      sizeBytes: stat.size,
      mimeType: this.inferMimeType(key),
      sha256Checksum,
      etag: `"${sha256Checksum.slice(0, 32)}"`,
      lastModified: stat.mtime,
    };

    const stream = fs.createReadStream(filePath);

    return {
      meta,
      stream,
      buffer,
    };
  }

  public async deleteObject(key: string): Promise<boolean> {
    const filePath = this.resolvePath(key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  public async exists(key: string): Promise<boolean> {
    const filePath = this.resolvePath(key);
    return fs.existsSync(filePath);
  }

  public getPublicUrl(key: string): string {
    const cleanKey = key.startsWith('public/') ? key.slice('public/'.length) : key;
    return `/api/storage/public/${cleanKey}`;
  }

  public createSignedUrl(key: string, expiresInSeconds: number = 900, extraPayload: Record<string, any> = {}): string {
    const now = Date.now();
    const exp = now + expiresInSeconds * 1000;
    
    const payload = {
      key,
      exp,
      iat: now,
      ...extraPayload,
    };

    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', SIGNED_URL_SECRET).update(data).digest('base64url');
    const token = `${data}.${signature}`;

    return token;
  }

  public verifySignedToken(token: string): { valid: boolean; key?: string; payload?: any; error?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) {
        return { valid: false, error: 'توقيع الرابط غير صالح (Invalid Token Structure)' };
      }

      const [data, signature] = parts;
      const expectedSignature = crypto.createHmac('sha256', SIGNED_URL_SECRET).update(data).digest('base64url');

      if (signature !== expectedSignature) {
        return { valid: false, error: 'فشل التحقق من التوقيع الرقمي للرابط (Signature Mismatch)' };
      }

      const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
      if (payload.exp && Date.now() > payload.exp) {
        return { valid: false, error: 'انتهت صلاحية رابط التحميل الآمن (Signed URL Expired)' };
      }

      return {
        valid: true,
        key: payload.key,
        payload,
      };
    } catch {
      return { valid: false, error: 'فشل فك ترميز التوقيع الرقمي' };
    }
  }

  private inferMimeType(key: string): string {
    const ext = path.extname(key).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.gif':
        return 'image/gif';
      case '.svg':
        return 'image/svg+xml';
      case '.pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }
}
