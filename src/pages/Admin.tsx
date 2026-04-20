import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import {
  Loader2, Plus, Trash2, LogOut, Book, ShoppingBag, FileText, Tags,
  Edit, LayoutDashboard, Settings, ChevronRight, Search, Save,
  AtSign, Phone, MapPin, History, PlusCircle, Edit3,
  Facebook, Youtube, Instagram, Twitter, CheckCircle2, AlertCircle, Info,
} from 'lucide-react';
import * as adminAuth from '../services/adminAuthService';
import * as content from '../services/contentService';
import * as settingsSvc from '../services/settingsService';
import * as media from '../services/mediaService';
import { logAction } from '../services/auditLogService';
import { MediaGallery } from '../components/admin/media/MediaGallery';
import { MediaUploader } from '../components/admin/media/MediaUploader';
import { AdvancedImageUrlInput } from '../components/admin/media/AdvancedImageUrlInput';
import type { Category, Product, ProductWithImages, Book as BookType, BookWithImages, Note } from '../types/database';
import type { ProductImage, BookImage, MediaAsset } from '../types/database';
import { supabase } from '../lib/supabase';

// ============================================================
// Main Admin Page
// ============================================================

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState('overview');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    adminAuth.getSession().then((s) => {
      setSession(s);
      setIsAdmin(adminAuth.isAdminSession(s));
      setLoading(false);
    });

    const sub = adminAuth.onAuthStateChange((s) => {
      setSession(s);
      setIsAdmin(adminAuth.isAdminSession(s));
    });

    return () => sub.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError('');
    setResetMsg('');
    const { error } = await adminAuth.signIn(email.trim(), password);
    if (error) setAuthError(error);
    setIsLoggingIn(false);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) { setAuthError('Nhập email để gửi link đặt lại mật khẩu.'); return; }
    setAuthError('');
    await adminAuth.sendPasswordReset(email.trim());
    setResetMsg('Nếu email hợp lệ, hệ thống đã gửi link đặt lại mật khẩu.');
  };

  const handleLogout = async () => {
    await adminAuth.signOut();
    setSession(null);
    setIsAdmin(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A3151]" />
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="p-8 max-w-lg w-full text-center border-neutral-200 shadow-sm">
          <h1 className="text-xl font-bold text-red-600 mb-3">Chưa cấu hình Supabase</h1>
          <p className="text-neutral-600 text-sm leading-6">
            Trang Admin cần <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> thật.
            Nếu chạy Docker, điền hai biến này trong <code>.env</code> rồi build lại image.
            Nếu chạy <code>npm run dev</code>, dùng <code>.env.local</code>.
          </p>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="p-8 max-w-md w-full border-neutral-200 shadow-sm">
          <h1 className="text-2xl font-serif font-bold text-[#0A3151] mb-1 text-center">Đăng nhập quản trị</h1>
          <p className="text-neutral-500 mb-6 text-center text-sm">Hệ quản trị chuyên dụng</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com" required autoComplete="email" disabled={isLoggingIn} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Mật khẩu</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••" required autoComplete="current-password" disabled={isLoggingIn} />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            {resetMsg && <p className="text-sm text-green-600">{resetMsg}</p>}
            <Button type="submit" disabled={isLoggingIn} className="w-full bg-[#0A3151] hover:bg-[#0D426E] text-white py-5">
              {isLoggingIn ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xác thực...</> : 'Đăng nhập'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button type="button" onClick={handleResetPassword} disabled={isLoggingIn}
              className="text-sm text-neutral-500 hover:text-[#0A3151] underline-offset-2 hover:underline">
              Quên mật khẩu?
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Card className="p-8 max-w-md w-full text-center border-neutral-200 shadow-sm">
          <h1 className="text-2xl font-serif font-bold text-[#0A3151] mb-2">Không có quyền truy cập</h1>
          <p className="text-neutral-500 mb-8">Tài khoản <strong>{session.user.email}</strong> chưa được cấp quyền quản trị CMS.</p>
          <Button onClick={handleLogout} className="w-full bg-[#0A3151] hover:bg-[#0D426E] text-white py-6 text-lg">
            Đăng xuất
          </Button>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, group: 'Hệ thống' },
    { id: 'categories', label: 'Danh mục bài viết', icon: Tags, group: 'Nội dung' },
    { id: 'notes', label: 'Ghi chú & Bài viết', icon: FileText, group: 'Nội dung' },
    { id: 'books', label: 'Thư viện Sách', icon: Book, group: 'Cửa hàng' },
    { id: 'products', label: 'Sản phẩm', icon: ShoppingBag, group: 'Cửa hàng' },
    { id: 'settings', label: 'Giao diện trang chủ', icon: Settings, group: 'Cấu hình' },
  ];

  const groupedMenu = menuItems.reduce((acc: Record<string, typeof menuItems>, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="w-64 bg-[#0A3151] text-white fixed h-full flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-[#0A3151] rounded flex items-center justify-center font-bold text-xl">WT</div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider">Control Center</h1>
              <p className="text-[10px] text-white/50">Dr. Wynn Tran CMS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {Object.entries(groupedMenu).map(([group, items]) => (
            <div key={group} className="mb-6">
              <h3 className="text-[10px] uppercase font-bold text-white/30 px-3 mb-2 tracking-widest">{group}</h3>
              <div className="space-y-1">
                {items.map((item) => (
                  <button key={item.id} onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeMenu === item.id ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    {activeMenu === item.id && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
              {session.user.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium truncate">Admin</p>
              <p className="text-[10px] text-white/40 truncate">{session.user.email}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}
            className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10 h-9 p-2">
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-xs">Đăng xuất hệ thống</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 min-h-screen">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#0A3151]">
              {menuItems.find(m => m.id === activeMenu)?.label}
            </h2>
            <p className="text-neutral-500 text-sm mt-1">
              Trang quản trị / {menuItems.find(m => m.id === activeMenu)?.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Ngày hệ thống</p>
            <p className="text-sm font-medium text-[#0A3151]">{new Date().toLocaleDateString('vi-VN')}</p>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeMenu === 'overview'    && <OverviewManager setActiveMenu={setActiveMenu} />}
          {activeMenu === 'settings'   && <SettingsManager session={session} />}
          {activeMenu === 'categories' && <CategoriesManager session={session} />}
          {activeMenu === 'books'      && <BooksManager session={session} />}
          {activeMenu === 'products'   && <ProductsManager session={session} />}
          {activeMenu === 'notes'      && <NotesManager session={session} />}
        </div>
      </main>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function TableAction({ onEdit, onDelete }: { onEdit?: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2 justify-end">
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50">
          <Edit className="w-3.5 h-3.5" />
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-neutral-100 text-neutral-500',
    in_review: 'bg-yellow-100 text-yellow-700',
    archived: 'bg-red-100 text-red-500',
  };
  const labels: Record<string, string> = { published: 'Đã xuất bản', draft: 'Bản nháp', in_review: 'Đang duyệt', archived: 'Lưu trữ' };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors[status] ?? ''}`}>{labels[status] ?? status}</span>;
}

interface ChecklistItem {
  label: string;
  ok: boolean;
  warn?: boolean;
}

function QualityChecklist({ items }: { items: ChecklistItem[] }) {
  const allOk = items.every(i => i.ok);
  return (
    <div className={`rounded-lg p-3 border ${allOk ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-2 text-neutral-500">Kiểm tra chất lượng</p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.ok
              ? <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              : item.warn
              ? <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
              : <Info className="w-3 h-3 text-red-400 shrink-0" />
            }
            <span className={`text-[11px] ${item.ok ? 'text-green-700' : item.warn ? 'text-amber-700' : 'text-red-600'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// OverviewManager
// ============================================================

function OverviewManager({ setActiveMenu }: { setActiveMenu: (id: string) => void }) {
  const [stats, setStats] = useState({ products: 0, books: 0, notes: 0, categories: 0 });
  const [recentActivity, setRecentActivity] = useState<Awaited<ReturnType<typeof content.getRecentActivity>>>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoadingStats(false); return; }
    content.getDashboardStats().then(s => { setStats(s); setLoadingStats(false); });
    content.getRecentActivity().then(setRecentActivity);
  }, []);

  const statCards = [
    { id: 'products', label: 'Sản phẩm', count: stats.products, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { id: 'books', label: 'Đầu sách', count: stats.books, icon: Book, color: 'bg-emerald-50 text-emerald-600' },
    { id: 'notes', label: 'Bài viết', count: stats.notes, icon: FileText, color: 'bg-amber-50 text-amber-600' },
    { id: 'categories', label: 'Danh mục', count: stats.categories, icon: Tags, color: 'bg-indigo-50 text-indigo-600' },
  ];

  const typeLabel: Record<string, string> = { products: 'Sản phẩm', books: 'Sách', notes: 'Ghi chú' };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(card => (
          <Card key={card.id} className="p-6 border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setActiveMenu(card.id)}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.color}`}><card.icon className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-neutral-400 font-medium">{card.label}</p>
                <p className="text-2xl font-bold text-neutral-800">{loadingStats ? '—' : card.count}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 border-none shadow-sm">
          <h3 className="font-bold text-[#0A3151] mb-6 flex items-center gap-2">
            <History className="w-4 h-4" /> Hoạt động gần đây
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((a, i) => (
              <div key={i} className="flex gap-4 items-start pb-4 border-b border-neutral-100 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.action.includes('thêm') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  {a.action.includes('thêm') ? <PlusCircle className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    <span className="font-bold">{typeLabel[a.type] ?? a.type}:</span> {a.title}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{a.action}</p>
                  <p className="text-[10px] text-neutral-400">{new Date(a.updated_at).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-neutral-400 italic">Chưa có hoạt động nào được ghi nhận...</p>
            )}
          </div>
        </Card>
        <Card className="p-6 border-none shadow-sm bg-[#0A3151] text-white">
          <h3 className="font-bold mb-4 opacity-80">Thông tin hỗ trợ</h3>
          <p className="text-sm text-white/70 leading-relaxed">
            Hệ thống CMS chuyên dụng được thiết kế để quản lý kho dữ liệu y khoa và sức khỏe.
            Vui lòng đảm bảo các thông tin cập nhật luôn có nguồn trích dẫn đáng tin cậy.
          </p>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Phiên bản</p>
            <p className="text-sm font-medium">2.0.0 Supabase Build</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// SettingsManager
// ============================================================

function SettingsManager({ session }: { session: Session }) {
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
      alert('Đã lưu cấu hình website.');
    } catch {
      alert('Lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  const setInput = (key: keyof settingsSvc.SiteSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [key]: event.target.value }));
  };

  const setTextArea = (key: keyof settingsSvc.SiteSettings) => (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSettings(prev => ({ ...prev, [key]: event.target.value }));
  };

  const getSettingsChecklist = (): ChecklistItem[] => [
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
            <QualityChecklist items={getSettingsChecklist()} />
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

// ============================================================
// BooksManager
// ============================================================

type BookFormData = { title: string; author: string; year: string; image: string; description: string; price: number; isNew: boolean; status: BookType['status'] };

function getBookChecklist(formData: BookFormData, images: Array<{ alt: string; is_primary: boolean }>): ChecklistItem[] {
  const hasPrimary = images.some(i => i.is_primary);
  const allAlt = images.length > 0 && images.every(i => i.alt && i.alt.trim().length > 0);
  return [
    { label: 'Tiêu đề sách', ok: !!formData.title },
    { label: 'Tác giả', ok: !!formData.author },
    { label: 'Mô tả (tối thiểu 50 ký tự)', ok: formData.description.length >= 50, warn: formData.description.length > 0 && formData.description.length < 50 },
    { label: 'Đã upload ảnh bìa', ok: images.length > 0, warn: images.length === 0 },
    { label: 'Ảnh bìa primary được chọn', ok: hasPrimary, warn: !hasPrimary && images.length > 0 },
    { label: 'Alt text cho tất cả ảnh', ok: allAlt, warn: !allAlt && images.length > 0 },
  ];
}

function BooksManager({ session }: { session: Session }) {
  const [books, setBooks] = useState<BookWithImages[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [galleryImages, setGalleryImages] = useState<Array<BookImage>>([]);
  const [formData, setFormData] = useState<BookFormData>({ title: '', author: '', year: '', image: '', description: '', price: 0, isNew: false, status: 'draft' });
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    setBooks(await content.getAllBooks());
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setJustCreated(false);
    setGalleryImages([]);
    setFormData({ title: '', author: '', year: '', image: '', description: '', price: 0, isNew: false, status: 'draft' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!editingId) {
        const book = await content.createBook({
          title: formData.title, author: formData.author, year: formData.year,
          description: formData.description, price: formData.price,
          isNew: formData.isNew, status: 'draft', imageUrl: formData.image || undefined,
        });
        setEditingId(book.id);
        setJustCreated(true);
        await load();
      } else {
        await content.updateBook(editingId, {
          title: formData.title, author: formData.author, year: formData.year,
          description: formData.description, price: formData.price,
          is_new: formData.isNew, status: formData.status, imageUrl: formData.image || undefined,
        });
        resetForm();
        await load();
      }
    } catch (e) { alert(e instanceof Error ? e.message : 'Lỗi khi lưu'); }
    setSaving(false);
  };

  const handleEdit = (book: BookWithImages) => {
    setFormData({ title: book.title, author: book.author ?? '', year: book.year ?? '', image: '', description: book.description ?? '', price: book.price ?? 0, isNew: book.is_new, status: book.status });
    setEditingId(book.id);
    setIsAdding(true);
    setJustCreated(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return;
    await content.deleteBook(id);
    await load();
  };

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.author ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Thư viện Sách</h2>
          <p className="text-xs text-neutral-400 mt-1">Quản lý kho sách sức khỏe và y khoa</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAdding(true); }} className="bg-[#0A3151] hover:bg-[#0D426E] text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm sách mới
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 border-none shadow-md mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-lg">{editingId && !justCreated ? 'Sửa thông tin sách' : editingId ? 'Bước 2: Upload ảnh bìa' : 'Bước 1: Thông tin cơ bản'}</h3>
                {justCreated && <p className="text-xs text-green-600 mt-0.5">Bản nháp đã tạo. Hãy upload ảnh bìa bên dưới.</p>}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>✕</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-xs">Tên sách</label><Input required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} /></div>
              <div><label className="label-xs">Tác giả</label><Input required value={formData.author} onChange={e => setFormData(p => ({ ...p, author: e.target.value }))} /></div>
              <div><label className="label-xs">Năm xuất bản</label><Input required value={formData.year} onChange={e => setFormData(p => ({ ...p, year: e.target.value }))} /></div>
              <div><label className="label-xs">Giá (VNĐ)</label><Input required type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} /></div>
              {editingId && (
                <div><label className="label-xs">Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as BookType['status'] }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="draft">Bản nháp</option>
                    <option value="published">Xuất bản</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              )}
              <div className="col-span-2"><label className="label-xs">Mô tả</label><Textarea required value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="book-isNew" checked={formData.isNew} onChange={e => setFormData(p => ({ ...p, isNew: e.target.checked }))} />
                <label htmlFor="book-isNew" className="text-sm">Đánh dấu là sách mới</label>
              </div>
            </div>

            {editingId && (
              <>
                <MediaGallery
                  entityId={editingId}
                  entityType="book"
                  maxImages={5}
                  aspectHint="3:4"
                  session={session}
                  onChanged={imgs => setGalleryImages(imgs as BookImage[])}
                />
                <QualityChecklist items={getBookChecklist(formData, galleryImages)} />
                <AdvancedImageUrlInput
                  value={formData.image}
                  onChange={url => setFormData(p => ({ ...p, image: url }))}
                />
              </>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>Hủy</Button>
              <Button type="submit" disabled={saving} className="bg-[#0A3151] px-8 text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingId ? 'Cập nhật' : 'Tạo bản nháp →'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg shadow-sm border border-neutral-100">
        <Search className="w-4 h-4 text-neutral-400 ml-2" />
        <Input className="border-none shadow-none focus-visible:ring-0 text-sm p-0 h-auto" placeholder="Tìm kiếm sách..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Bìa</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Tiêu đề & Tác giả</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Năm / Giá</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Trạng thái</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {filtered.map(book => {
                const primary = book.book_images?.find(i => i.is_primary);
                return (
                  <tr key={book.id} className="hover:bg-neutral-50">
                    <td className="p-4">
                      {primary ? <img src={primary.url} alt={primary.alt} className="w-10 h-14 rounded shadow-sm object-cover" referrerPolicy="no-referrer" /> : <div className="w-10 h-14 bg-neutral-100 rounded" />}
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-neutral-700 truncate">{book.title}</p>
                      <p className="text-xs text-neutral-400 mt-1">{book.author}</p>
                      <span className="text-[9px] text-neutral-400">{book.book_images?.length ?? 0} ảnh</span>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-neutral-500">{book.year}</p>
                      <p className="text-xs font-bold text-neutral-800 mt-1">{(book.price ?? 0).toLocaleString()}đ</p>
                    </td>
                    <td className="p-4"><StatusBadge status={book.status} /></td>
                    <td className="p-4"><TableAction onEdit={() => handleEdit(book)} onDelete={() => handleDelete(book.id)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// ProductsManager
// ============================================================

type ProductFormData = { name: string; price: number; image: string; description: string; tag: string; status: Product['status'] };

function getProductChecklist(formData: ProductFormData, images: Array<{ alt: string; is_primary: boolean }>): ChecklistItem[] {
  const hasPrimary = images.some(i => i.is_primary);
  const allAlt = images.length > 0 && images.every(i => i.alt && i.alt.trim().length > 0);
  return [
    { label: 'Tên sản phẩm', ok: !!formData.name },
    { label: 'Giá sản phẩm', ok: formData.price > 0 },
    { label: 'Mô tả sản phẩm', ok: formData.description.length >= 30, warn: formData.description.length > 0 && formData.description.length < 30 },
    { label: 'Nên có ít nhất 3 ảnh', ok: images.length >= 3, warn: images.length > 0 && images.length < 3 },
    { label: 'Ảnh primary được chọn', ok: hasPrimary, warn: !hasPrimary && images.length > 0 },
    { label: 'Alt text cho tất cả ảnh', ok: allAlt, warn: !allAlt && images.length > 0 },
  ];
}

function ProductsManager({ session }: { session: Session }) {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [galleryImages, setGalleryImages] = useState<Array<ProductImage>>([]);
  const [formData, setFormData] = useState<ProductFormData>({ name: '', price: 0, image: '', description: '', tag: '', status: 'draft' });
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => { if (supabase) setProducts(await content.getAllProducts()); }, []);
  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setJustCreated(false);
    setGalleryImages([]);
    setFormData({ name: '', price: 0, image: '', description: '', tag: '', status: 'draft' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!editingId) {
        const product = await content.createProduct({
          name: formData.name, description: formData.description, price: formData.price,
          tag: formData.tag || undefined, status: 'draft', imageUrl: formData.image || undefined,
        });
        setEditingId(product.id);
        setJustCreated(true);
        await load();
      } else {
        await content.updateProduct(editingId, {
          name: formData.name, price: formData.price, description: formData.description,
          tag: formData.tag, status: formData.status, imageUrl: formData.image || undefined,
        });
        resetForm();
        await load();
      }
    } catch (e) { alert(e instanceof Error ? e.message : 'Lỗi'); }
    setSaving(false);
  };

  const handleEdit = (p: ProductWithImages) => {
    setFormData({ name: p.name, price: p.price ?? 0, image: '', description: p.description ?? '', tag: p.tag ?? '', status: p.status });
    setEditingId(p.id);
    setIsAdding(true);
    setJustCreated(false);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Danh mục Sản phẩm</h2>
          <p className="text-xs text-neutral-400 mt-1">Quản lý sản phẩm thực phẩm chức năng và vật tư y tế</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAdding(true); }} className="bg-[#0A3151] hover:bg-[#0D426E] text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 border-none shadow-md mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-lg">{editingId && !justCreated ? 'Sửa sản phẩm' : editingId ? 'Bước 2: Upload ảnh sản phẩm' : 'Bước 1: Thông tin cơ bản'}</h3>
                {justCreated && <p className="text-xs text-green-600 mt-0.5">Bản nháp đã tạo. Hãy upload ảnh sản phẩm bên dưới.</p>}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>✕</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-xs">Tên sản phẩm</label><Input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="label-xs">Giá (VNĐ)</label><Input required type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} /></div>
              <div><label className="label-xs">Tag (VD: Bán chạy)</label><Input value={formData.tag} onChange={e => setFormData(p => ({ ...p, tag: e.target.value }))} /></div>
              {editingId && (
                <div><label className="label-xs">Trạng thái</label>
                  <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as Product['status'] }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="draft">Bản nháp</option>
                    <option value="published">Xuất bản</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              )}
              <div className="col-span-2"><label className="label-xs">Mô tả</label><Textarea required value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
            </div>

            {editingId && (
              <>
                <MediaGallery
                  entityId={editingId}
                  entityType="product"
                  maxImages={5}
                  aspectHint="1:1"
                  session={session}
                  onChanged={imgs => setGalleryImages(imgs as ProductImage[])}
                />
                <QualityChecklist items={getProductChecklist(formData, galleryImages)} />
                <AdvancedImageUrlInput
                  value={formData.image}
                  onChange={url => setFormData(p => ({ ...p, image: url }))}
                />
              </>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>Hủy</Button>
              <Button type="submit" disabled={saving} className="bg-[#0A3151] px-8 text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingId ? 'Cập nhật' : 'Tạo bản nháp →'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg shadow-sm border border-neutral-100">
        <Search className="w-4 h-4 text-neutral-400 ml-2" />
        <Input className="border-none shadow-none focus-visible:ring-0 text-sm p-0 h-auto" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Hình</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Sản phẩm</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Giá</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Trạng thái</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {filtered.map(p => {
                const primary = p.product_images?.find(i => i.is_primary);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="p-4">
                      {primary ? <img src={primary.url} alt={primary.alt} className="w-12 h-12 rounded object-cover border" referrerPolicy="no-referrer" /> : <div className="w-12 h-12 bg-neutral-100 rounded" />}
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-neutral-700 truncate">{p.name}</p>
                      {p.tag && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{p.tag}</span>}
                    </td>
                    <td className="p-4"><p className="text-sm font-bold text-neutral-600">{(p.price ?? 0).toLocaleString()}đ</p></td>
                    <td className="p-4"><StatusBadge status={p.status} /></td>
                    <td className="p-4"><TableAction onEdit={() => handleEdit(p)} onDelete={async () => { if (window.confirm('Xóa?')) { await content.deleteProduct(p.id); await load(); } }} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// CategoriesManager
// ============================================================

function CategoriesManager({ session: _session }: { session: Session }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => { if (supabase) setCategories(await content.getCategories()); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await content.updateCategory(editingId, formData);
    else await content.createCategory(formData);
    setIsAdding(false); setEditingId(null); setFormData({ name: '', description: '' }); await load();
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Cấu hình Danh mục</h2>
          <p className="text-xs text-neutral-400 mt-1">Quản lý các chuyên mục phân loại bài viết</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }); setIsAdding(true); }} className="bg-[#0A3151] hover:bg-[#0D426E] text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 border-none shadow-md mb-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-lg mb-4">{editingId ? 'Cập nhật chuyên mục' : 'Tạo chuyên mục mới'}</h3>
            <div><label className="label-xs">Tên danh mục</label><Input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="label-xs">Mô tả (Tùy chọn)</label><Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingId(null); }}>Hủy</Button>
              <Button type="submit" className="bg-[#0A3151] text-white px-8">{editingId ? 'Cập nhật' : 'Lưu'}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg shadow-sm border border-neutral-100">
        <Search className="w-4 h-4 text-neutral-400 ml-2" />
        <Input className="border-none shadow-none focus-visible:ring-0 text-sm p-0 h-auto" placeholder="Tìm kiếm danh mục..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b">
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Tên</th>
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Mô tả</th>
              <th className="p-4 text-[10px] uppercase font-bold text-neutral-400 text-right">Lệnh</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="p-4 font-bold text-[#0A3151]">{c.name}</td>
                <td className="p-4 text-xs text-neutral-500">{c.description ?? '—'}</td>
                <td className="p-4">
                  <TableAction
                    onEdit={() => { setFormData({ name: c.name, description: c.description ?? '' }); setEditingId(c.id); setIsAdding(true); }}
                    onDelete={async () => { if (window.confirm('Xóa danh mục?')) { await content.deleteCategory(c.id); await load(); } }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ============================================================
// NotesManager
// ============================================================

type NoteFormData = {
  title: string; excerpt: string; content: string; category_id: string;
  cover_image_url: string; cover_storage_path: string; cover_alt: string;
  read_time: string; status: Note['status'];
};

function getNoteChecklist(formData: NoteFormData): ChecklistItem[] {
  return [
    { label: 'Tiêu đề bài viết', ok: !!formData.title },
    { label: 'Tóm tắt ngắn', ok: formData.excerpt.length >= 20, warn: formData.excerpt.length > 0 && formData.excerpt.length < 20 },
    { label: 'Nội dung chi tiết', ok: formData.content.length >= 100, warn: formData.content.length > 0 && formData.content.length < 100 },
    { label: 'Ảnh bìa', ok: !!formData.cover_image_url, warn: !formData.cover_image_url },
    { label: 'Alt text ảnh bìa', ok: !!formData.cover_alt, warn: !!formData.cover_image_url && !formData.cover_alt },
  ];
}

function NotesManager({ session }: { session: Session }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState(false);
  const [savedCoverStoragePath, setSavedCoverStoragePath] = useState('');
  const [formData, setFormData] = useState<NoteFormData>({
    title: '', excerpt: '', content: '', category_id: '',
    cover_image_url: '', cover_storage_path: '', cover_alt: '',
    read_time: '', status: 'draft',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    const [n, c] = await Promise.all([content.getAllNotes(), content.getCategories()]);
    setNotes(n); setCategories(c);
  }, []);
  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setJustCreated(false);
    setSavedCoverStoragePath('');
    setFormData({ title: '', excerpt: '', content: '', category_id: '', cover_image_url: '', cover_storage_path: '', cover_alt: '', read_time: '', status: 'draft' });
  };

  const cleanupDraftCoverPath = async (currentPath: string, nextPath = '') => {
    if (currentPath && currentPath !== savedCoverStoragePath && currentPath !== nextPath) {
      await media.deleteStorageObjectIfUnused({ storagePath: currentPath });
    }
  };

  const cleanupSavedCoverPath = async (nextPath: string) => {
    if (savedCoverStoragePath && savedCoverStoragePath !== nextPath) {
      await media.deleteStorageObjectIfUnused({ storagePath: savedCoverStoragePath });
    }
  };

  const handleCancel = () => {
    void cleanupDraftCoverPath(formData.cover_storage_path);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formData.title, excerpt: formData.excerpt, content: formData.content,
        category_id: formData.category_id || undefined,
        cover_image_url: formData.cover_image_url || undefined,
        cover_storage_path: formData.cover_storage_path || undefined,
        cover_alt: formData.cover_alt || undefined,
        read_time: formData.read_time || undefined,
        status: formData.status,
      };
      if (editingId) {
        await content.updateNote(editingId, payload);
        if (formData.cover_storage_path) {
          await media.updateMediaAssetAltByStoragePath(formData.cover_storage_path, formData.cover_alt);
        }
        await cleanupSavedCoverPath(formData.cover_storage_path);
        resetForm();
      } else {
        const note = await content.createNote({ ...payload, status: 'draft' });
        setEditingId(note.id);
        setJustCreated(true);
        setSavedCoverStoragePath('');
        setFormData(prev => ({ ...prev, status: 'draft' }));
      }
      await load();
    } catch (e) { alert(e instanceof Error ? e.message : 'Lỗi'); }
    setSaving(false);
  };

  const handleEdit = (n: Note) => {
    setFormData({
      title: n.title, excerpt: n.excerpt ?? '', content: n.content ?? '',
      category_id: n.category_id ?? '',
      cover_image_url: n.cover_image_url ?? '',
      cover_storage_path: (n as Note & { cover_storage_path?: string }).cover_storage_path ?? '',
      cover_alt: (n as Note & { cover_alt?: string }).cover_alt ?? '',
      read_time: n.read_time ?? '',
      status: n.status,
    });
    setEditingId(n.id);
    setJustCreated(false);
    setSavedCoverStoragePath((n as Note & { cover_storage_path?: string }).cover_storage_path ?? '');
    setIsAdding(true);
  };

  const filtered = notes.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const getCatName = (id: string | null) => categories.find(c => c.id === id)?.name ?? '—';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Quản lý Kho Bài viết</h2>
          <p className="text-xs text-neutral-400 mt-1">Ghi chú y khoa, kiến thức chống lão hóa và chăm sóc sức khỏe</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAdding(true); }} className="bg-[#0A3151] hover:bg-[#0D426E] text-white">
          <Plus className="w-4 h-4 mr-2" /> Viết bài mới
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 border-none shadow-md mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  {editingId && !justCreated ? 'Cập nhật bài viết' : editingId ? 'Bước 2: Upload ảnh bìa' : 'Bước 1: Soạn bản nháp'}
                </h3>
                {justCreated && <p className="text-xs text-green-600 mt-0.5">Bản nháp đã tạo. Hãy upload ảnh bìa rồi cập nhật bài viết.</p>}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>✕</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="label-xs">Tiêu đề bài viết</label><Input required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="text-lg font-medium" /></div>
              <div><label className="label-xs">Chuyên mục</label>
                <select value={formData.category_id} onChange={e => setFormData(p => ({ ...p, category_id: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Chọn chuyên mục...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="label-xs">Trạng thái</label>
                <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value as Note['status'] }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="draft">Bản nháp</option>
                  <option value="in_review">Đang duyệt</option>
                  <option value="published">Xuất bản</option>
                  <option value="archived">Lưu trữ</option>
                </select>
              </div>
              <div><label className="label-xs">Thời gian đọc</label><Input placeholder="5 phút" value={formData.read_time} onChange={e => setFormData(p => ({ ...p, read_time: e.target.value }))} /></div>
              <div className="col-span-2"><label className="label-xs">Tóm tắt ngắn</label><Textarea required value={formData.excerpt} onChange={e => setFormData(p => ({ ...p, excerpt: e.target.value }))} rows={2} /></div>
              <div className="col-span-2"><label className="label-xs">Nội dung chi tiết</label><Textarea required className="min-h-[300px]" value={formData.content} onChange={e => setFormData(p => ({ ...p, content: e.target.value }))} /></div>
            </div>

            <div className="border-t pt-4">
              <MediaUploader
                label="Ảnh bìa bài viết"
                currentUrl={formData.cover_image_url}
                currentAlt={formData.cover_alt}
                aspectHint="16:9"
                disabled={!editingId}
                disabledReason="Lưu bản nháp trước để upload ảnh bìa"
                onUpload={async (file, alt) => {
                  const result = await media.uploadNoteCover(editingId!, file, { alt, uploadedBy: session.user.id });
                  return { url: result.url, storagePath: result.storagePath };
                }}
                onUploaded={({ url, storagePath, alt }) => {
                  void cleanupDraftCoverPath(formData.cover_storage_path, storagePath);
                  setFormData(p => ({ ...p, cover_image_url: url, cover_storage_path: storagePath, cover_alt: alt }));
                  logAction(session, 'upload_image', 'note', editingId!, { after: { url } });
                }}
                onRemove={() => {
                  void cleanupDraftCoverPath(formData.cover_storage_path);
                  setFormData(p => ({ ...p, cover_image_url: '', cover_storage_path: '', cover_alt: '' }));
                }}
                onAltChange={alt => setFormData(p => ({ ...p, cover_alt: alt }))}
                onSelectAsset={(asset) => {
                  void cleanupDraftCoverPath(formData.cover_storage_path, asset.storage_path);
                  setFormData(p => ({
                    ...p,
                    cover_image_url: asset.public_url,
                    cover_storage_path: asset.storage_path,
                    cover_alt: asset.alt,
                  }));
                  logAction(session, 'select_library_image', 'note', editingId!, { after: { media_asset_id: asset.id } });
                }}
              />
              <AdvancedImageUrlInput
                value={formData.cover_image_url}
                onChange={url => {
                  void cleanupDraftCoverPath(formData.cover_storage_path);
                  setFormData(p => ({ ...p, cover_image_url: url, cover_storage_path: '' }));
                }}
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <QualityChecklist items={getNoteChecklist(formData)} />

            <div className="flex gap-2 justify-end pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>Hủy</Button>
              <Button type="submit" disabled={saving} className="bg-[#0A3151] text-white px-10">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{editingId ? 'Cập nhật bài viết' : 'Tạo bản nháp →'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-lg shadow-sm border border-neutral-100">
        <Search className="w-4 h-4 text-neutral-400 ml-2" />
        <Input className="border-none shadow-none focus-visible:ring-0 text-sm p-0 h-auto" placeholder="Tìm kiếm bài viết..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b">
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Ảnh</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Tiêu đề & Chuyên mục</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400">Trạng thái</th>
                <th className="p-4 text-[10px] uppercase font-bold text-neutral-400 text-right">Lệnh</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {filtered.map(n => (
                <tr key={n.id} className="hover:bg-neutral-50">
                  <td className="p-4">
                    {n.cover_image_url ? <img src={n.cover_image_url} alt={(n as Note & { cover_alt?: string }).cover_alt || n.title} className="w-16 h-12 rounded object-cover border" referrerPolicy="no-referrer" /> : <div className="w-16 h-12 bg-neutral-100 rounded" />}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-neutral-700 truncate max-w-md">{n.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">#{getCatName(n.category_id)}</span>
                      {n.read_time && <span className="text-[10px] text-neutral-400">• {n.read_time}</span>}
                    </div>
                  </td>
                  <td className="p-4"><StatusBadge status={n.status} /></td>
                  <td className="p-4">
                    <TableAction
                      onEdit={() => handleEdit(n)}
                      onDelete={async () => { if (window.confirm('Xóa bài viết?')) { await content.deleteNote(n.id); await load(); } }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
