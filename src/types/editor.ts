export type EditorEntityType = 'product' | 'book';

export type EditorImage = {
  id: string;
  source: 'persisted' | 'staged' | 'library';
  url: string;
  storagePath: string | null;
  mediaAssetId: string | null;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  fileName?: string | null;
};
