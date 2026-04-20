export type ContentStatus = 'draft' | 'in_review' | 'published' | 'archived';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MediaAsset = {
  id: string;
  bucket: string;
  storage_path: string;
  public_url: string;
  file_name: string;
  original_file_name: string | null;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt: string;
  caption: string | null;
  folder: string;
  entity_type: 'product' | 'book' | 'note' | 'setting' | 'general' | null;
  entity_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaAssetInsert = {
  id?: string;
  bucket?: string;
  storage_path: string;
  public_url: string;
  file_name: string;
  original_file_name?: string | null;
  mime_type: string;
  size_bytes?: number;
  width?: number | null;
  height?: number | null;
  alt?: string;
  caption?: string | null;
  folder?: string;
  entity_type?: 'product' | 'book' | 'note' | 'setting' | 'general' | null;
  entity_id?: string | null;
  uploaded_by?: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  brand: string | null;
  price: number | null;
  tag: string | null;
  short_description: string | null;
  description: string | null;
  usage: string | null;
  warnings: string | null;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  storage_path: string | null;
  alt: string;
  sort_order: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  media_asset_id: string | null;
  created_at: string;
};

export type Book = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  author: string | null;
  publisher: string | null;
  year: string | null;
  price: number | null;
  description: string | null;
  content: string | null;
  pages: number | null;
  rating: number | null;
  is_new: boolean;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type BookImage = {
  id: string;
  book_id: string;
  url: string;
  storage_path: string | null;
  alt: string;
  sort_order: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  media_asset_id: string | null;
  created_at: string;
};

export type NoteSource = {
  title: string;
  url: string;
  accessed_at?: string;
};

export type Note = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category_id: string | null;
  cover_image_url: string | null;
  cover_storage_path: string | null;
  cover_alt: string;
  read_time: string | null;
  status: ContentStatus;
  next_review_at: string | null;
  sources: NoteSource[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type Setting = {
  key: string;
  value: Record<string, string>;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
};

export type CategoryInsert = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  type?: string;
  sort_order?: number;
};

export type ProductInsert = {
  id?: string;
  name: string;
  slug: string;
  category_id?: string | null;
  brand?: string | null;
  price?: number | null;
  tag?: string | null;
  short_description?: string | null;
  description?: string | null;
  usage?: string | null;
  warnings?: string | null;
  status?: ContentStatus;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
};

export type ProductImageInsert = {
  id?: string;
  product_id: string;
  url: string;
  storage_path?: string | null;
  alt?: string;
  sort_order?: number;
  is_primary?: boolean;
  width?: number | null;
  height?: number | null;
  mime_type?: string | null;
  media_asset_id?: string | null;
};

export type BookInsert = {
  id?: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  author?: string | null;
  publisher?: string | null;
  year?: string | null;
  price?: number | null;
  description?: string | null;
  content?: string | null;
  pages?: number | null;
  rating?: number | null;
  is_new?: boolean;
  status?: ContentStatus;
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
};

export type BookImageInsert = {
  id?: string;
  book_id: string;
  url: string;
  storage_path?: string | null;
  alt?: string;
  sort_order?: number;
  is_primary?: boolean;
  width?: number | null;
  height?: number | null;
  mime_type?: string | null;
  media_asset_id?: string | null;
};

export type NoteInsert = {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  category_id?: string | null;
  cover_image_url?: string | null;
  cover_storage_path?: string | null;
  cover_alt?: string;
  read_time?: string | null;
  status?: ContentStatus;
  next_review_at?: string | null;
  sources?: NoteSource[];
  seo_title?: string | null;
  seo_description?: string | null;
  published_at?: string | null;
};

export type SettingInsert = {
  key: string;
  value?: Record<string, string>;
  updated_at?: string;
};

export type AuditLogInsert = {
  id?: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  before_data?: Record<string, unknown> | null;
  after_data?: Record<string, unknown> | null;
};

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<Row, Insert, Update, Relationships extends Relationship[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

export type Database = {
  public: {
    Tables: {
      categories: Table<Category, CategoryInsert, Partial<CategoryInsert>>;
      media_assets: Table<MediaAsset, MediaAssetInsert, Partial<MediaAssetInsert>>;
      products: Table<Product, ProductInsert, Partial<ProductInsert>, [{
        foreignKeyName: 'products_category_id_fkey';
        columns: ['category_id'];
        isOneToOne: false;
        referencedRelation: 'categories';
        referencedColumns: ['id'];
      }]>;
      product_images: Table<ProductImage, ProductImageInsert, Partial<ProductImageInsert>, [{
        foreignKeyName: 'product_images_product_id_fkey';
        columns: ['product_id'];
        isOneToOne: false;
        referencedRelation: 'products';
        referencedColumns: ['id'];
      }]>;
      books: Table<Book, BookInsert, Partial<BookInsert>>;
      book_images: Table<BookImage, BookImageInsert, Partial<BookImageInsert>, [{
        foreignKeyName: 'book_images_book_id_fkey';
        columns: ['book_id'];
        isOneToOne: false;
        referencedRelation: 'books';
        referencedColumns: ['id'];
      }]>;
      notes: Table<Note, NoteInsert, Partial<NoteInsert>, [{
        foreignKeyName: 'notes_category_id_fkey';
        columns: ['category_id'];
        isOneToOne: false;
        referencedRelation: 'categories';
        referencedColumns: ['id'];
      }]>;
      settings: Table<Setting, SettingInsert, Partial<SettingInsert>>;
      audit_logs: Table<AuditLog, AuditLogInsert, Partial<AuditLogInsert>>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { content_status: ContentStatus };
    CompositeTypes: { [_ in never]: never };
  };
};

export type ProductWithImages = Product & { product_images: ProductImage[] };
export type BookWithImages = Book & { book_images: BookImage[] };
export type NoteWithCategory = Note & { categories: Category | null };
