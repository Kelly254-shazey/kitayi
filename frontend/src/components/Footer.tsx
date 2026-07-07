import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="border-t" style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          <div className="flex flex-col gap-5">
            <Link to="/">
              <BrandLogo variant="full" className="h-10 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
              Providing safe, clean, and reliable water delivery for homes and businesses since 2014.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-label" style={{ color: '#06b6d4' }}>Quick Links</h4>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Services', path: '/services' },
                { name: 'About', path: '/about' },
                { name: 'Shop', path: '/shop' },
                { name: 'Contact', path: '/contact' },
              ].map((l) => (
                <Link key={l.path} to={l.path} className="text-sm font-medium transition-colors" style={{ color: '#64748b' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  {l.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-label" style={{ color: '#06b6d4' }}>Services</h4>
            <div className="flex flex-col gap-3">
              {['Home Delivery', 'Office Supply', 'Bulk Tankers', 'Water Quality'].map(s => (
                <Link key={s} to="/services" className="text-sm font-medium transition-colors" style={{ color: '#64748b' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-label" style={{ color: '#06b6d4' }}>Contact</h4>
            <div className="flex flex-col gap-4">
              <a href="tel:+254705002891" className="flex items-center gap-3 text-sm font-medium transition-colors" style={{ color: '#cbd5e1' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
              >
                <Phone className="w-4 h-4" style={{ color: '#06b6d4' }} />
                +254 705 002 891
              </a>
              <a href="mailto:info@kitayi.co.ke" className="flex items-center gap-3 text-sm font-medium transition-colors" style={{ color: '#cbd5e1' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
              >
                <Mail className="w-4 h-4" style={{ color: '#06b6d4' }} />
                info@kitayi.co.ke
              </a>
              <div className="flex items-start gap-3 text-sm" style={{ color: '#64748b' }}>
                <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#06b6d4' }} />
                <span>P.O Box 132-50204,<br />Kimilli, Bungoma</span>
              </div>
            </div>
          </div>
        </div>

        <div className="divider mt-12 mb-8" style={{ backgroundColor: '#1e293b' }} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-caption" style={{ color: '#475569' }}>
          <span>&copy; 2026 Kitayi Solutions Limited. All rights reserved.</span>
          <div className="flex gap-8">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
