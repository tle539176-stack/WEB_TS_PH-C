import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, ShoppingBag, UserCheck } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Badge } from '@/components/ui/badge';
import { getNoteBySlug, getRelatedNotes, getRelatedProducts } from '@/services/contentService';
import { buildMedicalWebPageJsonLd } from '@/lib/structuredData';
import type { NoteWithMedicalMeta, NoteWithCategory, ProductWithImages } from '@/types/database';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function getPrimaryImage(product: ProductWithImages): string {
  return product.product_images.find(img => img.is_primary)?.url ?? product.product_images[0]?.url ?? '';
}

function formatPrice(price: number | null): string {
  if (price == null) return 'Liên hệ';
  return `${price.toLocaleString('vi-VN')}đ`;
}

export default function NoteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [note, setNote] = useState<NoteWithMedicalMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [relatedNotes, setRelatedNotes] = useState<NoteWithCategory[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithImages[]>([]);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    getNoteBySlug(slug)
      .then(data => {
        if (!data) { setNotFound(true); return; }
        setNote(data);
        // Fetch related content in parallel
        Promise.all([
          getRelatedNotes(data.category_id, data.id, 3),
          getRelatedProducts(4),
        ]).then(([notes, products]) => {
          setRelatedNotes(notes);
          setRelatedProducts(products);
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A3151] mx-auto" />
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h2 className="public-lead-title mb-4">Không tìm thấy bài viết</h2>
        <Link to="/notes" className="inline-flex items-center gap-2 text-[#0A3151] hover:underline public-small font-medium">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  // Combine structured sources (preferred) with legacy JSONB fallback
  const displaySources = note.note_sources?.length
    ? note.note_sources
    : (note.sources ?? []).map((s, i) => ({
        id: `legacy-${i}`,
        note_id: note.id,
        title: s.title,
        url: s.url,
        publisher: null,
        source_type: 'website' as const,
        doi: null, pmid: null,
        published_at: null,
        accessed_at: s.accessed_at ?? null,
        evidence_level: null,
        notes: null,
        sort_order: i,
        created_at: '', updated_at: '',
      }));

  const jsonLd = buildMedicalWebPageJsonLd(note);
  const pageContainerClass = 'mx-auto w-full max-w-7xl px-4 md:px-8';

  return (
    <div className="pt-28 pb-24 bg-white md:pt-32">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={pageContainerClass}>
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="public-meta flex items-center gap-1.5 mb-8 flex-wrap">
            <Link to="/" className="hover:text-[#2F6F5E] transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <Link to="/notes" className="hover:text-[#2F6F5E] transition-colors">Bộ Ghi Chú</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
            <span className="opacity-60 line-clamp-1">{note.title}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header: Category + Title */}
            <div className="space-y-4 max-w-4xl">
              {note.categories?.name && (
                <Badge className="bg-[#0A3151]/10 text-[#0A3151] hover:bg-[#0A3151]/20 border-none px-4 py-1 shadow-sm">
                  {note.categories.name}
                </Badge>
              )}
              <h1 className="public-section-title public-article-title">
                {note.title}
              </h1>
            </div>

            {/* Cover Image */}
            {note.cover_image_url && (
              <div className="overflow-hidden border border-neutral-100 shadow-xl aspect-[16/9] md:aspect-[21/9]">
                <img src={note.cover_image_url} alt={note.cover_alt || note.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Main grid: Content + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-10 pt-4">
              {/* LEFT: Article Content */}
              <div>
                {note.content ? (
                  <div
                    className="prose prose-neutral public-body public-muted-text max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
                  />
                ) : (
                  <p className="text-neutral-400 italic">Chưa có nội dung.</p>
                )}

                {/* Doctor's advice quote */}
                <div className="mt-14 p-8 bg-[#0A3151]/5 border-l-4 border-[#0A3151] relative">
                  <div className="absolute top-0 left-6 -translate-y-1/2 w-10 h-10 bg-[#0A3151] flex items-center justify-center shadow-lg">
                    <span className="text-white text-3xl font-serif leading-none mt-3">"</span>
                  </div>
                  <h3 className="public-card-title mb-2">Lời khuyên từ Bác sĩ:</h3>
                  <p className="public-body public-muted-text public-title-summary italic">
                    "Sức khỏe không phải là thứ chúng ta có thể mua được, nhưng nó là một tài khoản tiết kiệm vô cùng quý giá. Hãy bắt đầu chăm sóc nó ngay từ hôm nay bằng những thói quen nhỏ nhất."
                  </p>
                </div>

                {/* References section */}
                {displaySources.length > 0 && (
                  <div className="mt-8 p-8 bg-white border border-neutral-100 shadow-sm">
                    <h3 className="public-card-title mb-5 text-[#0A3151]">Tài liệu tham khảo</h3>
                    <ol className="space-y-4 list-decimal list-outside ml-5">
                      {displaySources.map((src, i) => (
                        <li key={src.id ?? i} className="public-small pl-1 text-neutral-600">
                          <div className="space-y-0.5">
                            {src.url ? (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[#0A3151] underline font-medium"
                              >
                                {src.title}
                              </a>
                            ) : (
                              <span className="font-medium">{src.title}</span>
                            )}
                            <div className="public-meta flex flex-wrap gap-x-3 text-neutral-400">
                              {src.publisher && <span>{src.publisher}</span>}
                              {src.published_at && <span>{src.published_at}</span>}
                              {src.doi && (
                                <a href={`https://doi.org/${src.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#0A3151]">
                                  DOI: {src.doi}
                                </a>
                              )}
                              {src.pmid && (
                                <a href={`https://pubmed.ncbi.nlm.nih.gov/${src.pmid}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#0A3151]">
                                  PMID: {src.pmid}
                                </a>
                              )}
                              {src.accessed_at && <span>Truy cập: {src.accessed_at}</span>}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Medical disclaimer */}
                <div className="mt-8 p-5 bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="public-small space-y-1 text-amber-900">
                      <p className="font-bold">Tuyên bố miễn trách y tế</p>
                      <p className="leading-relaxed text-amber-800">
                        Nội dung bài viết chỉ mang tính chất thông tin giáo dục sức khỏe, không thay thế lời khuyên y tế, chẩn đoán hoặc điều trị từ bác sĩ có chuyên môn.
                        Vui lòng tham khảo ý kiến bác sĩ trước khi đưa ra quyết định về sức khỏe.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile: Related Products (horizontal scroll) */}
                {relatedProducts.length > 0 && (
                  <div className="mt-10 lg:hidden">
                    <h3 className="public-card-title uppercase text-[#0A3151] mb-1.5">Sản phẩm liên quan</h3>
                    <div className="h-[3px] w-12 bg-[#C79A3D] mb-5" />
                    <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory">
                      {relatedProducts.map(product => {
                        const image = getPrimaryImage(product);
                        return (
                          <Link
                            key={product.id}
                            to={`/products/${product.slug}`}
                            className="group flex-none w-[200px] snap-start border border-[var(--public-border)] bg-white shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="aspect-[4/3] overflow-hidden bg-[linear-gradient(160deg,#f6f8fb_0%,#e9edf4_100%)]">
                              {image ? (
                                <img src={image} alt={product.name} className="h-full w-full object-contain p-2" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-neutral-300">
                                  <ShoppingBag className="h-8 w-8" />
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <p className="public-compact-title public-article-title line-clamp-2 mb-1">{product.name}</p>
                              <p className="public-meta public-muted-text mb-1">{product.brand || 'Dr. Phuc Collection'}</p>
                              <p className="public-small font-bold text-[#0A3151]">{formatPrice(product.price)}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mobile: Related Notes */}
                {relatedNotes.length > 0 && (
                  <div className="mt-10 lg:hidden">
                    <h3 className="public-card-title uppercase text-[#0A3151] mb-1.5">Bài viết liên quan</h3>
                    <div className="h-[3px] w-12 bg-[#C79A3D] mb-5" />
                    <div className="space-y-4">
                      {relatedNotes.map(related => (
                        <Link
                          key={related.id}
                          to={`/notes/${related.slug}`}
                          className="group grid grid-cols-[68px_minmax(0,1fr)] gap-3 border-b border-[var(--public-border)] pb-4 last:border-b-0 last:pb-0"
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-[var(--public-warm-ivory)]">
                            {related.cover_image_url && (
                              <img src={related.cover_image_url} alt={related.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="public-compact-title public-article-title line-clamp-2 transition-colors">{related.title}</h4>
                            <p className="public-meta public-muted-text mt-1">{formatDate(related.published_at)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Sidebar (desktop only) */}
              <aside className="hidden lg:block">
                <div className="sticky top-28 space-y-8">
                  {/* Related Products */}
                  {relatedProducts.length > 0 && (
                    <section className="border border-[var(--public-border)] bg-white p-5 shadow-[0_22px_48px_-34px_rgba(10,49,81,0.35)]">
                      <h3 className="public-card-title uppercase text-[#0A3151] mb-1.5">Sản phẩm liên quan</h3>
                      <div className="h-[3px] w-12 bg-[#C79A3D] mb-5" />
                      <div className="space-y-4">
                        {relatedProducts.slice(0, 2).map(product => {
                          const image = getPrimaryImage(product);
                          return (
                            <Link
                              key={product.id}
                              to={`/products/${product.slug}`}
                              className="group block border border-[var(--public-border)] bg-white hover:shadow-md transition-shadow"
                            >
                              <div className="aspect-[4/3] overflow-hidden bg-[linear-gradient(160deg,#f6f8fb_0%,#e9edf4_100%)]">
                                {image ? (
                                  <img src={image} alt={product.name} className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-neutral-300">
                                    <ShoppingBag className="h-8 w-8" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3.5">
                                <p className="public-card-title public-article-title line-clamp-2 mb-1">{product.name}</p>
                                <p className="public-meta public-muted-text mb-1">{product.brand || 'Dr. Phuc Collection'}</p>
                                <p className="public-meta public-gold-text mb-2">{'★'.repeat(5)} <span className="public-muted-text">(4.8)</span></p>
                                <p className="public-small font-bold text-[#0A3151] mb-3">{formatPrice(product.price)}</p>
                                <span className="block text-center public-small font-bold text-white bg-[#0A3151] hover:bg-[#0A3151]/90 px-4 py-2.5 transition-colors">
                                  Xem chi tiết
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Related Notes */}
                  {relatedNotes.length > 0 && (
                    <section className="border border-[var(--public-border)] bg-white p-5 shadow-[0_22px_48px_-34px_rgba(10,49,81,0.35)]">
                      <h3 className="public-card-title uppercase text-[#0A3151] mb-1.5">Bài viết liên quan</h3>
                      <div className="h-[3px] w-12 bg-[#C79A3D] mb-5" />
                      <div className="space-y-4">
                        {relatedNotes.map(related => (
                          <Link
                            key={related.id}
                            to={`/notes/${related.slug}`}
                            className="group grid grid-cols-[68px_minmax(0,1fr)] gap-3 border-b border-[var(--public-border)] pb-4 last:border-b-0 last:pb-0"
                          >
                            <div className="aspect-[4/3] overflow-hidden bg-[var(--public-warm-ivory)]">
                              {related.cover_image_url && (
                                <img src={related.cover_image_url} alt={related.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="public-compact-title public-article-title line-clamp-2 transition-colors">{related.title}</h4>
                              <p className="public-meta public-muted-text mt-1">{formatDate(related.published_at)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </aside>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
