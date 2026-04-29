import type { ProductImage, BookImage } from '../../../types/database';
import type { EditorImage } from '../../../types/editor';
import type { QualityCheck } from '../../../lib/contentQuality';

export type ChecklistItem = { label: string; ok: boolean; warn?: boolean };

export function createStagingKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const selectControlClass =
  'h-10 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#0A3151]/20';

export function productImagesToEditorImages(images: ProductImage[] = []): EditorImage[] {
  return images
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image, index) => ({
      id: image.id,
      source: 'persisted' as const,
      url: image.url,
      storagePath: image.storage_path,
      mediaAssetId: image.media_asset_id,
      alt: image.alt,
      isPrimary: image.is_primary,
      sortOrder: index,
      width: image.width,
      height: image.height,
      mimeType: image.mime_type,
    }));
}

export function bookImagesToEditorImages(images: BookImage[] = []): EditorImage[] {
  return images
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image, index) => ({
      id: image.id,
      source: 'persisted' as const,
      url: image.url,
      storagePath: image.storage_path,
      mediaAssetId: image.media_asset_id,
      alt: image.alt,
      isPrimary: image.is_primary,
      sortOrder: index,
      width: image.width,
      height: image.height,
      mimeType: image.mime_type,
    }));
}

export function editorImagesToCatalogImages(images: EditorImage[]) {
  return images.map(image => ({
    url: image.url,
    alt: image.alt,
    isPrimary: image.isPrimary,
  }));
}

export function qualityChecksToChecklist(checks: QualityCheck[]): ChecklistItem[] {
  return checks.map(check => ({
    label: check.detail ? `${check.label} (${check.detail})` : check.label,
    ok: check.passed,
    warn: check.severity === 'warning',
  }));
}

export type StatCard = { label: string; value: number | string; hint: string; tone: string };
export type WorkflowStep = { label: string; hint: string; done: boolean; active?: boolean };
