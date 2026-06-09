import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import BrandLogo from './BrandLogo';

const NAV_LINKS = [
  { name: 'Services', path: '/services' },
  { name: 'About', path: '/about' },
  { name: 'Shop', path: '/shop' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'py-3 md:py-4 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl border-b border-brand-primary/10 dark:border-white/10' 
          : 'py-6 md:py-8 bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-6 lg:gap-16">
          <Link to="/" className="group transition-transform hover:scale-105 active:scale-95 flex items-center gap-3">
            <BrandLogo variant="mark" className="h-8 md:h-10 w-auto brightness-0 dark:invert text-brand-primary" />
            <div className="flex flex-col leading-none">
              <span className="font-display font-black text-lg md:text-xl tracking-tighter text-brand-navy dark:text-white uppercase">Kitayi</span>
              <span className="text-[7px] md:text-[8px] font-black text-brand-primary uppercase tracking-[0.4em]">Pure Water</span>
            </div>
          </Link>

          <ul className="hidden md:flex items-center gap-6 lg:gap-10">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`text-xs font-black uppercase tracking-[0.15em] transition-colors hover:text-brand-primary dark:hover:text-white relative py-2 ${
                    location.pathname === link.path ? 'text-brand-primary dark:text-white' : 'text-ink/40 dark:text-white/40'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-px bg-brand-primary dark:bg-brand-cyan shadow-glow"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-2xl glass-panel text-brand-primary dark:text-white/40 hover:bg-brand-primary/5 dark:hover:text-white transition-all group"
            title="Toggle Mode"
          >
            {isDark ? <Sun className="w-4 h-4 transition-transform group-hover:rotate-90 duration-500" /> : <Moon className="w-4 h-4 transition-transform group-hover:-rotate-12 duration-500" />}
          </button>
          
          <div className="h-6 w-px bg-brand-primary/10 dark:bg-white/10" />
          
          <Link to="/login" className="btn-glass px-6 lg:px-8 py-2.5 lg:py-3">
            Log In
          </Link>
          <Link to="/register" className="btn-premium px-6 lg:px-8 py-2.5 lg:py-3">
            Sign Up
          </Link>
        </div>

        {/* Mobile Control */}
        <div className="flex items-center gap-6 md:hidden">
          <button onClick={toggleDarkMode} className="text-brand-primary dark:text-white/40">{isDark ? <Sun size={22} /> : <Moon size={22} />}</button>
          <button
            className="p-2 text-brand-navy dark:text-white/80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-white dark:bg-brand-black/95 backdrop-blur-elite border-b border-brand-primary/5 dark:border-white/10 overflow-hidden"
          >
            <div className="px-10 py-12 flex flex-col gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl font-display font-black text-ink/60 dark:text-white/60 hover:text-brand-primary dark:hover:text-white uppercase tracking-tighter transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px w-full bg-brand-primary/5 dark:bg-white/10 my-4" />
              <div className="grid grid-cols-2 gap-4">
                <Link to="/login" className="btn-glass w-full text-center py-4">Log In</Link>
                <Link to="/register" className="btn-premium w-full text-center py-4">Sign Up</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
