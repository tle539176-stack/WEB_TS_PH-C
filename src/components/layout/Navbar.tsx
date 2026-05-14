import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Menu, BookOpen, User, Home, FileText, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { DEFAULT_SETTINGS, getSiteSettings, SiteSettings } from '@/services/settingsService';

const navItems = [
  { name: 'Trang chủ', path: '/', icon: Home },
  { name: 'Giới thiệu', path: '/about', icon: User },
  { name: 'Ghi chú', path: '/notes', icon: FileText },
  { name: 'Sách', path: '/books', icon: BookOpen },
  { name: 'Sản phẩm', path: '/products', icon: ShoppingBag },
];

function BrandMark({ settings, siteNameDisplay }: { settings: SiteSettings; siteNameDisplay: string }) {
  const logoText = (settings.logoText || DEFAULT_SETTINGS.logoText || 'DHP').trim().toUpperCase() === 'DP'
    ? 'DHP'
    : (settings.logoText || DEFAULT_SETTINGS.logoText || 'DHP');

  return (
    <>
      <div className="public-navbar-logo public-text-blue flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-[#c9a64a] bg-[#fbfaf4] font-serif text-[16px] font-bold tracking-[0.04em] text-[var(--public-navy)] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.85)] transition-colors lg:h-12 lg:w-12 lg:text-[18px]">
        {settings.logoImage
          ? <img src={settings.logoImage} alt={siteNameDisplay} className="public-navbar-logo-image h-full w-full object-cover" referrerPolicy="no-referrer" />
          : logoText
        }
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-[3.5px] lg:gap-1.5">
        <span className="block max-w-full truncate text-[15.5px] font-bold uppercase leading-[1.12] text-white sm:text-[16.5px] lg:text-[17px]">
          ĐẶNG HỮU PHÚC
        </span>
        <span className="public-gold-text block max-w-full truncate text-[13px] font-medium italic leading-[1.18] sm:text-[13.5px] lg:text-[14.5px]">
          Tiến sĩ Chống lão hóa
        </span>
      </div>
    </>
  );
}

export default function Navbar() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const location = useLocation();
  const siteNameDisplay = (settings.siteName || DEFAULT_SETTINGS.siteName).toLocaleUpperCase('vi-VN');

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <nav
      className={cn(
        'public-on-blue fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-[var(--public-navy)] text-white shadow-lg shadow-[rgba(10,49,81,0.15)] md:h-[68px]'
      )}
    >
      <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        <Link to="/" className="group hidden min-w-0 flex-1 items-center gap-2 lg:flex">
          <BrandMark settings={settings} siteNameDisplay={siteNameDisplay} />
        </Link>

        {/* Mobile Nav */}
        <div className="flex w-full items-center justify-between gap-3 lg:hidden">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-2">
            <BrandMark settings={settings} siteNameDisplay={siteNameDisplay} />
          </Link>
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="h-11 w-11 text-white hover:bg-white/10 hover:text-white" />}>
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="left" className="public-site w-[300px] bg-white text-[var(--public-navy)] sm:w-[360px]">
              <div className="flex flex-col gap-8 mt-12">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      'flex min-h-12 items-center gap-4 p-3 text-lg font-medium transition-colors',
                      location.pathname === item.path ? 'bg-[var(--public-warm-ivory)] text-[var(--public-navy)]' : 'text-neutral-500 hover:bg-[var(--public-warm-ivory)]'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'text-sm font-normal transition-colors hover:text-white relative py-1',
                location.pathname === item.path ? 'public-gold-text opacity-100' : 'text-white opacity-75'
              )}
            >
              {item.name}
              {location.pathname === item.path && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C79A3D]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

      </div>
    </nav>
  );
}
