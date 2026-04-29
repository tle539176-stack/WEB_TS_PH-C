export type ContentStatus = 'draft' | 'in_review' | 'published' | 'archived';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  sort_order: number;
  parent_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Person = {
  id: string;
  display_name: string;
  slug: string;
  role: 'author' | 'reviewer' | 'editor' | 'admin' | 'contributor';
  professional_title: string | null;
  credentials: string | null;
  specialties: string[];
  bio: string | null;
  profile_url: string | null;
  same_as: string[];
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type NoteSourceRow = {
  id: string;
  note_id: string;
  title: string;
  url: string | null;
  publisher: string | null;
  source_type: 'guideline' | 'journal' | 'systematic_review' | 'textbook' | 'government' | 'organization' | 'website' | 'other';
  doi: string | null;
  pmid: string | null;
  published_at: string | null;
  accessed_at: string | null;
  evidence_level: 'high' | 'moderate' | 'low' | 'expert_opinion' | 'unknown' | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ContentReview = {
  id: string;
  entity_type: 'note' | 'product' | 'book' | 'setting';
  entity_id: string;
  reviewer_id: string | null;
  decision: 'approved' | 'needs_changes' | 'rejected' | 'expired';
  review_scope: 'medical' | 'editorial' | 'seo' | 'legal' | 'product_safety';
  summary: string | null;
  evidence_notes: string | null;
  reviewed_at: string;
  next_review_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type ContentRevision = {
  id: string;
  entity_type: 'note' | 'product' | 'book' | 'setting';
  entity_id: string | null;
  entity_key: string | null;
  version: number;
  status: string | null;
  title: string | null;
  snapshot: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

export type ContentMedia = {
  id: string;
  entity_type: 'note' | 'product' | 'book' | 'setting';
  entity_id: string;
  media_asset_id: string;
  role: 'cover' | 'gallery' | 'inline' | 'logo' | 'hero' | 'footer';
  alt_override: string | null;
  caption_override: string | null;
  sort_order: number;
  is_primary: boolean;
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
  // Fields in DB since migration 001, now exposed in type:
  reviewed_by: string | null;
  reviewed_at: string | null;
  // Fields added in migration 003:
  author_id: string | null;
  reviewed_by_id: string | null;
  medical_specialty: string | null;
  medical_audience: string;
  disclaimer_ack: boolean;
  schema_type: string;
  word_count: number | null;
  reading_level: string | null;
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

// ---- Insert types ----

export type CategoryInsert = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  type?: string;
  sort_order?: number;
  parent_id?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  is_active?: boolean;
};

export type PersonInsert = {
  id?: string;
  display_name: string;
  slug: string;
  role?: Person['role'];
  professional_title?: string | null;
  credentials?: string | null;
  specialties?: string[];
  bio?: string | null;
  profile_url?: string | null;
  same_as?: string[];
  is_public?: boolean;
  is_active?: boolean;
};

export type NoteSourceRowInsert = {
  id?: string;
  note_id: string;
  title: string;
  url?: string | null;
  publisher?: string | null;
  source_type?: NoteSourceRow['source_type'];
  doi?: string | null;
  pmid?: string | null;
  published_at?: string | null;
  accessed_at?: string | null;
  evidence_level?: NoteSourceRow['evidence_level'];
  notes?: string | null;
  sort_order?: number;
};

export type ContentReviewInsert = {
  entity_type: ContentReview['entity_type'];
  entity_id: string;
  reviewer_id?: string | null;
  decision?: ContentReview['decision'];
  review_scope?: ContentReview['review_scope'];
  summary?: string | null;
  evidence_notes?: string | null;
  reviewed_at?: string;
  next_review_at?: string | null;
  created_by?: string | null;
};

export type ContentRevisionInsert = {
  entity_type: ContentRevision['entity_type'];
  entity_id?: string | null;
  entity_key?: string | null;
  version: number;
  status?: string | null;
  title?: string | null;
  snapshot: Record<string, unknown>;
  created_by?: string | null;
};

export type ContentMediaInsert = {
  entity_type: ContentMedia['entity_type'];
  entity_id: string;
  media_asset_id: string;
  role?: ContentMedia['role'];
  alt_override?: string | null;
  caption_override?: string | null;
  sort_order?: number;
  is_primary?: boolean;
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
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  author_id?: string | null;
  reviewed_by_id?: string | null;
  medical_specialty?: string | null;
  medical_audience?: string;
  disclaimer_ack?: boolean;
  schema_type?: string;
  word_count?: number | null;
  reading_level?: string | null;
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
      notes: Table<Note, NoteInsert, Partial<NoteInsert>, [
        {
          foreignKeyName: 'notes_category_id_fkey';
          columns: ['category_id'];
          isOneToOne: false;
          referencedRelation: 'categories';
          referencedColumns: ['id'];
        },
        {
          foreignKeyName: 'notes_author_id_fkey';
          columns: ['author_id'];
          isOneToOne: false;
          referencedRelation: 'people';
          referencedColumns: ['id'];
        },
        {
          foreignKeyName: 'notes_reviewed_by_id_fkey';
          columns: ['reviewed_by_id'];
          isOneToOne: false;
          referencedRelation: 'people';
          referencedColumns: ['id'];
        }
      ]>;
      settings: Table<Setting, SettingInsert, Partial<SettingInsert>>;
      audit_logs: Table<AuditLog, AuditLogInsert, Partial<AuditLogInsert>>;
      people: Table<Person, PersonInsert, Partial<PersonInsert>>;
      note_sources: Table<NoteSourceRow, NoteSourceRowInsert, Partial<NoteSourceRowInsert>, [{
        foreignKeyName: 'note_sources_note_id_fkey';
        columns: ['note_id'];
        isOneToOne: false;
        referencedRelation: 'notes';
        referencedColumns: ['id'];
      }]>;
      content_reviews: Table<ContentReview, ContentReviewInsert, Partial<ContentReviewInsert>>;
      content_revisions: Table<ContentRevision, ContentRevisionInsert, Partial<ContentRevisionInsert>>;
      content_media: Table<ContentMedia, ContentMediaInsert, Partial<ContentMediaInsert>>;
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

export type NoteWithMedicalMeta = Note & {
  categories: Category | null;
  author: Person | null;
  reviewer: Person | null;
  note_sources: NoteSourceRow[];
  content_reviews: (ContentReview & { reviewer: Person | null })[];
};
