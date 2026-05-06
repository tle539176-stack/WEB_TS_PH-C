import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, BookOpen, User, Home, FileText, Phone, PlayCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { DEFAULT_SETTINGS, getSiteSettings, SiteSettings } from '@/services/settingsService';

const navItems = [
  { name: 'Trang chủ', path: '/', icon: Home },
  { name: 'Ghi chú', path: '/notes', icon: FileText },
  { name: 'Sách', path: '/books', icon: BookOpen },
  { name: 'Sản phẩm', path: '/products', icon: ShoppingBag },
  { name: 'Video', href: '/#video-facebook', icon: PlayCircle },
  { name: 'Giới thiệu', path: '/about', icon: User },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const location = useLocation();
  const siteNameDisplay = (settings.siteName || DEFAULT_SETTINGS.siteName).toLocaleUpperCase('vi-VN');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <nav
      className={cn(
        'public-on-blue fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0A3151] text-white shadow-lg shadow-[#0A3151]/15 transition-all duration-300',
        isScrolled ? 'py-3' : 'py-4'
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="public-text-blue w-10 h-10 bg-white flex items-center justify-center text-[#0A3151] text-xl font-bold transition-colors overflow-hidden">
            {settings.logoImage
              ? <img src={settings.logoImage} alt={siteNameDisplay} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              : (settings.logoText || DEFAULT_SETTINGS.logoText)
            }
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="max-w-[210px] truncate text-lg font-bold tracking-tight text-white sm:max-w-none">{siteNameDisplay}</span>
            <span className="max-w-[210px] truncate text-[10px] font-medium uppercase tracking-[0.2em] text-white/65 sm:max-w-none">{settings.tagline}</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => item.path ? (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-white relative py-1',
                location.pathname === item.path ? 'text-white' : 'text-white/68'
              )}
            >
              {item.name}
              {location.pathname === item.path && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ) : (
            <a
              key={item.name}
              href={item.href}
              className="relative py-1 text-sm font-medium text-white/68 transition-colors hover:text-white"
            >
              {item.name}
            </a>
          ))}
          <Button 
            render={<a href="#footer" />}
            className="public-text-blue bg-white hover:bg-white text-[#0A3151] px-6 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Phone className="w-4 h-4 mr-2" />
            Liên hệ
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="h-11 w-11 text-white hover:bg-white/10 hover:text-white" />}>
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="public-site w-[300px] bg-white text-[#0A3151] sm:w-[400px]">
              <div className="flex flex-col gap-8 mt-12">
                {navItems.map((item) => item.path ? (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      'flex min-h-12 items-center gap-4 p-3 text-lg font-medium transition-colors',
                      location.pathname === item.path ? 'bg-neutral-100 text-[#0A3151]' : 'text-neutral-500 hover:bg-neutral-50'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex min-h-12 items-center gap-4 p-3 text-lg font-medium text-[#0A3151] transition-colors hover:bg-[#0A3151]/5"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </a>
                ))}
                <Button 
                  render={<a href="#footer" onClick={() => document.querySelector('[data-state="open"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))} />}
                  className="public-on-blue bg-[#0A3151] hover:bg-[#0A3151] text-white w-full mt-4 py-6 text-lg shadow-lg transition-all duration-300"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  Liên hệ ngay
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
