import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/auth';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  {
    label: 'Services', href: '/services',
    sub: [
      { label: 'Residential Supply', href: '/services#residential' },
      { label: 'Commercial & Industrial', href: '/services#commercial' },
      { label: 'Bottled Water', href: '/services#bottled' },
    ],
  },
  { label: 'Shop', href: '/shop' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = location.pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'shadow-brand-md'
        : ''
    } brand-surface`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-black text-white text-base tracking-tight">
            KITAYI<span className="text-cta">SOLUTIONS</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(item =>
            item.sub ? (
              <div key={item.label} className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}>
                <button className={`nav-link flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 ${pathname.startsWith('/services') ? 'active text-white' : ''}`}>
                  {item.label} <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
                {servicesOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 card p-1.5 animate-fade-in shadow-card-md">
                    {item.sub.map(s => (
                      <Link key={s.href} to={s.href}
                        className="block px-3 py-2.5 rounded-xl text-sm text-ink-secondary hover:text-brand hover:bg-brand-light transition-colors">
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={item.href} to={item.href}
                className={`nav-link px-3 py-2 rounded-lg hover:bg-white/10 ${pathname === item.href ? 'active text-white' : ''}`}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/pay-bill" className="btn-cta text-xs px-4 py-2">Pay Bill</Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link to={user.user_type.includes('Admin') || user.user_type.includes('Manager') ? '/admin' : '/dashboard'}
                className="btn-ghost text-xs px-4 py-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50">
                Dashboard
              </Link>
              <button onClick={logout} className="text-xs text-white/60 hover:text-white transition-colors px-2">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Sign In</Link>
              <Link to="/shop" className="btn-cta text-xs px-4 py-2">Order Water</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && pathname && (
        <div key={pathname} className="md:hidden bg-white border-t border-base-200 px-4 py-3 flex flex-col gap-1 shadow-card-md animate-slide-up">
          {NAV.map(item => (
            <Link key={item.label} to={item.href} onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:text-brand hover:bg-brand-light transition-colors">
              {item.label}
            </Link>
          ))}
          <hr className="border-base-200 my-1" />
          <Link to="/pay-bill" onClick={() => setOpen(false)} className="btn-cta py-2.5 text-xs mt-1">Pay Bill</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-brand py-2.5 text-xs mt-1">Dashboard</Link>
              <button onClick={logout} className="text-xs text-ink-muted mt-1 px-3 py-2 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm font-medium text-ink hover:text-brand hover:bg-brand-light rounded-xl transition-colors">Sign In</Link>
              <Link to="/shop" onClick={() => setOpen(false)} className="btn-cta py-2.5 text-xs mt-1">Order Water</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
