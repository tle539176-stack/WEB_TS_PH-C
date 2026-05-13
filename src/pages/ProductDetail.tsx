import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingCart, Star, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProductBySlug } from '@/services/contentService';
import type { ProductWithImages } from '@/types/database';

function getPrimaryImage(images: { url: string; alt: string; is_primary: boolean }[]): { url: string; alt: string } {
  const img = images.find(i => i.is_primary) ?? images[0];
  return { url: img?.url ?? '', alt: img?.alt ?? '' };
}

function formatPrice(price: number | null): string {
  if (price == null) return '';
  return price.toLocaleString('vi-VN') + '₫';
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductWithImages | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3151] mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h2 className="public-lead-title mb-4">Không tìm thấy sản phẩm</h2>
        <Link to="/products">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const primaryImage = getPrimaryImage(product.product_images ?? []);
  const imageUrl = primaryImage.url;
  const pageContainerClass = 'mx-auto w-full max-w-7xl px-4 md:px-8';

  return (
    <div className="pt-32 pb-24">
      <div className={pageContainerClass}>
        <Link to="/products" className="inline-flex items-center gap-2 text-[#0A3151] hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách sản phẩm
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {imageUrl ? (
              <img src={imageUrl} alt={primaryImage.alt || product.name} className="w-full rounded-2xl shadow-lg" />
            ) : (
              <div className="w-full aspect-square bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400">
                Không có ảnh
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {product.tag && <Badge className="bg-[#0A3151] text-white">{product.tag}</Badge>}
            <h1 className="public-section-title public-article-title">{product.name}</h1>
            {product.brand && <p className="public-small public-muted-text">Thương hiệu: {product.brand}</p>}
            {product.short_description && <p className="public-body public-muted-text public-title-summary">{product.short_description}</p>}

            {product.price != null && (
              <div className="public-lead-title font-bold text-[#0A3151]">{formatPrice(product.price)}</div>
            )}

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <div className="public-small public-muted-text space-y-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Sản phẩm chính hãng 100%</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-600" /> Được bác sĩ khuyên dùng</div>
              <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-green-600" /> Giao hàng toàn quốc</div>
            </div>

            <Button size="lg" className="w-full bg-[#0A3151] hover:bg-[#0A3151]/90 text-white gap-2 sm:w-auto">
              <ShoppingCart className="w-5 h-5" />
              Mua ngay
            </Button>
          </motion.div>
        </div>

        {product.description && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-neutral public-body public-muted-text mt-16 max-w-none">
            <h2 className="public-section-title">Mô tả sản phẩm</h2>
            <div className="public-title-summary" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
          </motion.div>
        )}

        {product.usage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-neutral public-body public-muted-text mt-12 max-w-none">
            <h2 className="public-section-title">Hướng dẫn sử dụng</h2>
            <div className="public-title-summary" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.usage) }} />
          </motion.div>
        )}

        {product.warnings && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="prose prose-neutral public-body public-muted-text mt-12 max-w-none">
            <h2 className="public-section-title">Lưu ý</h2>
            <div className="public-title-summary" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.warnings) }} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
