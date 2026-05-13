import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, Share2, ShieldCheck, UserCheck } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getNoteBySlug } from '@/services/contentService';
import { buildMedicalWebPageJsonLd } from '@/lib/structuredData';
import type { NoteWithMedicalMeta } from '@/types/database';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function formatDateLong(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function NoteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [note, setNote] = useState<NoteWithMedicalMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    getNoteBySlug(slug)
      .then(data => { if (!data) setNotFound(true); else setNote(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="pt-40 pb-24 text-center text-neutral-400">Đang tải...</div>;
  }

  if (notFound || !note) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h2 className="public-lead-title mb-4">Không tìm thấy bài viết</h2>
        <Link to="/notes"><Button variant="outline">Quay lại danh sách</Button></Link>
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

  const reviewerPerson = note.reviewer;
  const authorPerson = note.author;
  const pageContainerClass = 'mx-auto w-full max-w-7xl px-4 md:px-8';

  return (
    <div className="pt-32 pb-24 bg-white">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={pageContainerClass}>
        <div className="max-w-4xl mx-auto">
          <Link to="/notes" className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#0A3151] transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại danh sách
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              {note.categories?.name && (
                <Badge className="bg-[#0A3151]/10 text-[#0A3151] hover:bg-[#0A3151]/20 border-none px-4 py-1 rounded-full shadow-sm">
                  {note.categories.name}
                </Badge>
              )}
              <h1 className="public-section-title public-article-title">
                {note.title}
              </h1>

              {/* Meta bar */}
              <div className="public-small flex flex-wrap items-center gap-6 border-y border-neutral-100 py-4 text-neutral-500">
                {/* Author or reviewer avatar */}
                <div className="flex items-center gap-3">
                  <div className="public-small flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-neutral-200 font-bold text-neutral-500 shadow-sm">
                    {authorPerson
                      ? authorPerson.display_name[0].toUpperCase()
                      : reviewerPerson
                        ? reviewerPerson.display_name[0].toUpperCase()
                        : 'Dr'}
                  </div>
                  <div>
                    {authorPerson && (
                    <p className="public-small font-bold text-[#1A1A1A]">{authorPerson.display_name}</p>
                    )}
                    {authorPerson?.professional_title && (
                      <p className="public-meta text-neutral-400">{authorPerson.professional_title}</p>
                    )}
                    {!authorPerson && reviewerPerson && (
                      <p className="public-small font-bold text-[#1A1A1A]">{reviewerPerson.display_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  {formatDate(note.published_at)}
                </div>
                {note.read_time && (
                  <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    {note.read_time} đọc
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full gap-2 text-neutral-600 rounded-full hover:bg-neutral-50 sm:ml-auto sm:w-auto">
                  <Share2 className="w-4 h-4" /> Chia sẻ bài viết
                </Button>
              </div>

              {/* Medical review info bar */}
              {(reviewerPerson || note.reviewed_at) && (
                <div className="public-meta flex flex-wrap items-center gap-4 rounded-xl border border-[#0A3151]/10 bg-[#0A3151]/5 px-5 py-3">
                  <ShieldCheck className="w-4 h-4 text-[#0A3151] shrink-0" />
                  {reviewerPerson && (
                    <div>
                      <span className="text-neutral-500">Reviewer y tế: </span>
                      <span className="font-bold text-[#0A3151]">{reviewerPerson.display_name}</span>
                      {reviewerPerson.credentials && <span className="text-neutral-500 ml-1">({reviewerPerson.credentials})</span>}
                      {reviewerPerson.professional_title && <span className="text-neutral-400 ml-1">· {reviewerPerson.professional_title}</span>}
                    </div>
                  )}
                  {note.reviewed_at && (
                    <div>
                      <span className="text-neutral-500">Ngày review: </span>
                      <span className="font-medium text-neutral-700">{formatDateLong(note.reviewed_at)}</span>
                    </div>
                  )}
                  {note.next_review_at && (
                    <div>
                      <span className="text-neutral-500">Review tiếp theo: </span>
                      <span className={`font-medium ${new Date(note.next_review_at) < new Date() ? 'text-red-600' : 'text-neutral-700'}`}>
                        {formatDateLong(note.next_review_at)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {note.cover_image_url && (
              <div className="overflow-hidden rounded-3xl border border-neutral-100 shadow-xl aspect-[4/3] md:aspect-[21/9]">
                <img src={note.cover_image_url} alt={note.cover_alt || note.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-8">
              <div className="lg:col-span-3">
                {note.content ? (
                  <div
                    className="prose prose-neutral public-body public-muted-text max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
                  />
                ) : (
                  <p className="text-neutral-400 italic">Chưa có nội dung.</p>
                )}

                <div className="mt-16 p-8 bg-neutral-50 rounded-3xl border border-neutral-100 relative">
                  <div className="absolute top-0 left-8 -translate-y-1/2 w-12 h-12 bg-[#0A3151] rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-4xl font-serif leading-none mt-4">"</span>
                  </div>
                  <h3 className="public-card-title">Lời khuyên từ Bác sĩ:</h3>
                  <p className="public-body public-muted-text public-title-summary italic">
                    "Sức khỏe không phải là thứ chúng ta có thể mua được, nhưng nó là một tài khoản tiết kiệm vô cùng quý giá. Hãy bắt đầu chăm sóc nó ngay từ hôm nay bằng những thói quen nhỏ nhất."
                  </p>
                </div>

                {/* References section */}
                {displaySources.length > 0 && (
                  <div className="mt-8 p-8 bg-white rounded-3xl border border-neutral-100 shadow-sm">
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
                              {src.evidence_level && src.evidence_level !== 'unknown' && (
                                <span className="public-meta rounded bg-blue-50 px-1.5 py-0.5 font-bold uppercase text-blue-600">
                                  {src.evidence_level}
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Medical disclaimer */}
                <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="public-small space-y-1 text-amber-900">
                      <p className="font-bold">Tuyên bố miễn trách y tế</p>
                      <p className="leading-relaxed text-amber-800">
                        Nội dung bài viết chỉ mang tính chất thông tin giáo dục sức khỏe, không thay thế lời khuyên y tế, chẩn đoán hoặc điều trị từ bác sĩ có chuyên môn.
                        Vui lòng tham khảo ý kiến bác sĩ trước khi đưa ra quyết định về sức khỏe.
                      </p>
                      {reviewerPerson && (
                        <p className="public-meta mt-2 text-amber-700">
                          Bài viết này đã được review bởi <strong>{reviewerPerson.display_name}</strong>
                          {reviewerPerson.credentials ? ` (${reviewerPerson.credentials})` : ''}
                          {note.reviewed_at ? ` vào ${formatDateLong(note.reviewed_at)}` : ''}.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <section>
                  <h3 className="public-card-title border-b border-neutral-100 pb-2">Bài viết liên quan</h3>
                  <p className="public-small public-title-summary text-neutral-400">Đang cập nhật...</p>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
