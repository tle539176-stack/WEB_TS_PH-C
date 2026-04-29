import { supabase, assertSupabase } from '../lib/supabase';
import { slugify } from '../lib/slugify';
import {
  addBookImage,
  addProductImage,
  deleteStorageObjectIfUnused,
  setPrimaryBookImage,
  setPrimaryProductImage,
} from './mediaService';
import type {
  Category, CategoryInsert,
  Product, ProductInsert, ProductWithImages,
  Book, BookInsert, BookWithImages,
  Note, NoteInsert, NoteSource, NoteWithCategory, NoteWithMedicalMeta,
  Person, ContentReview,
} from '../types/database';

// ============================================================
// Categories
// ============================================================

export async function getCategories(): Promise<Category[]> {
  assertSupabase(supabase);
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(input: { name: string; description?: string; type?: string; parent_id?: string }): Promise<Category> {
  assertSupabase(supabase);
  const row: CategoryInsert = {
    name: input.name,
    slug: slugify(input.name),
    description: input.description ?? null,
    type: input.type ?? 'note',
    parent_id: input.parent_id ?? null,
    sort_order: 0,
  };
  const { data, error } = await supabase.from('categories').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, input: Partial<{ name: string; description: string; type: string; parent_id: string }>): Promise<void> {
  assertSupabase(supabase);
  const updates: Record<string, unknown> = { ...input };
  if (input.name) updates['slug'] = slugify(input.name);
  if ('parent_id' in input && !input.parent_id) updates['parent_id'] = null;
  const { error } = await supabase.from('categories').update(updates as Partial<CategoryInsert>).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  assertSupabase(supabase);
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Products
// ============================================================

export async function getPublishedProducts(): Promise<ProductWithImages[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProductWithImages[];
}

export async function getAllProducts(): Promise<ProductWithImages[]> {
  assertSupabase(supabase);
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProductWithImages[];
}

export async function getProductById(id: string): Promise<ProductWithImages | null> {
  assertSupabase(supabase);
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as ProductWithImages;
}

export async function createProduct(input: {
  name: string; description: string; price: number;
  tag?: string; brand?: string; status?: Product['status'];
  imageUrl?: string;
}): Promise<Product> {
  assertSupabase(supabase);
  const row: ProductInsert = {
    name: input.name,
    slug: slugify(input.name),
    description: input.description,
    price: input.price,
    tag: input.tag ?? null,
    brand: input.brand ?? null,
    status: input.status ?? 'draft',
    category_id: null, short_description: null,
    usage: null, warnings: null, seo_title: null, seo_description: null,
    published_at: input.status === 'published' ? new Date().toISOString() : null,
  };
  const { data, error } = await supabase.from('products').insert(row).select().single();
  if (error) throw error;
  if (input.imageUrl) {
    await supabase.from('product_images').insert({
      product_id: data.id, url: input.imageUrl,
      alt: input.name, is_primary: true, sort_order: 0,
    });
  }
  return data;
}

export async function updateProduct(id: string, input: Partial<ProductInsert> & { imageUrl?: string }): Promise<void> {
  assertSupabase(supabase);
  const { imageUrl, ...rest } = input;
  if (rest.name) rest.slug = slugify(rest.name);
  if (rest.status === 'published') {
    const { data: existing } = await supabase.from('products').select('published_at').eq('id', id).single();
    if (!existing?.published_at) rest.published_at = new Date().toISOString();
  }
  const { error } = await supabase.from('products').update(rest).eq('id', id);
  if (error) throw error;
  if (imageUrl !== undefined) {
    const { data: existing } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', id)
      .eq('url', imageUrl)
      .maybeSingle();
    if (existing?.id) {
      await supabase.from('product_images').update({ alt: rest.name ?? '' }).eq('id', existing.id);
      await setPrimaryProductImage(existing.id, id);
    } else {
      await addProductImage(id, imageUrl, { alt: rest.name ?? '', isPrimary: true });
    }
  }
}

export async function deleteProduct(id: string): Promise<void> {
  assertSupabase(supabase);
  const { data: images, error: imageError } = await supabase
    .from('product_images')
    .select('storage_path, media_asset_id')
    .eq('product_id', id);
  if (imageError) throw imageError;

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;

  await Promise.all((images ?? [])
    .filter(image => image.storage_path)
    .map(image => deleteStorageObjectIfUnused({
      mediaAssetId: image.media_asset_id ?? undefined,
      storagePath: image.storage_path!,
    })));
}

// ============================================================
// Books
// ============================================================

export async function getPublishedBooks(): Promise<BookWithImages[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('books')
    .select('*, book_images(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BookWithImages[];
}

export async function getAllBooks(): Promise<BookWithImages[]> {
  assertSupabase(supabase);
  const { data, error } = await supabase
    .from('books')
    .select('*, book_images(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BookWithImages[];
}

export async function getBookById(id: string): Promise<BookWithImages | null> {
  assertSupabase(supabase);
  const { data, error } = await supabase
    .from('books')
    .select('*, book_images(*)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as BookWithImages;
}

export async function createBook(input: {
  title: string; author: string; year: string;
  description: string; price: number; isNew?: boolean;
  status?: Book['status']; imageUrl?: string;
}): Promise<Book> {
  assertSupabase(supabase);
  const row: BookInsert = {
    title: input.title,
    slug: slugify(input.title),
    author: input.author,
    year: input.year,
    description: input.description,
    price: input.price,
    is_new: input.isNew ?? false,
    status: input.status ?? 'draft',
    subtitle: null, publisher: null, content: null, pages: null,
    rating: null, seo_title: null, seo_description: null,
    published_at: input.status === 'published' ? new Date().toISOString() : null,
  };
  const { data, error } = await supabase.from('books').insert(row).select().single();
  if (error) throw error;
  if (input.imageUrl) {
    await supabase.from('book_images').insert({
      book_id: data.id, url: input.imageUrl,
      alt: input.title, is_primary: true, sort_order: 0,
    });
  }
  return data;
}

export async function updateBook(id: string, input: Partial<BookInsert> & { imageUrl?: string }): Promise<void> {
  assertSupabase(supabase);
  const { imageUrl, ...rest } = input;
  if (rest.title) rest.slug = slugify(rest.title);
  if (rest.status === 'published') {
    const { data: existing } = await supabase.from('books').select('published_at').eq('id', id).single();
    if (!existing?.published_at) rest.published_at = new Date().toISOString();
  }
  const { error } = await supabase.from('books').update(rest).eq('id', id);
  if (error) throw error;
  if (imageUrl !== undefined) {
    const { data: existing } = await supabase
      .from('book_images')
      .select('id')
      .eq('book_id', id)
      .eq('url', imageUrl)
      .maybeSingle();
    if (existing?.id) {
      await supabase.from('book_images').update({ alt: rest.title ?? '' }).eq('id', existing.id);
      await setPrimaryBookImage(existing.id, id);
    } else {
      await addBookImage(id, imageUrl, { alt: rest.title ?? '', isPrimary: true });
    }
  }
}

export async function deleteBook(id: string): Promise<void> {
  assertSupabase(supabase);
  const { data: images, error: imageError } = await supabase
    .from('book_images')
    .select('storage_path, media_asset_id')
    .eq('book_id', id);
  if (imageError) throw imageError;

  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw error;

  await Promise.all((images ?? [])
    .filter(image => image.storage_path)
    .map(image => deleteStorageObjectIfUnused({
      mediaAssetId: image.media_asset_id ?? undefined,
      storagePath: image.storage_path!,
    })));
}

// ============================================================
// Notes
// ============================================================

export async function getPublishedNotes(): Promise<Note[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedNotesWithCategory(): Promise<NoteWithCategory[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('notes')
    .select('*, categories(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as NoteWithCategory[];
}

export async function getBookBySlug(slug: string): Promise<BookWithImages | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('books')
    .select('*, book_images(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (error) return null;
  return data as BookWithImages;
}

export async function getNoteBySlug(slug: string): Promise<NoteWithMedicalMeta | null> {
  if (!supabase) return null;

  // Get note with category and structured sources
  const { data: note, error } = await supabase
    .from('notes')
    .select('*, categories(*), note_sources(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (error || !note) return null;

  const noteData = note as Note & { categories: Category | null; note_sources: unknown[] };

  // Get author, reviewer, and content_reviews in parallel
  const [authorResult, reviewerResult, reviewsResult] = await Promise.all([
    noteData.author_id
      ? supabase.from('people').select('*').eq('id', noteData.author_id).maybeSingle()
      : Promise.resolve(null),
    noteData.reviewed_by_id
      ? supabase.from('people').select('*').eq('id', noteData.reviewed_by_id).maybeSingle()
      : Promise.resolve(null),
    supabase
      .from('content_reviews')
      .select('*')
      .eq('entity_type', 'note')
      .eq('entity_id', noteData.id)
      .order('reviewed_at', { ascending: false }),
  ]);

  return {
    ...noteData,
    note_sources: (noteData.note_sources ?? []) as import('../types/database').NoteSourceRow[],
    author: (authorResult?.data as Person | null) ?? null,
    reviewer: (reviewerResult?.data as Person | null) ?? null,
    content_reviews: ((reviewsResult.data ?? []) as ContentReview[]),
  } as NoteWithMedicalMeta;
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (error) return null;
  return data as ProductWithImages;
}

export async function getAllNotes(): Promise<Note[]> {
  assertSupabase(supabase);
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getNoteById(id: string): Promise<Note | null> {
  assertSupabase(supabase);
  const { data, error } = await supabase.from('notes').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function createNote(input: {
  title: string; excerpt: string; content: string;
  category_id?: string; cover_image_url?: string;
  cover_storage_path?: string; cover_alt?: string;
  read_time?: string; status?: Note['status'];
  sources?: NoteSource[]; next_review_at?: string;
  seo_title?: string; seo_description?: string;
  author_id?: string; reviewed_by_id?: string;
  medical_specialty?: string; medical_audience?: string;
  disclaimer_ack?: boolean; reviewed_at?: string;
  schema_type?: string; word_count?: number; reading_level?: string;
}): Promise<Note> {
  assertSupabase(supabase);
  const row: NoteInsert = {
    title: input.title,
    slug: slugify(input.title),
    excerpt: input.excerpt,
    content: input.content,
    category_id: input.category_id ?? null,
    cover_image_url: input.cover_image_url ?? null,
    cover_storage_path: input.cover_storage_path ?? null,
    cover_alt: input.cover_alt ?? '',
    read_time: input.read_time ?? null,
    status: input.status ?? 'draft',
    sources: input.sources ?? [],
    next_review_at: input.next_review_at ?? null,
    seo_title: input.seo_title ?? null,
    seo_description: input.seo_description ?? null,
    author_id: input.author_id ?? null,
    reviewed_by_id: input.reviewed_by_id ?? null,
    medical_specialty: input.medical_specialty ?? null,
    medical_audience: input.medical_audience ?? 'Patient',
    disclaimer_ack: input.disclaimer_ack ?? false,
    reviewed_at: input.reviewed_at ?? null,
    schema_type: input.schema_type ?? 'MedicalWebPage',
    word_count: input.word_count ?? null,
    reading_level: input.reading_level ?? null,
    published_at: input.status === 'published' ? new Date().toISOString() : null,
  };
  const { data, error } = await supabase.from('notes').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateNote(id: string, input: Partial<NoteInsert>): Promise<void> {
  assertSupabase(supabase);
  if (input.title) input.slug = slugify(input.title);
  if (input.status === 'published') {
    const { data: existing } = await supabase.from('notes').select('published_at').eq('id', id).single();
    if (!existing?.published_at) input.published_at = new Date().toISOString();
  }
  const { error } = await supabase.from('notes').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteNote(id: string): Promise<void> {
  assertSupabase(supabase);
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('cover_storage_path')
    .eq('id', id)
    .single();
  if (noteError) throw noteError;

  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;

  if (note?.cover_storage_path) {
    await deleteStorageObjectIfUnused({ storagePath: note.cover_storage_path });
  }
}

// ============================================================
// Dashboard stats
// ============================================================

export async function getDashboardStats(): Promise<{ products: number; books: number; notes: number; categories: number }> {
  assertSupabase(supabase);
  const [p, b, n, c] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('notes').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
  ]);
  return {
    products: p.count ?? 0,
    books: b.count ?? 0,
    notes: n.count ?? 0,
    categories: c.count ?? 0,
  };
}

export type WorkQueueItem = {
  type: 'book' | 'product' | 'note';
  id: string;
  title: string;
  issue: string;
  issueType: 'error' | 'warning';
};

export async function getAdminWorkQueue(): Promise<WorkQueueItem[]> {
  assertSupabase(supabase);
  const items: WorkQueueItem[] = [];

  const [draftBooks, draftProducts, reviewNotes, draftNotes, reviewDueNotes, seoBooks, seoProducts, seoNotes, missingReviewer, missingDisclaimer] =
    await Promise.allSettled([
      supabase
        .from('books')
        .select('id, title')
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(8),
      supabase
        .from('products')
        .select('id, name')
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(8),
      supabase
        .from('notes')
        .select('id, title')
        .eq('status', 'in_review')
        .order('updated_at', { ascending: false })
        .limit(10),
      supabase
        .from('notes')
        .select('id, title, cover_image_url, excerpt, category_id')
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(10),
      supabase
        .from('notes')
        .select('id, title, next_review_at')
        .eq('status', 'published')
        .not('next_review_at', 'is', null)
        .lte('next_review_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('next_review_at', { ascending: true })
        .limit(5),
      supabase
        .from('books')
        .select('id, title')
        .eq('status', 'published')
        .or('seo_title.is.null,seo_description.is.null')
        .limit(5),
      supabase
        .from('products')
        .select('id, name')
        .eq('status', 'published')
        .or('seo_title.is.null,seo_description.is.null')
        .limit(5),
      supabase
        .from('notes')
        .select('id, title')
        .eq('status', 'published')
        .or('seo_title.is.null,seo_description.is.null')
        .limit(5),
      supabase
        .from('notes')
        .select('id, title')
        .eq('status', 'published')
        .is('reviewed_by_id', null)
        .limit(5),
      supabase
        .from('notes')
        .select('id, title')
        .eq('status', 'published')
        .eq('disclaimer_ack', false)
        .limit(5),
    ]);

  if (draftBooks.status === 'fulfilled') {
    const bookIds = (draftBooks.value.data ?? []).map(b => b.id);
    if (bookIds.length > 0) {
      const { data: bookImages } = await supabase
        .from('book_images')
        .select('book_id')
        .in('book_id', bookIds);
      const withImages = new Set((bookImages ?? []).map((r: { book_id: string }) => r.book_id));
      (draftBooks.value.data ?? [])
        .filter(b => !withImages.has(b.id))
        .forEach(b => items.push({ type: 'book', id: b.id, title: b.title, issue: 'Bản nháp chưa có ảnh bìa', issueType: 'error' }));
    }
  }

  if (draftProducts.status === 'fulfilled') {
    const prodIds = (draftProducts.value.data ?? []).map(p => p.id);
    if (prodIds.length > 0) {
      const { data: prodImages } = await supabase
        .from('product_images')
        .select('product_id')
        .in('product_id', prodIds);
      const withImages = new Set((prodImages ?? []).map((r: { product_id: string }) => r.product_id));
      (draftProducts.value.data ?? [])
        .filter(p => !withImages.has(p.id))
        .forEach(p => items.push({ type: 'product', id: p.id, title: p.name, issue: 'Bản nháp chưa có ảnh', issueType: 'error' }));
    }
  }

  if (reviewNotes.status === 'fulfilled') {
    (reviewNotes.value.data ?? []).forEach(n =>
      items.push({ type: 'note', id: n.id, title: n.title, issue: 'Đang chờ duyệt', issueType: 'warning' }),
    );
  }

  if (draftNotes.status === 'fulfilled') {
    (draftNotes.value.data ?? []).forEach((n: { id: string; title: string; cover_image_url: string | null; excerpt: string | null; category_id: string | null }) => {
      const missing: string[] = [];
      if (!n.cover_image_url) missing.push('ảnh bìa');
      if (!n.excerpt) missing.push('tóm tắt');
      if (!n.category_id) missing.push('chuyên mục');
      if (missing.length > 0) {
        items.push({ type: 'note', id: n.id, title: n.title, issue: `Nháp thiếu: ${missing.join(', ')}`, issueType: 'error' });
      }
    });
  }

  if (reviewDueNotes.status === 'fulfilled') {
    (reviewDueNotes.value.data ?? []).forEach((n: { id: string; title: string; next_review_at: string }) => {
      const daysLeft = Math.ceil((new Date(n.next_review_at).getTime() - Date.now()) / 86400000);
      items.push({
        type: 'note', id: n.id, title: n.title,
        issue: daysLeft <= 0 ? 'Đã quá hạn review' : `Đến hạn review trong ${daysLeft} ngày`,
        issueType: daysLeft <= 0 ? 'error' : 'warning',
      });
    });
  }

  if (seoBooks.status === 'fulfilled') {
    (seoBooks.value.data ?? []).forEach(b =>
      items.push({ type: 'book', id: b.id, title: b.title, issue: 'Thiếu SEO title/description', issueType: 'warning' }),
    );
  }
  if (seoProducts.status === 'fulfilled') {
    (seoProducts.value.data ?? []).forEach(p =>
      items.push({ type: 'product', id: p.id, title: p.name, issue: 'Thiếu SEO title/description', issueType: 'warning' }),
    );
  }
  if (seoNotes.status === 'fulfilled') {
    (seoNotes.value.data ?? []).forEach(n =>
      items.push({ type: 'note', id: n.id, title: n.title, issue: 'Thiếu SEO title/description', issueType: 'warning' }),
    );
  }
  if (missingReviewer.status === 'fulfilled') {
    (missingReviewer.value.data ?? []).forEach(n =>
      items.push({ type: 'note', id: n.id, title: n.title, issue: 'Đã đăng nhưng thiếu reviewer y tế', issueType: 'error' }),
    );
  }
  if (missingDisclaimer.status === 'fulfilled') {
    (missingDisclaimer.value.data ?? []).forEach(n =>
      items.push({ type: 'note', id: n.id, title: n.title, issue: 'Đã đăng nhưng chưa xác nhận disclaimer', issueType: 'warning' }),
    );
  }

  return items;
}

export async function getRecentActivity(limit = 5): Promise<Array<{ id: string; type: string; title: string; updated_at: string; action: string }>> {
  assertSupabase(supabase);
  const [products, books, notes] = await Promise.all([
    supabase.from('products').select('id, name, updated_at, created_at').order('updated_at', { ascending: false }).limit(3),
    supabase.from('books').select('id, title, updated_at, created_at').order('updated_at', { ascending: false }).limit(3),
    supabase.from('notes').select('id, title, updated_at, created_at').order('updated_at', { ascending: false }).limit(3),
  ]);

  const all = [
    ...(products.data ?? []).map(r => ({ id: r.id, type: 'products', title: r.name, updated_at: r.updated_at, action: r.created_at === r.updated_at ? 'đã được thêm mới' : 'đã được cập nhật' })),
    ...(books.data ?? []).map(r => ({ id: r.id, type: 'books', title: r.title, updated_at: r.updated_at, action: r.created_at === r.updated_at ? 'đã được thêm mới' : 'đã được cập nhật' })),
    ...(notes.data ?? []).map(r => ({ id: r.id, type: 'notes', title: r.title, updated_at: r.updated_at, action: r.created_at === r.updated_at ? 'đã được thêm mới' : 'đã được cập nhật' })),
  ];

  return all.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, limit);
}
