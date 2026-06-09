import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Share2, MessageCircle, Heart, Award } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="bg-brand-navy border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-cyan to-brand-primary opacity-30" />
      
      <div className="max-w-7xl mx-auto px-10 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">

          {/* Brand Leadership */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <Link to="/" className="flex items-center gap-3">
                <BrandLogo variant="mark" className="h-10 w-auto brightness-0 invert" />
                <div className="flex flex-col leading-none">
                  <span className="font-display font-black text-xl tracking-tighter text-white uppercase">Kitayi</span>
                  <span className="text-[8px] font-black text-brand-cyan uppercase tracking-[0.4em]">Pure Water</span>
                </div>
              </Link>
            </div>
            <p className="text-sm text-white/70 leading-relaxed font-medium">
              Providing safe, clean, and reliable water delivery for homes and businesses since 2014.
            </p>
            <div className="flex gap-4">
              {[Share2, MessageCircle, Heart, Award].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-brand-cyan hover:border-brand-cyan/60 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-8">
            <h4 className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em]">Quick Links</h4>
            <div className="flex flex-col gap-4">
              {[
                { name: 'Services', path: '/services' },
                { name: 'About', path: '/about' },
                { name: 'Shop', path: '/shop' },
                { name: 'Contact', path: '/contact' }
              ].map((l) => (
                <Link key={l.path} to={l.path} className="text-sm font-bold text-white/60 hover:text-white transition-colors">{l.name}</Link>
              ))}
            </div>
          </div>

          {/* Our Services */}
          <div className="flex flex-col gap-8">
            <h4 className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em]">Our Services</h4>
            <div className="flex flex-col gap-4">
              {['Home Delivery','Office Supply','Bulk Tankers','Water Quality','Business Accounts'].map(s => (
                <Link key={s} to="/services" className="text-sm font-bold text-white/60 hover:text-white transition-colors">{s}</Link>
              ))}
            </div>
          </div>

          {/* Contact Us */}
          <div className="flex flex-col gap-8">
            <h4 className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em]">Get In Touch</h4>
            <div className="flex flex-col gap-6">
              <a href="tel:+254705002891" className="flex items-center gap-4 text-sm font-bold text-white/80 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Phone className="w-4 h-4 text-brand-cyan" /></div>
                +254 705 002 891
              </a>
              <a href="mailto:info@kitayi.co.ke" className="flex items-center gap-4 text-sm font-bold text-white/80 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Mail className="w-4 h-4 text-brand-cyan" /></div>
                info@kitayi.co.ke
              </a>
              <div className="flex items-start gap-4 text-sm font-bold text-white/60">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mt-1"><MapPin className="w-4 h-4 text-brand-cyan" /></div>
                <span>P.O Box 132-50204, <br/>Kimilli, Bungoma</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
          <span>© 2026 Kitayi Solutions Limited. All rights reserved.</span>
          <div className="flex gap-12">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
