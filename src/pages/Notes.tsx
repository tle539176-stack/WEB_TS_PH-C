import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, Clock, Tag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPublishedNotesWithCategory } from '@/services/contentService';
import type { NoteWithCategory } from '@/types/database';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function Notes() {
  const [notes, setNotes] = useState<NoteWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPublishedNotesWithCategory()
      .then(setNotes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(notes.map(n => n.categories?.name).filter(Boolean))] as string[];

  const filtered = search
    ? notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        (n.excerpt ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Ghi Chú Chống Lão Hóa</h1>
            <p className="text-neutral-600">Những bài viết chuyên sâu về y học, sức khỏe và bí quyết duy trì sự trẻ trung từ Bác sĩ Wynn Tran.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              className="pl-10 border-neutral-200 focus:ring-[#0A3151]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {loading && <p className="text-neutral-400 text-center py-12">Đang tải...</p>}
            {!loading && filtered.length === 0 && (
              <p className="text-neutral-400 text-center py-12">Chưa có bài viết nào.</p>
            )}
            {filtered.map((note, i) => (
              <motion.article
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group cursor-pointer"
              >
                <Link to={`/notes/${note.slug}`}>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="md:col-span-2 overflow-hidden aspect-[4/3] bg-neutral-100">
                      {note.cover_image_url && (
                        <img
                          src={note.cover_image_url}
                          alt={note.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="md:col-span-3 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-4">
                        {note.categories?.name && (
                          <Badge variant="secondary" className="bg-[#0A3151]/10 text-[#0A3151] hover:bg-[#0A3151]/20 border-none">
                            {note.categories.name}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-neutral-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(note.published_at)}
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold font-serif mb-4 group-hover:text-[#0A3151] transition-colors">
                        {note.title}
                      </h2>
                      <p className="text-neutral-600 mb-6 line-clamp-2 leading-relaxed">
                        {note.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        {note.read_time && (
                          <div className="flex items-center gap-1 text-xs text-neutral-400">
                            <Clock className="w-3 h-3" />
                            {note.read_time} đọc
                          </div>
                        )}
                        <span className="flex items-center gap-1 text-sm font-bold text-[#0A3151]">
                          Đọc thêm <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          <div className="space-y-10">
            <section>
              <h3 className="text-xl font-bold font-serif mb-6 pb-2 border-b-2 border-[#0A3151] inline-block">Chuyên mục</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="px-4 py-2 cursor-pointer hover:bg-[#0A3151] hover:text-white transition-colors"
                    onClick={() => setSearch(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
                {categories.length === 0 && !loading && (
                  <p className="text-sm text-neutral-400">Chưa có chuyên mục.</p>
                )}
              </div>
            </section>

            <Card className="bg-white border-none p-8">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-white flex items-center justify-center mx-auto mb-6 text-[#0A3151]">
                  <Tag className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-serif mb-4">Tải E-book miễn phí</h3>
                <p className="text-sm text-neutral-600 mb-6">Cẩm nang 10 bước bảo vệ sức khỏe tim mạch tại nhà.</p>
                <Button className="w-full bg-[#0A3151] hover:bg-[#0D426E] text-white">
                  Tải ngay
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
