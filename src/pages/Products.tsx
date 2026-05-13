import { useEffect, useState } from 'react';
import {
  FlaskConical, Search, ShieldCheck, ShoppingBag, Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { getPublishedProducts } from '@/services/contentService';
import type { ProductWithImages } from '@/types/database';

type ProductTab = 'all' | 'supplement' | 'skin' | 'device';
type ViewMode = 'square' | 'compact';

const PRODUCT_TABS: { id: ProductTab; label: string; mobileLabel: string }[] = [
  { id: 'all', label: 'Tất cả', mobileLabel: 'Tất cả' },
  { id: 'supplement', label: 'Thực phẩm bổ sung', mobileLabel: 'Bổ sung' },
  { id: 'skin', label: 'Chăm sóc da', mobileLabel: 'Chăm sóc da' },
  { id: 'device', label: 'Thiết bị', mobileLabel: 'Thiết bị' },
];

const BADGE_PRESET = [
  { label: 'Khuyến nghị', className: 'bg-[#c8a74b] text-white' },
  { label: 'Bán chạy', className: 'bg-[#28959a] text-white' },
  { label: 'Mới', className: 'bg-[#ef7a61] text-white' },
  { label: 'Hot', className: 'bg-[#7350c9] text-white' },
];

const CTA_PRESET = [
  'bg-[#0b2c61] hover:bg-[#0f376f]',
  'bg-[#2b9fa8] hover:bg-[#248f96]',
  'bg-[#ee7f63] hover:bg-[#e36e51]',
  'bg-[#724bc4] hover:bg-[#643cb5]',
  'bg-[#2f8d56] hover:bg-[#257548]',
];

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Được Bác Sĩ Kiểm Duyệt',
    desc: 'Được bác sĩ kiểm duyệt, chứng nhận minh bạch.',
  },
  {
    icon: FlaskConical,
    title: 'Chứng Nhận Khoa Học',
    desc: 'Chứng nhận khoa học, ưu tiên công thức rõ bằng chứng.',
  },
  {
    icon: Truck,
    title: 'Giao Hàng Toàn Quốc',
    desc: 'Giao hàng toàn quốc, theo dõi đơn và hỗ trợ sau mua.',
  },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function classifyProduct(product: ProductWithImages): Exclude<ProductTab, 'all'> {
  const text = normalize(`${product.name} ${product.tag ?? ''} ${product.description ?? ''}`);
  if (text.includes('thiet bi') || text.includes('device') || text.includes('may')) return 'device';
  if (text.includes('da') || text.includes('skin') || text.includes('collagen')) return 'skin';
  return 'supplement';
}

function getPrimaryImage(product: ProductWithImages): string {
  return product.product_images.find(img => img.is_primary)?.url ?? product.product_images[0]?.url ?? '';
}

function formatPrice(price: number | null): string {
  if (price == null) return 'Liên hệ';
  return `${price.toLocaleString('vi-VN')}đ`;
}

function ratingForIndex(index: number): number {
  const values = [4.8, 4.7, 4.8, 4.9, 4.6];
  return values[index % values.length];
}

function getPriceTone(index: number): string {
  return index % 4 === 1 || index % 4 === 2 ? 'public-gold-text' : '';
}

export default function Products() {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ProductTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('square');

  useEffect(() => {
    getPublishedProducts()
      .then(setProducts)
      .catch(() => setError('Không thể tải danh sách sản phẩm.'))
      .finally(() => setLoading(false));
  }, []);

  const query = normalize(search.trim());
  const filtered = products.filter(product => {
    const type = classifyProduct(product);
    if (activeTab !== 'all' && type !== activeTab) return false;
    if (!query) return true;
    const target = normalize(`${product.name} ${product.tag ?? ''} ${product.description ?? ''} ${product.brand ?? ''}`);
    return target.includes(query);
  });

  const pageContainerClass = 'mx-auto w-full max-w-7xl px-4 md:px-8';

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#eef2f7_100%)] pt-24 pb-16 md:pt-28 md:pb-20">
      <div className={pageContainerClass}>
        <section className="mb-8 max-w-[760px] text-left md:mb-10">
          <h1 className="public-listing-title uppercase text-[var(--public-navy)]">
            Sản phẩm chống lão hóa
          </h1>
          <p className="public-section-summary public-muted-text mt-4 max-w-[720px]">
            Các sản phẩm được bác sĩ Phúc nghiên cứu và khuyến nghị dựa trên bằng chứng khoa học.
          </p>
        </section>

        <section className="mb-4 rounded-[8px] border border-[#d8dee8] bg-white p-3 shadow-[0_8px_22px_-18px_rgba(10,40,90,0.55)] md:mb-6 md:p-4">
          <div className="mb-3 md:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f8796]" />
              <Input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="public-small h-11 rounded-[8px] border-[#d1d7e2] bg-white pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {PRODUCT_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`public-small shrink-0 rounded-[8px] border px-4 py-2 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#0d2f66] bg-[#0d2f66] text-white'
                      : 'border-[#2d3e5f] bg-white text-[#111f38] hover:bg-[#f4f6fa]'
                  }`}
                >
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.mobileLabel}</span>
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <label htmlFor="product-view-mode" className="sr-only">Chế độ hiển thị</label>
              <select
                id="product-view-mode"
                value={viewMode}
                onChange={event => setViewMode(event.target.value as ViewMode)}
                className="public-small h-10 min-w-[122px] rounded-[8px] border border-[#ccd3df] bg-white px-3 font-semibold text-[#1b2438] focus:outline-none"
              >
                <option value="square">SQUARE</option>
                <option value="compact">COMPACT</option>
              </select>
            </div>
          </div>
        </section>

        {loading && <p className="py-16 text-center text-neutral-500">Đang tải sản phẩm...</p>}
        {error && <p className="py-16 text-center text-red-500">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-[8px] border border-[#d8dee8] bg-white p-10 text-center text-[#4a576f]">
            Không có sản phẩm phù hợp với bộ lọc hiện tại.
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:gap-5">
            {filtered.map((product, index) => {
              const image = getPrimaryImage(product);
              const badge = BADGE_PRESET[index % BADGE_PRESET.length];
              const ctaClass = CTA_PRESET[index % CTA_PRESET.length];
              const rating = ratingForIndex(index);
              const productHref = `/products/${product.slug}`;
              const isCompact = viewMode === 'compact';
              const priceTone = getPriceTone(index);
              return (
                <div key={product.id} className="rounded-[8px] border border-[#d9dfe9] bg-white p-2 shadow-[0_10px_20px_-16px_rgba(8,36,78,0.55)] md:p-3">
                  <div className="relative mb-2.5 aspect-[4/3] overflow-hidden rounded-[6px] bg-[linear-gradient(160deg,#f6f8fb_0%,#e9edf4_100%)] md:mb-3">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-contain p-2 transition-transform duration-500 hover:scale-[1.03]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#9da6b6]">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                    <span className={`public-meta absolute left-2 top-2 rounded-[6px] px-2 py-1 font-bold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="public-card-title public-article-title mb-0.5 line-clamp-2">
                    {product.name}
                  </p>
                  <p className="public-meta public-muted-text mb-0.5">
                    {product.brand || 'Dr. Phuc Collection'}
                  </p>

                  <p className="public-meta public-gold-text mb-1">
                    {'★'.repeat(5)} <span className="public-muted-text">({rating.toFixed(1)})</span>
                  </p>

                  {!isCompact && (
                    <p className="public-small public-muted-text mb-1.5 hidden line-clamp-2 md:block">
                      {product.description || 'Sản phẩm chống lão hóa được chọn lọc theo tiêu chí khoa học.'}
                    </p>
                  )}

                  <p className={`public-body mb-2 font-bold leading-none text-[var(--public-navy)] md:mb-3 ${priceTone}`}>
                    {formatPrice(product.price)}
                  </p>

                  <Link
                    to={productHref}
                    className={`public-small block rounded-[6px] px-2 py-2 text-center font-bold text-white transition-colors ${ctaClass}`}
                  >
                    Thêm vào giỏ
                  </Link>
                </div>
              );
            })}

            <div className="public-on-blue col-span-2 mt-0.5 rounded-[8px] bg-[linear-gradient(135deg,#081e4a_0%,#0f3f89_100%)] p-4 text-white shadow-[0_14px_28px_-18px_rgba(8,20,48,0.86)] md:hidden">
              <h3 className="public-lead-title mb-1 text-white">Bộ Sản Phẩm Chống Lão Hóa Toàn Diện</h3>
              <div className="mb-3 flex items-end gap-2">
                <span className="public-body public-gold-text font-bold leading-none">2,500,000đ</span>
                <span className="public-meta text-white/70 line-through">2,500,000đ</span>
              </div>
              <button type="button" className="public-small w-full rounded-[8px] bg-white py-2 font-bold text-[var(--public-navy)]">XEM COMBO</button>
            </div>
          </div>
        )}

        <section className="mt-6 hidden gap-4 md:grid md:grid-cols-3">
          {TRUST_ITEMS.map(item => (
            <div key={item.title} className="flex items-center gap-3 rounded-[8px] border border-[#d7dde8] bg-white px-4 py-3 shadow-[0_10px_24px_-20px_rgba(7,32,70,0.8)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#f1f5fb] text-[#0f2e63]">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="public-card-title public-article-title">{item.title}</p>
            </div>
          ))}
        </section>

        <section className="mt-5 space-y-3 md:hidden">
          {TRUST_ITEMS.map(item => (
            <div key={item.title} className="rounded-[8px] border border-[#d7dde8] bg-white p-3 shadow-[0_8px_20px_-16px_rgba(7,32,70,0.7)]">
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-[#f1f5fb] text-[#0f2e63]">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="public-card-title public-article-title">{item.title}</p>
              </div>
              <p className="public-small public-muted-text">{item.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
