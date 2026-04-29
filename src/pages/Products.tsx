import { useState, useEffect } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProductCatalogCard } from '@/components/catalog/ProductCatalogCard';
import { getPublishedProducts } from '@/services/contentService';
import { productToCardViewModel } from '@/lib/catalogViewModels';
import type { ProductWithImages } from '@/types/database';

function uniqueValues(values: Array<string | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => !!value && value.trim().length > 0))).sort((a, b) => a.localeCompare(b, 'vi'));
}

export default function Products() {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortMode, setSortMode] = useState<'newest' | 'name' | 'price'>('newest');

  useEffect(() => {
    getPublishedProducts()
      .then(setProducts)
      .catch(() => setError('Không thể tải danh sách sản phẩm.'))
      .finally(() => setLoading(false));
  }, []);

  const tags = uniqueValues(products.map(product => product.tag));
  const brands = uniqueValues(products.map(product => product.brand));
  const query = search.trim().toLowerCase();
  const filtered = products
    .filter(product => {
      const matchesSearch = !query ||
        product.name.toLowerCase().includes(query) ||
        (product.description ?? '').toLowerCase().includes(query) ||
        (product.brand ?? '').toLowerCase().includes(query) ||
        (product.tag ?? '').toLowerCase().includes(query);
      const matchesTag = selectedTag === 'all' || product.tag === selectedTag;
      const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
      return matchesSearch && matchesTag && matchesBrand;
    })
    .sort((a, b) => {
      if (sortMode === 'name') return a.name.localeCompare(b.name, 'vi');
      if (sortMode === 'price') return (b.price ?? 0) - (a.price ?? 0);
      return new Date(b.published_at ?? b.created_at).getTime() - new Date(a.published_at ?? a.created_at).getTime();
    });

  const hasActiveFilter = selectedTag !== 'all' || selectedBrand !== 'all' || !!query;

  return (
    <div className="pt-28 pb-24 bg-[#F7F8FA] min-h-screen">
      <div className="container mx-auto px-4">
        <section className="mb-10">
          <div className="max-w-3xl">
            <Badge className="bg-[#0A3151] text-white border-none mb-5 px-4 py-1.5 rounded-full uppercase tracking-wider text-xs shadow-sm">Sản phẩm khuyên dùng</Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-950 mb-5">Danh Mục Sản Phẩm</h1>
            <p className="text-neutral-600 leading-7">
              Lọc nhanh theo tag, thương hiệu và từ khóa để tìm đúng nhóm sản phẩm đang cần xem.
            </p>
          </div>

          <div className="mt-8 bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid lg:grid-cols-[1fr_180px_180px_180px] gap-3">
              <div className="flex items-center gap-3 rounded-md border border-neutral-200 px-3">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <Input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Tìm sản phẩm, thương hiệu, tag..."
                  className="border-none shadow-none focus-visible:ring-0 h-11 p-0 bg-transparent"
                />
              </div>
              <select
                value={selectedTag}
                onChange={event => setSelectedTag(event.target.value)}
                className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#0A3151]/20 cursor-pointer"
              >
                <option value="all">Tất cả tag</option>
                {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
              <select
                value={selectedBrand}
                onChange={event => setSelectedBrand(event.target.value)}
                className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#0A3151]/20 cursor-pointer"
              >
                <option value="all">Tất cả thương hiệu</option>
                {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <select
                value={sortMode}
                onChange={event => setSortMode(event.target.value as 'newest' | 'name' | 'price')}
                className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#0A3151]/20 cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="price">Giá cao trước</option>
              </select>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-400">{filtered.length}/{products.length} sản phẩm</span>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setSelectedTag('all'); setSelectedBrand('all'); }}
                  className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-200"
                >
                  Xóa bộ lọc
                </button>
              )}
              {selectedTag !== 'all' && <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">{selectedTag}</span>}
              {selectedBrand !== 'all' && <span className="rounded-full bg-green-50 border border-green-100 px-3 py-1.5 text-xs font-bold text-green-700 shadow-sm">{selectedBrand}</span>}
            </div>
          </div>
        </section>

        {loading && <p className="text-center text-neutral-400 py-20">Đang tải...</p>}
        {error && <p className="text-center text-red-500 py-20">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-lg py-16 text-center text-neutral-500">
            Không có sản phẩm phù hợp với bộ lọc hiện tại.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-7">
          {filtered.map(product => (
            <div key={product.id} className="h-full">
              <ProductCatalogCard product={productToCardViewModel(product)} />
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#F8FAFC] border border-blue-100 rounded-3xl p-6 md:p-8 flex gap-5 shadow-sm">
          <div className="bg-white p-3 rounded-2xl shadow-sm shrink-0 h-fit"><ShieldCheck className="w-6 h-6 text-[#0A3151]" /></div>
          <div>
            <h2 className="font-bold text-neutral-950 mb-2">Lưu ý khi tham khảo sản phẩm</h2>
            <p className="text-sm leading-6 text-neutral-600">
              Danh sách sản phẩm chỉ mang tính tham khảo. Người dùng nên đọc kỹ hướng dẫn và hỏi ý kiến chuyên môn trước khi sử dụng, đặc biệt khi đang điều trị hoặc có bệnh nền.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
