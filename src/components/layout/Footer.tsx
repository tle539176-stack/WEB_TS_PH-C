import { Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, getSiteSettings, SiteSettings } from '../../services/settingsService';

const DEFAULTS = {
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

  const contactItems = [
    { icon: MapPin, value: s?.address || DEFAULTS.address },
    { icon: Mail, value: s?.contactEmail || DEFAULTS.contactEmail },
    { icon: Phone, value: s?.contactPhone || DEFAULTS.contactPhone },
  ].filter(item => item.value);

  const hasContactInfo = contactItems.length > 0;

  return (
    <footer id="footer" className="public-on-blue bg-[var(--public-navy)] text-white py-5 md:py-6">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
        {hasContactInfo && (
        <div className="mx-auto mb-5 max-w-xl text-center md:mb-6">
          <h4 className="public-card-title mb-4 text-white">Liên hệ</h4>
          <ul className="public-small space-y-3">
            {contactItems.map(({ icon: Icon, value }) => (
              <li key={value} className="flex items-start justify-center gap-3 text-white/76">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/52" />
                <span className="leading-6">{value}</span>
              </li>
            ))}
          </ul>
        </div>
        )}
        <div className={`public-meta ${hasContactInfo ? 'border-t border-white/12 pt-4' : ''} text-center italic text-white/60`}>
          <p className="mx-auto max-w-3xl">{s?.medicalDisclaimer || DEFAULT_SETTINGS.medicalDisclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
