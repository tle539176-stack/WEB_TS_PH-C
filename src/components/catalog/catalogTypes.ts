export type CatalogImage = {
  url: string;
  alt: string;
  isPrimary?: boolean;
};

export type ProductCardViewModel = {
  id?: string;
  name: string;
  slug?: string;
  price: number | null;
  tag?: string | null;
  brand?: string | null;
  description?: string | null;
  images: CatalogImage[];
};

export type BookCardViewModel = {
  id?: string;
  title: string;
  slug?: string;
  subtitle?: string | null;
  author?: string | null;
  year?: string | null;
  price: number | null;
  rating?: number | null;
  isNew?: boolean;
  description?: string | null;
  images: CatalogImage[];
};

export function getPrimaryCatalogImage(images: CatalogImage[]): CatalogImage | null {
  return images.find(image => image.isPrimary) ?? images[0] ?? null;
}

export function formatCatalogPrice(price: number | null): string {
  if (price == null) return 'Liên hệ';
  return price.toLocaleString('vi-VN') + 'đ';
}
