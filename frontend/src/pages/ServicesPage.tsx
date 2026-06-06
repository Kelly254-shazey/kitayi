import { Link } from 'react-router-dom';
import {
  Droplets, Truck, Award, ArrowRight, CheckCircle2,
  Clock, Shield, Zap, MapPin, Users, FlaskConical
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RESIDENTIAL = [
  'Doorstep delivery of 20L dispenser refills',
  'Premium 500ml & 1L bottled water cases',
  'Weekly, bi-weekly, and monthly subscriptions',
  'M-Pesa & card payment at checkout',
  'SMS delivery notifications & live GPS tracking',
  'Reusable bottle swap programme',
];

const COMMERCIAL = [
  'Scheduled bulk tanker deliveries (5,000L–20,000L)',
  'Corporate account with postpaid credit facility',
  'Dedicated account manager & priority dispatch',
  'VAT-compliant branded PDF invoices',
  'Multi-site delivery coordination',
  'SLA-backed delivery windows',
];

const BOTTLED = [
  'KEBS & WHO certified purified water',
  '500ml, 1L, 5L, 10L, and 20L bottle sizes',
  'Cases of 12 & 24 for office and hospitality',
  'Custom-label branding for corporate clients',
  'Cold-chain delivery for hotels & clinics',
  'Available for one-off and subscription orders',
];

const PROCESS = [
  { step: '01', title: 'Place Order', desc: 'Choose your product, select delivery date & slot, and pay securely in under 3 steps.' },
  { step: '02', title: 'Order Confirmed', desc: 'You receive an SMS confirmation with your tracking number immediately.' },
  { step: '03', title: 'Dispatched', desc: 'A driver is assigned and your live GPS tracking link is sent to your phone.' },
  { step: '04', title: 'Delivered', desc: 'Water arrives at your door. Confirm receipt with the driver OTP code.' },
];

export default function ServicesPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <div className="pt-24">

        {/* Hero */}
        <section className="py-24 max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <div className="section-tag">Our Services</div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-ink leading-tight max-w-3xl">
            Water Solutions for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Every Scale</span>
          </h1>
          <p className="text-ink-secondary text-lg leading-relaxed max-w-2xl">
            From a single 20L dispenser refill to a 20,000L industrial tanker — Kitayi Solutions delivers purified, KEBS-certified water on your schedule.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link to="/shop" className="btn-primary px-8 py-4">Order Now <ArrowRight className="w-5 h-5" /></Link>
            <Link to="/contact" className="btn-secondary px-8 py-4">Get a Quote</Link>
          </div>
        </section>

        {/* Service 1 — Residential */}
        <section id="residential" className="py-20 max-w-7xl mx-auto px-6">
          <div className="glass-card p-10 md:p-14 grid md:grid-cols-2 gap-14 items-center">
            <div className="flex flex-col gap-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <Droplets className="w-7 h-7 text-blue-400" />
              </div>
              <div className="section-tag w-fit">Residential</div>
              <h2 className="text-4xl font-display font-black text-ink">Residential Water Supply</h2>
              <p className="text-ink-secondary leading-relaxed">
                Fresh, purified water delivered straight to your home or apartment. Whether you need a single dispenser refill or a monthly subscription, we make it effortless.
              </p>
              <Link to="/shop" className="btn-primary w-fit px-6 py-3">
                Shop Residential Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {RESIDENTIAL.map((item) => (
                <div key={item} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service 2 — Commercial */}
        <section id="commercial" className="py-8 max-w-7xl mx-auto px-6">
          <div className="glass-card p-10 md:p-14 grid md:grid-cols-2 gap-14 items-center">
            <div className="flex flex-col gap-3 order-2 md:order-1">
              {COMMERCIAL.map((item) => (
                <div key={item} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-6 order-1 md:order-2">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
                <Award className="w-7 h-7 text-violet-400" />
              </div>
              <div className="section-tag w-fit">Commercial & Industrial</div>
              <h2 className="text-4xl font-display font-black text-ink">Bulk Delivery for Business</h2>
              <p className="text-ink-secondary leading-relaxed">
                Hospitals, factories, schools, and construction sites — our dedicated corporate division manages large-volume water logistics with SLA-backed precision.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link to="/shop" className="btn-primary w-fit px-6 py-3">
                  Request Tanker <Truck className="w-4 h-4" />
                </Link>
                <Link to="/register" className="btn-secondary w-fit px-6 py-3">Corporate Account</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Service 3 — Bottled */}
        <section id="bottled" className="py-8 max-w-7xl mx-auto px-6">
          <div className="glass-card p-10 md:p-14 grid md:grid-cols-2 gap-14 items-center">
            <div className="flex flex-col gap-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <FlaskConical className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="section-tag w-fit">Bottled Water</div>
              <h2 className="text-4xl font-display font-black text-ink">Kitayi Branded Bottled Water</h2>
              <p className="text-ink-secondary leading-relaxed">
                Our premium bottled water line passes a 7-stage purification process and carries KEBS & WHO certification. Available in multiple sizes for every setting.
              </p>
              <Link to="/shop" className="btn-primary w-fit px-6 py-3">
                View Bottled Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {BOTTLED.map((item) => (
                <div key={item} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/8 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center flex flex-col gap-4 mb-16">
            <div className="section-tag mx-auto">How It Works</div>
            <h2 className="text-4xl font-display font-black text-ink">Order in 4 Simple Steps</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {PROCESS.map(({ step, title, desc }) => (
              <div key={step} className="glass-card p-7 flex flex-col gap-4 text-center items-center">
                <span className="w-12 h-12 rounded-full border-2 border-primary/40 bg-primary/15 flex items-center justify-center text-xl font-display font-black text-primary">{step}</span>
                <h3 className="font-display font-bold text-ink">{title}</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature highlights */}
        <section className="py-16 border-y border-white/6">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: 'Same-Day Dispatch', sub: 'Orders before 12pm dispatched same day' },
              { icon: Shield, label: 'PCI-DSS Secure', sub: 'No raw card data stored on our servers' },
              { icon: Clock, label: '24/7 Service', sub: 'Emergency helpline always available' },
              { icon: MapPin, label: 'Live GPS Tracking', sub: 'Follow your truck in real-time' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="glass-card p-5 flex flex-col gap-3 text-center items-center">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-bold text-ink">{label}</p>
                <p className="text-xs text-ink-muted">{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <div className="section-tag">Ready to Order?</div>
          <h2 className="text-4xl font-display font-black text-ink">Start Your Water Delivery Today</h2>
          <p className="text-ink-secondary leading-relaxed">
            Join 50,000+ Kenyan households and businesses who trust Kitayi Solutions for reliable, certified water delivery.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/shop" className="btn-primary px-8 py-4">
              Order Water <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register" className="btn-secondary px-8 py-4">
              <Users className="w-5 h-5" /> Create Account
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
