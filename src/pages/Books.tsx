import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPublishedBooks } from '@/services/contentService';
import type { BookWithImages } from '@/types/database';

function getPrimaryImageUrl(images: { url: string; is_primary: boolean }[]): string {
  return images.find(i => i.is_primary)?.url ?? images[0]?.url ?? '';
}

function formatPrice(price: number | null): string {
  if (price == null) return '';
  return price.toLocaleString('vi-VN') + '₫';
}

export default function Books() {
  const [books, setBooks] = useState<BookWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublishedBooks()
      .then(setBooks)
      .catch(() => setError('Không thể tải danh sách sách.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Tủ Sách Bác Sĩ Wynn Tran</h1>
          <p className="text-neutral-600">Những kiến thức y khoa được đúc kết tâm huyết, trình bày dễ hiểu dành cho mọi gia đình.</p>
        </div>

        {loading && (
          <p className="text-center text-neutral-400 py-20">Đang tải...</p>
        )}
        {error && (
          <p className="text-center text-red-500 py-20">{error}</p>
        )}
        {!loading && !error && books.length === 0 && (
          <p className="text-center text-neutral-400 py-20">Chưa có sách nào được xuất bản.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                <div className="relative aspect-[2/3] overflow-hidden">
                  {getPrimaryImageUrl(book.book_images) && (
                    <img
                      src={getPrimaryImageUrl(book.book_images)}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {book.is_new && (
                    <Badge className="absolute top-4 right-4 bg-[#0A3151] text-white border-none">Mới nhất</Badge>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button size="icon" className="bg-white text-[#1A1A1A] hover:bg-white/90">
                      <ShoppingCart className="w-5 h-5" />
                    </Button>
                    <Link to={`/books/${book.slug}`}>
                      <Button size="icon" className="bg-white text-[#1A1A1A] hover:bg-white/90">
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-[#0A3151] uppercase tracking-widest">{book.year}</span>
                    {book.rating != null && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{book.rating}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-serif mb-1 group-hover:text-[#0A3151] transition-colors">{book.title}</h3>
                  {book.subtitle && <p className="text-sm text-neutral-500 italic mb-4">{book.subtitle}</p>}
                  <p className="text-sm text-neutral-600 line-clamp-2">{book.description}</p>
                </CardContent>
                <CardFooter className="pb-6 pt-0 flex justify-between items-center">
                  <span className="text-lg font-bold text-[#1A1A1A]">{formatPrice(book.price)}</span>
                  <Link to={`/books/${book.slug}`}>
                    <Button variant="link" className="text-[#0A3151] font-bold p-0 h-auto">
                      Chi tiết
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-12 bg-[#0A3151] text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-serif font-bold mb-4">Bạn muốn nhận thông tin về sách mới?</h2>
            <p className="text-white/70">Đăng ký nhận bản tin để không bỏ lỡ những kiến thức y khoa mới nhất và các ưu đãi đặc biệt.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="Email của bạn"
              className="bg-white/10 border border-white/20 px-6 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 w-full md:w-64"
            />
            <Button className="bg-white text-[#0A3151] hover:bg-white/90 px-8">
              Đăng ký
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
