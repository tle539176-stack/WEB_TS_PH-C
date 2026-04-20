import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getNoteBySlug } from '@/services/contentService';
import type { NoteWithCategory } from '@/types/database';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function NoteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [note, setNote] = useState<NoteWithCategory | null>(null);
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
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h2>
        <Link to="/notes"><Button variant="outline">Quay lại danh sách</Button></Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container mx-auto px-4">
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
                <Badge className="bg-[#0A3151]/10 text-[#0A3151] hover:bg-[#0A3151]/20 border-none px-4 py-1">
                  {note.categories.name}
                </Badge>
              )}
              <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-[#1A1A1A]">
                {note.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500 py-4 border-y border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-neutral-200 overflow-hidden">
                    <img src="https://picsum.photos/seed/dr/100/100" alt="Dr. Wynn Tran" />
                  </div>
                  <span className="font-bold text-[#1A1A1A]">Dr. Wynn Tran</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(note.published_at)}
                </div>
                {note.read_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {note.read_time} đọc
                  </div>
                )}
                <Button variant="ghost" size="sm" className="ml-auto gap-2 text-neutral-500">
                  <Share2 className="w-4 h-4" /> Chia sẻ
                </Button>
              </div>
            </div>

            {note.cover_image_url && (
              <div className="overflow-hidden aspect-[21/9] shadow-lg">
                <img src={note.cover_image_url} alt={(note as typeof note & { cover_alt?: string }).cover_alt || note.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-8">
              <div className="lg:col-span-3">
                {note.content ? (
                  <div
                    className="prose prose-neutral prose-lg max-w-none text-neutral-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
                  />
                ) : (
                  <p className="text-neutral-400 italic">Chưa có nội dung.</p>
                )}

                <div className="mt-16 p-8 bg-white border border-neutral-100">
                  <h3 className="text-xl font-bold font-serif mb-4">Lời khuyên từ Bác sĩ:</h3>
                  <p className="italic text-neutral-600">
                    "Sức khỏe không phải là thứ chúng ta có thể mua được, nhưng nó là một tài khoản tiết kiệm vô cùng quý giá. Hãy bắt đầu chăm sóc nó ngay từ hôm nay bằng những thói quen nhỏ nhất."
                  </p>
                </div>

                {note.sources && note.sources.length > 0 && (
                  <div className="mt-8 p-6 bg-neutral-50 border border-neutral-100">
                    <h3 className="font-bold font-serif mb-4">Tài liệu tham khảo</h3>
                    <ul className="space-y-2">
                      {note.sources.map((src, i) => (
                        <li key={i} className="text-sm text-neutral-600">
                          <a href={src.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#0A3151] underline">
                            {src.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-10">
                <section>
                  <h3 className="text-lg font-bold font-serif mb-4 pb-2 border-b border-neutral-100">Bài viết liên quan</h3>
                  <p className="text-sm text-neutral-400">Đang cập nhật...</p>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
