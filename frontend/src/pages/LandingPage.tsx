import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  Clock,
  Droplets,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  Users,
  Zap,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BrandLogo from '../components/BrandLogo';
import { communicationsApi, productsApi } from '../services/api';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_qty: number;
};

const STATS = [
  { value: '10+', label: 'Years of Service', icon: Award },
  { value: '50,000+', label: 'Happy Customers', icon: Users },
  { value: '250,000+', label: 'Deliveries Done', icon: Truck },
  { value: '100%', label: 'Quality Certified', icon: ShieldCheck },
];

const SERVICES = [
  { title: 'Residential Supply', desc: 'Doorstep delivery of purified bottled water and 20L dispenser refills for homes.', icon: Droplets },
  { title: 'Corporate & Industrial', desc: 'Scheduled bulk tanker deliveries for factories, hospitals, schools and offices.', icon: Award },
  { title: 'Tanker Services', desc: 'Large-volume water delivery for construction sites and utility emergencies.', icon: Truck },
  { title: 'Dispenser Refills', desc: 'Premium 20L purified bottle swaps for home and office hot/cold dispensers.', icon: ShieldCheck },
];

const WHY = [
  { title: 'Real-Time GPS Tracking', desc: 'Follow your delivery live on a map with precise ETA sent to your phone.', icon: MapPin },
  { title: 'KEBS & WHO Certified', desc: 'Every litre passes rigorous lab testing to meet Kenya Bureau of Standards.', icon: ShieldCheck },
  { title: 'Flexible Subscriptions', desc: 'Weekly, bi-weekly or monthly auto-delivery with autopay options.', icon: Clock },
  { title: 'Secure Payments', desc: 'M-Pesa Daraja STK push, Stripe card, or PayPal - fully PCI-DSS compliant.', icon: Zap },
];

const TESTIMONIALS = [
  { quote: 'Kitayi transformed how we manage water. Subscriptions work like clockwork and M-Pesa pay is instant.', author: 'Jane Mwangi', role: 'Property Manager, Kilimani Estates', stars: 5 },
  { quote: 'The tanker arrived within 2 hours of booking. GPS tracking and the digital dashboard were seamless.', author: 'David Ochieng', role: 'Site Engineer, Landmark Builders', stars: 5 },
  { quote: "Our hospital now has zero water shortage incidents thanks to Kitayi's corporate credit account.", author: 'Dr. Amina Khalid', role: 'Admin Director, Nairobi Clinic', stars: 5 },
];

const FAQS = [
  { q: 'How do I schedule a recurring delivery?', a: 'Log in, go to Subscriptions, choose your product and frequency, and confirm auto-billing.' },
  { q: 'What payment methods do you support?', a: 'M-Pesa STK Push, Stripe credit/debit cards, and PayPal. Corporate clients can apply for postpaid credit terms.' },
  { q: 'Are deliveries tracked in real-time?', a: 'Yes. Once dispatched, you receive an SMS link to follow your truck live with a countdown ETA.' },
  { q: 'Do you offer corporate credit accounts?', a: 'Yes. Commercial clients with a registered business ID can apply for postpaid credit limits via our finance team.' },
  { q: 'What is the minimum tanker order?', a: 'Our minimum is 5,000 litres. We operate fleets up to 20,000L for industrial clients.' },
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [subEmail, setSubEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);
  const [quickProducts, setQuickProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsApi.list({ ordering: 'price' })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setQuickProducts(data.slice(0, 3));
      })
      .catch(error => {
        console.error('Failed to load quick order products:', error);
      });
  }, []);

  const quickOrderItems = useMemo(() => {
    const fallback = [
      { id: 'fallback-1', name: 'Dispenser Refill 20L', category: 'Most Popular', price: 350, stock_qty: 0 },
      { id: 'fallback-2', name: 'Bulk Tanker 5,000L', category: 'Best Value', price: 4500, stock_qty: 0 },
      { id: 'fallback-3', name: 'Bottled Water 1L x 12', category: 'Catalog Item', price: 720, stock_qty: 0 },
    ];

    return (quickProducts.length ? quickProducts : fallback).map((product, index) => ({
      ...product,
      tag: index === 0 ? 'Most Popular' : index === 1 ? 'Best Value' : product.category,
    }));
  }, [quickProducts]);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittingNewsletter(true);
    try {
      await communicationsApi.newsletterSubscribe(subEmail);
      setSubMsg("You're subscribed to Kitayi updates!");
      setSubEmail('');
    } catch (error) {
      console.error('Newsletter signup failed:', error);
      setSubMsg('Subscription failed. Please try again.');
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />

      <section className="relative overflow-hidden bg-hero-pattern pt-20">
        <div className="brand-surface absolute inset-x-0 top-0 h-72 opacity-5 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-7 animate-slide-up">
            <span className="section-tag w-fit">
              <ShieldCheck className="w-3.5 h-3.5" /> KEBS & WHO Certified
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-black text-ink leading-[1.08] tracking-tight">
              Pure Water <br />
              <span className="text-brand">Delivered</span>{' '}
              <span className="text-cta">Fast</span>
            </h1>
            <p className="text-lg text-ink-secondary leading-relaxed max-w-lg">
              Order bottled water, bulk tanker deliveries, and dispenser refills, then track your delivery live.
              Kenya's most trusted water utility platform.
            </p>
            <div className="flex flex-wrap gap-3 mt-1">
              <Link to="/pay-bill" className="btn-cta px-8 py-4 text-base">
                Pay Kitayi Bill <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/shop" className="btn-brand px-8 py-4 text-base">
                Order Water <Droplets className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              {['PCI-DSS Secure', 'SSL Encrypted', 'KEBS Certified'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="card-md p-8 bg-brand rounded-2xl animate-float shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                  <BrandLogo variant="mark" className="w-full h-full" />
                </div>
                <div>
                  <p className="text-sm text-white font-black">Quick Order</p>
                  <p className="text-base text-white font-black">Kitayi Solutions Limited</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {quickOrderItems.map(item => (
                  <Link
                    to="/shop"
                    key={item.id}
                    className="flex min-h-[76px] items-center justify-between p-4 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-slate-950 font-black leading-tight">{item.name}</p>
                      {item.tag && (
                        <span className="inline-block mt-1 text-xs text-orange-700 font-black bg-orange-100 px-2 py-1 rounded">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className="text-sm font-black text-blue-700 whitespace-nowrap">
                        Ksh {Number(item.price).toLocaleString()}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                to="/shop"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                View Full Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 border-y border-base-200 bg-base-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-10 h-10 rounded-xl brand-surface flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-3xl font-display font-black text-brand">{value}</span>
              <span className="text-xs text-ink-muted font-medium uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center flex flex-col gap-4 mb-14">
          <div className="section-tag mx-auto">Our Services</div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-ink">Water Solutions for Every Need</h2>
          <p className="text-ink-secondary max-w-xl mx-auto leading-relaxed">
            Tailored plans for residences, offices, factories, and public facilities.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {SERVICES.map(({ title, desc, icon: Icon }) => (
            <Link
              to="/services"
              key={title}
              className="card p-6 flex flex-col gap-4 hover:border-brand/30 hover:shadow-card-md hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl brand-surface flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-base text-ink">{title}</h3>
              <p className="text-sm text-ink-secondary leading-relaxed">{desc}</p>
              <span className="flex items-center gap-1 text-cta text-xs font-semibold mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="why-us" className="py-24 brand-surface-navy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-14">
            <div className="flex flex-col gap-4">
              <span className="text-cta font-bold text-sm tracking-widest uppercase">Why Kitayi</span>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-tight">
                Built for Enterprise.<br />Simple for Everyone.
              </h2>
            </div>
            <p className="text-white/60 text-lg leading-relaxed">
              Cloud dispatch, real-time GPS, and secure mobile wallets make water delivery as reliable as a tap.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {WHY.map(({ title, desc, icon: Icon }) => (
              <div key={title} className="bg-white/8 border border-white/12 rounded-2xl p-6 flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-cta/20 border border-cta/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-cta" />
                </div>
                <h3 className="font-display font-bold text-sm text-white">{title}</h3>
                <p className="text-xs text-white/75 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-base-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center flex flex-col gap-4 mb-14">
            <div className="section-tag mx-auto">Testimonials</div>
            <h2 className="text-4xl font-display font-black text-ink">Trusted by Thousands of Kenyans</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, author, role, stars }) => (
              <div key={author} className="card p-7 flex flex-col gap-5 justify-between hover:shadow-card-md transition-shadow">
                <div className="flex gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed italic">"{quote}"</p>
                <div>
                  <p className="text-sm font-bold text-ink">{author}</p>
                  <p className="text-xs text-ink-muted">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 max-w-3xl mx-auto px-6">
        <div className="text-center flex flex-col gap-4 mb-14">
          <div className="section-tag mx-auto">FAQ</div>
          <h2 className="text-4xl font-display font-black text-ink">Frequently Asked Questions</h2>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className={`card overflow-hidden transition-all ${activeFaq === i ? 'border-brand/30' : ''}`}>
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-sm text-ink hover:text-brand transition-colors"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-ink-muted transition-transform duration-300 shrink-0 ml-4 ${activeFaq === i ? 'rotate-180 text-brand' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-5 text-sm text-ink-secondary leading-relaxed border-t border-base-100 pt-4 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="py-24 max-w-7xl mx-auto px-6">
        <div className="card-md p-10 md:p-14">
          <div className="grid md:grid-cols-2 gap-14">
            <div className="flex flex-col gap-6">
              <div>
                <div className="section-tag w-fit mb-4">Get In Touch</div>
                <h2 className="text-3xl font-display font-black text-ink mb-3">Emergency Delivery Helpline</h2>
                <p className="text-ink-secondary leading-relaxed">
                  Bulk orders, corporate accounts, or emergency deliveries - available 24/7.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Phone, text: '+254 700 000 000', href: 'tel:+254700000000' },
                  { icon: Mail, text: 'support@kitayisolutions.com', href: 'mailto:support@kitayisolutions.com' },
                  { icon: MapPin, text: 'Industrial Area, Nairobi, Kenya', href: '#' },
                ].map(({ icon: Icon, text, href }) => (
                  <a key={text} href={href} className="flex items-center gap-3 text-sm text-ink-secondary hover:text-brand transition-colors">
                    <div className="w-9 h-9 rounded-xl brand-surface flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {text}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <h3 className="font-display font-bold text-lg text-ink">Stay Updated</h3>
              <p className="text-sm text-ink-secondary">Subscribe for promotions, quality updates, and delivery alerts.</p>
              {subMsg ? (
                <div className={subMsg.includes('failed') ? 'alert-danger text-sm' : 'alert-success text-sm'}>{subMsg}</div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={subEmail}
                    onChange={e => setSubEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="form-input"
                    required
                  />
                  <button type="submit" disabled={submittingNewsletter} className="btn-cta py-3.5 disabled:opacity-60">
                    {submittingNewsletter ? 'Subscribing...' : 'Subscribe'} <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
              <Link to="/pay-bill" className="btn-ghost py-3.5 text-sm text-center mt-1">
                Pay Your Bill Without Logging In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
