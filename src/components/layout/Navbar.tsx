import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, BookOpen, User, Home, FileText, ShoppingBag, Share2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { DEFAULT_SETTINGS, getSiteSettings, SiteSettings } from '@/services/settingsService';

const navItems = [
  { name: 'Trang chủ', path: '/', icon: Home },
  { name: 'Giới thiệu', path: '/about', icon: User },
  { name: 'Sách mới', path: '/books', icon: BookOpen },
  { name: 'Ghi chú', path: '/notes', icon: FileText },
  { name: 'Sản phẩm', path: '/products', icon: ShoppingBag },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const location = useLocation();

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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled ? 'bg-white py-3 border-neutral-200 shadow-sm' : 'bg-transparent py-5 border-transparent'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#0A3151] flex items-center justify-center text-white font-serif text-xl font-bold group-hover:bg-[#0D426E] transition-colors overflow-hidden">
            {settings.logoImage
              ? <img src={settings.logoImage} alt={settings.siteName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              : (settings.logoText || DEFAULT_SETTINGS.logoText)
            }
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-serif font-bold tracking-tight text-[#0A3151]">{settings.siteName}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">{settings.tagline}</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-[#0A3151] relative py-1',
                location.pathname === item.path ? 'text-[#0A3151]' : 'text-neutral-500'
              )}
            >
              {item.name}
              {location.pathname === item.path && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0A3151]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
          <Button 
            render={<a href="#footer" />}
            className="bg-[#0A3151] hover:bg-[#0D426E] text-white px-6 shadow-lg shadow-blue-900/10 hover:shadow-xl hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Phone className="w-4 h-4 mr-2" />
            Liên hệ
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8 mt-12">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-4 text-lg font-medium p-2 transition-colors',
                      location.pathname === item.path ? 'bg-neutral-100 text-[#0A3151]' : 'text-neutral-500 hover:bg-neutral-50'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
                <Button 
                  render={<a href="#footer" onClick={() => document.querySelector('[data-state="open"]')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))} />}
                  className="bg-[#0A3151] hover:bg-[#0D426E] text-white w-full mt-4 py-6 text-lg shadow-lg transition-all duration-300"
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
