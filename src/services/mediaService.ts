import { supabase, assertSupabase } from '../lib/supabase';
import type { ProductImage, BookImage, MediaAsset, MediaAssetInsert } from '../types/database';
import type { EditorEntityType, EditorImage } from '../types/editor';

const BUCKET = 'site-media';
const MAX_PRODUCT_IMAGES = 9;
const MAX_BOOK_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ============================================================
// Validation & file helpers
// ============================================================

export function validateImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.');
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`Kích thước ảnh tối đa là ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`);
  }
}

export function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf('.');
  const ext = lastDot >= 0 ? name.slice(lastDot + 1).toLowerCase() : '';
  const base = lastDot >= 0 ? name.slice(0, lastDot) : name;

  const normalized = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'image';

  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? (ext === 'jpeg' ? 'jpg' : ext) : (ext || 'jpg');
  return `${normalized}.${safeExt}`;
}

export function buildMediaPath(folder: string, fileName: string): string {
  return `${folder}/${Date.now()}-${fileName}`;
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve({ width: 0, height: 0 }); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

// ============================================================
// Core: upload media asset to Storage + create DB record
// ============================================================

export async function uploadMediaAsset(input: {
  file: File;
  folder: string;
  entityType: MediaAsset['entity_type'];
  entityId?: string;
  alt?: string;
  uploadedBy?: string;
}): Promise<MediaAsset> {
  assertSupabase(supabase);
  validateImageFile(input.file);

  const safeName = sanitizeFileName(input.file.name);
  const path = buildMediaPath(input.folder, safeName);
  const dims = await getImageDimensions(input.file);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, input.file, { upsert: false, contentType: input.file.type });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const row: MediaAssetInsert = {
    bucket: BUCKET,
    storage_path: path,
    public_url: urlData.publicUrl,
    file_name: safeName,
    original_file_name: input.file.name,
    mime_type: input.file.type,
    size_bytes: input.file.size,
    width: dims.width || null,
    height: dims.height || null,
    alt: input.alt ?? '',
    folder: input.folder,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    uploaded_by: input.uploadedBy ?? null,
  };

  const { data, error } = await supabase.from('media_assets').insert(row).select().single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
  return data as MediaAsset;
}

// ============================================================
// Reference count — checks all tables BEFORE deciding to delete
// ============================================================

export async function getMediaReferenceCount(params: {
  mediaAssetId?: string;
  storagePath?: string;
}): Promise<number> {
  assertSupabase(supabase);
  let count = 0;

  if (params.mediaAssetId) {
    const { count: c1 } = await supabase
      .from('product_images').select('*', { count: 'exact', head: true }).eq('media_asset_id', params.mediaAssetId);
    count += c1 ?? 0;
    const { count: c2 } = await supabase
      .from('book_images').select('*', { count: 'exact', head: true }).eq('media_asset_id', params.mediaAssetId);
    count += c2 ?? 0;
  }

  if (params.storagePath) {
    const { count: c3 } = await supabase
      .from('product_images').select('*', { count: 'exact', head: true }).eq('storage_path', params.storagePath);
    count += c3 ?? 0;
    const { count: c4 } = await supabase
      .from('book_images').select('*', { count: 'exact', head: true }).eq('storage_path', params.storagePath);
    count += c4 ?? 0;
    const { count: c5 } = await supabase
      .from('notes').select('*', { count: 'exact', head: true }).eq('cover_storage_path', params.storagePath);
    count += c5 ?? 0;
    // Check settings JSON values for logo/hero/footer storage paths
    const { data: settingsRows } = await supabase.from('settings').select('value');
    for (const row of settingsRows ?? []) {
      const v = row.value as Record<string, string>;
      if (Object.values(v).some(val => val === params.storagePath)) {
        count++;
      }
    }
  }

  return count;
}

export async function deleteStorageObjectIfUnused(params: {
  mediaAssetId?: string;
  storagePath: string;
}): Promise<void> {
  assertSupabase(supabase);
  const refs = await getMediaReferenceCount(params);
  if (refs === 0) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([params.storagePath]);
    if (removeError) throw removeError;
    if (params.mediaAssetId) {
      await supabase.from('media_assets').delete().eq('id', params.mediaAssetId);
    } else {
      await supabase.from('media_assets').delete().eq('storage_path', params.storagePath);
    }
  }
}

// ============================================================
// Media library CRUD
// ============================================================

export async function listMediaAssets(opts?: {
  folder?: string;
  entityType?: string;
  search?: string;
  limit?: number;
}): Promise<MediaAsset[]> {
  assertSupabase(supabase);
  let q = supabase.from('media_assets').select('*').order('created_at', { ascending: false });
  if (opts?.folder) q = q.eq('folder', opts.folder);
  if (opts?.entityType) q = q.eq('entity_type', opts.entityType as 'product' | 'book' | 'note' | 'setting' | 'general');
  if (opts?.search) q = q.or(`file_name.ilike.%${opts.search}%,alt.ilike.%${opts.search}%`);
  q = q.limit(opts?.limit ?? 50);
  const { data } = await q;
  return (data ?? []) as MediaAsset[];
}

export async function updateMediaAssetAlt(id: string, alt: string): Promise<void> {
  assertSupabase(supabase);
  await supabase.from('media_assets').update({ alt }).eq('id', id);
}

export async function updateMediaAssetAltByStoragePath(storagePath: string, alt: string): Promise<void> {
  assertSupabase(supabase);
  await supabase.from('media_assets').update({ alt }).eq('storage_path', storagePath);
}

export async function deleteMediaAsset(asset: MediaAsset): Promise<void> {
  assertSupabase(supabase);
  const refs = await getMediaReferenceCount({ mediaAssetId: asset.id, storagePath: asset.storage_path });
  if (refs > 0) throw new Error('Ảnh đang được dùng, không thể xóa. Gỡ khỏi tất cả bài viết/sản phẩm/sách trước.');
  await supabase.storage.from(BUCKET).remove([asset.storage_path]);
  await supabase.from('media_assets').delete().eq('id', asset.id);
}

// ============================================================
// Staged editor media
// ============================================================

function normalizeEditorImages(images: EditorImage[]): EditorImage[] {
  const sorted = images
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image, index) => ({ ...image, sortOrder: index }));
  if (sorted.length === 0) return sorted;
  const primaryIndex = sorted.findIndex(image => image.isPrimary);
  return sorted.map((image, index) => ({
    ...image,
    isPrimary: primaryIndex >= 0 ? index === primaryIndex : index === 0,
  }));
}

export async function uploadStagedMediaAsset(input: {
  file: File;
  entityType: EditorEntityType;
  stagingKey: string;
  alt?: string;
  uploadedBy?: string;
}): Promise<MediaAsset> {
  const folder = `staging/${input.entityType}s/${input.stagingKey}`;
  return uploadMediaAsset({
    file: input.file,
    folder,
    entityType: input.entityType,
    entityId: undefined,
    alt: input.alt ?? '',
    uploadedBy: input.uploadedBy,
  });
}

export async function deleteUnattachedStagedAssets(stagingKey: string): Promise<void> {
  assertSupabase(supabase);
  const folders = [`staging/products/${stagingKey}`, `staging/books/${stagingKey}`];
  for (const folder of folders) {
    const { data } = await supabase
      .from('media_assets')
      .select('*')
      .eq('folder', folder)
      .is('entity_id', null);
    const assets = (data ?? []) as MediaAsset[];
    for (const asset of assets) {
      await supabase.storage.from(BUCKET).remove([asset.storage_path]);
      await supabase.from('media_assets').delete().eq('id', asset.id);
    }
  }
}

export async function deleteUnattachedMediaAsset(mediaAssetId: string, storagePath: string | null): Promise<void> {
  assertSupabase(supabase);
  const { data } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', mediaAssetId)
    .maybeSingle();
  const asset = data as MediaAsset | null;
  if (!asset || asset.entity_id) return;
  const refs = await getMediaReferenceCount({ mediaAssetId, storagePath: storagePath ?? asset.storage_path });
  if (refs > 0) return;
  await supabase.storage.from(BUCKET).remove([asset.storage_path]);
  await supabase.from('media_assets').delete().eq('id', mediaAssetId);
}

export async function attachProductEditorImages(productId: string, images: EditorImage[]): Promise<ProductImage[]> {
  assertSupabase(supabase);
  const normalized = normalizeEditorImages(images).slice(0, MAX_PRODUCT_IMAGES);
  const existing = await getProductImages(productId);
  const keepPersistedIds = new Set(normalized.filter(image => image.source === 'persisted').map(image => image.id));

  for (const image of existing) {
    if (!keepPersistedIds.has(image.id)) {
      await deleteProductImage(image);
    }
  }

  for (const image of normalized) {
    if (image.source === 'persisted') {
      await supabase
        .from('product_images')
        .update({
          alt: image.alt,
          sort_order: image.sortOrder,
          is_primary: image.isPrimary,
        })
        .eq('id', image.id);
      if (image.mediaAssetId) await updateMediaAssetAlt(image.mediaAssetId, image.alt);
      continue;
    }

    const { data: inserted, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: image.url,
        storage_path: image.storagePath,
        alt: image.alt,
        sort_order: image.sortOrder,
        is_primary: image.isPrimary,
        width: image.width ?? null,
        height: image.height ?? null,
        mime_type: image.mimeType ?? null,
        media_asset_id: image.mediaAssetId,
      })
      .select()
      .single();
    if (error) throw error;
    if (image.mediaAssetId) {
      await supabase
        .from('media_assets')
        .update({ entity_type: 'product', entity_id: productId, alt: image.alt })
        .eq('id', image.mediaAssetId);
    }
    image.id = (inserted as ProductImage).id;
  }

  const refreshed = await getProductImages(productId);
  if (refreshed.length > 0 && !refreshed.some(image => image.is_primary)) {
    await setPrimaryProductImage(refreshed[0].id, productId);
  }
  return getProductImages(productId);
}

export async function attachBookEditorImages(bookId: string, images: EditorImage[]): Promise<BookImage[]> {
  assertSupabase(supabase);
  const normalized = normalizeEditorImages(images).slice(0, MAX_BOOK_IMAGES);
  const existing = await getBookImages(bookId);
  const keepPersistedIds = new Set(normalized.filter(image => image.source === 'persisted').map(image => image.id));

  for (const image of existing) {
    if (!keepPersistedIds.has(image.id)) {
      await deleteBookImage(image);
    }
  }

  for (const image of normalized) {
    if (image.source === 'persisted') {
      await supabase
        .from('book_images')
        .update({
          alt: image.alt,
          sort_order: image.sortOrder,
          is_primary: image.isPrimary,
        })
        .eq('id', image.id);
      if (image.mediaAssetId) await updateMediaAssetAlt(image.mediaAssetId, image.alt);
      continue;
    }

    const { data: inserted, error } = await supabase
      .from('book_images')
      .insert({
        book_id: bookId,
        url: image.url,
        storage_path: image.storagePath,
        alt: image.alt,
        sort_order: image.sortOrder,
        is_primary: image.isPrimary,
        width: image.width ?? null,
        height: image.height ?? null,
        mime_type: image.mimeType ?? null,
        media_asset_id: image.mediaAssetId,
      })
      .select()
      .single();
    if (error) throw error;
    if (image.mediaAssetId) {
      await supabase
        .from('media_assets')
        .update({ entity_type: 'book', entity_id: bookId, alt: image.alt })
        .eq('id', image.mediaAssetId);
    }
    image.id = (inserted as BookImage).id;
  }

  const refreshed = await getBookImages(bookId);
  if (refreshed.length > 0 && !refreshed.some(image => image.is_primary)) {
    await setPrimaryBookImage(refreshed[0].id, bookId);
  }
  return getBookImages(bookId);
}

// ============================================================
// Product images
// ============================================================

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  assertSupabase(supabase);
  const { data } = await supabase
    .from('product_images').select('*').eq('product_id', productId).order('sort_order', { ascending: true });
  return (data ?? []) as ProductImage[];
}

export async function uploadProductImage(
  productId: string,
  file: File,
  opts?: { alt?: string; isPrimary?: boolean; uploadedBy?: string },
): Promise<ProductImage> {
  assertSupabase(supabase);
  const existing = await getProductImages(productId);
  if (existing.length >= MAX_PRODUCT_IMAGES) throw new Error(`Tối đa ${MAX_PRODUCT_IMAGES} ảnh cho mỗi sản phẩm.`);

  const asset = await uploadMediaAsset({
    file,
    folder: `products/${productId}`,
    entityType: 'product',
    entityId: productId,
    alt: opts?.alt ?? '',
    uploadedBy: opts?.uploadedBy,
  });

  const isPrimary = opts?.isPrimary ?? existing.length === 0;
  if (isPrimary) {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId);
  }

  const { data, error } = await supabase.from('product_images').insert({
    product_id: productId,
    url: asset.public_url,
    storage_path: asset.storage_path,
    alt: asset.alt,
    sort_order: existing.length,
    is_primary: isPrimary,
    width: asset.width,
    height: asset.height,
    mime_type: asset.mime_type,
    media_asset_id: asset.id,
  }).select().single();
  if (error) {
    await deleteStorageObjectIfUnused({ mediaAssetId: asset.id, storagePath: asset.storage_path });
    throw error;
  }
  return data as ProductImage;
}

export async function addProductImage(
  productId: string,
  url: string,
  opts?: {
    alt?: string;
    storagePath?: string;
    isPrimary?: boolean;
    mediaAssetId?: string;
    width?: number | null;
    height?: number | null;
    mimeType?: string | null;
  },
): Promise<ProductImage> {
  assertSupabase(supabase);
  const existing = await getProductImages(productId);
  if (existing.length >= MAX_PRODUCT_IMAGES) throw new Error(`Tối đa ${MAX_PRODUCT_IMAGES} ảnh cho mỗi sản phẩm.`);
  const isPrimary = opts?.isPrimary ?? existing.length === 0;
  if (isPrimary) {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId);
  }
  const { data, error } = await supabase.from('product_images').insert({
    product_id: productId,
    url,
    storage_path: opts?.storagePath ?? null,
    alt: opts?.alt ?? '',
    sort_order: existing.length,
    is_primary: isPrimary,
    width: opts?.width ?? null,
    height: opts?.height ?? null,
    mime_type: opts?.mimeType ?? null,
    media_asset_id: opts?.mediaAssetId ?? null,
  }).select().single();
  if (error) throw error;
  return data as ProductImage;
}

export async function setPrimaryProductImage(imageId: string, productId: string): Promise<void> {
  assertSupabase(supabase);
  await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId);
  await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId);
}

export async function updateProductImageAlt(imageId: string, alt: string): Promise<void> {
  assertSupabase(supabase);
  await supabase.from('product_images').update({ alt }).eq('id', imageId);
  const { data } = await supabase.from('product_images').select('media_asset_id').eq('id', imageId).single();
  if (data?.media_asset_id) await updateMediaAssetAlt(data.media_asset_id, alt);
}

export async function deleteProductImage(image: ProductImage): Promise<void> {
  assertSupabase(supabase);
  await supabase.from('product_images').delete().eq('id', image.id);
  if (image.storage_path) {
    await deleteStorageObjectIfUnused({
      mediaAssetId: image.media_asset_id ?? undefined,
      storagePath: image.storage_path,
    });
  }
}

export async function reorderProductImages(productId: string, imageIds: string[]): Promise<void> {
  assertSupabase(supabase);
  await Promise.all(
    imageIds.map((id, idx) => supabase.from('product_images').update({ sort_order: idx }).eq('id', id)),
  );
}

// ============================================================
// Book images
// ============================================================

export async function getBookImages(bookId: string): Promise<BookImage[]> {
  assertSupabase(supabase);
  const { data } = await supabase
    .from('book_images').select('*').eq('book_id', bookId).order('sort_order', { ascending: true });
  return (data ?? []) as BookImage[];
}

export async function uploadBookImage(
  bookId: string,
  file: File,
  opts?: { alt?: string; isPrimary?: boolean; uploadedBy?: string },
): Promise<BookImage> {
  assertSupabase(supabase);
  const existing = await getBookImages(bookId);
  if (existing.length >= MAX_BOOK_IMAGES) throw new Error(`Tối đa ${MAX_BOOK_IMAGES} ảnh cho mỗi sách.`);

  const asset = await uploadMediaAsset({
    file,
    folder: `books/${bookId}`,
    entityType: 'book',
    entityId: bookId,
    alt: opts?.alt ?? '',
    uploadedBy: opts?.uploadedBy,
  });

  const isPrimary = opts?.isPrimary ?? existing.length === 0;
  if (isPrimary) {
    await supabase.from('book_images').update({ is_primary: false }).eq('book_id', bookId);
  }

  const { data, error } = await supabase.from('book_images').insert({
    book_id: bookId,
    url: asset.public_url,
    storage_path: asset.storage_path,
    alt: asset.alt,
    sort_order: existing.length,
    is_primary: isPrimary,
    width: asset.width,
    height: asset.height,
    mime_type: asset.mime_type,
    media_asset_id: asset.id,
  }).select().single();
  if (error) {
    await deleteStorageObjectIfUnused({ mediaAssetId: asset.id, storagePath: asset.storage_path });
    throw error;
  }
  return data as BookImage;
}

export async function addBookImage(
  bookId: string,
  url: string,
  opts?: {
    alt?: string;
    storagePath?: string;
    isPrimary?: boolean;
    mediaAssetId?: string;
    width?: number | null;
    height?: number | null;
    mimeType?: string | null;
  },
): Promise<BookImage> {
  assertSupabase(supabase);
  const existing = await getBookImages(bookId);
  if (existing.length >= MAX_BOOK_IMAGES) throw new Error(`Tối đa ${MAX_BOOK_IMAGES} ảnh cho mỗi sách.`);
  const isPrimary = opts?.isPrimary ?? existing.length === 0;
  if (isPrimary) {
    await supabase.from('book_images').update({ is_primary: false }).eq('book_id', bookId);
  }
  const { data, error } = await supabase.from('book_images').insert({
    book_id: bookId,
    url,
    storage_path: opts?.storagePath ?? null,
    alt: opts?.alt ?? '',
    sort_order: existing.length,
    is_primary: isPrimary,
    width: opts?.width ?? null,
    height: opts?.height ?? null,
    mime_type: opts?.mimeType ?? null,
    media_asset_id: opts?.mediaAssetId ?? null,
  }).select().single();
  if (error) throw error;
  return data as BookImage;
}

export async function setPrimaryBookImage(imageId: string, bookId: string): Promise<void> {
  assertSupabase(supabase);
  await supabase.from('book_images').update({ is_primary: false }).eq('book_id', bookId);
  await supabase.from('book_images').update({ is_primary: true }).eq('id', imageId);
}

export async function updateBookImageAlt(imageId: string, alt: string): Promise<void> {
  assertSupabase(supabase);
  await supabase.from('book_images').update({ alt }).eq('id', imageId);
  const { data } = await supabase.from('book_images').select('media_asset_id').eq('id', imageId).single();
  if (data?.media_asset_id) await updateMediaAssetAlt(data.media_asset_id, alt);
}

export async function deleteBookImage(image: BookImage): Promise<void> {
  assertSupabase(supabase);
  await supabase.from('book_images').delete().eq('id', image.id);
  if (image.storage_path) {
    await deleteStorageObjectIfUnused({
      mediaAssetId: image.media_asset_id ?? undefined,
      storagePath: image.storage_path,
    });
  }
}

export async function reorderBookImages(bookId: string, imageIds: string[]): Promise<void> {
  assertSupabase(supabase);
  await Promise.all(
    imageIds.map((id, idx) => supabase.from('book_images').update({ sort_order: idx }).eq('id', id)),
  );
}

// ============================================================
// Note cover
// ============================================================

export async function uploadNoteCover(
  noteId: string,
  file: File,
  opts?: { alt?: string; uploadedBy?: string },
): Promise<{ url: string; storagePath: string; asset: MediaAsset }> {
  assertSupabase(supabase);
  const asset = await uploadMediaAsset({
    file,
    folder: `notes/${noteId}`,
    entityType: 'note',
    entityId: noteId,
    alt: opts?.alt ?? '',
    uploadedBy: opts?.uploadedBy,
  });
  return { url: asset.public_url, storagePath: asset.storage_path, asset };
}

// ============================================================
// Settings images (logo / hero / footer)
// ============================================================

export async function uploadSettingImage(
  kind: 'logo' | 'hero' | 'footer',
  file: File,
  opts?: { alt?: string; uploadedBy?: string },
): Promise<{ url: string; storagePath: string; asset: MediaAsset }> {
  assertSupabase(supabase);
  const asset = await uploadMediaAsset({
    file,
    folder: `settings/${kind}`,
    entityType: 'setting',
    alt: opts?.alt ?? kind,
    uploadedBy: opts?.uploadedBy,
  });
  return { url: asset.public_url, storagePath: asset.storage_path, asset };
}

// ============================================================
// Legacy: direct storage upload (kept for backward compat)
// ============================================================

export async function uploadImage(path: string, file: File): Promise<string> {
  assertSupabase(supabase);
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteStorageObject(storagePath: string): Promise<void> {
  assertSupabase(supabase);
  await supabase.storage.from(BUCKET).remove([storagePath]);
}
