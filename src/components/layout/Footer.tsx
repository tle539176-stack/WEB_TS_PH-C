import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, getSiteSettings, SiteSettings } from '../../services/settingsService';

const DEFAULTS = {
  facebookUrl: '',
  youtubeUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  address: '',
  contactEmail: '',
  contactPhone: '',
};

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const s = settings;
  const siteNameDisplay = (s?.siteName || DEFAULT_SETTINGS.siteName).toLocaleUpperCase('vi-VN');

  const socialLinks = [
    { icon: Facebook, url: s?.facebookUrl || DEFAULTS.facebookUrl, color: 'hover:bg-white/20' },
    { icon: Youtube, url: s?.youtubeUrl || DEFAULTS.youtubeUrl, color: 'hover:bg-white/20' },
    { icon: Instagram, url: s?.instagramUrl || DEFAULTS.instagramUrl, color: 'hover:bg-white/20' },
    { icon: Twitter, url: s?.twitterUrl || DEFAULTS.twitterUrl, color: 'hover:bg-white/20' },
  ].filter(social => social.url);

  const contactItems = [
    { icon: MapPin, value: s?.address || DEFAULTS.address },
    { icon: Mail, value: s?.contactEmail || DEFAULTS.contactEmail },
    { icon: Phone, value: s?.contactPhone || DEFAULTS.contactPhone },
  ].filter(item => item.value);

  return (
    <footer id="footer" className="public-on-blue bg-[var(--public-navy)] text-white pt-16 pb-10">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="public-text-blue w-10 h-10 bg-white flex items-center justify-center text-[var(--public-navy)] text-xl font-bold overflow-hidden">
                {s?.logoImage
                  ? <img src={s.logoImage} alt={siteNameDisplay} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  : (s?.logoText || DEFAULT_SETTINGS.logoText)
                }
              </div>
              <span className="text-xl font-bold tracking-tight">{siteNameDisplay}</span>
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
            <h4 className="text-lg font-bold mb-6">Liên kết nhanh</h4>
            <ul className="flex flex-col gap-4 text-neutral-400 text-sm">
              <li><Link to="/notes" className="hover:text-white transition-colors">Ghi chú y khoa</Link></li>
              <li><Link to="/books" className="hover:text-white transition-colors">Sách đã xuất bản</Link></li>
              <li><a href="/#video-facebook" className="hover:text-white transition-colors">Video Facebook</a></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Về {siteNameDisplay}</Link></li>
              <li className="pt-2"><Link to="/admin" className="hover:text-white transition-colors">Đăng nhập quản trị</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Chuyên mục</h4>
            <ul className="flex flex-col gap-4 text-neutral-400 text-sm">
              <li><Link to="/notes" className="hover:text-white transition-colors">Chống lão hóa</Link></li>
              <li><Link to="/notes" className="hover:text-white transition-colors">Dinh dưỡng</Link></li>
              <li><Link to="/notes" className="hover:text-white transition-colors">Thực phẩm bổ sung</Link></li>
              <li><Link to="/notes" className="hover:text-white transition-colors">Tầm soát sức khỏe</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Thông tin liên hệ</h4>
            <ul className="flex flex-col gap-4 text-neutral-400 text-sm">
              {contactItems.length > 0 ? contactItems.map(({ icon: Icon, value }) => (
                <li key={value} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-neutral-500 shrink-0" />
                  <span>{value}</span>
                </li>
              )) : (
                <li className="text-neutral-500">Thông tin liên hệ sẽ được cập nhật.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-500 text-xs">
          <div>
            <p>© {new Date().getFullYear()} {siteNameDisplay}. All rights reserved.</p>
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
