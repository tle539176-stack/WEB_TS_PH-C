import { supabase, assertSupabase } from '../lib/supabase';

export interface SiteSettings {
  siteName: string;
  logoText: string;
  logoImage: string;
  logoStoragePath: string;
  tagline: string;
  footerText: string;
  footerImage: string;
  footerStoragePath: string;
  seoTitle: string;
  seoDescription: string;
  medicalDisclaimer: string;
  heroImage: string;
  heroStoragePath: string;
  heroMobileImage: string;
  heroMobileStoragePath: string;
  heroMobileObjectX: string;
  heroMobileObjectY: string;
  heroMobileScale: string;
  aboutTitle: string;
  aboutSubtitle: string;
  aboutQuote: string;
  aboutSectionTitle: string;
  aboutBody: string;
  aboutHighlights: string;
  aboutImage: string;
  aboutStoragePath: string;
  aboutImageAlt: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  twitterUrl: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Đặng Hữu Phúc',
  logoText: 'DP',
  logoImage: '',
  logoStoragePath: '',
  tagline: 'Kiến thức sức khỏe chính thống',
  footerText: 'Website chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm cho cộng đồng.',
  footerImage: '',
  footerStoragePath: '',
  seoTitle: 'Tiến sĩ Đặng Hữu Phúc',
  seoDescription: 'Website chia sẻ kiến thức sức khỏe, ghi chú, sách và nội dung tham khảo của Tiến sĩ Đặng Hữu Phúc.',
  medicalDisclaimer: 'Thông tin trên website chỉ nhằm mục đích tham khảo, không thay thế cho tư vấn, chẩn đoán hoặc điều trị y khoa trực tiếp.',
  heroImage: '',
  heroStoragePath: '',
  heroMobileImage: '',
  heroMobileStoragePath: '',
  heroMobileObjectX: '88',
  heroMobileObjectY: '8',
  heroMobileScale: '1',
  aboutTitle: 'Tiến sĩ Đặng Hữu Phúc',
  aboutSubtitle: 'Chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm',
  aboutQuote: 'Kiến thức đúng giúp người đọc hiểu rõ hơn và ra quyết định sức khỏe thận trọng hơn.',
  aboutSectionTitle: 'Giới thiệu',
  aboutBody: 'Tiến sĩ Đặng Hữu Phúc xây dựng website này như một không gian chia sẻ kiến thức sức khỏe chính thống, dễ hiểu và có trách nhiệm cho cộng đồng. Nội dung được trình bày theo hướng giáo dục sức khỏe, giúp người đọc hiểu vấn đề, chuẩn bị câu hỏi phù hợp và trao đổi hiệu quả hơn với nhân viên y tế.\n\nCác bài viết, ghi chú, sách và tài liệu trên website ưu tiên tính rõ ràng, thận trọng và minh bạch nguồn tham khảo. Thông tin không thay thế chẩn đoán hoặc điều trị trực tiếp; khi có triệu chứng hoặc vấn đề sức khỏe cụ thể, người đọc nên tham khảo ý kiến bác sĩ hoặc cơ sở y tế phù hợp.',
  aboutHighlights: 'Giáo dục sức khỏe cộng đồng\nKiến thức y khoa dễ hiểu\nNội dung có nguồn tham khảo\nKhuyến khích thăm khám đúng lúc',
  aboutImage: '',
  aboutStoragePath: '',
  aboutImageAlt: 'Tiến sĩ Đặng Hữu Phúc',
  contactEmail: '',
  contactPhone: '',
  address: '',
  facebookUrl: '',
  youtubeUrl: '',
  instagramUrl: '',
  twitterUrl: '',
};

function normalizeKnownProfileText(value: string): string {
  return value
    .replaceAll('Tiễn sĩ', 'Tiến sĩ')
    .replaceAll('Tễn sĩ', 'Tiến sĩ')
    .replaceAll('Đặng Hữ Phúc', 'Đặng Hữu Phúc')
    .replaceAll('Hữ Phúc', 'Hữu Phúc');
}

function readString(source: Record<string, string>, key: string, fallback = ''): string {
  return normalizeKnownProfileText(source[key]?.trim() || fallback);
}

function replaceLegacyTemplateValue(value: string, fallback: string): string {
  const legacyValues = new Set([
    'Bác sĩ Wynn Tran',
    'WT',
    'Medical Professional',
    'Sứ mệnh của tôi là mang kiến thức y khoa chính thống, dễ hiểu đến với cộng đồng người Việt trên toàn thế giới.',
    'Website chia sẻ kiến thức y khoa, sách, ghi chú và sản phẩm khuyên dùng của Bác sĩ Wynn Tran.',
  ]);
  return legacyValues.has(value.trim()) ? fallback : value;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!supabase) return DEFAULT_SETTINGS;
  const { data, error } = await supabase.from('settings').select('key, value');
  if (error || !data) return DEFAULT_SETTINGS;

  const merged: Record<string, string> = {};
  for (const row of data) {
    Object.assign(merged, row.value);
  }

  return {
    siteName: replaceLegacyTemplateValue(readString(merged, 'siteName', DEFAULT_SETTINGS.siteName), DEFAULT_SETTINGS.siteName),
    logoText: replaceLegacyTemplateValue(readString(merged, 'logoText', DEFAULT_SETTINGS.logoText), DEFAULT_SETTINGS.logoText),
    logoImage: readString(merged, 'logoImage'),
    logoStoragePath: readString(merged, 'logoStoragePath'),
    tagline: replaceLegacyTemplateValue(readString(merged, 'tagline', DEFAULT_SETTINGS.tagline), DEFAULT_SETTINGS.tagline),
    footerText: replaceLegacyTemplateValue(readString(merged, 'footerText', DEFAULT_SETTINGS.footerText), DEFAULT_SETTINGS.footerText),
    footerImage: readString(merged, 'footerImage'),
    footerStoragePath: readString(merged, 'footerStoragePath'),
    seoTitle: replaceLegacyTemplateValue(readString(merged, 'seoTitle', readString(merged, 'siteName', DEFAULT_SETTINGS.seoTitle)), DEFAULT_SETTINGS.seoTitle),
    seoDescription: replaceLegacyTemplateValue(readString(merged, 'seoDescription', DEFAULT_SETTINGS.seoDescription), DEFAULT_SETTINGS.seoDescription),
    medicalDisclaimer: readString(merged, 'medicalDisclaimer', DEFAULT_SETTINGS.medicalDisclaimer),
    heroImage: readString(merged, 'heroImage'),
    heroStoragePath: readString(merged, 'heroStoragePath'),
    heroMobileImage: readString(merged, 'heroMobileImage'),
    heroMobileStoragePath: readString(merged, 'heroMobileStoragePath'),
    heroMobileObjectX: readString(merged, 'heroMobileObjectX', DEFAULT_SETTINGS.heroMobileObjectX),
    heroMobileObjectY: readString(merged, 'heroMobileObjectY', DEFAULT_SETTINGS.heroMobileObjectY),
    heroMobileScale: readString(merged, 'heroMobileScale', DEFAULT_SETTINGS.heroMobileScale),
    aboutTitle: readString(merged, 'aboutTitle', DEFAULT_SETTINGS.aboutTitle),
    aboutSubtitle: readString(merged, 'aboutSubtitle', DEFAULT_SETTINGS.aboutSubtitle),
    aboutQuote: readString(merged, 'aboutQuote', DEFAULT_SETTINGS.aboutQuote),
    aboutSectionTitle: readString(merged, 'aboutSectionTitle', DEFAULT_SETTINGS.aboutSectionTitle),
    aboutBody: readString(merged, 'aboutBody', DEFAULT_SETTINGS.aboutBody),
    aboutHighlights: readString(merged, 'aboutHighlights', DEFAULT_SETTINGS.aboutHighlights),
    aboutImage: readString(merged, 'aboutImage'),
    aboutStoragePath: readString(merged, 'aboutStoragePath'),
    aboutImageAlt: readString(merged, 'aboutImageAlt', DEFAULT_SETTINGS.aboutImageAlt),
    contactEmail: readString(merged, 'email', readString(merged, 'contactEmail')),
    contactPhone: readString(merged, 'phone', readString(merged, 'contactPhone')),
    address: readString(merged, 'address'),
    facebookUrl: readString(merged, 'facebookUrl'),
    youtubeUrl: readString(merged, 'youtubeUrl'),
    instagramUrl: readString(merged, 'instagramUrl'),
    twitterUrl: readString(merged, 'twitterUrl'),
  };
}

async function upsertSetting(key: string, value: Record<string, string>, updatedAt: string): Promise<void> {
  assertSupabase(supabase);
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: updatedAt }, { onConflict: 'key' });
  if (error) throw error;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const now = new Date().toISOString();
  await Promise.all([
    upsertSetting('global', {
      siteName: settings.siteName,
      logoText: settings.logoText,
      logoImage: settings.logoImage,
      logoStoragePath: settings.logoStoragePath,
      tagline: settings.tagline,
      footerText: settings.footerText,
      footerImage: settings.footerImage,
      footerStoragePath: settings.footerStoragePath,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      medicalDisclaimer: settings.medicalDisclaimer,
    }, now),
    upsertSetting('home', {
      heroImage: settings.heroImage,
      heroStoragePath: settings.heroStoragePath,
      heroMobileImage: settings.heroMobileImage,
      heroMobileStoragePath: settings.heroMobileStoragePath,
      heroMobileObjectX: settings.heroMobileObjectX,
      heroMobileObjectY: settings.heroMobileObjectY,
      heroMobileScale: settings.heroMobileScale,
    }, now),
    upsertSetting('about', {
      aboutTitle: settings.aboutTitle,
      aboutSubtitle: settings.aboutSubtitle,
      aboutQuote: settings.aboutQuote,
      aboutSectionTitle: settings.aboutSectionTitle,
      aboutBody: settings.aboutBody,
      aboutHighlights: settings.aboutHighlights,
      aboutImage: settings.aboutImage,
      aboutStoragePath: settings.aboutStoragePath,
      aboutImageAlt: settings.aboutImageAlt,
    }, now),
    upsertSetting('contact', {
      email: settings.contactEmail,
      phone: settings.contactPhone,
      address: settings.address,
    }, now),
    upsertSetting('social', {
      facebookUrl: settings.facebookUrl,
      youtubeUrl: settings.youtubeUrl,
      instagramUrl: settings.instagramUrl,
      twitterUrl: settings.twitterUrl,
    }, now),
  ]);
}
