import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import {
  Loader2, LogOut, Book, ShoppingBag, FileText, Tags,
  LayoutDashboard, Settings, ChevronRight, Users,
} from 'lucide-react';
import * as adminAuth from '../services/adminAuthService';
import { supabase } from '../lib/supabase';
import { AdminToastProvider } from '../components/admin/common/AdminToast';
import { ConfirmDialogProvider } from '../components/admin/common/ConfirmDialog';
import { OverviewManager } from '../components/admin/overview/OverviewManager';
import { SettingsManager } from '../components/admin/settings/SettingsManager';
import { CategoriesManager } from '../components/admin/categories/CategoriesManager';
import { BooksManager } from '../components/admin/books/BooksManager';
import { ProductsManager } from '../components/admin/products/ProductsManager';
import { NotesManager } from '../components/admin/notes/NotesManager';
import { PeopleManager } from '../components/admin/people/PeopleManager';

const MENU_ITEMS = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, group: 'Hệ thống' },
  { id: 'categories', label: 'Danh mục bài viết', icon: Tags, group: 'Nội dung' },
  { id: 'notes', label: 'Ghi chú & Bài viết', icon: FileText, group: 'Nội dung' },
  { id: 'people', label: 'Người viết & Reviewer', icon: Users, group: 'Nội dung' },
  { id: 'books', label: 'Thư viện Sách', icon: Book, group: 'Cửa hàng' },
  { id: 'products', label: 'Sản phẩm', icon: ShoppingBag, group: 'Cửa hàng' },
  { id: 'settings', label: 'Giao diện trang chủ', icon: Settings, group: 'Cấu hình' },
] as const;

type MenuId = (typeof MENU_ITEMS)[number]['id'];

function AdminShell({ session }: { session: Session }) {
  const [activeMenu, setActiveMenu] = useState<MenuId>('overview');

  const grouped = MENU_ITEMS.reduce((acc: Record<string, typeof MENU_ITEMS[number][]>, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const activeLabel = MENU_ITEMS.find(m => m.id === activeMenu)?.label ?? '';

  const handleLogout = async () => { await adminAuth.signOut(); };

  return (
    <AdminToastProvider>
      <ConfirmDialogProvider>
        <div className="admin-ui min-h-screen bg-neutral-50 flex">
          {/* Sidebar */}
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
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="mb-6">
                  <h3 className="text-[10px] uppercase font-bold text-white/30 px-3 mb-2 tracking-widest">{group}</h3>
                  <div className="space-y-1">
                    {items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveMenu(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          activeMenu === item.id ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
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
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-red-500/10 h-9 p-2">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="text-xs">Đăng xuất hệ thống</span>
              </Button>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 ml-64 p-8 min-h-screen">
            <header className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-serif font-bold text-[#0A3151]">{activeLabel}</h2>
                <p className="text-neutral-500 text-sm mt-1">Trang quản trị / {activeLabel}</p>
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
              {activeMenu === 'people'     && <PeopleManager session={session} />}
            </div>
          </main>
        </div>
      </ConfirmDialogProvider>
    </AdminToastProvider>
  );
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    adminAuth.getSession().then(s => { setSession(s); setIsAdmin(adminAuth.isAdminSession(s)); setLoading(false); });
    const sub = adminAuth.onAuthStateChange(s => { setSession(s); setIsAdmin(adminAuth.isAdminSession(s)); });
    return () => sub.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true); setAuthError(''); setResetMsg('');
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

  if (loading) {
    return (
      <div className="admin-ui min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A3151]" />
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="admin-ui min-h-screen flex items-center justify-center bg-white">
        <Card className="p-8 max-w-lg w-full text-center border-neutral-200 shadow-sm">
          <h1 className="text-xl font-bold text-red-600 mb-3">Chưa cấu hình Supabase</h1>
          <p className="text-neutral-600 text-sm leading-6">
            Trang Admin cần <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> thật.
          </p>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="admin-ui min-h-screen flex items-center justify-center bg-white">
        <Card className="p-8 max-w-md w-full border-neutral-200 shadow-sm">
          <h1 className="text-2xl font-serif font-bold text-[#0A3151] mb-1 text-center">Đăng nhập quản trị</h1>
          <p className="text-neutral-500 mb-6 text-center text-sm">Hệ quản trị chuyên dụng</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required autoComplete="email" disabled={isLoggingIn} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Mật khẩu</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" required autoComplete="current-password" disabled={isLoggingIn} />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            {resetMsg && <p className="text-sm text-green-600">{resetMsg}</p>}
            <Button type="submit" disabled={isLoggingIn} className="w-full bg-[#0A3151] hover:bg-[#0D426E] text-white py-5">
              {isLoggingIn ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xác thực...</> : 'Đăng nhập'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button type="button" onClick={handleResetPassword} disabled={isLoggingIn} className="text-sm text-neutral-500 hover:text-[#0A3151] underline-offset-2 hover:underline">
              Quên mật khẩu?
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-ui min-h-screen flex items-center justify-center bg-white">
        <Card className="p-8 max-w-md w-full text-center border-neutral-200 shadow-sm">
          <h1 className="text-2xl font-serif font-bold text-[#0A3151] mb-2">Không có quyền truy cập</h1>
          <p className="text-neutral-500 mb-8">Tài khoản <strong>{session.user.email}</strong> chưa được cấp quyền quản trị CMS.</p>
          <Button onClick={() => adminAuth.signOut()} className="w-full bg-[#0A3151] hover:bg-[#0D426E] text-white py-6 text-lg">Đăng xuất</Button>
        </Card>
      </div>
    );
  }

  return <AdminShell session={session} />;
}
