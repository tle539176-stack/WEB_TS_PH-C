import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, BookOpen, CalendarDays, FileText,
  GraduationCap, ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FacebookVideoStrip } from '@/components/home/FacebookVideoStrip';
import {
  getPublishedBooks, getPublishedNotesWithCategory,
} from '@/services/contentService';
import { DEFAULT_SETTINGS, getSiteSettings, type SiteSettings } from '@/services/settingsService';
import { getHomeVideos } from '@/services/videoService';
import type { BookWithImages, NoteWithCategory, Video } from '@/types/database';

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1887&auto=format&fit=crop';

type DisplayNote = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryName: string;
  publishedAt: string | null;
  coverImageUrl: string | null;
  isDemo?: boolean;
};

type DisplayBook = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string | null;
  isDemo?: boolean;
};

const DEMO_NOTES: DisplayNote[] = [
  {
    id: 'demo-note-1',
    title: 'Chống lão hóa bắt đầu từ giấc ngủ và nhịp sinh học',
    slug: 'demo-chong-lao-hoa-giac-ngu',
    excerpt: 'Ghi chú mẫu về cách giấc ngủ, ánh sáng và lịch sinh hoạt ảnh hưởng đến sức khỏe lâu dài.',
    categoryName: 'Chống lão hóa',
    publishedAt: '2026-05-01',
    coverImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
    isDemo: true,
  },
  {
    id: 'demo-note-2',
    title: 'Omega-3: khi nào nên bổ sung và khi nào cần thận trọng',
    slug: 'demo-omega-3',
    excerpt: 'Ghi chú mẫu giúp người đọc hiểu đúng hơn về omega-3, liều dùng và các điểm cần hỏi nhân viên y tế.',
    categoryName: 'Thực phẩm bổ sung',
    publishedAt: '2026-04-24',
    coverImageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=1200&auto=format&fit=crop',
    isDemo: true,
  },
  {
    id: 'demo-note-3',
    title: 'Protein sau tuổi 40: ăn bao nhiêu là vừa đủ',
    slug: 'demo-protein-sau-tuoi-40',
    excerpt: 'Ghi chú mẫu về vai trò của protein với cơ, chuyển hóa và sức khỏe khi tuổi tăng dần.',
    categoryName: 'Dinh dưỡng',
    publishedAt: '2026-04-18',
    coverImageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop',
    isDemo: true,
  },
  {
    id: 'demo-note-4',
    title: 'Chống nắng đúng cách: SPF, PA và những hiểu lầm thường gặp',
    slug: 'demo-chong-nang-dung-cach',
    excerpt: 'Ghi chú mẫu tóm tắt cách đọc nhãn chống nắng và các lỗi thường gặp khi sử dụng hằng ngày.',
    categoryName: 'Da và chống nắng',
    publishedAt: '2026-04-10',
    coverImageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1200&auto=format&fit=crop',
    isDemo: true,
  },
  {
    id: 'demo-note-5',
    title: 'Tầm soát sức khỏe định kỳ: nên chuẩn bị câu hỏi gì',
    slug: 'demo-tam-soat-suc-khoe',
    excerpt: 'Ghi chú mẫu về cách chuẩn bị trước khi đi khám, giúp buổi trao đổi với bác sĩ hiệu quả hơn.',
    categoryName: 'Tầm soát sức khỏe',
    publishedAt: '2026-04-02',
    coverImageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop',
    isDemo: true,
  },
];

const DEMO_BOOKS: DisplayBook[] = [
  {
    id: 'demo-book-1',
    title: 'Ghi Chú Chống Lão Hóa',
    slug: 'demo-ghi-chu-chong-lao-hoa',
    description: 'Tài liệu mẫu hệ thống các chủ đề nền tảng về chống lão hóa, dinh dưỡng và lối sống.',
    coverUrl: null,
    isDemo: true,
  },
  {
    id: 'demo-book-2',
    title: 'Dinh Dưỡng Thực Hành',
    slug: 'demo-dinh-duong-thuc-hanh',
    description: 'Tài liệu mẫu giúp người đọc hiểu cách đọc nhãn, chọn thực phẩm và chuẩn bị câu hỏi khi cần tư vấn.',
    coverUrl: null,
    isDemo: true,
  },
  {
    id: 'demo-book-3',
    title: 'Sức Khỏe Bền Vững',
    slug: 'demo-suc-khoe-ben-vung',
    description: 'Tài liệu mẫu về thói quen, giấc ngủ, vận động và các yếu tố nền của sức khỏe lâu dài.',
    coverUrl: null,
    isDemo: true,
  },
  {
    id: 'demo-book-4',
    title: 'Tủ Sách Y Khoa Dễ Hiểu',
    slug: 'demo-tu-sach-y-khoa-de-hieu',
    description: 'Tài liệu mẫu gom các chủ đề sức khỏe thường gặp theo cách đọc ngắn gọn và có hệ thống.',
    coverUrl: null,
    isDemo: true,
  },
];

const DEMO_VIDEOS: Video[] = [
  {
    id: 'demo-video-1',
    title: 'Chống lão hóa nên bắt đầu từ đâu?',
    video_url: '#demo-video-1',
    thumbnail_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=900&auto=format&fit=crop',
    description: 'Video mẫu dạng dọc cho nhóm chủ đề chống lão hóa.',
    category: 'Chống lão hóa',
    duration: '01:12',
    source: 'facebook',
    sort_order: 1,
    is_featured: true,
    is_active: true,
    created_at: '2026-05-01',
    updated_at: '2026-05-01',
  },
  {
    id: 'demo-video-2',
    title: 'Có nên uống dầu cá mỗi ngày?',
    video_url: '#demo-video-2',
    thumbnail_url: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=900&auto=format&fit=crop',
    description: 'Video mẫu về thực phẩm bổ sung và cách đọc kỹ trước khi dùng.',
    category: 'Thực phẩm bổ sung',
    duration: '00:58',
    source: 'facebook',
    sort_order: 2,
    is_featured: false,
    is_active: true,
    created_at: '2026-04-24',
    updated_at: '2026-04-24',
  },
  {
    id: 'demo-video-3',
    title: 'Protein quan trọng thế nào sau tuổi 40?',
    video_url: '#demo-video-3',
    thumbnail_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=900&auto=format&fit=crop',
    description: 'Video mẫu về dinh dưỡng, cơ và chuyển hóa.',
    category: 'Dinh dưỡng',
    duration: '01:06',
    source: 'facebook',
    sort_order: 3,
    is_featured: false,
    is_active: true,
    created_at: '2026-04-18',
    updated_at: '2026-04-18',
  },
  {
    id: 'demo-video-4',
    title: 'Chọn kem chống nắng cần nhìn thông số nào?',
    video_url: '#demo-video-4',
    thumbnail_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=900&auto=format&fit=crop',
    description: 'Video mẫu về chống nắng và cách đọc nhãn sản phẩm.',
    category: 'Da và chống nắng',
    duration: '00:49',
    source: 'facebook',
    sort_order: 4,
    is_featured: false,
    is_active: true,
    created_at: '2026-04-10',
    updated_at: '2026-04-10',
  },
  {
    id: 'demo-video-5',
    title: 'Đi khám định kỳ nên hỏi bác sĩ điều gì?',
    video_url: '#demo-video-5',
    thumbnail_url: 'https://images.unsplash.com/photo-1576765607924-6f3d5f6f5f1c?q=80&w=900&auto=format&fit=crop',
    description: 'Video mẫu về chuẩn bị trước khi trao đổi với nhân viên y tế.',
    category: 'Tầm soát sức khỏe',
    duration: '01:20',
    source: 'facebook',
    sort_order: 5,
    is_featured: false,
    is_active: true,
    created_at: '2026-04-02',
    updated_at: '2026-04-02',
  },
];

function getPrimaryImageUrl(images?: { url: string; is_primary: boolean }[]): string {
  return images?.find(image => image.is_primary)?.url ?? images?.[0]?.url ?? '';
}

function formatDate(date: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
}

function toDisplayNote(note: NoteWithCategory): DisplayNote {
  return {
    id: note.id,
    title: note.title,
    slug: note.slug,
    excerpt: note.excerpt || 'Bài viết đang được hệ thống từ nội dung bác sĩ Phúc chia sẻ.',
    categoryName: note.categories?.name ?? 'Ghi chú',
    publishedAt: note.published_at,
    coverImageUrl: note.cover_image_url,
  };
}

function toDisplayBook(book: BookWithImages): DisplayBook {
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    description: book.description || 'Tài liệu đọc sâu hơn từ hệ thống nội dung của bác sĩ Phúc.',
    coverUrl: getPrimaryImageUrl(book.book_images) || null,
  };
}

export default function Home() {
  const [books, setBooks] = useState<BookWithImages[]>([]);
  const [notes, setNotes] = useState<NoteWithCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getPublishedBooks().then(data => setBooks(data.slice(0, 4))).catch(() => {});
    getPublishedNotesWithCategory().then(data => setNotes(data.slice(0, 5))).catch(() => {});
    getHomeVideos(6).then(setVideos).catch(() => {});
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const heroImage = settings.heroImage || settings.aboutImage || DEFAULT_HERO;
  const displayNotes = [...notes.map(toDisplayNote), ...DEMO_NOTES].slice(0, 5);
  const displayBooks = [...books.map(toDisplayBook), ...DEMO_BOOKS].slice(0, 4);
  const displayVideos = [...videos, ...DEMO_VIDEOS].slice(0, 5);
  const leadNote = displayNotes[0] ?? null;
  const secondaryNotes = displayNotes.slice(1, 5);

  return (
    <div className="bg-white text-[#0A3151]">
      <section className="bg-white pt-20 md:pt-24">
        <div className="mx-auto max-w-7xl px-4 pb-12 md:px-8 md:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative min-h-[430px] overflow-hidden border border-[#0A3151]/15 bg-white md:min-h-[500px] lg:min-h-[560px]"
          >
            <img
              src={heroImage}
              alt={settings.aboutImageAlt || settings.siteName}
              className="absolute inset-0 h-full w-full object-cover object-center"
              referrerPolicy="no-referrer"
            />

            <div className="relative z-10 flex min-h-[430px] items-center px-5 py-10 md:min-h-[500px] md:px-10 lg:min-h-[560px] lg:px-14">
              <div className="max-w-2xl">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#0A3151] drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]">
                  WEBSITE CHÍNH THỨC
                </p>
                <h1 className="text-[34px] font-bold leading-[1.08] text-[#0A3151] drop-shadow-[0_1px_0_rgba(255,255,255,0.85)] md:text-[48px] lg:text-[56px]">
                  TS. ĐẶNG HỮU PHÚC
                </h1>
                <p className="mt-5 max-w-xl text-[17px] font-medium leading-8 text-[#0A3151] drop-shadow-[0_1px_0_rgba(255,255,255,0.85)] md:text-[18px]">
                  Bộ ghi chú sức khỏe được hệ thống từ các chủ đề bác sĩ đang chia sẻ trên Facebook.
                </p>

                <div className="mt-7 grid gap-2 sm:grid-cols-3">
                  {[
                    { Icon: GraduationCap, label: 'Tiến sĩ Y khoa' },
                    { Icon: BookOpen, label: 'Tác giả sách' },
                    { Icon: ShieldCheck, label: 'Có nguồn tham khảo' },
                  ].map(({ Icon, label }) => (
                    <div key={label} className="flex min-h-11 items-center gap-2 border border-[#0A3151]/30 bg-white/80 px-3 py-2 text-[#0A3151]">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-bold leading-5">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="bo-ghi-chu" className="bg-white py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 max-w-3xl border-b border-[#0A3151]/15 pb-5">
            <h2 className="text-[30px] font-bold leading-tight text-[#0A3151] md:text-[34px]">
              Bộ Ghi Chú Chống Lão Hóa
            </h2>
            <p className="mt-3 text-base font-medium leading-7 text-[#0A3151]">
              Các bài viết được hệ thống lại từ những chủ đề bác sĩ Phúc đang chia sẻ, giúp người đọc xem phần đầy đủ sau khi theo dõi video ngắn.
            </p>
          </div>

          {leadNote ? (
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <Link to={leadNote.isDemo ? '/notes' : `/notes/${leadNote.slug}`} className="group block h-full">
                <article className="grid h-full overflow-hidden border border-[#0A3151]/15 bg-white md:grid-cols-[0.9fr_1.1fr]">
                  <div className="min-h-[240px] bg-[#0A3151]/5">
                    {leadNote.coverImageUrl ? (
                      <img
                        src={leadNote.coverImageUrl}
                        alt={leadNote.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full min-h-[240px] items-center justify-center bg-[#0A3151]/5 px-6 text-center">
                        <FileText className="h-10 w-10 text-[#0A3151]" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between p-6 md:p-8">
                    <div>
                      <div className="mb-4 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[#0A3151]">
                        <span className="public-on-blue bg-[#0A3151] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                          {leadNote.categoryName}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#0A3151]">
                          <CalendarDays className="h-3 w-3" />{formatDate(leadNote.publishedAt)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold leading-snug text-[#0A3151] md:text-3xl">
                        {leadNote.title}
                      </h3>
                      {leadNote.excerpt && (
                        <p className="mt-4 line-clamp-3 text-sm font-medium leading-7 text-[#0A3151]">{leadNote.excerpt}</p>
                      )}
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0A3151]">
                      Đọc bài đầy đủ <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </article>
              </Link>

              <div className="divide-y divide-[#0A3151]/15 border border-[#0A3151]/15 bg-white">
                {secondaryNotes.length > 0 ? secondaryNotes.map(note => (
                  <Link key={note.id} to={note.isDemo ? '/notes' : `/notes/${note.slug}`} className="group block p-5 transition-colors hover:bg-[#0A3151]/5">
                    <article className="grid grid-cols-[76px_1fr] gap-4">
                      <div className="aspect-[4/3] overflow-hidden bg-[#0A3151]/5">
                        {note.coverImageUrl ? (
                          <img src={note.coverImageUrl} alt={note.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FileText className="h-5 w-5 text-[#0A3151]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0A3151]">
                          {note.categoryName}
                        </p>
                        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[#0A3151]">
                          {note.title}
                        </h3>
                        <p className="mt-1.5 text-xs font-medium text-[#0A3151]">{formatDate(note.publishedAt)}</p>
                      </div>
                    </article>
                  </Link>
                )) : (
                  <p className="p-6 text-sm font-medium text-[#0A3151]">Các bài viết tiếp theo sẽ hiển thị tại đây sau khi xuất bản.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-[#0A3151]/25 bg-white p-12 text-center text-[#0A3151]">
              Chưa có bài viết được xuất bản.
            </div>
          )}

          <div className="mt-8">
            <Link to="/notes" className="inline-flex items-center gap-2 text-sm font-bold text-[#0A3151]">
              Xem toàn bộ ghi chú <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="sach" className="public-on-blue bg-[#0A3151] py-14 text-white md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 max-w-3xl border-b border-white/20 pb-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white">Bằng chứng hệ thống nội dung</p>
            <h2 className="text-[30px] font-bold leading-tight text-white md:text-[34px]">
              Sách và tài liệu đã xuất bản
            </h2>
            <p className="mt-3 text-base font-medium leading-7 text-white">
              Sách được đặt ở đây như một phần hồ sơ chuyên môn: các nội dung đọc sâu hơn, được trình bày thành hệ thống.
            </p>
          </div>

          {displayBooks.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {displayBooks.map(book => {
                const cover = book.coverUrl;
                return (
                  <Link key={book.id} to={book.isDemo ? '/books' : `/books/${book.slug}`} className="group border border-white/20 p-5 transition-colors hover:bg-white/10">
                    <article className="grid gap-5">
                      <div className="aspect-[2/3] max-h-[320px] overflow-hidden bg-white/10">
                        {cover ? (
                          <img src={cover} alt={book.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="public-on-blue flex h-full w-full flex-col items-center justify-center bg-white/10 p-5 text-center">
                            <BookOpen className="mb-4 h-10 w-10 text-white" />
                            <span className="text-sm font-bold leading-6 text-white">{book.title}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white">Tủ sách</p>
                        <h3 className="line-clamp-2 text-xl font-bold leading-tight text-white">{book.title}</h3>
                        {book.description && (
                          <p className="mt-3 line-clamp-3 text-sm font-medium leading-7 text-white">{book.description}</p>
                        )}
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white">
                          Đọc thêm <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="border border-white/25 p-8 text-white">
              <p className="text-sm font-semibold text-white">Sách và tài liệu sẽ hiển thị tại đây sau khi được xuất bản.</p>
            </div>
          )}

          <div className="mt-8">
            <Link to="/books" className="inline-flex items-center gap-2 text-sm font-bold text-white">
              Xem tủ sách <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <div id="video-facebook" className="bg-white">
        <FacebookVideoStrip videos={displayVideos} facebookUrl={settings.facebookUrl} />
      </div>
    </div>
  );
}
