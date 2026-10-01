import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { api } from '../../services/api';
import { StoredFile } from '../../types';

interface MediaUploaderProps {
  purpose: string;
  associatedEntityType?: string;
  associatedEntityId?: string;
  accept?: string;
  multiple?: boolean;
  label?: string;
  helperText?: string;
  onUploadSuccess: (file: StoredFile) => void;
  onUploadMultipleSuccess?: (files: StoredFile[]) => void;
  onUploadError?: (error: string) => void;
  currentPreviewUrl?: string;
  maxSizeBytes?: number;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  purpose,
  associatedEntityType = 'general',
  associatedEntityId,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  multiple = false,
  label = 'رفع ملف إلى خادم التخزين (Object Storage)',
  helperText = 'الصيغ المدعومة: JPEG, PNG, WebP, GIF (بحد أقصى 10 ميجابايت)',
  onUploadSuccess,
  onUploadMultipleSuccess,
  onUploadError,
  currentPreviewUrl,
  maxSizeBytes = 10 * 1024 * 1024,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successFile, setSuccessFile] = useState<StoredFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSingleFile = async (file: File): Promise<StoredFile> => {
    if (file.size > maxSizeBytes) {
      throw new Error(`حجم الملف "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} ميجابايت) يتجاوز الحد المسموح به (${(maxSizeBytes / 1024 / 1024).toFixed(0)} ميجابايت)`);
    }

    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error(`فشل قراءة بيانات الملف ${file.name}`));
    });

    reader.readAsDataURL(file);
    const base64Data = await base64Promise;

    return await api.uploadMedia({
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      purpose,
      base64Data,
      associatedEntityType,
      associatedEntityId,
    });
  };

  const processFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadCount(files.length);

    try {
      const uploadedResults: StoredFile[] = [];
      const errors: string[] = [];

      for (const file of files) {
        try {
          const stored = await processSingleFile(file);
          uploadedResults.push(stored);
          onUploadSuccess(stored);
        } catch (err: any) {
          errors.push(err.message || `خطأ أثناء رفع ${file.name}`);
        }
      }

      if (uploadedResults.length > 0) {
        setSuccessFile(uploadedResults[uploadedResults.length - 1]);
        if (onUploadMultipleSuccess) {
          onUploadMultipleSuccess(uploadedResults);
        }
      }

      if (errors.length > 0) {
        setErrorMessage(errors.join(' | '));
        onUploadError?.(errors.join(' | '));
      }
    } catch (err: any) {
      const msg = err.message || 'فشل رفع الملفات إلى خادم التخزين';
      setErrorMessage(msg);
      onUploadError?.(msg);
    } finally {
      setIsUploading(false);
      setUploadCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const previewSrc = !multiple ? (successFile?.publicUrl || currentPreviewUrl) : undefined;

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">{label}</label>}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer text-center ${
          dragActive 
            ? 'border-[#800020] bg-[#800020]/5' 
            : 'border-gray-200 dark:border-zinc-700 hover:border-[#800020]/40 bg-[#FDFBF7] dark:bg-zinc-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-2 text-[#800020] dark:text-[#D4AF37]">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-xs font-bold">
              {uploadCount > 1 
                ? `جاري فحص ورفع ${uploadCount} صور بالتوازي إلى التخزين السحابي...`
                : 'جاري الفحص الأمني والرفع إلى التخزين السحابي...'}
            </p>
          </div>
        ) : previewSrc ? (
          <div className="flex items-center justify-between gap-4 p-2">
            <div className="flex items-center gap-3">
              <img
                src={previewSrc}
                alt="Preview"
                className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-xs"
              />
              <div className="text-right">
                <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 line-clamp-1">
                  {successFile?.originalFilename || 'تم رفع الصورة بنجاح'}
                </p>
                <p className="text-[10px] text-green-700 dark:text-green-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 inline" />
                  مخزنة ومفحوصة أمنياً (Object Storage CDN)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="text-xs text-[#800020] dark:text-[#D4AF37] hover:underline font-bold px-3 py-1 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700"
            >
              تغيير الصورة
            </button>
          </div>
        ) : (
          <div className="py-5 flex flex-col items-center justify-center space-y-2 text-gray-500 dark:text-zinc-400">
            <div className="w-10 h-10 rounded-full bg-[#800020]/10 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-700 dark:text-zinc-200">
              {multiple 
                ? 'اسحب صورة واحدة أو عدة صور معاً، أو انقر للاختيار من جهازك' 
                : 'اسحب الملف هنا أو انقر للاختيار من جهازك'}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500">{helperText}</p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
