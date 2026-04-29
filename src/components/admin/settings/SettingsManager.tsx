import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card } from '../../ui/card';
import { Loader2, Save, Settings, AtSign, Info, Facebook, Youtube, Instagram, Twitter } from 'lucide-react';
import * as settingsSvc from '../../../services/settingsService';
import * as media from '../../../services/mediaService';
import { logAction } from '../../../services/auditLogService';
import { MediaUploader } from '../media/MediaUploader';
import { AdvancedImageUrlInput } from '../media/AdvancedImageUrlInput';
import { QualityChecklist } from '../common/QualityChecklist';
import { useAdminToast } from '../common/AdminToast';
import type { ChecklistItem } from '../common/adminHelpers';
import type { MediaAsset } from '../../../types/database';

export function SettingsManager({ session }: { session: Session }) {
  const { showToast } = useAdminToast();
  const [settings, setSettings] = useState<settingsSvc.SiteSettings>(settingsSvc.DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<settingsSvc.SiteSettings>(settingsSvc.DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsSvc.getSiteSettings().then(current => {
      setSettings(current);
      setSavedSettings(current);
    });
  }, []);

  const cleanupDraftSettingPath = async (currentPath: string, savedPath: string, nextPath = '') => {
    if (currentPath && currentPath !== savedPath && currentPath !== nextPath) {
      await media.deleteStorageObjectIfUnused({ storagePath: currentPath });
    }
  };

  const cleanupSavedSettingPath = async (previousPath: string, nextPath: string) => {
    if (previousPath && previousPath !== nextPath) {
      await media.deleteStorageObjectIfUnused({ storagePath: previousPath });
    }
  };

  const selectLogoAsset = (asset: MediaAsset) => {
    void cleanupDraftSettingPath(settings.logoStoragePath, savedSettings.logoStoragePath, asset.storage_path);
    setSettings(prev => ({ ...prev, logoImage: asset.public_url, logoStoragePath: asset.storage_path }));
    logAction(session, 'select_library_image', 'setting', 'logo', { after: { media_asset_id: asset.id } });
  };

  const selectHeroAsset = (asset: MediaAsset) => {
    void cleanupDraftSettingPath(settings.heroStoragePath, savedSettings.heroStoragePath, asset.storage_path);
    setSettings(prev => ({ ...prev, heroImage: asset.public_url, heroStoragePath: asset.storage_path }));
    logAction(session, 'select_library_image', 'setting', 'hero', { after: { media_asset_id: asset.id } });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsSvc.saveSiteSettings(settings);
      await Promise.all([
        cleanupSavedSettingPath(savedSettings.logoStoragePath, settings.logoStoragePath),
        cleanupSavedSettingPath(savedSettings.heroStoragePath, settings.heroStoragePath),
        cleanupSavedSettingPath(savedSettings.footerStoragePath, settings.footerStoragePath),
      ]);
      setSavedSettings(settings);
      showToast('Đã lưu cấu hình website.', 'success');
    } catch {
      showToast('Lỗi khi lưu cấu hình. Vui lòng thử lại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const setInput = (key: keyof settingsSvc.SiteSettings) => (event: ChangeEvent<HTMLInputElement>) =>
    setSettings(prev => ({ ...prev, [key]: event.target.value }));

  const setTextArea = (key: keyof settingsSvc.SiteSettings) => (event: ChangeEvent<HTMLTextAreaElement>) =>
    setSettings(prev => ({ ...prev, [key]: event.target.value }));

  const checklist: ChecklistItem[] = [
    { label: 'Tên website', ok: !!settings.siteName },
    { label: 'Logo (ảnh hoặc chữ tắt)', ok: !!(settings.logoImage || settings.logoText) },
    { label: 'Ảnh Hero trang chủ', ok: !!settings.heroImage, warn: !settings.heroImage },
    { label: 'SEO title', ok: !!settings.seoTitle },
    { label: 'SEO description', ok: settings.seoDescription.length >= 50, warn: settings.seoDescription.length > 0 && settings.seoDescription.length < 50 },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <Card className="p-8 border-none shadow-md">
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
          <Settings className="w-6 h-6 text-[#0A3151]" />
          <div>
            <h2 className="text-xl font-serif font-bold text-[#0A3151]">Cấu hình website</h2>
            <p className="text-xs text-neutral-500 mt-1">Quản lý tên web, nhận diện thương hiệu, SEO, liên hệ và mạng xã hội.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Thương hiệu</h3>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-2">Tên website</label>
              <Input value={settings.siteName} onChange={setInput('siteName')} placeholder="Bác sĩ Wynn Tran" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-2">Chữ logo ngắn</label>
              <Input value={settings.logoText} onChange={setInput('logoText')} placeholder="WT" maxLength={8} />
            </div>
            <MediaUploader
              label="Ảnh Logo"
              currentUrl={settings.logoImage}
              currentAlt={settings.siteName}
              aspectHint="1:1"
              onUpload={async (file, alt) => {
                const asset = await media.uploadSettingImage('logo', file, { alt, uploadedBy: session.user.id });
                return { url: asset.url, storagePath: asset.storagePath };
              }}
              onUploaded={({ url, storagePath }) => {
                void cleanupDraftSettingPath(settings.logoStoragePath, savedSettings.logoStoragePath, storagePath);
                setSettings(prev => ({ ...prev, logoImage: url, logoStoragePath: storagePath }));
                logAction(session, 'upload_setting_image', 'setting', 'logo', { after: { url } });
              }}
              onRemove={() => {
                void cleanupDraftSettingPath(settings.logoStoragePath, savedSettings.logoStoragePath);
                setSettings(prev => ({ ...prev, logoImage: '', logoStoragePath: '' }));
              }}
              onSelectAsset={selectLogoAsset}
              libraryFilterEntityType="setting"
            />
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-2">Tagline dưới logo</label>
              <Input value={settings.tagline} onChange={setInput('tagline')} placeholder="Medical Professional" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-2">Nội dung giới thiệu ở footer</label>
              <Textarea value={settings.footerText} onChange={setTextArea('footerText')} rows={4} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">SEO & pháp lý</h3>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-2">Tiêu đề trình duyệt / SEO title</label>
              <Input value={settings.seoTitle} onChange={setInput('seoTitle')} placeholder="Bác sĩ Wynn Tran" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-2">SEO description</label>
              <Textarea value={settings.seoDescription} onChange={setTextArea('seoDescription')} rows={3} />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-2">Disclaimer y khoa</label>
              <Textarea value={settings.medicalDisclaimer} onChange={setTextArea('medicalDisclaimer')} rows={4} />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Trang chủ</h3>
            <MediaUploader
              label="Ảnh Hero trang chủ"
              currentUrl={settings.heroImage}
              currentAlt="Hero"
              aspectHint="16:9"
              onUpload={async (file, alt) => {
                const asset = await media.uploadSettingImage('hero', file, { alt, uploadedBy: session.user.id });
                return { url: asset.url, storagePath: asset.storagePath };
              }}
              onUploaded={({ url, storagePath }) => {
                void cleanupDraftSettingPath(settings.heroStoragePath, savedSettings.heroStoragePath, storagePath);
                setSettings(prev => ({ ...prev, heroImage: url, heroStoragePath: storagePath }));
                logAction(session, 'upload_setting_image', 'setting', 'hero', { after: { url } });
              }}
              onRemove={() => {
                void cleanupDraftSettingPath(settings.heroStoragePath, savedSettings.heroStoragePath);
                setSettings(prev => ({ ...prev, heroImage: '', heroStoragePath: '' }));
              }}
              onSelectAsset={selectHeroAsset}
            />
            <AdvancedImageUrlInput
              value={settings.heroImage}
              onChange={url => {
                void cleanupDraftSettingPath(settings.heroStoragePath, savedSettings.heroStoragePath);
                setSettings(prev => ({ ...prev, heroImage: url, heroStoragePath: '' }));
              }}
              placeholder="https://example.com/hero.jpg"
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Thông tin liên hệ</h3>
            <div className="flex items-center gap-3">
              <AtSign className="w-4 h-4 text-neutral-400" />
              <Input placeholder="Email liên hệ" value={settings.contactEmail} onChange={setInput('contactEmail')} />
            </div>
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-neutral-400" />
              <Input placeholder="Số điện thoại" value={settings.contactPhone} onChange={setInput('contactPhone')} />
            </div>
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-neutral-400" />
              <Input placeholder="Địa chỉ văn phòng" value={settings.address} onChange={setInput('address')} />
            </div>
          </section>

          <section className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Mạng xã hội</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Facebook, key: 'facebookUrl' as const, placeholder: 'Facebook URL', cls: 'text-blue-600' },
                { icon: Youtube, key: 'youtubeUrl' as const, placeholder: 'Youtube URL', cls: 'text-red-600' },
                { icon: Instagram, key: 'instagramUrl' as const, placeholder: 'Instagram URL', cls: 'text-pink-600' },
                { icon: Twitter, key: 'twitterUrl' as const, placeholder: 'Twitter URL', cls: 'text-sky-500' },
              ].map(({ icon: Icon, key, placeholder, cls }) => (
                <div key={key} className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${cls}`} />
                  <Input placeholder={placeholder} value={settings[key]} onChange={setInput(key)} />
                </div>
              ))}
            </div>
          </section>

          <section className="col-span-1 md:col-span-2">
            <QualityChecklist items={checklist} />
          </section>
        </div>

        <div className="mt-12 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-[#0A3151] hover:bg-[#0D426E] text-white px-12 py-6 text-lg">
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
            Lưu cấu hình
          </Button>
        </div>
      </Card>
    </div>
  );
}
