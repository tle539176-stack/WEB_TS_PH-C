import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Filter, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPublishedProducts } from '@/services/contentService';
import type { ProductWithImages } from '@/types/database';

function getPrimaryImageUrl(images: { url: string; is_primary: boolean }[]): string {
  return images.find(i => i.is_primary)?.url ?? images[0]?.url ?? '';
}

function formatPrice(price: number | null): string {
  if (price == null) return '';
  return price.toLocaleString('vi-VN') + '₫';
}

export default function Products() {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPublishedProducts()
      .then(setProducts)
      .catch(() => setError('Không thể tải danh sách sản phẩm.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Sản Phẩm Khuyên Dùng</h1>
            <p className="text-neutral-600">Danh sách các sản phẩm chăm sóc sức khỏe và sắc đẹp được Bác sĩ Wynn Tran tuyển chọn kỹ lưỡng dựa trên tiêu chuẩn y khoa.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Tìm sản phẩm..."
                className="pl-10 w-[250px] border-neutral-200"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 border-neutral-200">
              <Filter className="w-4 h-4" /> Lọc
            </Button>
          </div>
        </div>

        {loading && <p className="text-center text-neutral-400 py-20">Đang tải...</p>}
        {error && <p className="text-center text-red-500 py-20">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-neutral-400 py-20">Chưa có sản phẩm nào.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-white p-6">
                  {getPrimaryImageUrl(product.product_images) && (
                    <img
                      src={getPrimaryImageUrl(product.product_images)}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {product.tag && (
                    <Badge className="absolute top-4 left-4 bg-[#0A3151] text-white border-none">{product.tag}</Badge>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button size="icon" className="bg-white text-[#1A1A1A] hover:bg-white/90">
                      <ShoppingCart className="w-5 h-5" />
                    </Button>
                    <Link to={`/products/${product.slug}`}>
                      <Button size="icon" className="bg-white text-[#1A1A1A] hover:bg-white/90">
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <CardContent className="pt-6">
                  {product.brand && (
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">{product.brand}</p>
                  )}
                  <h3 className="text-lg font-bold font-serif mb-2 group-hover:text-[#0A3151] transition-colors">{product.name}</h3>
                  <p className="text-sm text-neutral-600 line-clamp-2">{product.description}</p>
                </CardContent>
                <CardFooter className="pb-6 pt-0 flex justify-between items-center">
                  <span className="text-lg font-bold text-[#1A1A1A]">{formatPrice(product.price)}</span>
                  <Link to={`/products/${product.slug}`}>
                    <Button variant="link" className="text-[#0A3151] font-bold p-0 h-auto">
                      Xem thêm
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-neutral-500 text-sm mb-6 italic">* Lưu ý: Các sản phẩm trên chỉ mang tính chất tham khảo. Quý vị nên tham khảo ý kiến bác sĩ trước khi sử dụng.</p>
        </div>
      </div>
    </div>
  );
}
