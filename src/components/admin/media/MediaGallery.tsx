import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Image as ImageIcon, Loader2, Plus, Trash2, Star, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as media from '@/services/mediaService';
import { logAction } from '@/services/auditLogService';
import type { ProductImage, BookImage, MediaAsset } from '@/types/database';
import { validateImageFile } from '@/services/mediaService';
import { MediaLibraryPicker } from './MediaLibraryPicker';

type AnyImage = ProductImage | BookImage;

interface MediaGalleryProps {
  entityId: string;
  entityType: 'product' | 'book';
  maxImages?: number;
  aspectHint?: '1:1' | '3:4';
  session: Session;
  onChanged?: (images: AnyImage[]) => void;
}

export function MediaGallery({
  entityId,
  entityType,
  maxImages = 5,
  aspectHint = '1:1',
  session,
  onChanged,
}: MediaGalleryProps) {
  const [images, setImages] = useState<AnyImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangedRef = useRef(onChanged);

  useEffect(() => {
    onChangedRef.current = onChanged;
  }, [onChanged]);

  const load = useCallback(async () => {
    const imgs = entityType === 'product'
      ? await media.getProductImages(entityId)
      : await media.getBookImages(entityId);
    setImages(imgs);
    onChangedRef.current?.(imgs);
  }, [entityId, entityType]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file: File) => {
    setError('');
    try { validateImageFile(file); } catch (e) { setError(e instanceof Error ? e.message : 'File không hợp lệ'); return; }
    setUploading(true);
    setUploadingIdx(images.length);
    try {
      const userId = session.user.id;
      if (entityType === 'product') {
        await media.uploadProductImage(entityId, file, { uploadedBy: userId });
      } else {
        await media.uploadBookImage(entityId, file, { uploadedBy: userId });
      }
      await logAction(session, 'upload_image', entityType, entityId,
        { after: { file_name: file.name, entity_id: entityId } });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi upload');
    } finally {
      setUploading(false);
      setUploadingIdx(null);
    }
  };

  const handleSetPrimary = async (img: AnyImage) => {
    setError('');
    try {
      if (entityType === 'product') {
        await media.setPrimaryProductImage(img.id, entityId);
      } else {
        await media.setPrimaryBookImage(img.id, entityId);
      }
      await logAction(session, 'set_primary_image', entityType, entityId, { after: { image_id: img.id } });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi'); }
  };

  const handleSelectFromLibrary = async (asset: MediaAsset) => {
    setError('');
    if (images.some(img => img.media_asset_id === asset.id || img.storage_path === asset.storage_path)) {
      setError('Ảnh này đã có trong danh sách.');
      return;
    }
    try {
      if (entityType === 'product') {
        await media.addProductImage(entityId, asset.public_url, {
          alt: asset.alt,
          storagePath: asset.storage_path,
          mediaAssetId: asset.id,
          isPrimary: images.length === 0,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mime_type,
        });
      } else {
        await media.addBookImage(entityId, asset.public_url, {
          alt: asset.alt,
          storagePath: asset.storage_path,
          mediaAssetId: asset.id,
          isPrimary: images.length === 0,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mime_type,
        });
      }
      await logAction(session, 'select_library_image', entityType, entityId, {
        after: { media_asset_id: asset.id, storage_path: asset.storage_path },
      });
      setLibraryOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi chọn ảnh từ thư viện');
    }
  };

  const handleDelete = async (img: AnyImage) => {
    if (!window.confirm('Xóa ảnh này?')) return;
    setError('');
    try {
      if (entityType === 'product') {
        await media.deleteProductImage(img as ProductImage);
      } else {
        await media.deleteBookImage(img as BookImage);
      }
      await logAction(session, 'delete_image', entityType, entityId, { before: { image_id: img.id, storage_path: img.storage_path } });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi xóa ảnh'); }
  };

  const handleMoveUp = async (idx: number) => {
    if (idx === 0) return;
    const newOrder = [...images];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    const ids = newOrder.map(i => i.id);
    try {
      if (entityType === 'product') await media.reorderProductImages(entityId, ids);
      else await media.reorderBookImages(entityId, ids);
      await logAction(session, 'reorder_images', entityType, entityId, { after: { order: ids } });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi sắp xếp'); }
  };

  const handleMoveDown = async (idx: number) => {
    if (idx >= images.length - 1) return;
    const newOrder = [...images];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    const ids = newOrder.map(i => i.id);
    try {
      if (entityType === 'product') await media.reorderProductImages(entityId, ids);
      else await media.reorderBookImages(entityId, ids);
      await logAction(session, 'reorder_images', entityType, entityId, { after: { order: ids } });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi sắp xếp'); }
  };

  const handleSaveAlt = async (img: AnyImage) => {
    try {
      if (entityType === 'product') await media.updateProductImageAlt(img.id, altDraft);
      else await media.updateBookImageAlt(img.id, altDraft);
      setEditingAltId(null);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Lỗi lưu alt'); }
  };

  const hasPrimary = images.some(i => i.is_primary);
  const canAddMore = images.length < maxImages && !uploading;

  return (
    <div className="border-t pt-4 mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
          Ảnh ({images.length}/{maxImages})
        </p>
        <div className="flex items-center gap-2">
          {!hasPrimary && images.length > 0 && (
            <span className="text-[10px] text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Chưa có ảnh bìa
            </span>
          )}
          {canAddMore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[10px]"
              onClick={() => setLibraryOpen(true)}
            >
              <ImageIcon className="w-3 h-3 mr-1" />
              Chọn từ thư viện
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {images.map((img, idx) => (
          <div key={img.id} className="relative border rounded overflow-hidden bg-neutral-50 group">
            <img
              src={img.url}
              alt={img.alt}
              className={`w-full object-cover ${aspectHint === '3:4' ? 'aspect-[3/4]' : 'aspect-square'}`}
              referrerPolicy="no-referrer"
            />
            {img.is_primary && (
              <span className="absolute top-1 left-1 bg-[#0A3151] text-white text-[8px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                <Star className="w-2 h-2" /> Bìa
              </span>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
              {!img.is_primary && (
                <button type="button" onClick={() => handleSetPrimary(img)}
                  className="text-[8px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-bold w-full text-center">
                  Đặt bìa
                </button>
              )}
              <div className="flex gap-1 w-full">
                <button type="button" onClick={() => handleMoveUp(idx)} disabled={idx === 0}
                  className="flex-1 bg-white/20 text-white text-[8px] py-0.5 rounded disabled:opacity-30">
                  <ArrowUp className="w-3 h-3 mx-auto" />
                </button>
                <button type="button" onClick={() => handleMoveDown(idx)} disabled={idx === images.length - 1}
                  className="flex-1 bg-white/20 text-white text-[8px] py-0.5 rounded disabled:opacity-30">
                  <ArrowDown className="w-3 h-3 mx-auto" />
                </button>
              </div>
              <button type="button" onClick={() => { setEditingAltId(img.id); setAltDraft(img.alt); }}
                className="text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded w-full text-center">
                Alt text
              </button>
              <button type="button" onClick={() => handleDelete(img)}
                className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded w-full text-center flex items-center justify-center gap-0.5">
                <Trash2 className="w-2 h-2" /> Xóa
              </button>
            </div>
          </div>
        ))}

        {uploadingIdx !== null && (
          <div className={`border-2 border-dashed border-[#0A3151] rounded flex items-center justify-center bg-blue-50 ${aspectHint === '3:4' ? 'aspect-[3/4]' : 'aspect-square'}`}>
            <Loader2 className="w-5 h-5 animate-spin text-[#0A3151]" />
          </div>
        )}

        {canAddMore && uploadingIdx === null && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed border-neutral-300 rounded flex flex-col items-center justify-center gap-1 hover:border-[#0A3151] hover:bg-neutral-50 transition-colors ${aspectHint === '3:4' ? 'aspect-[3/4]' : 'aspect-square'}`}
          >
            <Plus className="w-5 h-5 text-neutral-400" />
            <span className="text-[9px] text-neutral-400 font-medium">Thêm ảnh</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }}
      />

      {editingAltId && (
        <div className="flex gap-2 items-center">
          <Input
            value={altDraft}
            onChange={e => setAltDraft(e.target.value)}
            placeholder="Mô tả ảnh..."
            className="text-xs h-8 flex-1"
            autoFocus
          />
          <Button type="button" size="sm" className="h-8 text-xs bg-[#0A3151] text-white px-3"
            onClick={() => { const img = images.find(i => i.id === editingAltId); if (img) handleSaveAlt(img); }}>
            Lưu
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 text-xs px-2"
            onClick={() => setEditingAltId(null)}>
            Hủy
          </Button>
        </div>
      )}

      {images.length < 3 && images.length > 0 && (
        <p className="text-[10px] text-amber-500 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Nên có ít nhất 3 ảnh để tối ưu nội dung.
        </p>
      )}

      {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">{error}</p>}

      {libraryOpen && (
        <MediaLibraryPicker
          onClose={() => setLibraryOpen(false)}
          onSelect={handleSelectFromLibrary}
        />
      )}
    </div>
  );
}
