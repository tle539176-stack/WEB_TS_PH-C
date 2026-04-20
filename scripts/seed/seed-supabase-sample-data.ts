/**
 * Seed Supabase database with sample content.
 * Idempotent: uses slug to avoid duplicates.
 *
 * PREREQUISITES:
 *  1. Run migration 001_initial_schema.sql in Supabase SQL Editor.
 *  2. Replace sample content below with real launch content if needed.
 *
 * Usage:
 *   VITE_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   npx tsx scripts/seed/seed-supabase-sample-data.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(text: string): string {
  const VIETNAMESE_MAP: Record<string, string> = {
    à: 'a', á: 'a', ạ: 'a', ả: 'a', ã: 'a',
    â: 'a', ầ: 'a', ấ: 'a', ậ: 'a', ẩ: 'a', ẫ: 'a',
    ă: 'a', ằ: 'a', ắ: 'a', ặ: 'a', ẳ: 'a', ẵ: 'a',
    è: 'e', é: 'e', ẹ: 'e', ẻ: 'e', ẽ: 'e',
    ê: 'e', ề: 'e', ế: 'e', ệ: 'e', ể: 'e', ễ: 'e',
    ì: 'i', í: 'i', ị: 'i', ỉ: 'i', ĩ: 'i',
    ò: 'o', ó: 'o', ọ: 'o', ỏ: 'o', õ: 'o',
    ô: 'o', ồ: 'o', ố: 'o', ộ: 'o', ổ: 'o', ỗ: 'o',
    ơ: 'o', ờ: 'o', ớ: 'o', ợ: 'o', ở: 'o', ỡ: 'o',
    ù: 'u', ú: 'u', ụ: 'u', ủ: 'u', ũ: 'u',
    ư: 'u', ừ: 'u', ứ: 'u', ự: 'u', ử: 'u', ữ: 'u',
    ỳ: 'y', ý: 'y', ỵ: 'y', ỷ: 'y', ỹ: 'y', đ: 'd',
  };
  return text
    .toLowerCase()
    .replace(/[^\u0000-\u007e]/g, (c) => VIETNAMESE_MAP[c] ?? c)
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Sample launch content. Replace this block with real products, books, and notes before production.
const BOOKS = [
  { title: 'Hanh Trinh Suc Khoe', subtitle: 'Bi quyet song khoe moi ngay', year: '2025', price: 250000, author: 'Dr. Wynn Tran', description: 'Cuon sach moi nhat chia se ve cach phong benh va duy tri loi song lanh manh.', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&h=800&q=80', isNew: true },
  { title: 'Y Hoc Thuong Thuc', subtitle: 'Hieu dung ve co the ban', year: '2023', price: 180000, author: 'Dr. Wynn Tran', description: 'Giai dap cac thac mac y khoa thuong gap mot cach khoa hoc va de hieu.', imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&h=800&q=80', isNew: false },
  { title: 'Chong Lao Hoa Tu Nhien', subtitle: 'Tre dep tu ben trong', year: '2022', price: 220000, author: 'Dr. Wynn Tran', description: 'Cac phuong phap cham soc da va suc khoe de duy tri net thanh xuan.', imageUrl: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&w=600&h=800&q=80', isNew: false },
];

const PRODUCTS = [
  { name: 'Vitamin C Serum', description: 'Serum Vitamin C nong do cao giup lam sang da, mo tham va chong lao hoa.', price: 850000, tag: 'Khuyen dung', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&h=600&q=80' },
  { name: 'Omega-3 Fish Oil', description: 'Dau ca tinh khiet cung cap EPA va DHA ham luong cao, ho tro tim mach.', price: 450000, tag: 'Ban chay', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&h=600&q=80' },
];

const NOTES_CATEGORIES = ['Chong lao hoa', 'Dinh duong', 'Y hoc thuong thuc'];
const NOTES = [
  { title: '5 Thoi quen giup tre lau tu ben trong', excerpt: 'Lao hoa khong chi la van de ngoai da, no bat dau tu cap do te bao.', category: 'Chong lao hoa', imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=1200&h=600&q=80', readTime: '5 phut' },
  { title: 'Dinh duong cho nguoi cao tuoi nhung dieu can luu y', excerpt: 'Khi buoc sang tuoi xe chieu, nhu cau dinh duong cua co the thay doi dang ke.', category: 'Dinh duong', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&h=600&q=80', readTime: '8 phut' },
  { title: 'Hieu dung ve thuc pham chuc nang', excerpt: 'Thuc pham chuc nang khong phai la thuoc than. Lam sao de chon dung va dung dung.', category: 'Y hoc thuong thuc', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&h=600&q=80', readTime: '6 phut' },
];

async function run() {
  console.log('Seeding categories...');
  const catMap: Record<string, string> = {};
  for (const name of NOTES_CATEGORIES) {
    const slug = slugify(name);
    const { data: existing } = await db.from('categories').select('id').eq('slug', slug).single();
    if (existing) { catMap[name] = existing.id; continue; }
    const { data } = await db.from('categories').insert({ name, slug, type: 'note', sort_order: 0 }).select('id').single();
    if (data) catMap[name] = data.id;
    console.log(`  Category: ${name}`);
  }

  console.log('Seeding books...');
  for (const b of BOOKS) {
    const slug = slugify(b.title);
    const { data: existing } = await db.from('books').select('id').eq('slug', slug).single();
    let bookId: string;
    if (existing) { bookId = existing.id; console.log(`  Book exists: ${b.title}`); }
    else {
      const { data } = await db.from('books').insert({ title: b.title, slug, subtitle: b.subtitle, author: b.author, year: b.year, price: b.price, description: b.description, is_new: b.isNew, status: 'published', published_at: new Date().toISOString() }).select('id').single();
      if (!data) { console.error(`Failed: ${b.title}`); continue; }
      bookId = data.id;
      console.log(`  Created book: ${b.title}`);
    }
    const { data: imgExisting } = await db.from('book_images').select('id').eq('book_id', bookId).eq('is_primary', true).single();
    if (!imgExisting) {
      await db.from('book_images').insert({ book_id: bookId, url: b.imageUrl, alt: b.title, is_primary: true, sort_order: 0 });
    }
  }

  console.log('Seeding products...');
  for (const p of PRODUCTS) {
    const slug = slugify(p.name);
    const { data: existing } = await db.from('products').select('id').eq('slug', slug).single();
    let productId: string;
    if (existing) { productId = existing.id; console.log(`  Product exists: ${p.name}`); }
    else {
      const { data } = await db.from('products').insert({ name: p.name, slug, description: p.description, price: p.price, tag: p.tag, status: 'published', published_at: new Date().toISOString() }).select('id').single();
      if (!data) { console.error(`Failed: ${p.name}`); continue; }
      productId = data.id;
      console.log(`  Created product: ${p.name}`);
    }
    const { data: imgExisting } = await db.from('product_images').select('id').eq('product_id', productId).eq('is_primary', true).single();
    if (!imgExisting) {
      await db.from('product_images').insert({ product_id: productId, url: p.imageUrl, alt: p.name, is_primary: true, sort_order: 0 });
    }
  }

  console.log('Seeding notes...');
  for (const n of NOTES) {
    const slug = slugify(n.title);
    const { data: existing } = await db.from('notes').select('id').eq('slug', slug).single();
    if (existing) { console.log(`  Note exists: ${n.title}`); continue; }
    const catId = catMap[n.category] ?? null;
    await db.from('notes').insert({ title: n.title, slug, excerpt: n.excerpt, content: '', category_id: catId, cover_image_url: n.imageUrl, read_time: n.readTime, status: 'published', sources: [], published_at: new Date().toISOString() });
    console.log(`  Created note: ${n.title}`);
  }

  console.log('Done!');
}

run().catch((e) => { console.error(e); process.exit(1); });
