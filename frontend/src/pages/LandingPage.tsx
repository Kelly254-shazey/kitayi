import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Award, Droplets, ShieldCheck, Users, Truck, Star
} from 'lucide-react';
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
  { value: '15+', label: 'Years in Business', icon: Award },
  { value: '75k+', label: 'Happy Customers', icon: Users },
  { value: '1M+', label: 'Litres Delivered', icon: Droplets },
  { value: 'WHO', label: 'Safety Standards', icon: ShieldCheck },
];

const SERVICES = [
  { title: 'Home Delivery', desc: 'Fresh drinking water delivered to your doorstep.', icon: Droplets },
  { title: 'Office Supply', desc: 'Reliable hydration solutions for your workplace.', icon: Star },
  { title: 'Bulk Delivery', desc: 'Large tankers for construction, hotels, and events.', icon: Truck },
  { title: 'Auto-Reorder', desc: 'Never run out with scheduled subscription plans.', icon: Award },
];

const FALLBACK_PRODUCTS: Product[] = [
  { id: '20l-refill', name: 'Dispenser Refill 20L', category: 'Most Popular', price: 350, stock_qty: 120 },
  { id: 'bulk-5000l', name: 'Bulk Tanker 5,000L', category: 'Best Value', price: 4500, stock_qty: 8 },
  { id: 'bottled-12', name: 'Bottled Water 1L x 12', category: 'Catalog', price: 720, stock_qty: 45 },
  { id: 'omi-75cl', name: 'OMI 75cl', category: 'Retail', price: 249, stock_qty: 200 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);

  useEffect(() => {
    productsApi.list({ ordering: 'price' })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setProducts(data.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--surface-secondary)' }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 sm:pb-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(37,99,235,0.08), transparent 50%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.06), transparent 50%)'
        }} />
        <div className="page-container relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-caption mb-6" style={{
                backgroundColor: '#eff6ff', color: '#2563eb',
              }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#2563eb' }} />
                Premium Hydration Solutions
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-display sm:text-display-md mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              Pure Water.{' '}
              <span style={{ color: '#2563eb' }}>Delivered.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-body mb-10 max-w-xl"
              style={{ color: 'var(--text-secondary)' }}
            >
              Order refills, bottled water, and tanker deliveries from one platform. 
              Serving homes, offices, and industrial customers across Kenya.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/shop" className="btn-primary btn-lg">
                Order Water
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pay-bill" className="btn-lg" style={{
                backgroundColor: '#059669', color: 'white', borderRadius: '0.5rem',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', fontWeight: 600, padding: '0.75rem 1.5rem',
                transition: 'background-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}
              >
                Pay Kitayi Bill
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/services" className="btn-secondary btn-lg">
                View Services
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="page-container">
          <div className="stats-grid">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="stat-card"
              >
                <stat.icon className="w-5 h-5 mb-3" style={{ color: '#2563eb' }} />
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="section">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-label mb-2 block" style={{ color: '#2563eb' }}>Shop</span>
              <h2 className="text-h1 mb-2">Our Products</h2>
              <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Certified water products for every need.</p>
            </div>
            <Link to="/shop" className="btn-secondary btn-md">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid-4">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card cursor-pointer"
                onClick={() => navigate('/shop')}
              >
                <div className="h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1548839133-9aa08246bc61?w=400'}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="card-body">
                  <span className="badge-neutral mb-2">{p.category}</span>
                  <h3 className="text-h3 mb-1">{p.name}</h3>
                  <p className="text-2xl font-bold" style={{ color: '#2563eb' }}>
                    Ksh {p.price.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="text-label mb-2 block" style={{ color: '#2563eb' }}>Services</span>
            <h2 className="text-h1 mb-2">What We Offer</h2>
            <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Comprehensive water solutions for every customer type.</p>
          </div>

          <div className="grid-4">
            {SERVICES.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card"
              >
                <div className="card-body">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#eff6ff' }}>
                    <s.icon className="w-6 h-6" style={{ color: '#2563eb' }} />
                  </div>
                  <h3 className="text-h3 mb-2">{s.title}</h3>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="page-container">
          <div className="rounded-xl p-12 md:p-16 text-center" style={{ backgroundColor: '#2563eb' }}>
            <h2 className="text-display-md mb-4" style={{ color: 'white' }}>Ready to Order?</h2>
            <p className="text-body mb-8 max-w-lg mx-auto" style={{ color: '#bfdbfe' }}>
              Join thousands of families and businesses who trust Kitayi for their water needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-lg" style={{
                backgroundColor: 'white', color: '#2563eb', fontWeight: 600,
                borderRadius: '0.5rem', padding: '0.75rem 2rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Sign Up Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="btn-lg" style={{
                border: '2px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 600,
                borderRadius: '0.5rem', padding: '0.75rem 2rem',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                transition: 'background-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
