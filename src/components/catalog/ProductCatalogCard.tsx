import { ExternalLink, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCatalogPrice, getPrimaryCatalogImage, type ProductCardViewModel } from './catalogTypes';

type ProductCatalogCardProps = {
  product: ProductCardViewModel;
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

export function ProductCatalogCard({ product, preview = false }: ProductCatalogCardProps) {
  const image = getPrimaryCatalogImage(product.images);
  const detailHref = product.slug ? `/products/${product.slug}` : '/products';

  return (
    <Card className="h-full border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
      <div className="relative aspect-square overflow-hidden bg-white p-6 border-b border-neutral-100">
        {image?.url ? (
          <img
            src={image.url}
            alt={image.alt || product.name}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400">
            <ShoppingCart className="w-8 h-8" />
          </div>
        )}
        {product.tag && (
          <Badge className="absolute top-4 left-4 bg-[#0A3151] text-white border-none">{product.tag}</Badge>
        )}
      </div>
      <CardContent className="pt-5">
        {product.brand && (
          <p className="public-kicker mb-1 text-neutral-400">{product.brand}</p>
        )}
        <h3 className="public-card-title public-article-title mb-2 line-clamp-2">
          {product.name || 'Tên sản phẩm'}
        </h3>
        <p className="public-small public-muted-text public-title-summary line-clamp-3">
          {product.description || 'Mô tả sản phẩm sẽ hiển thị ở đây.'}
        </p>
      </CardContent>
      <CardFooter className="pb-6 pt-0 flex flex-col gap-4 items-stretch">
        <span className="public-body font-bold text-neutral-950">{formatCatalogPrice(product.price)}</span>
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
