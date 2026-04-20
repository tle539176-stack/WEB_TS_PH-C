import { BookOpen, ExternalLink, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCatalogPrice, getPrimaryCatalogImage, type BookCardViewModel } from './catalogTypes';

type BookCatalogCardProps = {
  book: BookCardViewModel;
  preview?: boolean;
};

function CardActionLink({
  to,
  preview,
  children,
}: {
  to: string;
  preview?: boolean;
  children: ReactNode;
}) {
  if (preview) return <div>{children}</div>;
  return <Link to={to}>{children}</Link>;
}

export function BookCatalogCard({ book, preview = false }: BookCatalogCardProps) {
  const image = getPrimaryCatalogImage(book.images);
  const detailHref = book.slug ? `/books/${book.slug}` : '/books';

  return (
    <Card className="h-full border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
      <div className="relative aspect-[2/3] overflow-hidden bg-neutral-100">
        {image?.url ? (
          <img
            src={image.url}
            alt={image.alt || book.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <BookOpen className="w-10 h-10" />
          </div>
        )}
        {book.isNew && (
          <Badge className="absolute top-4 right-4 bg-[#0A3151] text-white border-none">Mới nhất</Badge>
        )}
      </div>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start gap-3 mb-2">
          <span className="text-xs font-bold text-[#0A3151] uppercase tracking-widest">{book.year}</span>
          {book.rating != null && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs font-bold">{book.rating}</span>
            </div>
          )}
        </div>
        <h3 className="text-xl font-bold font-serif mb-1 text-neutral-950 line-clamp-2">
          {book.title || 'Tên sách'}
        </h3>
        {book.subtitle && <p className="text-sm text-neutral-500 italic mb-4 line-clamp-1">{book.subtitle}</p>}
        <p className="text-sm text-neutral-600 line-clamp-3">
          {book.description || 'Mô tả sách sẽ hiển thị ở đây.'}
        </p>
      </CardContent>
      <CardFooter className="pb-6 pt-0 flex flex-col gap-4 items-stretch">
        <div className="flex justify-between items-center gap-3">
          <span className="text-lg font-bold text-neutral-950">{formatCatalogPrice(book.price)}</span>
          <span className="text-xs text-neutral-400 truncate">{book.author}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CardActionLink to={detailHref} preview={preview}>
            <Button type="button" variant="outline" className="w-full gap-2 border-neutral-200">
              <ExternalLink className="w-4 h-4" /> Chi tiết
            </Button>
          </CardActionLink>
          <CardActionLink to={detailHref} preview={preview}>
            <Button type="button" className="w-full gap-2 bg-[#0A3151] hover:bg-[#0D426E] text-white">
              <ShoppingCart className="w-4 h-4" /> Xem mua
            </Button>
          </CardActionLink>
        </div>
      </CardFooter>
    </Card>
  );
}
