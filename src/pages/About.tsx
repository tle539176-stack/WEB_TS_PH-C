import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Award, Heart, ShieldCheck, Stethoscope } from 'lucide-react';
import { DEFAULT_SETTINGS, getSiteSettings, type SiteSettings } from '@/services/settingsService';

function splitParagraphs(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map(item => item.trim())
    .filter(Boolean);
}

function splitHighlights(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

export default function About() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const paragraphs = useMemo(() => splitParagraphs(settings.aboutBody), [settings.aboutBody]);
  const highlights = useMemo(() => splitHighlights(settings.aboutHighlights), [settings.aboutHighlights]);
  const initials = settings.aboutTitle
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-[#0A3151] font-bold mb-4">Giới thiệu</p>
            <h1 className="mb-5 text-[34px] font-serif font-bold leading-tight text-[#1A1A1A] md:text-[44px] lg:text-6xl">{settings.aboutTitle}</h1>
            <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">{settings.aboutSubtitle}</p>
            {settings.aboutQuote && (
              <p className="text-base md:text-lg text-neutral-500 italic mt-6">"{settings.aboutQuote}"</p>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-10 lg:gap-14 mb-20 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-28"
            >
              <div className="mx-auto max-w-[360px] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-xl aspect-[3/4] lg:max-w-none">
                {settings.aboutImage ? (
                  <img
                    src={settings.aboutImage}
                    alt={settings.aboutImageAlt || settings.aboutTitle}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0A3151] text-white flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 rounded-full border border-white/30 flex items-center justify-center text-4xl font-serif font-bold mb-6">
                      {initials || 'ĐP'}
                    </div>
                    <p className="font-serif text-2xl font-bold">{settings.aboutTitle}</p>
                    <p className="text-sm text-white/75 mt-3 leading-relaxed">{settings.aboutSubtitle}</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-6 h-6 text-[#0A3151]" />
                  <h2 className="text-2xl md:text-3xl font-bold font-serif text-[#0A3151]">{settings.aboutSectionTitle}</h2>
                </div>
                <div className="space-y-5 text-neutral-600 leading-8 text-base md:text-lg">
                  {paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              {highlights.length > 0 && (
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {highlights.map((item, index) => {
                    const Icon = [ShieldCheck, Heart, Award, Stethoscope][index % 4];
                    return (
                      <div key={item} className="p-5 border border-neutral-200 bg-white rounded-xl shadow-sm">
                        <Icon className="w-5 h-5 text-[#0A3151] mb-3" />
                        <p className="font-semibold text-[#1A1A1A] leading-relaxed">{item}</p>
                      </div>
                    );
                  })}
                </section>
              )}

              <section className="bg-[#0A3151] text-white p-7 md:p-8 rounded-2xl shadow-lg">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-7 h-7 shrink-0 text-white/90" />
                  <div>
                    <h3 className="text-xl font-serif font-bold mb-3">Lưu ý y khoa</h3>
                    <p className="text-white/80 leading-7">
                      {settings.medicalDisclaimer || DEFAULT_SETTINGS.medicalDisclaimer}
                    </p>
                  </div>
                </div>
              </section>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
