import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { getPublishedNotesWithCategory } from '@/services/contentService';
import type { NoteWithCategory } from '@/types/database';

type CategoryTone = {
  bg: string;
  hover: string;
};

const CATEGORY_TONES: Record<string, CategoryTone> = {
  'Chống lão hóa': { bg: 'bg-[#0A3151]', hover: 'hover:bg-[#123f66]' },
  'Thực phẩm bổ sung': { bg: 'bg-[#168C8C]', hover: 'hover:bg-[#0f7474]' },
  'Dinh dưỡng': { bg: 'bg-[#4A9448]', hover: 'hover:bg-[#3b7e3a]' },
  'Da và chống nắng': { bg: 'bg-[#E56E55]', hover: 'hover:bg-[#cf5d45]' },
  'Tầm soát sức khỏe': { bg: 'bg-[#7C4A9E]', hover: 'hover:bg-[#683b86]' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function getCategoryTone(categoryName?: string | null): CategoryTone {
  return CATEGORY_TONES[categoryName ?? ''] ?? { bg: 'bg-[#0A3151]', hover: 'hover:bg-[#123f66]' };
}

export default function Notes() {
  const [notes, setNotes] = useState<NoteWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    getPublishedNotesWithCategory()
      .then(setNotes)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(notes.map(n => n.categories?.name).filter(Boolean))] as string[];

  const query = search.trim().toLowerCase();
  const filtered = notes.filter(n => {
    const matchesSearch = !query ||
      n.title.toLowerCase().includes(query) ||
      (n.excerpt ?? '').toLowerCase().includes(query) ||
      (n.categories?.name ?? '').toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'all' || n.categories?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const leadNote = filtered[0] ?? null;
  const cardNotes = filtered.slice(1);
  const latestNotes = notes.slice(0, 3);
  const pageContainerClass = 'mx-auto w-full max-w-7xl px-4 md:px-8';
  const renderSearch = () => (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <Input
        placeholder="Tìm kiếm bài viết..."
        className="public-small h-12 rounded-[4px] border-[var(--public-border)] bg-white pl-11 shadow-none transition-colors hover:bg-[var(--public-warm-ivory)] focus:ring-[#0A3151]"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
  );
  const renderCategoryPills = (mobile = false) => (
    <div className={mobile ? 'flex gap-2 overflow-x-auto pb-1' : 'flex flex-col items-start gap-2'}>
      {categories.map(cat => {
        const tone = getCategoryTone(cat);
        const active = selectedCategory === cat;
        return (
          <button
            key={cat}
            type="button"
            className={`public-on-blue public-small shrink-0 rounded-[4px] px-3 py-2 font-medium text-white shadow-sm transition-all ${tone.bg} ${tone.hover} ${active ? 'ring-2 ring-[#C79A3D]/60 ring-offset-2' : ''}`}
            onClick={() => setSelectedCategory(active ? 'all' : cat)}
          >
            {cat}
          </button>
        );
      })}
      {categories.length === 0 && !loading && (
        <p className="public-small public-muted-text">Chưa có chuyên mục.</p>
      )}
    </div>
  );

  return (
    <div className="bg-[linear-gradient(180deg,#F3F8FC_0%,#FFFFFF_52%)] pt-24 pb-20 md:pt-28 md:pb-24">
      <div className={pageContainerClass}>
        <header className="mb-8 max-w-[760px] text-left md:mb-10">
          <h1 className="public-listing-title uppercase text-[var(--public-navy)]">
            Bộ Ghi Chú Chống Lão Hóa
          </h1>
          <p className="public-section-summary public-muted-text mt-4 max-w-[720px]">
            Các ghi chú y khoa được hệ thống từ nội dung bác sĩ Phúc chia sẻ, giúp người đọc xem nhanh, đọc sâu và tra cứu rõ ràng hơn.
          </p>
        </header>

        <div className="mb-7 space-y-5 lg:hidden">
          {renderSearch()}
          <section>
            <h3 className="public-card-title mb-3 uppercase text-[var(--public-navy)]">Chuyên mục</h3>
            {renderCategoryPills(true)}
          </section>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <main className="space-y-6">
            {loading && <p className="public-small py-12 text-center text-neutral-400">Đang tải...</p>}
            {!loading && !leadNote && (
              <p className="public-small py-12 text-center text-neutral-400">Chưa có bài viết nào.</p>
            )}
            {leadNote && (
              <motion.article initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                <Link to={`/notes/${leadNote.slug}`} className="group block">
                  <div className="relative min-h-[340px] overflow-hidden rounded-[6px] border border-white/30 bg-[var(--public-navy)] shadow-[0_20px_45px_-24px_rgba(10,49,81,0.7)] md:min-h-[420px]">
                    {leadNote.cover_image_url && (
                      <img
                        src={leadNote.cover_image_url}
                        alt={leadNote.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.48)_48%,rgba(0,0,0,0.86)_100%)]" />
                    <div className="public-on-blue absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                      {leadNote.categories?.name && (
                        <span className={`public-small inline-flex rounded-[4px] px-3 py-2 font-medium text-white ${getCategoryTone(leadNote.categories.name).bg}`}>
                          {leadNote.categories.name}
                        </span>
                      )}
                      <h2 className="public-lead-title mt-4 max-w-2xl text-white">
                        {leadNote.title}
                      </h2>
                      {leadNote.excerpt && (
                        <p className="public-body mt-3 max-w-xl text-white/88">
                          {leadNote.excerpt}
                        </p>
                      )}
                      <div className="public-small mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-white/85">
                          {leadNote.read_time && <><Clock className="h-4 w-4" /> {leadNote.read_time} đọc</>}
                          {leadNote.read_time && leadNote.published_at && <span>·</span>}
                          {leadNote.published_at && <span>{formatDate(leadNote.published_at)}</span>}
                        </span>
                        <span className="public-gold-text inline-flex items-center gap-1 font-bold">
                          Đọc thêm <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {cardNotes.map((note, i) => {
                const categoryName = note.categories?.name;
                const tone = getCategoryTone(categoryName);
                return (
                  <motion.article
                    key={note.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i + 1) * 0.05 }}
                    className="group h-full"
                  >
                    <Link to={`/notes/${note.slug}`} className="block h-full">
                      <div className="flex h-full flex-col overflow-hidden rounded-[6px] border border-[var(--public-border)] bg-white shadow-[0_18px_35px_-28px_rgba(10,49,81,0.55)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_44px_-28px_rgba(10,49,81,0.72)]">
                        <div className="aspect-[16/9] overflow-hidden bg-[var(--public-warm-ivory)]">
                          {note.cover_image_url && (
                            <img
                              src={note.cover_image_url}
                              alt={note.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            {categoryName && (
                              <span className={`public-on-blue public-meta rounded-[4px] px-3 py-1.5 font-medium text-white ${tone.bg}`}>
                                {categoryName}
                              </span>
                            )}
                            {note.published_at && (
                              <span className="public-meta inline-flex items-center gap-1 text-neutral-400">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(note.published_at)}
                              </span>
                            )}
                          </div>
                          <h2 className="public-card-title public-article-title transition-colors">
                            {note.title}
                          </h2>
                          {note.excerpt && (
                            <p className="public-small public-muted-text mt-3 line-clamp-3">{note.excerpt}</p>
                          )}
                          <div className="mt-auto flex items-center justify-between pt-5">
                            <span className="public-meta inline-flex items-center gap-1 text-neutral-400">
                              <Clock className="h-3.5 w-3.5" />
                              {note.read_time ? `${note.read_time} đọc` : 'Bài viết'}
                            </span>
                            <span className="public-small public-gold-text inline-flex items-center gap-1 font-bold">
                              Đọc thêm <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </main>

          <aside className="hidden rounded-[6px] border border-[var(--public-border)] bg-white p-6 shadow-[0_22px_48px_-34px_rgba(10,49,81,0.45)] lg:block lg:sticky lg:top-28">
            <div className="space-y-9">
              {renderSearch()}
              <section>
                <h3 className="public-card-title mb-4 uppercase text-[var(--public-navy)]">Chuyên mục</h3>
                <div className="h-1 w-16 bg-[#C79A3D] mb-5" />
                {renderCategoryPills()}
              </section>
              <section>
                <h3 className="public-card-title mb-4 uppercase text-[var(--public-navy)]">Bài viết mới</h3>
                <div className="h-1 w-16 bg-[#C79A3D] mb-5" />
                <div className="space-y-4">
                  {latestNotes.map(note => (
                    <Link key={note.id} to={`/notes/${note.slug}`} className="group grid grid-cols-[74px_minmax(0,1fr)] gap-3 border-b border-[var(--public-border)] pb-4 last:border-b-0 last:pb-0">
                      <div className="aspect-[4/3] overflow-hidden rounded-[4px] bg-[var(--public-warm-ivory)]">
                        {note.cover_image_url && (
                          <img src={note.cover_image_url} alt={note.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="public-compact-title public-article-title line-clamp-2 transition-colors">{note.title}</h4>
                        <p className="public-meta public-muted-text mt-1">{formatDate(note.published_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
