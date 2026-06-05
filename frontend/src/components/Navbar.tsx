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
      { label: 'Bottled Water Products', href: '/services#bottled' },
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-2xl bg-[#080e1c]/80 border-b border-white/8 shadow-glass' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
            <Droplets className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-white text-base tracking-tight">
            KITAYI<span className="text-primary">SOLUTIONS</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) =>
            item.sub ? (
              <div key={item.label} className="relative group">
                <button
                  className="nav-link flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/6"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  {item.label} <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
                {servicesOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-52 glass-card p-1.5 animate-fade-in"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    {item.sub.map((s) => (
                      <Link key={s.href} to={s.href} className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/8 transition-colors">
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                className={`nav-link px-3 py-2 rounded-lg hover:bg-white/6 ${location.pathname === item.href ? 'text-white' : ''}`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/pay-bill" className="btn-secondary text-xs px-4 py-2">Pay Bill</Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.user_type.includes('Admin') || user.user_type.includes('Manager') ? '/admin' : '/dashboard'}
                className="btn-primary text-xs px-4 py-2"
              >
                Dashboard
              </Link>
              <button onClick={logout} className="text-xs text-white/50 hover:text-white transition-colors px-2">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Sign In</Link>
              <Link to="/shop" className="btn-primary text-xs px-4 py-2">Order Water</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/8" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-card mx-4 mb-4 p-4 flex flex-col gap-1 animate-slide-up">
          {NAV.map((item) => (
            <Link key={item.label} to={item.sub ? item.href : item.href} className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition-colors">
              {item.label}
            </Link>
          ))}
          <hr className="border-white/10 my-1" />
          <Link to="/pay-bill" className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/8">Pay Bill</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="btn-primary text-xs mt-1 py-2.5">Dashboard</Link>
              <button onClick={logout} className="text-xs text-white/50 mt-1 px-3 py-2 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/8">Sign In</Link>
              <Link to="/shop" className="btn-primary text-xs mt-1 py-2.5">Order Water</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
