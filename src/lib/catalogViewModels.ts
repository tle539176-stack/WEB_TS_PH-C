import type { BookWithImages, ProductWithImages } from '@/types/database';
import type { BookCardViewModel, CatalogImage, ProductCardViewModel } from '@/components/catalog/catalogTypes';

type ImageLike = {
  url: string;
  alt: string;
  is_primary?: boolean;
  isPrimary?: boolean;
};

export function toCatalogImages(images: ImageLike[] = []): CatalogImage[] {
  return images.map(image => ({
    url: image.url,
    alt: image.alt,
    isPrimary: image.isPrimary ?? image.is_primary ?? false,
  }));
}

export function productToCardViewModel(product: ProductWithImages): ProductCardViewModel {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    tag: product.tag,
    brand: product.brand,
    description: product.description,
    images: toCatalogImages(product.product_images),
  };
}

export function bookToCardViewModel(book: BookWithImages): BookCardViewModel {
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    subtitle: book.subtitle,
    author: book.author,
    year: book.year,
    price: book.price,
    rating: book.rating,
    isNew: book.is_new,
    description: book.description,
    images: toCatalogImages(book.book_images),
  };
}
