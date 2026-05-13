import { useEffect, useState } from 'react';
import {
  Award, Check, Package, Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublishedBooks } from '@/services/contentService';
import type { BookWithImages } from '@/types/database';

type BookTab = 'all' | 'medical' | 'nutrition';

const BOOK_TABS: { id: BookTab; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'medical', label: 'Y học' },
  { id: 'nutrition', label: 'Dinh dưỡng' },
];

const BADGES = [
  { label: 'Bestseller', className: 'bg-[#c8a64b] text-white' },
  { label: 'Mới', className: 'bg-[#2e9ba2] text-white' },
  { label: 'Hot', className: 'bg-[#3f8c55] text-white' },
];

const CTA_PRESET = [
  'bg-[#0d2f66] hover:bg-[#133d7a]',
  'bg-[#2a9ca8] hover:bg-[#258f99]',
  'bg-[#2f8a53] hover:bg-[#297647]',
];

const MOBILE_COVER_BG = [
  'bg-[linear-gradient(180deg,#ccb36e_0%,#d9c587_100%)]',
  'bg-[linear-gradient(180deg,#c9d8cf_0%,#e4efe9_100%)]',
  'bg-[linear-gradient(180deg,#f4d4cc_0%,#f9ebe7_100%)]',
];

const TRUST_BOOK_ITEMS = [
  { icon: Award, title: 'Sách gốc bản quyền', desc: 'Sách gốc có bản quyền, thông tin xuất bản minh bạch.' },
  { icon: Truck, title: 'Giao hàng toàn quốc', desc: 'Giao hàng toàn quốc minh bạch, theo dõi đơn rõ ràng.' },
  { icon: Package, title: 'Đổi trả trong 7 ngày', desc: 'Đổi trả trong 7 ngày nếu phát sinh lỗi sản phẩm.' },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function classifyBook(book: BookWithImages): Exclude<BookTab, 'all'> {
  const target = normalize(`${book.title} ${book.subtitle ?? ''} ${book.description ?? ''}`);
  if (target.includes('dinh duong') || target.includes('chong viem') || target.includes('thuc pham')) return 'nutrition';
  return 'medical';
}

function getPrimaryImage(book: BookWithImages): string {
  return book.book_images.find(image => image.is_primary)?.url ?? book.book_images[0]?.url ?? '';
}

function formatPrice(price: number | null): string {
  if (price == null) return 'Liên hệ';
  return `${price.toLocaleString('vi-VN')}đ`;
}

function mobileSecondaryBadge(label: string): string {
  if (label === 'Bestseller') return '35%';
  if (label === 'Mới') return 'Mới';
  return 'Hot';
}

export default function Books() {
  const [books, setBooks] = useState<BookWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<BookTab>('all');

  useEffect(() => {
    getPublishedBooks()
      .then(setBooks)
      .catch(() => setError('Không thể tải danh sách sách.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = books
    .filter(book => {
      const type = classifyBook(book);
      return activeTab === 'all' || type === activeTab;
    })
    .sort((a, b) => new Date(b.published_at ?? b.created_at).getTime() - new Date(a.published_at ?? a.created_at).getTime());

  const topBooks = filtered.slice(0, 3);
  const mobileList = filtered.slice(0, 6);
  const featuredBook = filtered[0] ?? books[0] ?? null;
  const pageContainerClass = 'mx-auto w-full max-w-7xl px-4 md:px-8';

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#edf1f8_100%)] pt-24 pb-16 md:pt-28 md:pb-20">
      <div className={pageContainerClass}>
        <section className="mb-8 max-w-[760px] text-left md:mb-10">
          <h1 className="public-listing-title uppercase text-[var(--public-navy)]">Sách của bác sĩ Phúc</h1>
          <p className="public-section-summary public-muted-text mt-4 max-w-[720px]">
            Những cuốn sách được biên soạn chuyên sâu về y học chống lão hóa và sức khỏe toàn diện.
          </p>
        </section>

        <section className="mb-6 md:hidden">
          {loading && <p className="py-10 text-center text-neutral-500">Đang tải sách...</p>}
          {error && <p className="py-10 text-center text-red-500">{error}</p>}

          {!loading && !error && featuredBook && (
            <div className="public-on-blue relative mb-5 overflow-hidden rounded-[8px] border border-[#d8dee8] bg-[#0a1f4c] shadow-[0_12px_24px_-18px_rgba(8,20,48,0.85)]">
              {getPrimaryImage(featuredBook) && (
                <img
                  src={getPrimaryImage(featuredBook)}
                  alt={featuredBook.title}
                  className="h-52 w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(10,31,76,0.95)_0%,rgba(10,31,76,0.12)_100%)] p-4">
                <p className="public-lead-title line-clamp-2 text-white">{featuredBook.title}</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="public-body public-gold-text font-bold leading-none">{formatPrice(featuredBook.price)}</p>
                  <Link to={featuredBook.slug ? `/books/${featuredBook.slug}` : '/books'} className="public-small rounded-[8px] border border-white/55 px-3 py-2 font-bold text-white">
                    ĐẶT MUA NGAY
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              <h2 className="public-section-title mb-2 uppercase text-[var(--public-navy)]">Tất cả sách</h2>
              <div className="mb-4 h-1.5 w-14 bg-[#b49648]" />

              <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {BOOK_TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`public-small shrink-0 rounded-[8px] border px-4 py-2 font-semibold ${
                      activeTab === tab.id
                        ? 'border-[#0d2f66] bg-[#0d2f66] text-white'
                        : 'border-[#2d3e5f] bg-white text-[#111f38]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {mobileList.length === 0 ? (
                <div className="rounded-[8px] border border-[#d8dee8] bg-white p-8 text-center text-[#4a576f]">
                  Không có sách để hiển thị.
                </div>
              ) : (
                <div className="space-y-3">
                  {mobileList.map((book, index) => {
                    const badge = BADGES[index % BADGES.length];
                    const ctaClass = CTA_PRESET[index % CTA_PRESET.length];
                    const cover = getPrimaryImage(book);
                    const coverBg = MOBILE_COVER_BG[index % MOBILE_COVER_BG.length];
                    return (
                      <div key={book.id} className="grid grid-cols-[40%_60%] overflow-hidden rounded-[8px] border border-[#d7dde8] bg-white shadow-[0_10px_22px_-18px_rgba(8,20,48,0.75)]">
                        <div className={`relative p-2 ${coverBg}`}>
                          {cover && <img src={cover} alt={book.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />}
                          <span className="public-meta absolute bottom-2 left-1/2 -translate-x-1/2 rounded-[6px] bg-[#0c2e64]/90 px-2 py-0.5 font-bold text-white">
                            {mobileSecondaryBadge(badge.label)}
                          </span>
                        </div>
                        <div className="p-2.5">
                          <span className={`public-meta mb-1 inline-block rounded-[6px] px-2 py-0.5 font-bold ${badge.className}`}>{badge.label}</span>
                          <p className="public-card-title public-article-title line-clamp-2">{book.title}</p>
                          <p className="public-meta public-muted-text mb-1 line-clamp-2">
                            {book.description || 'Tác phẩm chuyên sâu về chống lão hóa và chăm sóc sức khỏe.'}
                          </p>
                          <p className="public-meta public-gold-text">{'★'.repeat(5)}</p>
                          <div className="mt-1 flex items-end justify-between gap-2">
                            <p className="public-body public-gold-text font-bold leading-none">{formatPrice(book.price)}</p>
                            <Link
                              to={book.slug ? `/books/${book.slug}` : '/books'}
                              className={`public-small rounded-[6px] px-3 py-1.5 font-bold text-white ${ctaClass}`}
                            >
                              MUA NGAY
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 space-y-3">
                {TRUST_BOOK_ITEMS.map(item => (
                  <div key={item.title} className="rounded-[8px] border border-[#d7dde8] bg-white p-3 shadow-[0_8px_20px_-16px_rgba(7,32,70,0.7)]">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#f1f5fb] text-[#0e2f62]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <p className="public-card-title public-article-title">{item.title}</p>
                    </div>
                    <p className="public-small public-muted-text">{item.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="hidden md:block">
          {loading && <p className="py-16 text-center text-neutral-500">Đang tải sách...</p>}
          {error && <p className="py-16 text-center text-red-500">{error}</p>}
          {!loading && !error && topBooks.length === 0 && (
            <div className="rounded-[8px] border border-[#d8dee8] bg-white p-12 text-center text-[#4a576f]">
              Không có sách để hiển thị.
            </div>
          )}

          {!loading && !error && topBooks.length > 0 && (
            <>
              <div className="mb-6 grid gap-4 lg:grid-cols-3">
                {topBooks.map((book, index) => {
                  const badge = BADGES[index % BADGES.length];
                  const ctaClass = CTA_PRESET[index % CTA_PRESET.length];
                  const cover = getPrimaryImage(book);
                  return (
                    <div key={book.id} className="overflow-hidden rounded-[8px] border border-[#d8dee7] bg-white shadow-[0_14px_26px_-20px_rgba(8,20,48,0.75)]">
                      <div className="relative aspect-[4/3] bg-[linear-gradient(130deg,#f4f7fb_0%,#e9eef5_100%)] p-4">
                        {cover && <img src={cover} alt={book.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />}
                        <span className={`public-meta absolute right-3 top-3 rounded-[6px] px-3 py-1 font-bold ${badge.className}`}>{badge.label}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="public-card-title public-article-title mb-1 line-clamp-2">{book.title}</h3>
                        <p className="public-small public-muted-text mb-1">{book.subtitle || 'Khoa học và thực hành'}</p>
                        <p className="public-meta public-gold-text mb-1">{'★'.repeat(5)}</p>
                        <p className="public-small public-muted-text mb-2 line-clamp-3">
                          {book.description || 'Tác phẩm chuyên sâu về y học chống lão hóa và chăm sóc sức khỏe toàn diện.'}
                        </p>
                        <p className="public-body public-gold-text mb-3 font-bold leading-none">{formatPrice(book.price)}</p>
                        <Link to={book.slug ? `/books/${book.slug}` : '/books'} className={`public-small block rounded-[6px] py-2 text-center font-bold text-white ${ctaClass}`}>
                          MUA NGAY
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {featuredBook && (
                <div className="overflow-hidden rounded-[8px] border border-[#d7dde8] bg-white shadow-[0_16px_28px_-20px_rgba(8,20,48,0.8)]">
                  <div className="grid lg:grid-cols-[1.05fr_1fr]">
                    <div className="aspect-[4/2.5] bg-[#e8edf5] p-4">
                      {getPrimaryImage(featuredBook) && (
                        <img
                          src={getPrimaryImage(featuredBook)}
                          alt={featuredBook.title}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="p-5 lg:p-6">
                      <p className="public-kicker public-gold-text mb-1">Sách nổi bật</p>
                      <h3 className="public-section-title mb-2 text-[var(--public-ink)]">Bộ Sách Chống Lão Hóa Toàn Tập</h3>
                      <p className="public-body public-muted-text mb-3">
                        Bộ sách tổng hợp nền tảng y học chống lão hóa, giúp người đọc xây kế hoạch sống khỏe dài hạn.
                      </p>
                      <ul className="public-small mb-3 space-y-1 text-[var(--public-ink)]">
                        <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4" /> Key hướng chống lão hóa</li>
                        <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4" /> Tần suất thăm khám da</li>
                        <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4" /> Dãy sách chống lão hóa</li>
                      </ul>
                      <div className="mb-4 flex items-end gap-2">
                        <span className="public-small public-muted-text line-through">{formatPrice((featuredBook.price ?? 0) + 70000)}</span>
                        <span className="public-lead-title public-gold-text font-bold">{formatPrice(featuredBook.price)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={featuredBook.slug ? `/books/${featuredBook.slug}` : '/books'}
                          className="public-small rounded-[6px] bg-[#0d2f66] px-4 py-2 font-bold text-white hover:bg-[#133d7a]"
                        >
                          ĐẶT MUA
                        </Link>
                        <Link
                          to={featuredBook.slug ? `/books/${featuredBook.slug}` : '/books'}
                          className="public-small rounded-[6px] border border-[#1f304f] px-4 py-2 font-bold text-[#1f304f] hover:bg-[#f5f7fb]"
                        >
                          Xem thêm
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !error && topBooks.length > 0 && (
            <section className="mt-5 grid grid-cols-3 gap-4">
              {TRUST_BOOK_ITEMS.map(item => (
                <div key={item.title} className="flex items-center gap-3 rounded-[8px] border border-[#d7dde8] bg-white px-4 py-3 shadow-[0_10px_24px_-20px_rgba(7,32,70,0.8)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#f1f5fb] text-[#0e2f62]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="public-card-title public-article-title">{item.title}</p>
                </div>
              ))}
            </section>
          )}
        </section>
      </div>
    </div>
  );
}
