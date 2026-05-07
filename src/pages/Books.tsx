import { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookCatalogCard } from '@/components/catalog/BookCatalogCard';
import { getPublishedBooks } from '@/services/contentService';
import { bookToCardViewModel } from '@/lib/catalogViewModels';
import type { BookWithImages } from '@/types/database';

function getPrimaryImageUrl(images: { url: string; is_primary: boolean }[]): string {
  return images.find(i => i.is_primary)?.url ?? images[0]?.url ?? '';
}

function getPublishedTime(book: BookWithImages): number {
  return new Date(book.published_at ?? book.created_at).getTime();
}

export default function Books() {
  const [books, setBooks] = useState<BookWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlyNew, setOnlyNew] = useState(false);
  const [sortMode, setSortMode] = useState<'newest' | 'title' | 'price'>('newest');

  useEffect(() => {
    getPublishedBooks()
      .then(setBooks)
      .catch(() => setError('Không thể tải danh sách sách.'))
      .finally(() => setLoading(false));
  }, []);

  const query = search.trim().toLowerCase();
  const filtered = books
    .filter(book => {
      const matchesSearch = !query ||
        book.title.toLowerCase().includes(query) ||
        (book.author ?? '').toLowerCase().includes(query) ||
        (book.subtitle ?? '').toLowerCase().includes(query) ||
        (book.description ?? '').toLowerCase().includes(query) ||
        (book.year ?? '').toLowerCase().includes(query);
      return matchesSearch && (!onlyNew || book.is_new);
    })
    .sort((a, b) => {
      if (sortMode === 'title') return a.title.localeCompare(b.title, 'vi');
      if (sortMode === 'price') return (b.price ?? 0) - (a.price ?? 0);
      return getPublishedTime(b) - getPublishedTime(a);
    });
  const featured = books.find(book => book.is_new) ?? books[0];

  return (
    <div className="pt-28 pb-24 bg-[#F7F8FA] min-h-screen">
      <div className="container mx-auto px-4">
        <section className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-end mb-10">
          <div>
            <Badge className="public-kicker mb-5 border-none bg-[#0A3151] px-4 py-1.5 text-white shadow-sm">Thư viện sách</Badge>
            <h1 className="public-page-title public-article-title">Tủ Sách Bác Sĩ Wynn Tran</h1>
            <p className="public-body public-muted-text public-title-summary max-w-2xl">
              Tìm nhanh các đầu sách sức khỏe, đọc mô tả ngắn, xem giá và mở trang chi tiết mà không cần rê chuột.
            </p>

            <div className="mt-8 bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="flex items-center gap-3 rounded-md border border-neutral-200 px-3">
                  <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                  <Input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Tìm theo tên sách, tác giả, năm xuất bản..."
                    className="border-none shadow-none focus-visible:ring-0 h-11 p-0 bg-transparent"
                  />
                </div>
                <select
                  value={sortMode}
                  onChange={event => setSortMode(event.target.value as 'newest' | 'title' | 'price')}
                  className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#0A3151]/20 cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="title">Tên A-Z</option>
                  <option value="price">Giá cao trước</option>
                </select>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyNew(value => !value)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${onlyNew ? 'bg-[#0A3151] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                >
                  Sách mới
                </button>
                <span className="text-xs text-neutral-400">{filtered.length}/{books.length} đầu sách</span>
              </div>
            </div>
          </div>

          {featured && (
            <Link to={`/books/${featured.slug}`} className="block">
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-4">
                  <div className="w-28 shrink-0 aspect-[2/3] rounded-xl bg-neutral-100 overflow-hidden shadow-sm">
                    {getPrimaryImageUrl(featured.book_images) ? (
                      <img
                        src={getPrimaryImageUrl(featured.book_images)}
                        alt={featured.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="public-kicker inline-block bg-[#0A3151]/5 px-2 py-1 text-[#0A3151]">Gợi ý nổi bật</p>
                    <h2 className="public-card-title public-article-title mt-3 line-clamp-2 transition-colors">{featured.title}</h2>
                    <p className="public-small public-muted-text public-title-summary line-clamp-3">{featured.description}</p>
                    <p className="mt-3 text-sm font-bold text-neutral-900">
                      {featured.price == null ? 'Liên hệ' : featured.price.toLocaleString('vi-VN') + 'đ'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </section>

        {loading && <p className="text-center text-neutral-400 py-20">Đang tải...</p>}
        {error && <p className="text-center text-red-500 py-20">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-lg py-16 text-center text-neutral-500">
            Không có sách phù hợp với bộ lọc hiện tại.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(book => (
            <div key={book.id} className="h-full">
              <BookCatalogCard book={bookToCardViewModel(book)} />
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#0A3151] text-white rounded-3xl p-10 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
          <div className="max-w-3xl">
            <h2 className="public-lead-title">Theo dõi sách và tài liệu mới</h2>
            <p className="public-body public-title-summary text-white/75">
              Các đầu sách được cập nhật từ hệ thống Admin sau khi chuyển sang trạng thái xuất bản và có ảnh bìa chính.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
