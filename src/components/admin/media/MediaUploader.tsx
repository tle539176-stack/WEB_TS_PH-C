import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateImageFile } from '@/services/mediaService';
import { cn } from '@/lib/utils';
import { MediaLibraryPicker } from './MediaLibraryPicker';
import type { MediaAsset } from '@/types/database';

export interface MediaUploaderResult {
  url: string;
  storagePath: string;
  alt: string;
}

interface MediaUploaderProps {
  label: string;
  currentUrl?: string;
  currentAlt?: string;
  aspectHint?: '1:1' | '3:4' | '16:9' | 'free';
  onUpload: (file: File, alt: string) => Promise<{ url: string; storagePath: string }>;
  onUploaded: (result: MediaUploaderResult) => void;
  onRemove?: () => void | Promise<void>;
  onAltChange?: (alt: string) => void;
  onSelectAsset?: (asset: MediaAsset) => void;
  libraryFilterEntityType?: MediaAsset['entity_type'];
  disabled?: boolean;
  disabledReason?: string;
}

const ASPECT_LABELS: Record<string, string> = {
  '1:1': 'Tỉ lệ 1:1 (vuông)',
  '3:4': 'Tỉ lệ 3:4 (đứng)',
  '16:9': 'Tỉ lệ 16:9 (ngang)',
  'free': '',
};

export function MediaUploader({
  label,
  currentUrl = '',
  currentAlt = '',
  aspectHint = 'free',
  onUpload,
  onUploaded,
  onRemove,
  onAltChange,
  onSelectAsset,
  libraryFilterEntityType,
  disabled = false,
  disabledReason,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [altText, setAltText] = useState(currentAlt);
  const [isDragOver, setIsDragOver] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAltText(currentAlt);
  }, [currentAlt, currentUrl]);

  const handleAltChange = (value: string) => {
    setAltText(value);
    onAltChange?.(value);
  };

  const handleFile = async (file: File) => {
    setError('');
    try {
      validateImageFile(file);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'File không hợp lệ');
      return;
    }
    setUploading(true);
    try {
      const result = await onUpload(file, altText);
      onUploaded({ ...result, alt: altText });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const hasImage = !!currentUrl;
  const canPickFromLibrary = !disabled && !!onSelectAsset;

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">{label}</p>

      {aspectHint !== 'free' && (
        <p className="text-[10px] text-neutral-400">Gợi ý: {ASPECT_LABELS[aspectHint]}</p>
      )}

      {hasImage ? (
        <div className="relative group border border-neutral-200 rounded overflow-hidden bg-neutral-50">
          <img
            src={currentUrl}
            alt={altText || label}
            className={cn(
              'w-full object-cover',
              aspectHint === '16:9' && 'aspect-video',
              aspectHint === '1:1' && 'aspect-square',
              aspectHint === '3:4' && 'aspect-[3/4] max-h-48',
              aspectHint === 'free' && 'max-h-48',
            )}
            referrerPolicy="no-referrer"
          />
          {!disabled && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {!disabled && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-white/90 text-[#0A3151] text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Thay ảnh
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            disabled
              ? 'border-neutral-100 bg-neutral-50 cursor-not-allowed'
              : isDragOver
              ? 'border-[#0A3151] bg-blue-50 cursor-copy'
              : 'border-neutral-200 hover:border-[#0A3151] hover:bg-neutral-50 cursor-pointer',
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-[#0A3151]">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-medium">Đang upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center',
                disabled ? 'bg-neutral-100' : 'bg-[#0A3151]/10')}>
                {disabled ? (
                  <ImageIcon className="w-5 h-5 text-neutral-300" />
                ) : (
                  <Upload className="w-5 h-5 text-[#0A3151]" />
                )}
              </div>
              {disabled ? (
                <p className="text-xs text-neutral-400">{disabledReason ?? 'Upload bị vô hiệu hóa'}</p>
              ) : (
                <>
                  <p className="text-xs font-medium text-neutral-600">
                    Kéo thả ảnh vào đây hoặc <span className="text-[#0A3151] underline">chọn file</span>
                  </p>
                  <p className="text-[10px] text-neutral-400">JPG, PNG, WebP · Tối đa 5MB</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled || uploading}
      />

      {hasImage && (
        <div>
          <label className="block text-[10px] font-bold text-neutral-500 mb-1">Alt text (mô tả ảnh)</label>
          <Input
            value={altText}
            onChange={e => handleAltChange(e.target.value)}
            placeholder="Mô tả ngắn về ảnh..."
            className="text-xs h-8"
            disabled={disabled}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}

      {!disabled && (hasImage || canPickFromLibrary) && (
        <div className="flex flex-wrap gap-2">
          {hasImage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
              {uploading ? 'Đang upload...' : 'Thay ảnh mới'}
            </Button>
          )}
          {canPickFromLibrary && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setLibraryOpen(true)}
              disabled={uploading}
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              Chọn từ thư viện
            </Button>
          )}
        </div>
      )}

      {libraryOpen && onSelectAsset && (
        <MediaLibraryPicker
          filterEntityType={libraryFilterEntityType ?? undefined}
          onClose={() => setLibraryOpen(false)}
          onSelect={(asset) => {
            handleAltChange(asset.alt || '');
            onSelectAsset(asset);
            setLibraryOpen(false);
          }}
        />
      )}
    </div>
  );
}
