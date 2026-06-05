import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets, ShieldCheck, Truck, CheckCircle2, ChevronDown,
  ArrowRight, Star, Phone, Mail, MapPin, Zap, Clock, Award, Users
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STATS = [
  { value: '10+', label: 'Years of Service', icon: Award },
  { value: '50,000+', label: 'Happy Customers', icon: Users },
  { value: '250,000+', label: 'Deliveries Done', icon: Truck },
  { value: '100%', label: 'Quality Certified', icon: ShieldCheck },
];

const SERVICES = [
  { title: 'Residential Supply', desc: 'Doorstep delivery of purified bottled water and dispenser refills for homes and apartments.', icon: Droplets, color: 'from-blue-500/20 to-cyan-500/10' },
  { title: 'Corporate & Industrial', desc: 'Scheduled bulk tanker deliveries for factories, hospitals, schools, and office complexes.', icon: Award, color: 'from-violet-500/20 to-purple-500/10' },
  { title: 'Tanker Services', desc: 'Large-volume water delivery for construction sites and utility shortage emergencies.', icon: Truck, color: 'from-emerald-500/20 to-teal-500/10' },
  { title: 'Dispenser Refills', desc: 'Premium 20L purified water bottle swaps for home and office hot/cold dispensers.', icon: ShieldCheck, color: 'from-amber-500/20 to-orange-500/10' },
];

const WHY = [
  { title: 'Real-Time GPS Tracking', desc: 'Follow your delivery truck live on a map with precise ETA updates sent to your phone.', icon: MapPin },
  { title: 'KEBS & WHO Certified', desc: 'Every litre passes rigorous lab testing to meet Kenya Bureau of Standards requirements.', icon: ShieldCheck },
  { title: 'Flexible Subscriptions', desc: 'Set weekly, bi-weekly or monthly auto-delivery schedules with auto-pay.', icon: Clock },
  { title: 'M-Pesa & Card Payments', desc: 'Pay instantly via M-Pesa Daraja STK push, Stripe card, or PayPal — fully secure.', icon: Zap },
];

const TESTIMONIALS = [
  { quote: 'Kitayi transformed how we manage water in our apartment complexes. Subscriptions work like clockwork, and M-Pesa pay is instant.', author: 'Jane Mwangi', role: 'Property Manager, Kilimani Estates', stars: 5 },
  { quote: 'The tanker arrived within 2 hours of booking online. GPS tracking and the digital dashboard made the whole experience seamless.', author: 'David Ochieng', role: 'Site Engineer, Landmark Builders', stars: 5 },
  { quote: 'Our hospital now has zero water shortage incidents. Kitayi\'s corporate account and credit facility changed our operations completely.', author: 'Dr. Amina Khalid', role: 'Admin Director, Nairobi Clinic', stars: 5 },
];

const FAQS = [
  { q: 'How do I schedule a recurring delivery?', a: 'Log in to your Customer Portal, go to Subscriptions, choose your product, set the frequency (weekly, bi-weekly, or monthly), and confirm auto-billing. Your water arrives on schedule every time.' },
  { q: 'What payment methods do you support?', a: 'We accept M-Pesa STK Push, credit/debit cards via Stripe, and PayPal. Corporate clients can also request invoiced credit terms.' },
  { q: 'Are deliveries tracked in real-time?', a: 'Yes — once a driver is dispatched, you receive an SMS link to follow the truck live on a map with a countdown ETA.' },
  { q: 'Do you offer corporate credit accounts?', a: 'Yes. Commercial clients with a registered business ID can apply for postpaid credit limits subject to our finance team\'s verification process.' },
  { q: 'What is the minimum order for a tanker?', a: 'Our minimum tanker order is 5,000 litres. We operate fleets up to 20,000L capacity for industrial and municipal clients.' },
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [subMsg, setSubMsg] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubMsg('Thank you! You\'re subscribed to Kitayi updates.');
    setEmail('');
  };

  return (
    <div className="page-bg">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-600/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center py-24">
          <div className="flex flex-col gap-7 animate-slide-up">
            <div className="section-tag w-fit">
              <ShieldCheck className="w-3.5 h-3.5" /> Purified to KEBS & WHO Standards
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-[1.05] tracking-tight">
              Pure Water<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                Delivered Fast
              </span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-lg">
              Order premium bottled water, bulk tanker deliveries, and dispenser refills — then track your delivery live. Kenya's most trusted water utility platform.
            </p>
            {/* Above-the-fold CTAs — PRD requirement */}
            <div className="flex flex-wrap gap-3 mt-2">
              <Link to="/pay-bill" className="btn-primary px-8 py-4 text-base">
                Pay Kitayi Bill <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/shop" className="btn-secondary px-8 py-4 text-base">
                Order Water <Droplets className="w-5 h-5" />
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-5 pt-2">
              {['PCI-DSS Secure', 'SSL Encrypted', 'KEBS Certified'].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-white/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" /> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-3xl blur-2xl" />
            <div className="glass-card p-8 w-full max-w-sm animate-float">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-medium">Quick Order</p>
                  <p className="text-sm text-white font-bold">Kitayi Solutions</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { label: 'Dispenser Refill 20L', price: 'KSh 350', tag: 'Most Popular' },
                  { label: 'Bulk Tanker 5,000L', price: 'KSh 4,500', tag: 'Best Value' },
                  { label: 'Bottled Water 1L × 12', price: 'KSh 720', tag: '' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/6 border border-white/8 hover:bg-white/10 transition-all cursor-pointer group">
                    <div>
                      <p className="text-sm text-white font-medium">{item.label}</p>
                      {item.tag && <span className="text-xs text-primary font-semibold">{item.tag}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.price}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/shop" className="btn-primary w-full mt-5 py-3.5 text-sm">
                View Full Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-white/6">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="glass-card p-6 flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-3xl font-display font-black text-white">{value}</span>
              <span className="text-xs text-white/45 font-medium uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center flex flex-col gap-4 mb-16">
          <div className="section-tag mx-auto">Our Services</div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white">Water Solutions for Every Need</h2>
          <p className="text-white/50 max-w-xl mx-auto leading-relaxed">Tailored supply plans for single residences, office complexes, manufacturing hubs, and public facilities.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {SERVICES.map(({ title, desc, icon: Icon, color }) => (
            <Link to="/services" key={title} className="glass-card p-6 flex flex-col gap-4 hover:border-white/20 transition-all group hover:-translate-y-1 duration-300">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} border border-white/10 flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-base text-white">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section id="why-us" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
            <div className="flex flex-col gap-5">
              <div className="section-tag w-fit">Why Kitayi</div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-tight">
                Built for Enterprise.<br />Simple for Everyone.
              </h2>
            </div>
            <p className="text-white/50 text-lg leading-relaxed">
              We leverage cloud dispatching, real-time GPS telemetry, and secure mobile wallets to make water delivery as seamless as a tap.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {WHY.map(({ title, desc, icon: Icon }) => (
              <div key={title} className="glass-card p-6 flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-sm text-white">{title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center flex flex-col gap-4 mb-16">
          <div className="section-tag mx-auto">Testimonials</div>
          <h2 className="text-4xl font-display font-black text-white">Trusted by Thousands of Kenyans</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, author, role, stars }) => (
            <div key={author} className="glass-card p-7 flex flex-col gap-5 justify-between">
              <div className="flex gap-1">{Array.from({ length: stars }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-white/70 leading-relaxed italic">"{quote}"</p>
              <div>
                <p className="text-sm font-bold text-white">{author}</p>
                <p className="text-xs text-white/40">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-6">
        <div className="text-center flex flex-col gap-4 mb-16">
          <div className="section-tag mx-auto">FAQ</div>
          <h2 className="text-4xl font-display font-black text-white">Frequently Asked Questions</h2>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div key={i} className={`glass-card overflow-hidden transition-all duration-300 ${activeFaq === i ? 'border-primary/30' : ''}`}>
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-sm text-white hover:text-primary transition-colors"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 shrink-0 ml-4 ${activeFaq === i ? 'rotate-180 text-primary' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-5 text-sm text-white/55 leading-relaxed border-t border-white/6 pt-4 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact & Newsletter ── */}
      <section id="contact" className="py-24 max-w-7xl mx-auto px-6">
        <div className="glass-card p-10 md:p-16">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="flex flex-col gap-7">
              <div>
                <div className="section-tag w-fit mb-4">Get In Touch</div>
                <h2 className="text-3xl font-display font-black text-white mb-3">Emergency Delivery Helpline</h2>
                <p className="text-white/50 leading-relaxed">Bulk order requests, custom delivery servicing, or corporate account inquiries — our team is available 24/7.</p>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { icon: Phone, text: '+254 700 000 000', href: 'tel:+254700000000' },
                  { icon: Mail, text: 'support@kitayisolutions.com', href: 'mailto:support@kitayisolutions.com' },
                  { icon: MapPin, text: 'Industrial Area, Nairobi, Kenya', href: '#' },
                ].map(({ icon: Icon, text, href }) => (
                  <a key={text} href={href} className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    {text}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <h3 className="font-display font-bold text-lg text-white">Stay Updated</h3>
              <p className="text-sm text-white/50">Subscribe for seasonal promotions, quality updates, and delivery schedule alerts.</p>
              {subMsg ? (
                <div className="p-4 rounded-xl bg-success/15 border border-success/25 text-sm text-success">{subMsg}</div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="glass-input" required
                  />
                  <button type="submit" className="btn-primary py-3.5">
                    Subscribe to Updates <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
              <Link to="/pay-bill" className="btn-secondary py-3.5 text-sm text-center mt-2">
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
