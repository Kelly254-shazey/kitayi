import { Link } from 'react-router-dom';
import { Droplets, Phone, Mail, MapPin, Share2, MessageCircle, Heart, Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20" style={{ background: '#1B4FD8' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-black text-white text-base tracking-tight">
                KITAYI<span className="text-cta">SOLUTIONS</span>
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Delivering pure, KEBS-certified water to homes and businesses across Kenya since 2014.
            </p>
            <div className="flex gap-3">
              {[Share2, MessageCircle, Heart, Briefcase].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white/50 hover:text-cta hover:border-cta/40 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[['Home','/'],['About','/about'],['Services','/services'],['Shop','/shop'],['Contact','/contact']].map(([l,h]) => (
                <Link key={h} to={h} className="text-sm text-white/70 hover:text-cta transition-colors">{l}</Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Services</h4>
            <div className="flex flex-col gap-2">
              {['Residential Supply','Bulk Tanker Delivery','Bottled Water','Dispenser Refills','Corporate Accounts'].map(s => (
                <Link key={s} to="/services" className="text-sm text-white/70 hover:text-cta transition-colors">{s}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Contact</h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+254700000000" className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-cta shrink-0" /> +254 700 000 000
              </a>
              <a href="mailto:support@kitayisolutions.com" className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-cta shrink-0" /> support@kitayisolutions.com
              </a>
              <div className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin className="w-4 h-4 text-cta shrink-0 mt-0.5" />
                <span>Industrial Area, Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <span>© 2026 Kitayi Solutions Limited. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
