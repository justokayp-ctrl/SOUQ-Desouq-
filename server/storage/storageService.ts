import crypto from 'crypto';
import { 
  IStorageProvider, 
  StoredFileRecord, 
  KycDocumentRecord, 
  FilePurpose, 
  KycDocumentType, 
  KycStatus,
  FileUploadPayload
} from './types';
import { validateFile } from './validation';
import { DiskObjectStorageProvider } from './providers/DiskObjectStorageProvider';
import { S3CompatibleStorageProvider } from './providers/S3CompatibleStorageProvider';
import { db } from '../db';
import { AuthUser } from '../../src/types';

export class StorageService {
  private provider: IStorageProvider;

  constructor(provider?: IStorageProvider) {
    if (provider) {
      this.provider = provider;
    } else if (process.env.STORAGE_PROVIDER === 's3' && process.env.S3_ACCESS_KEY_ID) {
      this.provider = new S3CompatibleStorageProvider();
    } else {
      this.provider = new DiskObjectStorageProvider();
    }
  }

  public getProvider(): IStorageProvider {
    return this.provider;
  }

  /**
   * Uploads public marketplace media (product images, seller logos, etc.)
   */
  public async uploadPublicMedia(
    payload: FileUploadPayload,
    user?: AuthUser
  ): Promise<{ success: boolean; file?: StoredFileRecord; error?: string }> {
    try {
      if (!payload.base64Data) {
        return { success: false, error: 'بيانات الملف فارغة' };
      }

      // Parse base64 string
      const base64Clean = payload.base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');

      // Security & Magic Bytes Validation
      const validation = validateFile(buffer, payload.filename, payload.mimeType, payload.purpose);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Entity and ID generation
      const fileId = `file-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const entityType = payload.associatedEntityType || (payload.purpose.includes('product') ? 'product' : 'seller');
      const entityId = payload.associatedEntityId || 'unassigned';

      // Safe storage key
      const storageKey = `public/${entityType}s/${entityId}/${fileId}_${validation.sanitizedFilename}`;

      // Store in Object Storage
      const meta = await this.provider.putObject(storageKey, buffer, {
        bucket: 'public',
        mimeType: validation.mimeType,
        isPublic: true,
      });

      const publicUrl = this.provider.getPublicUrl(storageKey);

      // Persist in authoritative Database
      const fileRecord = db.createStoredFile({
        id: fileId,
        storageKey,
        bucket: 'public',
        purpose: payload.purpose,
        originalFilename: payload.filename,
        sanitizedFilename: validation.sanitizedFilename,
        mimeType: validation.mimeType,
        sizeBytes: meta.sizeBytes,
        sha256Checksum: meta.sha256Checksum,
        ownerUserId: user?.id,
        ownerSellerId: user?.sellerId,
        associatedEntityType: entityType,
        associatedEntityId: entityId,
        publicUrl,
        metadata: {
          width: validation.imageDimensions?.width,
          height: validation.imageDimensions?.height,
          format: validation.mimeType.split('/')[1],
          optimized: true,
          isSensitive: false,
        },
        status: 'active',
      });

      return { success: true, file: fileRecord };
    } catch (err: any) {
      console.error('[StorageService] Error uploading public media:', err);
      return { success: false, error: err.message || 'فشل رفع الملف إلى خادم التخزين' };
    }
  }

  /**
   * Uploads private, access-controlled KYC document (commercial record, tax card, ID)
   */
  public async uploadKycDocument(
    payload: FileUploadPayload & {
      sellerId: string;
      documentType: KycDocumentType;
      titleAr: string;
      documentNumber?: string;
    },
    user: AuthUser
  ): Promise<{ success: boolean; kycDocument?: KycDocumentRecord; error?: string }> {
    try {
      // 1. Authorization: User must be a seller owning this sellerId or Admin
      if (user.role === 'seller' && user.sellerId !== payload.sellerId) {
        return { 
          success: false, 
          error: 'غير مصرح: لا يمكنك رفع مستندات تحقق لمتجر آخر' 
        };
      } else if (user.role === 'customer') {
        return { 
          success: false, 
          error: 'حساب المشتري غير مصرح له برفع وثائق تجارية' 
        };
      }

      if (!payload.base64Data) {
        return { success: false, error: 'بيانات المستند فارغة' };
      }

      // Parse base64
      const base64Clean = payload.base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');

      // 2. Validate KYC Document
      const validation = validateFile(buffer, payload.filename, payload.mimeType, payload.purpose);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // 3. Generate secure private storage key
      const fileId = `kyc-file-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const storageKey = `private/kyc/${payload.sellerId}/${payload.documentType}_${Date.now()}_${validation.sanitizedFilename}`;

      // 4. Store in Private Object Storage (Vault)
      const meta = await this.provider.putObject(storageKey, buffer, {
        bucket: 'private',
        mimeType: validation.mimeType,
        isPublic: false,
      });

      // 5. Create database stored_files record
      const fileRecord = db.createStoredFile({
        id: fileId,
        storageKey,
        bucket: 'private',
        purpose: payload.purpose,
        originalFilename: payload.filename,
        sanitizedFilename: validation.sanitizedFilename,
        mimeType: validation.mimeType,
        sizeBytes: meta.sizeBytes,
        sha256Checksum: meta.sha256Checksum,
        ownerUserId: user.id,
        ownerSellerId: payload.sellerId,
        associatedEntityType: 'kyc',
        associatedEntityId: payload.sellerId,
        publicUrl: undefined, // Strictly private! No direct public URL
        metadata: {
          isSensitive: true,
          encryptedAtRest: true,
          uploadedByRole: user.role,
        },
        status: 'active',
      });

      // 6. Create KYC Document database record
      const kycDocId = `kyc-doc-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const kycRecord = db.createKycDocument({
        id: kycDocId,
        sellerId: payload.sellerId,
        fileId: fileRecord.id,
        documentType: payload.documentType,
        titleAr: payload.titleAr || 'مستند توثيق تجاري',
        documentNumber: payload.documentNumber || '',
        status: 'pending',
        reviewNotes: 'تم استلام المستند بنجاح وبانتظار تدقيق مسؤول الامتثال والتحكيم',
      });

      // Update seller verification status to pending if currently rejected/unverified
      const seller = db.getSellerById(payload.sellerId);
      if (seller && seller.verificationStatus !== 'verified') {
        db.updateSellerVerification(payload.sellerId, 'pending');
      }

      return {
        success: true,
        kycDocument: {
          ...kycRecord,
          file: fileRecord,
        }
      };
    } catch (err: any) {
      console.error('[StorageService] Error uploading KYC document:', err);
      return { success: false, error: err.message || 'فشل حفظ المستند في الخزينة الآمنة' };
    }
  }

  /**
   * Generates a time-limited signed URL for private file access with RBAC & ownership verification
   */
  public generateSignedDownloadUrl(
    fileId: string,
    user: AuthUser,
    expiresInSeconds: number = 1800 // 30 minutes default
  ): { success: boolean; signedUrl?: string; error?: string; expiresAt?: string } {
    const file = db.getStoredFileById(fileId);
    if (!file) {
      return { success: false, error: 'الملف غير موجود بسجلات التخزين' };
    }

    // Access Control check
    if (file.bucket === 'private') {
      const isPrivileged = user.role === 'admin' || user.role === 'support';
      const isOwnerSeller = user.role === 'seller' && user.sellerId && user.sellerId === file.ownerSellerId;
      const isOwnerUser = file.ownerUserId === user.id;

      if (!isPrivileged && !isOwnerSeller && !isOwnerUser) {
        return { 
          success: false, 
          error: 'غير مصرح: ليس لديك صلاحية الوصول لهذا الملف الحساس' 
        };
      }
    }

    const token = this.provider.createSignedUrl(file.storageKey, expiresInSeconds, {
      fileId: file.id,
      userId: user.id,
      sellerId: user.sellerId,
      role: user.role,
    });

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    const signedUrl = `/api/storage/files/${file.id}/download?token=${token}`;

    return {
      success: true,
      signedUrl,
      expiresAt,
    };
  }

  /**
   * Retrieves file download stream with full authorization checks
   */
  public async getFileForDownload(
    fileId: string,
    user?: AuthUser,
    signedToken?: string
  ): Promise<{
    allowed: boolean;
    error?: string;
    fileRecord?: StoredFileRecord;
    stream?: NodeJS.ReadableStream;
    buffer?: Buffer;
    mimeType?: string;
    filename?: string;
  }> {
    const file = db.getStoredFileById(fileId);
    if (!file) {
      return { allowed: false, error: 'الملف غير موجود' };
    }

    // Public files are freely accessible
    if (file.bucket === 'public') {
      const obj = await this.provider.getObject(file.storageKey);
      return {
        allowed: true,
        fileRecord: file,
        stream: obj.stream,
        buffer: obj.buffer,
        mimeType: file.mimeType,
        filename: file.sanitizedFilename,
      };
    }

    // Private Files: Verify Token or User Session
    let isAuthorized = false;

    // Check signed token if provided
    if (signedToken) {
      const verify = this.provider.verifySignedToken(signedToken);
      if (verify.valid && verify.key === file.storageKey) {
        isAuthorized = true;
      }
    }

    // Check user role/ownership if authenticated
    if (!isAuthorized && user) {
      const isPrivileged = user.role === 'admin' || user.role === 'support';
      const isOwnerSeller = user.role === 'seller' && user.sellerId && user.sellerId === file.ownerSellerId;
      const isOwnerUser = file.ownerUserId === user.id;

      if (isPrivileged || isOwnerSeller || isOwnerUser) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return { 
        allowed: false, 
        error: 'غير مصرح: الملف يتطلب توقيعاً رقمياً ساري المفعول أو صلاحية مناسبة' 
      };
    }

    const obj = await this.provider.getObject(file.storageKey);
    return {
      allowed: true,
      fileRecord: file,
      stream: obj.stream,
      buffer: obj.buffer,
      mimeType: file.mimeType,
      filename: file.sanitizedFilename,
    };
  }

  /**
   * Admin / Support KYC Review
   */
  public async reviewKycDocument(
    kycDocId: string,
    user: AuthUser,
    status: KycStatus,
    reviewNotes: string,
    expiryDate?: string
  ): Promise<{ success: boolean; kycDocument?: KycDocumentRecord; error?: string }> {
    if (user.role !== 'admin' && user.role !== 'support') {
      return { success: false, error: 'صلاحية تدقيق مستندات الـ KYC مقتصرة على المشرفين ومستشاري التحكيم' };
    }

    const updated = db.updateKycDocument(kycDocId, {
      status,
      reviewNotes,
      reviewedBy: `${user.fullName} (${user.role})`,
      reviewedAt: new Date().toISOString(),
      expiryDate,
    });

    if (!updated) {
      return { success: false, error: 'مستند التوثيق غير موجود' };
    }

    // Check all documents for this seller to auto-update seller verification status
    const allDocs = db.getKycDocuments(updated.sellerId);
    const hasRejected = allDocs.some(d => d.status === 'rejected');
    const hasApproved = allDocs.some(d => d.status === 'approved');
    const allApproved = allDocs.length > 0 && allDocs.every(d => d.status === 'approved');

    if (allApproved) {
      db.updateSellerVerification(updated.sellerId, 'verified');
    } else if (hasRejected) {
      db.updateSellerVerification(updated.sellerId, 'rejected');
    } else if (hasApproved) {
      db.updateSellerVerification(updated.sellerId, 'pending');
    }

    return { success: true, kycDocument: updated };
  }
}

export const storageService = new StorageService();
