import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Droplets,
  ShieldCheck,
  Truck,
  Users,
  Activity,
  Globe,
  Lock,
  Plus,
  BadgeCheck,
  Leaf,
  FlaskConical,
  ShoppingCart
} from 'lucide-react';
import {
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { productsApi } from '../services/api';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_qty: number;
  image_url?: string;
};

const STATS = [
  { value: '15+', label: 'Years in Business', icon: Award, color: 'text-brand-primary' },
  { value: '75k+', label: 'Happy Customers', icon: Users, color: 'text-brand-secondary' },
  { value: '1M+', label: 'Litres Delivered', icon: Droplets, color: 'text-brand-primary' },
  { value: 'WHO', label: 'Safety Standards', icon: ShieldCheck, color: 'text-emerald-500' },
];

const HERO_MESSAGES = ['Clean Water', 'Fast Delivery', 'Pure Quality', 'Safe Supply'];

const ANALYTICS_DATA = [
  { time: '00:00', volume: 4000 },
  { time: '04:00', volume: 3000 },
  { time: '08:00', volume: 2000 },
  { time: '12:00', volume: 2780 },
  { time: '16:00', volume: 1890 },
  { time: '20:00', volume: 2390 },
  { time: '23:59', volume: 3490 },
];

const SERVICES = [
  { 
    title: 'Home Delivery', 
    desc: 'Fresh and pure drinking water delivered right to your doorstep for your family.', 
    icon: Droplets,
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  { 
    title: 'Office Supply', 
    desc: 'Reliable water solutions to keep your office and staff hydrated throughout the day.', 
    icon: Globe,
    gradient: 'from-blue-600/20 to-blue-400/20'
  },
  { 
    title: 'Bulk Delivery', 
    desc: 'Large capacity water tankers for construction, hotels, and big events.', 
    icon: Truck,
    gradient: 'from-blue-700/20 to-blue-500/20'
  },
  { 
    title: 'Secure Payments', 
    desc: 'Simple and safe payment options for easy and quick water ordering.', 
    icon: Lock,
    gradient: 'from-cyan-500/20 to-blue-500/20'
  },
];

const TRUST_MARKERS = [
  { icon: BadgeCheck, title: 'KEBS Certified', desc: 'Standard GS 1234 compliance' },
  { icon: FlaskConical, title: 'Lab Tested', desc: 'Rigorous 24-step purification' },
  { icon: Leaf, title: 'Sustainable', desc: 'Eco-conscious logistics' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  const [heroMessageIndex, setHeroMessageIndex] = useState(0);
  const [quickProducts, setQuickProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsApi.list({ ordering: 'price' })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setQuickProducts(data.slice(0, 4));
      })
      .catch(console.error);

    const timer = setInterval(() => {
      setHeroMessageIndex(current => (current + 1) % HERO_MESSAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page-shell relative transition-colors duration-500 min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden section-padding pt-32">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="content-container text-center relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8 inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-panel border-brand-primary/10"
          >
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-glow droplet-pulse" />
            <span className="text-[10px] font-display font-black tracking-[0.4em] uppercase text-brand-primary dark:text-white/60">
              Pure Water For Everyone
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight mb-8 text-brand-navy dark:text-white uppercase">
            <span className="block mb-2">Pure Water.</span>
            <div className="h-[1.2em] relative overflow-hidden flex justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroMessageIndex}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-premium-gradient absolute"
                >
                  {HERO_MESSAGES[heroMessageIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl text-ink dark:text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            Kitayi delivers safe, clean, and high-quality water to your home and office. 
            We are committed to providing reliable service every single day.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/register" className="btn-premium group px-12 py-5 text-lg">
              Order Now
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/services" className="btn-glass px-12 py-5 text-lg flex items-center justify-center">
              Our Services
              <Globe className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Liquid Wave Decor */}
        <div className="liquid-wave opacity-30 dark:opacity-10" />

        {/* Parallax Water Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ y: [0, -30, 0], rotate: [6, 8, 6] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[15%] right-[5%] hidden lg:block"
          >
            <div className="glass-card p-6 w-72 shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center droplet-pulse"><Activity className="w-6 h-6 text-brand-primary" /></div>
                <span className="text-[10px] font-black text-brand-primary/30 uppercase tracking-widest font-mono-data">NODE-01</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/40 dark:text-white/40 block mb-1 font-mono-data">Water Pressure</span>
              <span className="font-mono-data text-3xl font-black text-brand-navy dark:text-white">4.21 BAR</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Authority Stats Row */}
      <section className="section-padding relative overflow-hidden bg-white dark:bg-brand-black/40 border-y border-brand-primary/5">
        <div className="content-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants} className="stat-card group hover:border-brand-primary/40 transition-all border-none shadow-none">
                <stat.icon className={`w-6 h-6 mb-4 ${stat.color} transition-transform group-hover:scale-110`} />
                <span className="stat-value text-4xl text-brand-navy dark:text-white font-mono-data">{stat.value}</span>
                <span className="stat-label text-brand-primary/60 dark:text-white/60 font-black uppercase tracking-widest">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Certification Section */}
      <section className="py-20 bg-brand-soft/20 dark:bg-white/[0.01]">
        <div className="content-container">
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            {TRUST_MARKERS.map((marker, i) => (
              <div key={i} className="flex items-center gap-3">
                <marker.icon className="w-8 h-8 text-brand-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy dark:text-white">{marker.title}</span>
                  <span className="text-[9px] font-bold text-brand-primary/60 dark:text-white/60">{marker.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Repository */}
      <section className="section-padding relative">
        <div className="content-container">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-xl text-left">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 block">Our Products</span>
              <h2 className="text-4xl md:text-7xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tighter leading-none mb-6">Safe <br/><span className="text-premium-gradient">Water.</span></h2>
              <p className="text-lg text-ink dark:text-white/80 font-medium">Browse our products and find the perfect water solution for you.</p>
            </div>
            <Link to="/shop" className="btn-glass px-10 py-4 flex items-center gap-3">
              Shop Water <ShoppingCart className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate('/shop')}
                className="glass-card flex flex-col group cursor-pointer overflow-hidden border-brand-primary/5 hover:border-brand-primary/30 transition-all shadow-none bg-white/60 dark:bg-white/5"
              >
                <div className="h-56 relative overflow-hidden">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    onError={e => e.currentTarget.src = 'https://images.unsplash.com/photo-1548839133-9aa08246bc61?w=800'} />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 bg-brand-primary/10 dark:bg-brand-primary/20 backdrop-blur-md border border-brand-primary/20 px-3 py-1.5 rounded-full">
                    <span className="text-[9px] font-black text-brand-primary dark:text-white uppercase tracking-widest">{p.category}</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col gap-6 flex-1">
                  <div>
                    <h3 className="text-xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tight mb-1">{p.name}</h3>
                    <p className="text-[10px] font-bold text-brand-primary/60 dark:text-white/50 uppercase tracking-widest font-mono-data font-black">Batch Ref: {p.id.slice(0,8)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-display font-black text-brand-primary dark:text-white font-mono-data tracking-tighter uppercase">Ksh {p.price.toLocaleString()}</span>
                    <div className="w-10 h-10 rounded-xl bg-premium-gradient flex items-center justify-center shadow-glow opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <Plus className="text-white w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure Telemetry */}
      <section className="section-padding bg-brand-soft/20 dark:bg-white/[0.01]">
        <div className="content-container">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
              <span className="text-[10px] font-display font-black text-brand-primary uppercase tracking-[0.4em] mb-4 block text-liquid-shimmer">Reliable Delivery</span>
              <h2 className="text-4xl md:text-7xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tighter leading-none mb-8">Always <br/><span className="text-premium-gradient">On Time.</span></h2>
              <p className="text-lg text-ink dark:text-white/80 font-medium mb-12 max-w-lg leading-relaxed">
                Track your delivery in real-time and enjoy peace of mind knowing your 
                water is coming from a trusted and certified source.
              </p>
              <div className="grid grid-cols-2 gap-8 font-mono-data">
                <div><p className="text-4xl font-black text-brand-primary dark:text-white uppercase">100%</p><p className="text-[10px] text-brand-primary/60 dark:text-white/40 uppercase font-black tracking-widest">Reliability</p></div>
                <div><p className="text-4xl font-black text-brand-primary dark:text-white uppercase">&lt;10MS</p><p className="text-[10px] text-brand-primary/60 dark:text-white/40 uppercase font-black tracking-widest">Fast Service</p></div>
              </div>
            </motion.div>
            <div className="glass-card p-10 h-[450px] relative overflow-hidden bg-white/40 dark:bg-white/5 border-brand-primary/5 shadow-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ANALYTICS_DATA}>
                  <defs><linearGradient id="cV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient></defs>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px' }} />
                  <Area type="monotone" dataKey="volume" stroke="#2563eb" strokeWidth={4} fill="url(#cV)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Services */}
      <section className="section-padding">
        <div className="content-container">
          <div className="text-center mb-32">
            <h2 className="text-4xl md:text-8xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tighter leading-none mb-8">Pure Solutions.</h2>
            <p className="text-ink dark:text-white/80 max-w-2xl mx-auto text-xl font-medium uppercase font-display">Providing safe and clean water since 2014.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-10 group relative overflow-hidden bg-white/60 dark:bg-white/5 border-brand-primary/5 shadow-none">
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${s.gradient}`} />
                <s.icon className="w-12 h-12 text-brand-primary mb-10 transition-transform group-hover:scale-110 droplet-pulse" />
                <h3 className="text-2xl font-display font-black text-brand-navy dark:text-white mb-4 uppercase tracking-tight leading-none">{s.title}</h3>
                <p className="text-sm text-ink/80 dark:text-white/60 leading-relaxed font-semibold uppercase">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Footer CTA */}
      <section className="section-padding pb-32">
        <div className="content-container text-center">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-panel p-20 md:p-32 rounded-[64px] relative overflow-hidden bg-brand-primary text-white border-none shadow-premium">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/20 blur-[150px] -z-10 animate-pulse-slow" />
            <h2 className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter mb-10 leading-none">Order Today.</h2>
            <p className="text-2xl text-white/60 mb-16 max-w-3xl mx-auto font-medium uppercase font-display">Join thousands of families and businesses who trust Kitayi.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/register" className="bg-white text-brand-primary px-16 py-6 rounded-2xl uppercase tracking-widest font-black text-xl hover:scale-105 transition-transform">Sign Up Now</Link>
              <Link to="/contact" className="border-2 border-white/30 text-white px-16 py-6 rounded-2xl uppercase tracking-widest font-black text-xl hover:bg-white/10 transition-colors">Contact Us</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
