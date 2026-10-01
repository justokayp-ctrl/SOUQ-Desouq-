export type StorageBucket = 'public' | 'private';

export type FilePurpose = 
  | 'product_image' 
  | 'seller_logo' 
  | 'seller_banner' 
  | 'kyc_commercial_register' 
  | 'kyc_tax_card' 
  | 'kyc_national_id' 
  | 'kyc_bank_proof' 
  | 'kyc_other' 
  | 'dispute_evidence' 
  | 'general_media';

export type KycDocumentType = 
  | 'commercial_register' 
  | 'tax_card' 
  | 'national_id' 
  | 'bank_proof' 
  | 'other';

export type KycStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface StorageObjectMeta {
  key: string;
  bucket: StorageBucket;
  sizeBytes: number;
  mimeType: string;
  sha256Checksum: string;
  etag: string;
  lastModified: Date;
}

export interface StorageObjectResult {
  meta: StorageObjectMeta;
  stream: NodeJS.ReadableStream;
  buffer?: Buffer;
}

export interface PutObjectOptions {
  bucket: StorageBucket;
  mimeType: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

export interface GetObjectOptions {
  range?: { start: number; end: number };
}

export interface SignedUrlOptions {
  expiresInSeconds?: number;
  userId?: string;
  action?: 'download' | 'view';
}

export interface IStorageProvider {
  name: string;
  putObject(key: string, data: Buffer, options: PutObjectOptions): Promise<StorageObjectMeta>;
  getObject(key: string): Promise<StorageObjectResult>;
  deleteObject(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  getPublicUrl(key: string): string;
  createSignedUrl(key: string, expiresInSeconds: number, extraPayload?: Record<string, any>): string;
  verifySignedToken(token: string): { valid: boolean; key?: string; payload?: any; error?: string };
}

export interface StoredFileRecord {
  id: string;
  storageKey: string;
  bucket: StorageBucket;
  purpose: FilePurpose;
  originalFilename: string;
  sanitizedFilename: string;
  mimeType: string;
  sizeBytes: number;
  sha256Checksum: string;
  ownerUserId?: string;
  ownerSellerId?: string;
  associatedEntityType: string;
  associatedEntityId?: string;
  publicUrl?: string;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    optimized?: boolean;
    isSensitive?: boolean;
    [key: string]: any;
  };
  status: 'active' | 'archived' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface KycDocumentRecord {
  id: string;
  sellerId: string;
  fileId: string;
  file?: StoredFileRecord;
  documentType: KycDocumentType;
  titleAr: string;
  documentNumber?: string;
  status: KycStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadPayload {
  filename: string;
  mimeType: string;
  purpose: FilePurpose;
  base64Data?: string;
  associatedEntityType?: string;
  associatedEntityId?: string;
  documentNumber?: string;
  titleAr?: string;
  documentType?: KycDocumentType;
}
