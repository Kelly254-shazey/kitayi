import { Link } from 'react-router-dom';
import {
  Droplets, ArrowRight, CheckCircle2,
  Globe, Sparkles, BadgeCheck
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
  'Scheduled bulk tanker deliveries (5kL–20kL)',
  'Corporate account with postpaid credit facility',
  'Dedicated account manager & priority dispatch',
  'VAT-compliant branded PDF invoices',
  'Multi-site delivery coordination',
  'SLA-backed delivery windows',
];

const PROCESS = [
  { step: '01', title: 'Place Order', desc: 'Select your water products and choose your delivery location and time.' },
  { step: '02', title: 'Confirm Order', desc: 'Receive a confirmation message once your order is processed and scheduled.' },
  { step: '03', title: 'Track Delivery', desc: 'Watch your delivery in real-time as it makes its way to your doorstep.' },
  { step: '04', title: 'Receive Water', desc: 'Enjoy your fresh and pure water. Pay easily through our secure platform.' },
];

export default function ServicesPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <div className="flex-1 space-y-32 py-32">

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-10 text-center flex flex-col items-center gap-10">
          <div className="mb-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-panel border-brand-primary/10">
            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-glow" />
            <span className="text-[10px] font-display font-black tracking-[0.4em] uppercase text-brand-primary dark:text-white/60">
              Our Services
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-brand-navy dark:text-white leading-none uppercase tracking-tighter max-w-5xl">
            Water for <br/> <span className="text-premium-gradient">Every Need.</span>
          </h1>
          <p className="text-ink dark:text-white/80 text-xl font-medium leading-relaxed max-w-3xl">
            From drinking water for your home to large tankers for your business — 
            Kitayi delivers pure and safe water on your schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-4">
            <Link to="/shop" className="btn-premium px-12 py-5 text-lg">Shop Now <ArrowRight className="w-6 h-6 ml-2" /></Link>
            <Link to="/contact" className="btn-glass px-12 py-5 text-lg font-black uppercase tracking-widest">Get a Quote</Link>
          </div>
        </section>

        {/* Home Delivery */}
        <section id="residential" className="max-w-7xl mx-auto px-10">
          <div className="glass-card p-12 md:p-20 grid md:grid-cols-2 gap-20 items-center bg-white/60 dark:bg-white/5 border-brand-primary/5">
            <div className="space-y-8">
              <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center">
                <Droplets className="w-8 h-8 text-brand-primary" />
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] block">Home Water Delivery</span>
                <h2 className="text-4xl md:text-6xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tighter leading-tight">Water for <br/> Your Home.</h2>
                <p className="text-ink/80 dark:text-white/60 text-lg font-medium leading-relaxed">
                  Get clean and safe water delivered straight to your doorstep. Choose from our 
                  flexible subscription plans or order on-demand whenever you need.
                </p>
              </div>
              <Link to="/shop" className="btn-premium w-fit px-10 py-4 font-black">
                Shop Home Products
              </Link>
            </div>
            <div className="grid gap-4">
              {RESIDENTIAL.map((item) => (
                <div key={item} className="flex items-start gap-4 p-5 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 transition-all hover:bg-brand-primary/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-black uppercase tracking-widest text-brand-navy dark:text-white opacity-60">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business Solutions */}
        <section id="commercial" className="max-w-7xl mx-auto px-10">
          <div className="glass-panel p-12 md:p-20 grid md:grid-cols-2 gap-20 items-center bg-brand-navy text-white border-none shadow-premium rounded-[64px]">
            <div className="grid gap-4 order-2 md:order-1">
              {COMMERCIAL.map((item) => (
                <div key={item} className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <BadgeCheck className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
                  <span className="text-sm font-black uppercase tracking-widest text-white opacity-60 font-black">{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-8 order-1 md:order-2">
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center">
                <Globe className="w-8 h-8 text-brand-cyan" />
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.4em] block">Business Solutions</span>
                <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-tight">Business <br/> Logistics.</h2>
                <p className="text-white/40 text-lg font-medium leading-relaxed">
                  Reliable water solutions for factories, hotels, and offices. We provide 
                  bulk delivery and easy payment options for businesses of all sizes.
                </p>
              </div>
              <Link to="/contact" className="btn-glass bg-white/10 border-white/20 text-white w-fit px-10 py-4 hover:bg-white/20 transition-all font-black uppercase tracking-widest">
                Request Bulk Supply
              </Link>
            </div>
          </div>
        </section>

        {/* Tactical Process */}
        <section className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-24">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 block">The Handover</span>
            <h2 className="text-4xl md:text-7xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tighter">Operational Protocol</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS.map((p, i) => (
              <div key={i} className="glass-card p-10 flex flex-col gap-10 bg-white/60 dark:bg-white/5 border-brand-primary/5 hover:border-brand-primary/30 transition-all group shadow-none">
                <div className="flex justify-between items-start">
                  <span className="font-mono-data text-4xl font-black text-brand-primary/20 group-hover:text-brand-primary/30 transition-colors">{p.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors"><Sparkles className="w-5 h-5 text-brand-primary" /></div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tight">{p.title}</h3>
                  <p className="text-sm text-ink/80 dark:text-white/60 font-semibold leading-relaxed uppercase">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Order CTA */}
        <section className="max-w-7xl mx-auto px-10 pb-32">
          <div className="glass-panel p-20 md:p-32 rounded-[80px] bg-brand-soft/50 dark:bg-white/[0.01] border-brand-primary/10 text-center relative overflow-hidden shadow-none">
            <div className="absolute inset-0 bg-brand-primary/5 blur-[120px]" />
            <h2 className="text-4xl md:text-7xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tighter mb-10 leading-none">Ready to Order?</h2>
            <p className="text-2xl text-ink dark:text-white/80 mb-16 max-w-3xl mx-auto font-medium">Join thousands of happy customers who trust Kitayi for their daily water.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/register" className="btn-premium px-16 py-6 text-xl">Sign Up Now</Link>
              <Link to="/pay-bill" className="btn-glass px-16 py-6 text-xl font-black uppercase tracking-widest">Pay Your Bill</Link>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
