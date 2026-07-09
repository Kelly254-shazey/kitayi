import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import BrandLogo from './BrandLogo';

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'About', path: '/about' },
  { name: 'Shop', path: '/shop' },
  { name: 'Pay Bill', path: '/pay-bill' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: isScrolled ? 'var(--surface-secondary)' : 'transparent',
        borderBottom: isScrolled ? '1px solid var(--border)' : 'none',
        boxShadow: isScrolled ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <BrandLogo variant="full" className="h-8 w-auto" />
            <div className="hidden sm:flex flex-col leading-none border-l pl-3" style={{ borderColor: 'var(--border)' }}>
              <span className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>KITAYI</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>SOLUTIONS LTD</span>
            </div>
          </Link>

          <ul className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="text-sm font-medium transition-colors py-2"
                  style={{
                    color: location.pathname === link.path ? '#2563eb' : 'var(--text-secondary)',
                  }}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="btn-ghost btn-sm"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link to="/login" className="btn-secondary btn-md">Log In</Link>
          <Link to="/register" className="btn-primary btn-md">Sign Up</Link>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <button onClick={toggleDarkMode} className="btn-ghost p-2" title="Toggle theme">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            className="p-2 rounded-lg"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="px-4 py-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: location.pathname === link.path ? '#2563eb' : 'var(--text-secondary)',
                    backgroundColor: location.pathname === link.path ? '#eff6ff' : 'transparent',
                  }}
                >
                  {link.name}
                </Link>
              ))}
              <div className="divider my-4" />
              <Link to="/login" className="btn-secondary btn-md w-full justify-center">Log In</Link>
              <Link to="/register" className="btn-primary btn-md w-full justify-center">Sign Up</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
