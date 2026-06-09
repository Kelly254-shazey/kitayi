import { motion } from 'framer-motion';
import { Shield, Droplets, CheckCircle2, Leaf, FlaskConical, Globe, BadgeCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MILESTONES = [
  { year: '2014', title: 'Founded', desc: 'Kitayi Solutions Limited incorporated in Nairobi with a vision to deliver clean water to every Kenyan household.' },
  { year: '2016', title: 'KEBS Certification', desc: 'Achieved full Kenya Bureau of Standards certification for all water products and purification processes.' },
  { year: '2019', title: 'Commercial Expansion', desc: 'Launched bulk tanker division to serve factories, construction sites, and public utilities across 5 counties.' },
  { year: '2022', title: 'Digital Infrastructure', desc: 'Launched the digital provisioning and payment platform — enabling 24/7 online water ordering and telemetry.' },
  { year: '2026', title: 'National Leadership', desc: 'Serving 75,000+ customers across Kenya with a fleet of 40 vehicles and full GPS dispatch tracking.' },
];

const TRUST_MARKERS = [
  { icon: BadgeCheck, title: 'KEBS Certified', desc: 'Compliance with GS 1234 standards' },
  { icon: FlaskConical, title: 'WHO Standards', desc: 'World-class purity benchmarks' },
  { icon: Leaf, title: 'Sustainable', desc: 'Eco-conscious resource management' },
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <div className="flex-1 space-y-32 py-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-10">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div className="flex flex-col gap-8">
              <div className="mb-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-panel border-brand-primary/10">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-glow" />
                <span className="text-[10px] font-display font-black tracking-[0.4em] uppercase text-brand-primary dark:text-white/60">
                  Our Story
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-brand-navy dark:text-white leading-none uppercase tracking-tighter">
                Trusted <br/> <span className="text-premium-gradient">Water Supply.</span>
              </h1>
              <p className="text-ink dark:text-white/80 text-xl font-medium leading-relaxed">
                Since 2014, Kitayi Solutions Limited has been providing clean and safe water to 
                homes and businesses across the region with reliable and sustainable delivery.
              </p>
              <div className="flex flex-wrap gap-4">
                {['KEBS Certified', 'WHO Compliant', 'ISO 9001', 'PCI-DSS Secure'].map((b) => (
                  <span key={b} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-[10px] font-black uppercase tracking-widest text-brand-primary dark:text-white/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Shield, label: 'Safety Verified', desc: 'Every batch tested in our accredited lab before network entry.' },
                { icon: Droplets, label: 'Pure Source', desc: 'Water provisioned from protected natural aquifers.' },
                { icon: Leaf, label: 'Sustainable', desc: 'Reduced plastic waste through reusable container protocols.' },
                { icon: Globe, label: 'Kenya-Wide', desc: 'Operating across 15 counties with a precision dispatch fleet.' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="glass-card p-8 flex flex-col gap-6 bg-white/60 dark:bg-white/5 shadow-none border-brand-primary/5 hover:border-brand-primary/20 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-display font-black text-brand-navy dark:text-white uppercase tracking-tight mb-2">{label}</p>
                    <p className="text-xs text-ink/80 dark:text-white/60 leading-relaxed font-semibold">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Markers Bar */}
        <section className="py-20 bg-brand-soft/20 dark:bg-white/[0.01] border-y border-brand-primary/5">
          <div className="max-w-7xl mx-auto px-10">
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-60">
              {TRUST_MARKERS.map((marker, i) => (
                <div key={i} className="flex items-center gap-4">
                  <marker.icon className="w-8 h-8 text-brand-primary" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy dark:text-white">{marker.title}</span>
                    <span className="text-[9px] font-bold text-brand-primary/40">{marker.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Sequence */}
        <section className="max-w-4xl mx-auto px-10">
          <div className="text-center mb-24">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 block">The Sequence</span>
            <h2 className="text-4xl md:text-6xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tighter">A Decade of Leadership</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-brand-primary/10" />
            <div className="space-y-12">
              {MILESTONES.map(({ year, title, desc }, i) => (
                <motion.div 
                  key={year} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-10 items-start pl-4"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-glow" />
                  <div className="glass-card p-8 flex-1 bg-white/60 dark:bg-white/5 border-brand-primary/5 hover:border-brand-primary/20 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[10px] font-black text-brand-primary bg-brand-primary/5 px-3 py-1 rounded-full border border-brand-primary/10 uppercase tracking-widest">{year}</span>
                      <h3 className="text-xl font-display font-black text-brand-navy dark:text-white uppercase tracking-tight">{title}</h3>
                    </div>
                    <p className="text-sm text-ink/80 dark:text-white/60 leading-relaxed font-semibold">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Purification Section */}
        <section className="max-w-7xl mx-auto px-10 pb-32">
          <div className="glass-panel p-12 md:p-24 rounded-[64px] bg-brand-navy text-white relative overflow-hidden border-none shadow-premium">
            <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-brand-primary/20 blur-[150px] -z-10 animate-pulse-slow" />
            <div className="grid md:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4 block">Our Purification Process</span>
                <h2 className="text-4xl md:text-7xl font-display font-black uppercase tracking-tighter leading-none">Guaranteed <br/> Purity.</h2>
                <div className="space-y-4">
                  {['Multi-stage Filtration','Activated Carbon','Reverse Osmosis','UV Sterilization','Ozone Treatment','Final Mineral Balance','Quality Testing'].map((step, i) => (
                    <div key={step} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-white/60">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black text-brand-cyan shrink-0">{i + 1}</div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-12 bg-white/5 border-white/10 shadow-none">
                <FlaskConical className="w-16 h-16 text-brand-cyan mb-10 opacity-40 animate-pulse" />
                <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-6">Clean and Safe Water</h3>
                <p className="text-white/40 font-medium leading-relaxed mb-8">
                  Our rigorous testing and purification process ensures that every drop of water 
                  exceeds safety standards. We are committed to providing you with the purest water possible.
                </p>
                <div className="flex items-center gap-4 py-6 border-t border-white/5">
                  <BadgeCheck className="text-emerald-500 w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Verified Pure Water</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
