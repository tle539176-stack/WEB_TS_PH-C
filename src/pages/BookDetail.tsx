import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingCart, Star, Book as BookIcon } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBookBySlug } from '@/services/contentService';
import type { BookWithImages } from '@/types/database';

function getPrimaryImage(images: { url: string; alt: string; is_primary: boolean }[]): { url: string; alt: string } {
  const img = images.find(i => i.is_primary) ?? images[0];
  return { url: img?.url ?? '', alt: img?.alt ?? '' };
}

function formatPrice(price: number | null): string {
  if (price == null) return '';
  return price.toLocaleString('vi-VN') + '₫';
}

export default function BookDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [book, setBook] = useState<BookWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    getBookBySlug(slug)
      .then(data => { if (!data) setNotFound(true); else setBook(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="pt-40 pb-24 text-center text-neutral-400">Đang tải...</div>;
  }

  if (notFound || !book) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h2 className="public-lead-title mb-4">Không tìm thấy sách</h2>
        <Link to="/books"><Button variant="outline">Quay lại danh sách</Button></Link>
      </div>
    );
  }

  const primaryImage = getPrimaryImage(book.book_images);
  const imageUrl = primaryImage.url;
  const pageContainerClass = 'mx-auto w-full max-w-7xl px-4 md:px-8';

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className={pageContainerClass}>
        <Link to="/books" className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#0A3151] transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="overflow-hidden shadow-2xl aspect-[3/4] max-w-md mx-auto bg-neutral-100">
              {imageUrl && (
                <img src={imageUrl} alt={primaryImage.alt || book.title} className="w-full h-full object-cover" />
              )}
            </div>
            {book.is_new && (
              <Badge className="absolute top-6 right-6 bg-[#0A3151] text-white px-4 py-1">Mới nhất</Badge>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                {book.year && (
                  <span className="public-kicker text-[#0A3151]">{book.year}</span>
                )}
                {book.rating != null && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="public-meta font-bold">{book.rating}</span>
                  </div>
                )}
              </div>
              <h1 className="public-section-title public-article-title">{book.title}</h1>
              {book.subtitle && <p className="public-body public-muted-text public-title-summary italic">{book.subtitle}</p>}
            </div>

            <div className="flex items-center gap-6 py-6 border-y border-neutral-100 flex-wrap">
              {book.author && (
                <div>
                  <p className="public-kicker mb-1 text-neutral-400">Tác giả</p>
                  <p className="font-bold">{book.author}</p>
                </div>
              )}
              {book.publisher && (
                <>
                  <div className="w-px h-8 bg-neutral-100" />
                  <div>
                    <p className="public-kicker mb-1 text-neutral-400">Nhà xuất bản</p>
                    <p className="font-bold">{book.publisher}</p>
                  </div>
                </>
              )}
              {book.pages && (
                <>
                  <div className="w-px h-8 bg-neutral-100" />
                  <div>
                    <p className="public-kicker mb-1 text-neutral-400">Số trang</p>
                    <p className="font-bold">{book.pages} trang</p>
                  </div>
                </>
              )}
            </div>

            <p className="public-body public-muted-text">
              {book.description}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <span className="public-lead-title font-bold text-[#1A1A1A]">{formatPrice(book.price)}</span>
              <Button className="public-small w-full gap-2 bg-[#0A3151] px-10 py-6 text-white hover:bg-[#0D426E] sm:w-auto">
                <ShoppingCart className="w-5 h-5" />
                Đặt mua ngay
              </Button>
            </div>

            {book.content && (
              <div className="space-y-4 pt-8">
                <h3 className="public-card-title flex items-center gap-2">
                  <BookIcon className="w-5 h-5 text-[#0A3151]" /> Nội dung nổi bật
                </h3>
                <div
                  className="prose prose-neutral public-body public-muted-text max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(book.content) }}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
