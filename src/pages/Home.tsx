import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, HeartPulse, Sparkles, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPublishedBooks } from '@/services/contentService';
import { getPublishedNotesWithCategory } from '@/services/contentService';
import { getSiteSettings } from '@/services/settingsService';
import type { BookWithImages, NoteWithCategory } from '@/types/database';

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop';

function getPrimaryImageUrl(images: { url: string; is_primary: boolean }[]): string {
  return images.find(i => i.is_primary)?.url ?? images[0]?.url ?? '';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export default function Home() {
  const [books, setBooks] = useState<BookWithImages[]>([]);
  const [notes, setNotes] = useState<NoteWithCategory[]>([]);
  const [heroImage, setHeroImage] = useState(DEFAULT_HERO);

  useEffect(() => {
    getPublishedBooks().then(setBooks).catch(() => { });
    getPublishedNotesWithCategory().then(data => setNotes(data.slice(0, 3))).catch(() => { });
    getSiteSettings().then(s => { if (s.heroImage) setHeroImage(s.heroImage); }).catch(() => { });
  }, []);

  const featuredBook = books[0] ?? null;
  const recentNotes = notes;

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Badge className="bg-[#0A3151] text-white border-none px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold shadow-sm">
                Board Certified Physician
              </Badge>
              <span className="text-sm font-medium text-neutral-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-green-600" /> Medical Expert
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] text-[#1A1A1A] mb-6">
              Y học chứng cứ. <br />
              <span className="text-[#0A3151]">Chăm sóc tận tâm.</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Đồng hành cùng bạn trên hành trình bảo vệ sức khỏe và chống lão hóa bằng những kiến thức y khoa chuẩn xác, cập nhật nhất từ Hoa Kỳ.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/books">
                <Button className="bg-[#0A3151] hover:bg-[#1A252F] text-white rounded-full px-8 py-6 text-lg group shadow-md hover:shadow-xl transition-all">
                  Khám phá Tủ sách
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/notes">
                <Button variant="outline" className="rounded-full px-8 py-6 text-lg border-neutral-300 hover:bg-neutral-50 hover:shadow-md transition-all text-[#0A3151] font-medium">
                  Đọc Ghi chú Y khoa
                </Button>
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-3xl shadow-2xl border border-neutral-200/50"
          >
            <img
              src={heroImage}
              alt="Dr. Wynn Tran Clinic"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-end text-white gap-8">
              <div>
                <p className="font-serif text-3xl md:text-4xl font-bold mb-2">Dr. Wynn Tran</p>
                <p className="text-base md:text-lg opacity-90 font-light tracking-wide">MD, FACP - Internal Medicine</p>
              </div>
              <div className="flex gap-8 md:gap-12 text-left md:text-center">
                <div>
                  <p className="text-3xl md:text-4xl font-serif font-bold">15+</p>
                  <p className="text-xs uppercase tracking-wider opacity-80 mt-2 font-medium">Năm kinh nghiệm</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-serif font-bold">10k+</p>
                  <p className="text-xs uppercase tracking-wider opacity-80 mt-2 font-medium">Bệnh nhân</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-serif font-bold">3+</p>
                  <p className="text-xs uppercase tracking-wider opacity-80 mt-2 font-medium">Sách xuất bản</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Expertise / Bento Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm uppercase tracking-[0.2em] text-[#0A3151] font-bold mb-3">Lĩnh vực chuyên môn</h2>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A1A]">Chăm sóc sức khỏe toàn diện</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-neutral-100 shadow-sm bg-white rounded-3xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#0A3151]/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0A3151]/10 transition-all duration-300">
                  <HeartPulse className="w-8 h-8 text-[#0A3151]" />
                </div>
                <h4 className="text-xl font-bold font-serif mb-3">Tim mạch & Chuyển hóa</h4>
                <p className="text-neutral-600 text-sm leading-relaxed">Phòng ngừa và quản lý các bệnh lý mạn tính như cao huyết áp, tiểu đường, mỡ máu bằng phác đồ chuẩn Hoa Kỳ.</p>
              </CardContent>
            </Card>
            <Card className="border border-neutral-100 shadow-sm bg-white rounded-3xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#0A3151]/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0A3151]/10 transition-all duration-300">
                  <Sparkles className="w-8 h-8 text-[#0A3151]" />
                </div>
                <h4 className="text-xl font-bold font-serif mb-3">Y học chống lão hóa</h4>
                <p className="text-neutral-600 text-sm leading-relaxed">Tiếp cận khoa học về quá trình lão hóa, bảo vệ tế bào và duy trì sự trẻ trung từ bên trong qua dinh dưỡng và lối sống.</p>
              </CardContent>
            </Card>
            <Card className="border border-neutral-100 shadow-sm bg-white rounded-3xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#0A3151]/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0A3151]/10 transition-all duration-300">
                  <Activity className="w-8 h-8 text-[#0A3151]" />
                </div>
                <h4 className="text-xl font-bold font-serif mb-3">Y học dự phòng</h4>
                <p className="text-neutral-600 text-sm leading-relaxed">Tầm soát ung thư, tiêm ngừa và thiết kế các chương trình kiểm tra sức khỏe định kỳ cá nhân hóa.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Book Section */}
      {featuredBook && (
        <section className="py-24 bg-[#0A3151] text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <Badge className="bg-white/10 text-white hover:bg-white/20 border-none mb-6 px-4 py-1.5 rounded-full uppercase tracking-widest text-xs shadow-sm">
                  Ấn phẩm mới nhất
                </Badge>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
                  {featuredBook.title}
                </h2>
                {featuredBook.subtitle && (
                  <p className="text-xl text-white/80 italic mb-8">"{featuredBook.subtitle}"</p>
                )}
                <p className="text-white/70 leading-relaxed mb-10 text-lg">
                  {featuredBook.description}
                </p>
                <div className="flex items-center gap-6">
                  <Link to={`/books/${featuredBook.slug}`}>
                    <Button className="bg-white text-[#0A3151] hover:bg-neutral-100 rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all">
                      Đọc thử ngay
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A3151] overflow-hidden shadow-sm">
                          <img src={`https://picsum.photos/seed/reader${i}/100/100`} alt="Reader" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-white/80 ml-2">10.000+ độc giả</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="relative group perspective-1000">
                  <motion.div
                    whileHover={{ rotateY: -5, rotateX: 2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative z-10 w-full max-w-sm shadow-2xl overflow-hidden rounded-r-2xl rounded-l-sm border-l-8 border-white/20"
                  >
                    {getPrimaryImageUrl(featuredBook.book_images) && (
                      <img
                        src={getPrimaryImageUrl(featuredBook.book_images)}
                        alt={featuredBook.title}
                        className="w-full h-auto object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Medical Notes */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12 border-b border-neutral-200 pb-6">
            <div>
              <h2 className="text-sm uppercase tracking-[0.2em] text-[#0A3151] font-bold mb-2">Cập nhật y khoa</h2>
              <h3 className="text-3xl font-serif font-bold text-[#1A1A1A]">Ghi chú mới nhất</h3>
            </div>
            <Link to="/notes" className="hidden md:flex items-center gap-2 text-[#0A3151] font-bold hover:gap-3 transition-all">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <p className="text-neutral-400 text-center py-12">Chưa có ghi chú nào.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentNotes.map((note) => (
                <Link key={note.id} to={`/notes/${note.slug}`} className="group">
                  <article className="bg-white rounded-3xl p-4 border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 space-y-5">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/60 shadow-sm">
                      {note.cover_image_url && (
                        <img
                          src={note.cover_image_url}
                          alt={note.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="px-2 pb-2">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-bold text-[#0A3151] uppercase tracking-wider">
                          {note.categories?.name ?? ''}
                        </span>
                        <span className="text-xs text-neutral-400">{formatDate(note.published_at)}</span>
                      </div>
                      <h4 className="text-xl font-serif font-bold group-hover:text-[#0A3151] transition-colors line-clamp-2 mb-3">
                        {note.title}
                      </h4>
                      <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                        {note.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link to="/notes">
              <Button variant="outline" className="w-full">Xem tất cả ghi chú</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
