import { useRef, useState, type DragEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Edit3, ImagePlus, Loader2, Star, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as media from '@/services/mediaService';
import type { EditorEntityType, EditorImage } from '@/types/editor';

type CompactMediaManagerProps = {
  label: string;
  entityType: EditorEntityType;
  stagingKey: string;
  images: EditorImage[];
  onChange: (images: EditorImage[]) => void;
  session: Session;
  maxImages: number;
  aspectHint: '1:1' | '3:4';
};

function normalizeOrder(images: EditorImage[], primaryId?: string): EditorImage[] {
  const sorted = images.map((image, index) => ({ ...image, sortOrder: index }));
  if (sorted.length === 0) return sorted;
  const selectedPrimaryId = primaryId ?? sorted.find(image => image.isPrimary)?.id ?? sorted[0].id;
  return sorted.map((image, index) => ({
    ...image,
    isPrimary: image.id === selectedPrimaryId,
  }));
}

function fileNameToAlt(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
}

export function CompactMediaManager({
  label,
  entityType,
  stagingKey,
  images,
  onChange,
  session,
  maxImages,
  aspectHint,
}: CompactMediaManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<EditorImage | null>(null);
  const [altDraft, setAltDraft] = useState('');
  const [error, setError] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emit = (next: EditorImage[], primaryId?: string) => onChange(normalizeOrder(next, primaryId));

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError('');
    setUploading(true);
    let next = [...images];
    try {
      const availableSlots = maxImages - next.length;
      const files = Array.from(fileList).slice(0, availableSlots);
      for (const file of files) {
        media.validateImageFile(file);
        const asset = await media.uploadStagedMediaAsset({
          file,
          entityType,
          stagingKey,
          alt: fileNameToAlt(file.name),
          uploadedBy: session.user.id,
        });
        next = normalizeOrder([
          ...next,
          {
            id: asset.id,
            source: 'staged',
            url: asset.public_url,
            storagePath: asset.storage_path,
            mediaAssetId: asset.id,
            alt: asset.alt || fileNameToAlt(file.name),
            isPrimary: next.length === 0,
            sortOrder: next.length,
            width: asset.width,
            height: asset.height,
            mimeType: asset.mime_type,
            fileName: asset.file_name,
          },
        ]);
        onChange(next);
      }
      if (fileList.length > availableSlots) {
        setError(`Chỉ thêm được ${availableSlots} ảnh nữa. Giới hạn hiện tại là ${maxImages} ảnh.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi upload ảnh');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeImage = async (image: EditorImage) => {
    const next = images.filter(item => item.id !== image.id);
    emit(next);
    if (image.source === 'staged' && image.mediaAssetId) {
      await media.deleteUnattachedMediaAsset(image.mediaAssetId, image.storagePath).catch(() => undefined);
    }
  };

  const reorderImage = (draggedId: string, targetIndex: number) => {
    const fromIndex = images.findIndex(image => image.id === draggedId);
    if (fromIndex < 0) return;
    const next = [...images];
    const [moved] = next.splice(fromIndex, 1);
    const insertIndex = Math.max(0, Math.min(targetIndex, next.length));
    next.splice(insertIndex, 0, moved);
    emit(next, next[0]?.id);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, imageId: string) => {
    setDraggingId(imageId);
    setDragOverId(null);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', imageId);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement | HTMLButtonElement>, imageId: string | null) => {
    if (!draggingId && !event.dataTransfer.getData('text/plain')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverId(imageId);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement | HTMLButtonElement>, targetIndex: number) => {
    event.preventDefault();
    const draggedId = draggingId ?? event.dataTransfer.getData('text/plain');
    if (draggedId) reorderImage(draggedId, targetIndex);
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const saveAlt = () => {
    if (!editing) return;
    emit(images.map(image => image.id === editing.id ? { ...image, alt: altDraft } : image));
    setEditing(null);
    setAltDraft('');
  };

  const setPrimary = (image: EditorImage) => {
    const next = [image, ...images.filter(item => item.id !== image.id)];
    emit(next, image.id);
  };

  const canAddMore = images.length < maxImages && !uploading;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-900">{label}</p>
          <p className="text-xs text-neutral-400 mt-0.5">Upload nhiều ảnh, kéo thumbnail để sắp xếp. Ảnh đầu tiên sẽ hiển thị ngoài website.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">{images.length}/{maxImages}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={!canAddMore}>
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Thêm ảnh
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable={images.length > 1}
            onDragStart={event => handleDragStart(event, image.id)}
            onDragOver={event => handleDragOver(event, image.id)}
            onDragEnter={() => setDragOverId(image.id)}
            onDrop={event => handleDrop(event, index)}
            onDragEnd={handleDragEnd}
            title="Kéo để sắp xếp ảnh"
            className={`group relative h-24 w-24 cursor-grab overflow-hidden rounded-md border bg-neutral-50 transition active:cursor-grabbing ${
              draggingId === image.id ? 'scale-95 opacity-50 ring-2 ring-[#0A3151]' : 'border-neutral-200'
            } ${dragOverId === image.id && draggingId !== image.id ? 'ring-2 ring-[#0A3151] ring-offset-2' : ''}`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className={`h-full w-full ${aspectHint === '3:4' ? 'object-cover' : 'object-contain p-1'}`}
              referrerPolicy="no-referrer"
              draggable={false}
            />
            {image.isPrimary && (
              <span className="absolute left-1 top-1 rounded bg-[#0A3151] px-1.5 py-0.5 text-[9px] font-bold text-white">
                Chính
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 bg-black/70 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" className="p-1 text-white hover:bg-white/10" onClick={() => { setEditing(image); setAltDraft(image.alt); }} aria-label="Sửa ảnh">
                <Edit3 className="mx-auto h-3.5 w-3.5" />
              </button>
              <button type="button" className="p-1 text-white hover:bg-white/10 disabled:opacity-30" onClick={() => setPrimary(image)} disabled={image.isPrimary} aria-label="Đặt ảnh chính và đưa lên đầu">
                <Star className="mx-auto h-3.5 w-3.5" />
              </button>
              <button type="button" className="p-1 text-white hover:bg-red-500" onClick={() => removeImage(image)} aria-label="Xóa ảnh">
                <Trash2 className="mx-auto h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={event => handleDragOver(event, null)}
            onDrop={event => handleDrop(event, images.length)}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 hover:border-[#0A3151] hover:text-[#0A3151]"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px] font-bold">Thêm ảnh</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={event => uploadFiles(event.target.files)}
      />

      {images.length > 0 && images.length < 3 && entityType === 'product' && (
        <p className="mt-3 text-xs text-amber-600">Nên có ít nhất 3 ảnh để sản phẩm trông đầy đủ hơn.</p>
      )}
      {error && <p className="mt-3 rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">Chỉnh sửa hình ảnh</h3>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>Đóng</Button>
            </div>
            <div className="mt-4 grid md:grid-cols-[160px_1fr] gap-4">
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
                <img src={editing.url} alt={editing.alt} className="h-40 w-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="label-xs">Alt text</label>
                  <Input value={altDraft} onChange={event => setAltDraft(event.target.value)} placeholder="Mô tả ngắn cho ảnh" />
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={() => setPrimary(editing)} disabled={editing.isPrimary}>
                  <Star className="mr-2 h-4 w-4" /> Đặt làm ảnh chính
                </Button>
                <Button type="button" variant="outline" className="w-full text-red-600 hover:text-red-600" onClick={() => { removeImage(editing); setEditing(null); }}>
                  <Trash2 className="mr-2 h-4 w-4" /> Xóa ảnh
                </Button>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Hủy</Button>
              <Button type="button" className="bg-[#0A3151] text-white" onClick={saveAlt}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
