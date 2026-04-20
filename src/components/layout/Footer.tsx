import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, getSiteSettings, SiteSettings } from '../../services/settingsService';

const DEFAULTS = {
  facebookUrl: 'https://facebook.com/drwynntran',
  youtubeUrl: 'https://youtube.com/c/DrWynnTranOfficial',
  instagramUrl: 'https://instagram.com/drwynntran',
  twitterUrl: 'https://twitter.com/drwynntran',
  address: 'Los Angeles, California, USA',
  contactEmail: 'contact@drwynntran.com',
  contactPhone: '+1 (xxx) xxx-xxxx',
};

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const s = settings;

  const socialLinks = [
    { icon: Facebook, url: s?.facebookUrl || DEFAULTS.facebookUrl, color: 'hover:bg-blue-600' },
    { icon: Youtube, url: s?.youtubeUrl || DEFAULTS.youtubeUrl, color: 'hover:bg-red-600' },
    { icon: Instagram, url: s?.instagramUrl || DEFAULTS.instagramUrl, color: 'hover:bg-pink-600' },
    { icon: Twitter, url: s?.twitterUrl || DEFAULTS.twitterUrl, color: 'hover:bg-sky-500' },
  ];

  return (
    <footer id="footer" className="bg-[#1A1A1A] text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white flex items-center justify-center text-[#1A1A1A] font-serif text-xl font-bold overflow-hidden">
                {s?.logoImage
                  ? <img src={s.logoImage} alt={s.siteName || DEFAULT_SETTINGS.siteName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  : (s?.logoText || DEFAULT_SETTINGS.logoText)
                }
              </div>
              <span className="text-xl font-serif font-bold tracking-tight">{s?.siteName || DEFAULT_SETTINGS.siteName}</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
              {s?.footerText || DEFAULT_SETTINGS.footerText}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-white/10 flex items-center justify-center ${social.color} transition-all duration-300`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 font-serif">Liên kết nhanh</h4>
            <ul className="flex flex-col gap-4 text-neutral-400 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">Về Bác sĩ Wynn Tran</Link></li>
              <li><Link to="/books" className="hover:text-white transition-colors">Sách đã xuất bản</Link></li>
              <li><Link to="/notes" className="hover:text-white transition-colors">Ghi chú y khoa</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Sản phẩm khuyên dùng</Link></li>
              <li className="pt-2"><Link to="/admin" className="text-[#0A3151] hover:text-white transition-colors">Đăng nhập Quản trị viên</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 font-serif">Chuyên mục</h4>
            <ul className="flex flex-col gap-4 text-neutral-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Chống lão hóa</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Dinh dưỡng & Sức khỏe</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Y học thường thức</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hoạt động cộng đồng</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 font-serif">Thông tin liên hệ</h4>
            <ul className="flex flex-col gap-4 text-neutral-400 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neutral-500 shrink-0" />
                <span>{s?.address || DEFAULTS.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-neutral-500 shrink-0" />
                <span>{s?.contactEmail || DEFAULTS.contactEmail}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-neutral-500 shrink-0" />
                <span>{s?.contactPhone || DEFAULTS.contactPhone}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-500 text-xs">
          <div>
            <p>© {new Date().getFullYear()} {s?.siteName || DEFAULT_SETTINGS.siteName}. All rights reserved.</p>
            <p className="mt-2 max-w-2xl leading-relaxed">{s?.medicalDisclaimer || DEFAULT_SETTINGS.medicalDisclaimer}</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
