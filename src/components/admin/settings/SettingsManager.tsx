import { useEffect, useState } from 'react';
import type { ChangeEvent, PointerEvent } from 'react';
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
  const [draggingHeroMobile, setDraggingHeroMobile] = useState(false);

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

  const selectHeroMobileAsset = (asset: MediaAsset) => {
    void cleanupDraftSettingPath(settings.heroMobileStoragePath, savedSettings.heroMobileStoragePath, asset.storage_path);
    setSettings(prev => ({ ...prev, heroMobileImage: asset.public_url, heroMobileStoragePath: asset.storage_path }));
    logAction(session, 'select_library_image', 'setting', 'heroMobile', { after: { media_asset_id: asset.id } });
  };

  const selectAboutAsset = (asset: MediaAsset) => {
    void cleanupDraftSettingPath(settings.aboutStoragePath, savedSettings.aboutStoragePath, asset.storage_path);
    setSettings(prev => ({
      ...prev,
      aboutImage: asset.public_url,
      aboutStoragePath: asset.storage_path,
      aboutImageAlt: asset.alt || prev.aboutImageAlt,
    }));
    logAction(session, 'select_library_image', 'setting', 'about', { after: { media_asset_id: asset.id } });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsSvc.saveSiteSettings(settings);
      await Promise.all([
        cleanupSavedSettingPath(savedSettings.logoStoragePath, settings.logoStoragePath),
        cleanupSavedSettingPath(savedSettings.heroStoragePath, settings.heroStoragePath),
        cleanupSavedSettingPath(savedSettings.heroMobileStoragePath, settings.heroMobileStoragePath),
        cleanupSavedSettingPath(savedSettings.footerStoragePath, settings.footerStoragePath),
        cleanupSavedSettingPath(savedSettings.aboutStoragePath, settings.aboutStoragePath),
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

  const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const readNumberSetting = (key: keyof settingsSvc.SiteSettings, fallback: number, min: number, max: number) => {
    const value = Number(settings[key]);
    return clampNumber(Number.isFinite(value) ? value : fallback, min, max);
  };

  const heroMobilePreviewImage = settings.heroMobileImage || settings.heroImage;
  const heroMobileObjectX = readNumberSetting('heroMobileObjectX', Number(settingsSvc.DEFAULT_SETTINGS.heroMobileObjectX), 0, 100);
  const heroMobileObjectY = readNumberSetting('heroMobileObjectY', Number(settingsSvc.DEFAULT_SETTINGS.heroMobileObjectY), 0, 100);
  const heroMobileScale = readNumberSetting('heroMobileScale', Number(settingsSvc.DEFAULT_SETTINGS.heroMobileScale), 1, 2);

  const setHeroMobileCrop = (key: 'heroMobileObjectX' | 'heroMobileObjectY' | 'heroMobileScale', value: number) => {
    const limits = key === 'heroMobileScale' ? { min: 1, max: 2 } : { min: 0, max: 100 };
    const nextValue = clampNumber(value, limits.min, limits.max);
    setSettings(prev => ({ ...prev, [key]: key === 'heroMobileScale' ? nextValue.toFixed(2) : Math.round(nextValue).toString() }));
  };

  const setHeroMobileCropFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSettings(prev => ({
      ...prev,
      heroMobileObjectX: Math.round(clampNumber(x, 0, 100)).toString(),
      heroMobileObjectY: Math.round(clampNumber(y, 0, 100)).toString(),
    }));
  };

  const checklist: ChecklistItem[] = [
    { label: 'Tên website', ok: !!settings.siteName },
    { label: 'Logo (ảnh hoặc chữ tắt)', ok: !!(settings.logoImage || settings.logoText) },
    { label: 'Ảnh Hero trang chủ', ok: !!settings.heroImage, warn: !settings.heroImage },
    { label: 'Tiêu đề trang giới thiệu', ok: !!settings.aboutTitle },
    { label: 'Nội dung giới thiệu', ok: settings.aboutBody.length >= 120, warn: settings.aboutBody.length > 0 && settings.aboutBody.length < 120 },
    { label: 'Ảnh trang giới thiệu', ok: !!settings.aboutImage, warn: !settings.aboutImage },
    { label: 'Ảnh Hero trên điện thoại', ok: !!settings.heroMobileImage, warn: !settings.heroMobileImage },
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
            <div className="space-y-4 border-t pt-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Hero điện thoại</h4>
                <p className="mt-1 text-xs text-neutral-500">Dùng ảnh riêng cho điện thoại. Kéo trên khung preview để căn vị trí, dùng zoom để phóng to.</p>
              </div>
              <MediaUploader
                label="Ảnh Hero trên điện thoại"
                currentUrl={settings.heroMobileImage}
                currentAlt="Hero mobile"
                aspectHint="3:4"
                onUpload={async (file, alt) => {
                  const asset = await media.uploadSettingImage('heroMobile', file, { alt, uploadedBy: session.user.id });
                  return { url: asset.url, storagePath: asset.storagePath };
                }}
                onUploaded={({ url, storagePath }) => {
                  void cleanupDraftSettingPath(settings.heroMobileStoragePath, savedSettings.heroMobileStoragePath, storagePath);
                  setSettings(prev => ({ ...prev, heroMobileImage: url, heroMobileStoragePath: storagePath }));
                  logAction(session, 'upload_setting_image', 'setting', 'heroMobile', { after: { url } });
                }}
                onRemove={() => {
                  void cleanupDraftSettingPath(settings.heroMobileStoragePath, savedSettings.heroMobileStoragePath);
                  setSettings(prev => ({ ...prev, heroMobileImage: '', heroMobileStoragePath: '' }));
                }}
                onSelectAsset={selectHeroMobileAsset}
              />
              <AdvancedImageUrlInput
                value={settings.heroMobileImage}
                onChange={url => {
                  void cleanupDraftSettingPath(settings.heroMobileStoragePath, savedSettings.heroMobileStoragePath);
                  setSettings(prev => ({ ...prev, heroMobileImage: url, heroMobileStoragePath: '' }));
                }}
                placeholder="https://example.com/hero-mobile.jpg"
              />

              {heroMobilePreviewImage && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[160px_minmax(0,1fr)]">
                  <div>
                    <div
                      className="relative aspect-[9/16] w-full overflow-hidden border border-neutral-200 bg-neutral-100 touch-none"
                      onPointerDown={(event) => {
                        setDraggingHeroMobile(true);
                        event.currentTarget.setPointerCapture(event.pointerId);
                        setHeroMobileCropFromPointer(event);
                      }}
                      onPointerMove={(event) => {
                        if (draggingHeroMobile) setHeroMobileCropFromPointer(event);
                      }}
                      onPointerUp={(event) => {
                        setDraggingHeroMobile(false);
                        event.currentTarget.releasePointerCapture(event.pointerId);
                      }}
                      onPointerCancel={() => setDraggingHeroMobile(false)}
                    >
                      <img
                        src={heroMobilePreviewImage}
                        alt="Hero mobile preview"
                        className="h-full w-full select-none object-cover"
                        draggable={false}
                        referrerPolicy="no-referrer"
                        style={{
                          objectPosition: `${heroMobileObjectX}% ${heroMobileObjectY}%`,
                          transform: `scale(${heroMobileScale})`,
                          transformOrigin: `${heroMobileObjectX}% ${heroMobileObjectY}%`,
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 border border-white/40" />
                      <div
                        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 border border-white bg-[#0A3151]/70 shadow"
                        style={{ left: `${heroMobileObjectX}%`, top: `${heroMobileObjectY}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-neutral-500">Preview tỉ lệ điện thoại. Kéo trực tiếp trên ảnh để đổi tâm.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>Ngang</span>
                        <span>{Math.round(heroMobileObjectX)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={heroMobileObjectX}
                        onChange={event => setHeroMobileCrop('heroMobileObjectX', Number(event.target.value))}
                        className="w-full accent-[#0A3151]"
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>Dọc</span>
                        <span>{Math.round(heroMobileObjectY)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={heroMobileObjectY}
                        onChange={event => setHeroMobileCrop('heroMobileObjectY', Number(event.target.value))}
                        className="w-full accent-[#0A3151]"
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs font-bold text-neutral-600">
                        <span>Zoom</span>
                        <span>{heroMobileScale.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.05"
                        value={heroMobileScale}
                        onChange={event => setHeroMobileCrop('heroMobileScale', Number(event.target.value))}
                        className="w-full accent-[#0A3151]"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        heroMobileObjectX: settingsSvc.DEFAULT_SETTINGS.heroMobileObjectX,
                        heroMobileObjectY: settingsSvc.DEFAULT_SETTINGS.heroMobileObjectY,
                        heroMobileScale: settingsSvc.DEFAULT_SETTINGS.heroMobileScale,
                      }))}
                    >
                      Đặt lại căn mặc định
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="col-span-1 md:col-span-2 space-y-6 pt-4 border-t">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Trang giới thiệu</h3>
              <p className="text-xs text-neutral-500 mt-1">Nội dung đang hiển thị tại trang /about.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-2">Tiêu đề chính</label>
                    <Input value={settings.aboutTitle} onChange={setInput('aboutTitle')} placeholder="Tiến sĩ Đặng Hữu Phúc" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-2">Dòng mô tả dưới tên</label>
                    <Input value={settings.aboutSubtitle} onChange={setInput('aboutSubtitle')} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-2">Câu dẫn</label>
                  <Input value={settings.aboutQuote} onChange={setInput('aboutQuote')} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-2">Tiêu đề đoạn nội dung</label>
                  <Input value={settings.aboutSectionTitle} onChange={setInput('aboutSectionTitle')} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-2">Nội dung giới thiệu</label>
                  <Textarea value={settings.aboutBody} onChange={setTextArea('aboutBody')} rows={8} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-2">Điểm nổi bật, mỗi dòng một mục</label>
                  <Textarea value={settings.aboutHighlights} onChange={setTextArea('aboutHighlights')} rows={5} />
                </div>
              </div>
              <div className="space-y-4">
                <MediaUploader
                  label="Ảnh trang giới thiệu"
                  currentUrl={settings.aboutImage}
                  currentAlt={settings.aboutImageAlt}
                  aspectHint="3:4"
                  onUpload={async (file, alt) => {
                    const asset = await media.uploadSettingImage('about', file, { alt, uploadedBy: session.user.id });
                    return { url: asset.url, storagePath: asset.storagePath };
                  }}
                  onUploaded={({ url, storagePath, alt }) => {
                    void cleanupDraftSettingPath(settings.aboutStoragePath, savedSettings.aboutStoragePath, storagePath);
                    setSettings(prev => ({ ...prev, aboutImage: url, aboutStoragePath: storagePath, aboutImageAlt: alt }));
                    logAction(session, 'upload_setting_image', 'setting', 'about', { after: { url } });
                  }}
                  onRemove={() => {
                    void cleanupDraftSettingPath(settings.aboutStoragePath, savedSettings.aboutStoragePath);
                    setSettings(prev => ({ ...prev, aboutImage: '', aboutStoragePath: '' }));
                  }}
                  onAltChange={alt => setSettings(prev => ({ ...prev, aboutImageAlt: alt }))}
                  onSelectAsset={selectAboutAsset}
                  libraryFilterEntityType="setting"
                />
                <AdvancedImageUrlInput
                  value={settings.aboutImage}
                  onChange={url => {
                    void cleanupDraftSettingPath(settings.aboutStoragePath, savedSettings.aboutStoragePath);
                    setSettings(prev => ({ ...prev, aboutImage: url, aboutStoragePath: '' }));
                  }}
                  placeholder="https://example.com/about-profile.jpg"
                />
              </div>
            </div>
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
