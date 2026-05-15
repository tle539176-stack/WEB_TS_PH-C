import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, GraduationCap, Leaf, MapPin, Stethoscope } from 'lucide-react';
import { DEFAULT_SETTINGS, getSiteSettings, type SiteSettings } from '@/services/settingsService';

const DEFAULT_HERO = '/images/hero-clinic-room.jpg';

function splitParagraphs(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map(item => item.trim())
    .filter(Boolean);
}

function clampNumber(value: string, fallback: number, min: number, max: number): number {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(max, Math.max(min, numericValue));
}

const TIMELINE = [
  {
    period: 'Từ nhỏ',
    title: 'Kế thừa y thuật gia truyền',
    description: 'Truyền nhân đời thứ 6 dòng y Đặng Gia Đường, được rèn luyện y lý từ thuở nhỏ.',
    location: 'Việt Nam',
    highlight: false,
    icon: Leaf,
  },
  {
    period: 'Thạc sĩ',
    title: 'Nội khoa – BV Đông Tây Y kết hợp Nhạc Dương',
    description: 'Nghiên cứu kết hợp Đông – Tây y trong chẩn đoán và điều trị nội khoa tại Thượng Hải.',
    location: 'Thượng Hải, Trung Quốc',
    highlight: false,
    icon: BookOpen,
  },
  {
    period: '2017 – 2025',
    title: 'Tiến sĩ Chống Lão Hóa',
    description: 'Tốt nghiệp tại Đại học Trung Y Dược Thượng Hải (上海中醫藥大學) – Top 1 Trung Quốc. Tốt nghiệp 23/06/2025.',
    location: 'Thượng Hải, Trung Quốc',
    highlight: false,
    icon: GraduationCap,
  },
  {
    period: 'Hiện tại',
    title: 'Giám đốc Thượng Y Viện',
    description: 'Đồng sáng lập Học Viện Nhân Hoà Y Đạo. Chuyên gia tư vấn và điều trị chống lão hóa, Đông Tây y kết hợp.',
    location: '136 Hàng Bông, Hà Nội',
    highlight: true,
    icon: Stethoscope,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function About() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [heroAspectPercent, setHeroAspectPercent] = useState('56.28%');

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const paragraphs = useMemo(() => splitParagraphs(settings.aboutBody), [settings.aboutBody]);
  const pageContainerClass = 'mx-auto w-full max-w-7xl px-4 md:px-8';
  const heroContainerClass = 'mx-auto w-full max-w-7xl md:px-8';
  const heroImage = settings.heroImage || settings.aboutImage || DEFAULT_HERO;
  const heroMobileImage = settings.heroMobileImage || heroImage;
  const heroMobileObjectX = clampNumber(settings.heroMobileObjectX, Number(DEFAULT_SETTINGS.heroMobileObjectX), 0, 100);
  const heroMobileObjectY = clampNumber(settings.heroMobileObjectY, Number(DEFAULT_SETTINGS.heroMobileObjectY), 0, 100);
  const heroMobileScale = clampNumber(settings.heroMobileScale, Number(DEFAULT_SETTINGS.heroMobileScale), 1, 2);
  const heroFrameStyle = {
    '--hero-aspect-percent': heroAspectPercent,
    '--hero-mobile-x': `${heroMobileObjectX}%`,
    '--hero-mobile-y': `${heroMobileObjectY}%`,
    '--hero-mobile-scale': heroMobileScale.toString(),
  } as CSSProperties;

  return (
    <div className="bg-white">
      {/* ============================================================ */}
      {/*  SECTION 1 — HERO                                            */}
      {/* ============================================================ */}
      <section className="bg-white pt-16 md:pt-[68px]">
        <div className={heroContainerClass}>
        <div className="public-hero-frame relative w-full overflow-hidden bg-[#071f3d]" style={heroFrameStyle}>
          <img
            src={heroImage}
            alt={settings.aboutImageAlt || settings.siteName}
            className="public-hero-image public-hero-image-desktop absolute inset-0 h-full w-full object-cover object-[70%_center]"
            referrerPolicy="no-referrer"
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              if (naturalWidth > 0 && naturalHeight > 0) {
                setHeroAspectPercent(`${((naturalHeight / naturalWidth) * 100).toFixed(4)}%`);
              }
            }}
          />
          <img
            src={heroMobileImage}
            alt={settings.aboutImageAlt || settings.siteName}
            className="public-hero-image public-hero-image-mobile absolute inset-0 h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="public-hero-text-scrim absolute inset-y-0 left-0" />

          <div className="public-hero-content absolute inset-0 z-10 flex items-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
            <div className="public-hero-copy-panel min-w-0 w-full max-w-[660px]">
              <div className="public-hero-meta-row mb-4 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 md:mb-5">
                <span className="public-hero-badge inline-flex items-center gap-2 bg-[#1e5b97] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.06em] text-white shadow-[0_10px_24px_-16px_rgba(0,0,0,0.7)] md:px-4.5 md:text-[13px]">
                  <Stethoscope className="h-[17px] w-[17px]" />
                  Tiến sĩ Y khoa
                </span>
                <span className="public-hero-specialty max-w-full text-[13px] font-bold uppercase leading-[1.25] tracking-[0.06em] text-white sm:text-sm md:text-base">
                  Chuyên gia chống lão hóa
                </span>
              </div>

              <h1 className="public-hero-title mb-4 max-w-full font-serif text-[34px] font-bold leading-[1.05] text-white sm:text-[42px] md:mb-6 md:text-[50px] lg:text-[60px] xl:text-[66px]">
                ĐẶNG HỮU PHÚC
              </h1>

              <div className="public-hero-quote mb-8 max-w-[600px] border-l-[4px] border-[#2d77bd] pl-5 md:mb-9">
                <p className="public-body italic text-white/95">
                  "Mong muốn lớn nhất của tôi là mang kiến thức chống lão hóa đến gần hơn với mọi người, để ai cũng có thể chủ động bảo vệ sức khỏe của chính mình. Vì tôi tin rằng, hiểu đúng về lão hóa chính là cách chống lão hóa hiệu quả nhất."
                </p>
              </div>

              <a href="#gioi-thieu" className="public-hero-cta group inline-flex items-center gap-2 bg-[#0b4c86] px-5.5 py-4 text-[13px] font-bold uppercase tracking-[0.04em] text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#155d9d] hover:shadow-[0_18px_34px_-18px_rgba(0,0,0,1)] md:px-7 md:text-sm">
                XEM THÊM THÔNG TIN
                <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — STORY + CLINIC PHOTO                            */}
      {/* ============================================================ */}
      <section id="gioi-thieu" className="bg-white pt-6 pb-16 md:py-20">
        <div className={pageContainerClass}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 items-start">

            {/* --- Story text --- */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="public-section-title uppercase mb-6" style={{ color: '#0A3151' }}>
                {settings.aboutSectionTitle || 'Giới thiệu'}
              </h2>

              <div className="public-body space-y-5 text-justify [text-indent:1.25rem]" style={{ color: '#4F5F64' }}>
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>


            </motion.div>

            {/* --- Clinic photo --- */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:sticky lg:top-28"
            >
              <div
                className="overflow-hidden aspect-[4/3] lg:aspect-[16/10] bg-neutral-100"
                style={{ borderRadius: '8px', boxShadow: '0 12px 40px -8px rgba(10,49,81,0.12)' }}
              >
                <img
                  src={heroImage}
                  alt={settings.aboutImageAlt || settings.siteName}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="public-meta mt-3 text-center" style={{ color: '#8A9BA8' }}>
                Phòng khám Thượng Y Viện - 136 Hàng Bông
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 4 — TIMELINE (navy background)                      */}
      {/* ============================================================ */}
      <section className="public-on-blue py-16 md:py-20" style={{ background: '#0A3151', color: '#FFFFFF' }}>
        <div className={pageContainerClass}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="public-listing-title text-center mb-12 md:mb-14"
              style={{ color: '#FFFFFF' }}
            >
              HÀNH TRÌNH Y ĐẠO
            </h2>

            <div className="relative max-w-3xl mx-auto">
              {/* Vertical line */}
              <div
                className="absolute left-[18px] md:left-[22px] top-0 bottom-0 w-[2px]"
                style={{ background: 'rgba(215,181,109,0.35)' }}
              />

              <div className="space-y-10 md:space-y-12">
                {TIMELINE.map((item, idx) => {
                  const TimelineIcon = item.icon;

                  return (
                    <motion.div
                      key={item.period}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.12 }}
                      className="relative pl-14 md:pl-16"
                    >
                      <span className="absolute left-[4px] top-0 h-[30px] w-[30px] md:left-[6px] md:h-[34px] md:w-[34px]">
                        <svg className="h-full w-full" viewBox="0 0 34 34" aria-hidden="true">
                          <circle cx="17" cy="17" r="15" fill="#0A3151" />
                          <circle
                            cx="17"
                            cy="17"
                            r="12.5"
                            fill={item.highlight ? '#D7B56D' : '#0A3151'}
                            stroke={item.highlight ? '#D7B56D' : 'rgba(255,255,255,0.42)'}
                            strokeWidth="3"
                          />
                        </svg>
                        <TimelineIcon
                          className="absolute left-1/2 top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 md:h-[15px] md:w-[15px]"
                          style={{ color: item.highlight ? '#0A3151' : 'rgba(255,255,255,0.82)' }}
                          strokeWidth={2.35}
                        />
                      </span>

                      <p
                        className="public-kicker mb-1 tracking-[0.06em]"
                        style={{ color: item.highlight ? '#D7B56D' : 'rgba(255,255,255,0.6)' }}
                      >
                        {item.period}
                      </p>

                      <h3
                        className="public-lead-title font-bold mb-2"
                        style={{ color: item.highlight ? '#D7B56D' : '#FFFFFF' }}
                      >
                        {item.title}
                      </h3>

                      <p className="public-small mb-2 italic" style={{ color: 'rgba(255,255,255,0.72)' }}>
                        {item.description}
                      </p>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                        <span className="public-meta italic" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {item.location}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
