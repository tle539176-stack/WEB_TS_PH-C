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
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
        <Link to="/products">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const primaryImage = getPrimaryImage(product.product_images ?? []);
  const imageUrl = primaryImage.url;

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        <Link to="/products" className="inline-flex items-center gap-2 text-[#0A3151] hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách sản phẩm
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mt-8">
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
            <h1 className="text-3xl md:text-4xl font-serif font-bold">{product.name}</h1>
            {product.brand && <p className="text-neutral-500">Thương hiệu: {product.brand}</p>}
            {product.short_description && <p className="text-lg text-neutral-600">{product.short_description}</p>}

            {product.price != null && (
              <div className="text-3xl font-bold text-[#0A3151]">{formatPrice(product.price)}</div>
            )}

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <div className="space-y-3 text-neutral-600">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Sản phẩm chính hãng 100%</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-600" /> Được bác sĩ khuyên dùng</div>
              <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-green-600" /> Giao hàng toàn quốc</div>
            </div>

            <Button size="lg" className="bg-[#0A3151] hover:bg-[#0A3151]/90 text-white gap-2">
              <ShoppingCart className="w-5 h-5" />
              Mua ngay
            </Button>
          </motion.div>
        </div>

        {product.description && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 prose prose-lg max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-6">Mô tả sản phẩm</h2>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
          </motion.div>
        )}

        {product.usage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 prose prose-lg max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-6">Hướng dẫn sử dụng</h2>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.usage) }} />
          </motion.div>
        )}

        {product.warnings && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 prose prose-lg max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-6">Lưu ý</h2>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.warnings) }} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
