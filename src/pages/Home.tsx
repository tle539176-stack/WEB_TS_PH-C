import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, BookOpen, CalendarDays, FileText,
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
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop',
    isDemo: true,
  },
  {
    id: 'demo-book-2',
    title: 'Dinh Dưỡng Thực Hành',
    slug: 'demo-dinh-duong-thuc-hanh',
    description: 'Tài liệu mẫu giúp người đọc hiểu cách đọc nhãn, chọn thực phẩm và chuẩn bị câu hỏi khi cần tư vấn.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop',
    isDemo: true,
  },
  {
    id: 'demo-book-3',
    title: 'Sức Khỏe Bền Vững',
    slug: 'demo-suc-khoe-ben-vung',
    description: 'Tài liệu mẫu về thói quen, giấc ngủ, vận động và các yếu tố nền của sức khỏe lâu dài.',
    coverUrl: 'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?q=80&w=400&auto=format&fit=crop',
    isDemo: true,
  },
  {
    id: 'demo-book-4',
    title: 'Tủ Sách Y Khoa Dễ Hiểu',
    slug: 'demo-tu-sach-y-khoa-de-hieu',
    description: 'Tài liệu mẫu gom các chủ đề sức khỏe thường gặp theo cách đọc ngắn gọn và có hệ thống.',
    coverUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=400&auto=format&fit=crop',
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
    <div className="bg-white text-[var(--public-navy)]">
      <section className="bg-white pt-20 md:pt-24">
        <div className="mx-auto hidden max-w-7xl px-8 pb-12 lg:block">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative aspect-[2.08/1] overflow-hidden bg-white"
          >
            <img
              src={heroImage}
              alt={settings.aboutImageAlt || settings.siteName}
              className="absolute inset-0 h-full w-full object-cover object-[66%_center] saturate-[0.96] contrast-[1.02]"
              referrerPolicy="no-referrer"
            />
            <div className="public-hero-scrim" />
            <div className="relative z-10 flex h-full items-center py-[clamp(20px,4vw,56px)] pl-[clamp(22px,3.4vw,52px)] pr-[clamp(18px,4vw,56px)]">
              <div className="public-hero-copy-panel w-[min(76%,920px)]">
                <p className="public-hero-kicker mb-[clamp(10px,1.2vw,18px)]">
                  Tiến sĩ chống lão hóa
                </p>
                <h1 className="public-hero-title max-w-full whitespace-nowrap text-[clamp(28px,5vw,66px)] font-bold leading-[1.0]">
                  ĐẶNG HỮU PHÚC
                </h1>
                <p className="public-hero-quote mt-[clamp(10px,1.2vw,18px)] max-w-[640px] text-[clamp(10px,1.05vw,14px)] italic leading-[1.65]">
                  "Mong muốn lớn nhất của Tiến sĩ Đặng Hữu Phúc là mang kiến thức chống lão hóa đến gần hơn với mọi người, để ai cũng có thể chủ động bảo vệ sức khỏe của chính mình. Vì tôi tin rằng, hiểu đúng về lão hóa chính là cách chống lão hóa hiệu quả nhất."
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mx-auto block w-full max-w-full pb-10 lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative min-h-[340px] overflow-hidden bg-white md:aspect-[2.08/1] md:min-h-0"
          >
            <img
              src={heroImage}
              alt={settings.aboutImageAlt || settings.siteName}
              className="absolute inset-0 h-full w-full object-cover object-[66%_center] saturate-[0.96] contrast-[1.02]"
              referrerPolicy="no-referrer"
            />
            <div className="public-hero-scrim" />
            <div className="relative z-10 flex h-full min-h-[340px] items-center px-4 py-10 md:min-h-0 md:px-8">
              <div className="public-hero-copy-panel w-[88%] max-w-[390px]">
                <p className="public-hero-kicker mb-3">
                  Tiến sĩ chống lão hóa
                </p>
                <h1 className="public-hero-title text-[clamp(34px,8vw,56px)] font-bold leading-[1.0]">
                  ĐẶNG HỮU PHÚC
                </h1>
                <p className="public-hero-quote mt-3 text-[11px] italic leading-[1.7]">
                  "Mong muốn lớn nhất của Tiến sĩ Đặng Hữu Phúc là mang kiến thức chống lão hóa đến gần hơn với mọi người, để ai cũng có thể chủ động bảo vệ sức khỏe của chính mình. Vì tôi tin rằng, hiểu đúng về lão hóa chính là cách chống lão hóa hiệu quả nhất."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="bo-ghi-chu" className="bg-white py-12 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-7 max-w-[760px] border-b border-[var(--public-border)] pb-5">
            <h2 className="public-section-title uppercase">
              Bộ Ghi Chú Chống Lão Hóa
            </h2>
            <p className="public-body public-muted-text public-title-summary max-w-[720px]">
              Các bài viết được hệ thống lại từ những chủ đề bác sĩ Phúc đang chia sẻ, giúp người đọc xem phần đầy đủ sau khi theo dõi video ngắn.
            </p>
          </div>

          {leadNote ? (
            <div className="grid items-stretch gap-7 lg:grid-cols-[1.02fr_0.98fr]">
              <Link to={leadNote.isDemo ? '/notes' : `/notes/${leadNote.slug}`} className="group block h-full">
                <article className="grid h-full overflow-hidden border-y border-[var(--public-border)] bg-white lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="h-full min-h-[220px] bg-[var(--public-warm-ivory)] lg:min-h-full">
                    {leadNote.coverImageUrl ? (
                      <img
                        src={leadNote.coverImageUrl}
                        alt={leadNote.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full min-h-[220px] items-center justify-center bg-[var(--public-warm-ivory)] px-6 text-center">
                        <FileText className="h-10 w-10 text-[var(--public-navy)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between p-5 md:p-6 lg:p-7">
                    <div>
                      <div className="public-meta mb-4 flex flex-wrap items-center gap-2.5">
                        <span className="public-kicker public-news-accent border-l border-[var(--public-herbal-jade)] pl-2">
                          {leadNote.categoryName}
                        </span>
                        <span className="public-muted-text inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />{formatDate(leadNote.publishedAt)}
                        </span>
                      </div>
                      <h3 className="public-article-title public-lead-title transition-colors">
                        {leadNote.title}
                      </h3>
                      {leadNote.excerpt && (
                        <p className="public-body public-muted-text public-title-summary line-clamp-3">{leadNote.excerpt}</p>
                      )}
                    </div>
                  </div>
                </article>
              </Link>

              <div className="flex h-full flex-col divide-y divide-[var(--public-border)] border-y border-[var(--public-border)] bg-white">
                {secondaryNotes.length > 0 ? secondaryNotes.map(note => (
                  <Link key={note.id} to={note.isDemo ? '/notes' : `/notes/${note.slug}`} className="group block flex-1 py-4 transition-colors hover:bg-[var(--public-warm-ivory)] sm:px-4 lg:px-5">
                    <article className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-4">
                      <div className="aspect-[5/3] overflow-hidden bg-[var(--public-warm-ivory)]">
                        {note.coverImageUrl ? (
                          <img src={note.coverImageUrl} alt={note.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FileText className="h-5 w-5 text-[var(--public-navy)]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="public-kicker public-news-accent mb-1">
                          {note.categoryName}
                        </p>
                        <h3 className="public-article-title public-card-title line-clamp-2">
                          {note.title}
                        </h3>
                        <p className="public-meta public-muted-text mt-1.5">{formatDate(note.publishedAt)}</p>
                      </div>
                    </article>
                  </Link>
                )) : (
                  <p className="p-6 text-sm font-medium text-[var(--public-navy)]">Các bài viết tiếp theo sẽ hiển thị tại đây sau khi xuất bản.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-[var(--public-border)] bg-white p-12 text-center text-[var(--public-navy)]">
              Chưa có bài viết được xuất bản.
            </div>
          )}

          <div className="mt-8">
            <Link to="/notes" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--public-navy)]">
              Xem toàn bộ ghi chú <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="sach" className="public-on-blue bg-[var(--public-navy)] py-14 text-white md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 max-w-3xl border-b border-white/20 pb-5 text-left">
            <h2 className="public-section-title uppercase text-white">
              Sách và tài liệu đã xuất bản
            </h2>
            <p className="public-body public-title-summary text-white">
              Sách được đặt ở đây như một phần hồ sơ chuyên môn: các nội dung đọc sâu hơn, được trình bày thành hệ thống.
            </p>
          </div>

          {displayBooks.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 min-[430px]:gap-x-6 md:mt-10 lg:grid-cols-4 lg:gap-10">
              {displayBooks.map(book => {
                const cover = book.coverUrl;
                return (
                  <Link key={book.id} to={book.isDemo ? '/books' : `/books/${book.slug}`} className="group flex flex-col">
                    <article className="flex flex-col items-center text-center">
                      <div className="w-full">
                        {cover ? (
                          <div className="mx-auto aspect-[2/3] w-full max-w-[142px] overflow-hidden rounded-[2px] border border-white/15 shadow-[0_16px_34px_-8px_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-white/10 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_24px_46px_-10px_rgba(0,0,0,0.82),0_0_0_1px_rgba(255,255,255,0.12)] min-[430px]:max-w-[158px] sm:max-w-[174px] lg:max-w-[220px] lg:shadow-[0_22px_46px_-8px_rgba(0,0,0,0.68),0_0_0_1px_rgba(255,255,255,0.08)] lg:group-hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.84),0_0_0_1px_rgba(255,255,255,0.12)]">
                            <img
                              src={cover}
                              alt={book.title}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="mx-auto flex aspect-[2/3] w-full max-w-[142px] flex-col items-center justify-center rounded-[2px] border border-white/15 bg-white/5 p-3 text-center shadow-[0_16px_34px_-8px_rgba(0,0,0,0.72),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-white/10 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_24px_46px_-10px_rgba(0,0,0,0.82),0_0_0_1px_rgba(255,255,255,0.12)] min-[430px]:max-w-[158px] sm:max-w-[174px] lg:max-w-[220px] lg:p-4 lg:shadow-[0_22px_46px_-8px_rgba(0,0,0,0.68),0_0_0_1px_rgba(255,255,255,0.08)] lg:group-hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.84),0_0_0_1px_rgba(255,255,255,0.12)]">
                            <BookOpen className="mb-2 h-6 w-6 text-white/50 lg:mb-3 lg:h-8 lg:w-8" />
                            <span className="public-small font-bold text-white/50">{book.title}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex flex-col items-center px-1 lg:mt-5 lg:px-2">
                        <h3 className="public-compact-title line-clamp-2 text-white transition-colors group-hover:text-[var(--public-soft-sage)]">{book.title}</h3>
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
