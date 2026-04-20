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
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  twitterUrl: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Bác sĩ Wynn Tran',
  logoText: 'WT',
  logoImage: '',
  logoStoragePath: '',
  tagline: 'Medical Professional',
  footerText: 'Sứ mệnh của tôi là mang kiến thức y khoa chính thống, dễ hiểu đến với cộng đồng người Việt trên toàn thế giới.',
  footerImage: '',
  footerStoragePath: '',
  seoTitle: 'Bác sĩ Wynn Tran',
  seoDescription: 'Website chia sẻ kiến thức y khoa, sách, ghi chú và sản phẩm khuyên dùng của Bác sĩ Wynn Tran.',
  medicalDisclaimer: 'Thông tin trên website chỉ nhằm mục đích tham khảo, không thay thế cho tư vấn, chẩn đoán hoặc điều trị y khoa trực tiếp.',
  heroImage: '',
  heroStoragePath: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  facebookUrl: '',
  youtubeUrl: '',
  instagramUrl: '',
  twitterUrl: '',
};

function readString(source: Record<string, string>, key: string, fallback = ''): string {
  return source[key]?.trim() || fallback;
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
    siteName: readString(merged, 'siteName', DEFAULT_SETTINGS.siteName),
    logoText: readString(merged, 'logoText', DEFAULT_SETTINGS.logoText),
    logoImage: readString(merged, 'logoImage'),
    logoStoragePath: readString(merged, 'logoStoragePath'),
    tagline: readString(merged, 'tagline', DEFAULT_SETTINGS.tagline),
    footerText: readString(merged, 'footerText', DEFAULT_SETTINGS.footerText),
    footerImage: readString(merged, 'footerImage'),
    footerStoragePath: readString(merged, 'footerStoragePath'),
    seoTitle: readString(merged, 'seoTitle', readString(merged, 'siteName', DEFAULT_SETTINGS.seoTitle)),
    seoDescription: readString(merged, 'seoDescription', DEFAULT_SETTINGS.seoDescription),
    medicalDisclaimer: readString(merged, 'medicalDisclaimer', DEFAULT_SETTINGS.medicalDisclaimer),
    heroImage: readString(merged, 'heroImage'),
    heroStoragePath: readString(merged, 'heroStoragePath'),
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
