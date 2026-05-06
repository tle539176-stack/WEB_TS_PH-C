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
      .catch(() => { })
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
        <div className="mb-12 flex flex-col items-start justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <h1 className="mb-6 text-[34px] font-serif font-bold leading-tight lg:text-5xl">Ghi Chú Chống Lão Hóa</h1>
            <p className="text-neutral-600">Những bài viết chuyên sâu về y học, sức khỏe và bí quyết duy trì sự trẻ trung từ Bác sĩ Wynn Tran.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              className="pl-10 rounded-full border-neutral-200 focus:ring-[#0A3151] bg-neutral-50 hover:bg-neutral-100 transition-colors"
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
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
                    <div className="overflow-hidden rounded-2xl bg-neutral-100 shadow-sm aspect-[4/3] transition-shadow group-hover:shadow-md lg:col-span-2">
                      {note.cover_image_url && (
                        <img
                          src={note.cover_image_url}
                          alt={note.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center lg:col-span-3">
                      <div className="flex items-center gap-4 mb-4">
                        {note.categories?.name && (
                          <Badge variant="secondary" className="bg-[#0A3151]/10 text-[#0A3151] hover:bg-[#0A3151]/20 border-none rounded-full px-3">
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
              <div className="flex flex-wrap gap-2 pt-2">
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="px-4 py-2 rounded-full cursor-pointer hover:bg-[#0A3151] hover:text-white transition-all shadow-sm"
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

            <Card className="bg-gradient-to-br from-[#0A3151] to-[#1A252F] border-none p-8 rounded-3xl shadow-xl text-white">
              <CardContent className="p-0 text-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 text-white border border-white/20">
                  <Tag className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif mb-4">Tải E-book miễn phí</h3>
                <p className="text-sm text-white/80 mb-8 leading-relaxed">Cẩm nang 10 bước bảo vệ sức khỏe tim mạch tại nhà chuẩn y khoa.</p>
                <Button className="w-full bg-white hover:bg-neutral-100 text-[#0A3151] rounded-xl py-6 font-bold text-lg shadow-lg hover:shadow-xl transition-all">
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
