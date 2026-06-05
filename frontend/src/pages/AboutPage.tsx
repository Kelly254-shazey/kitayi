import { Shield, Users, Award, Droplets, CheckCircle2, Leaf, FlaskConical, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MILESTONES = [
  { year: '2014', title: 'Founded', desc: 'Kitayi Solutions Limited incorporated in Nairobi with a vision to deliver clean water to every Kenyan household.' },
  { year: '2016', title: 'KEBS Certification', desc: 'Achieved full Kenya Bureau of Standards certification for all water products and purification processes.' },
  { year: '2019', title: 'Commercial Expansion', desc: 'Launched bulk tanker division to serve factories, construction sites, and public utilities across 5 counties.' },
  { year: '2022', title: 'Digital Platform', desc: 'Launched the digital ordering and payment platform — enabling 24/7 online water ordering and M-Pesa payments.' },
  { year: '2026', title: 'National Scale', desc: 'Serving 50,000+ customers across Kenya with a fleet of 40 vehicles and full GPS dispatch tracking.' },
];

const COMPLIANCE = ['Kenya Bureau of Standards (KEBS)', 'World Health Organization (WHO) Water Guidelines', 'Kenya Water Act 2016', 'PCI-DSS Payment Security', 'ISO 9001:2015 Quality Management'];

export default function AboutPage() {
  return (
    <div className="page-bg">
      <Navbar />
      <div className="pt-24">
        {/* Hero */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6">
              <div className="section-tag w-fit">About Kitayi Solutions</div>
              <h1 className="text-5xl md:text-6xl font-display font-black text-white leading-tight">
                Kenya's Most Trusted <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Water Partner</span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed">
                Since 2014, Kitayi Solutions Limited has been delivering KEBS-certified, WHO-compliant purified water to residential and commercial clients across Kenya. Our mission is simple: pure water, delivered on time, every time.
              </p>
              <div className="flex flex-wrap gap-3">
                {['KEBS Certified', 'ISO 9001', 'WHO Compliant', 'PCI-DSS Secure'].map((b) => (
                  <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 border border-white/12 text-xs font-semibold text-white/70">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" /> {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'Safety First', desc: 'Every batch tested in our accredited lab before dispatch.' },
                { icon: Droplets, label: 'Pure Source', desc: 'Water sourced from protected natural springs and borehole aquifers.' },
                { icon: Leaf, label: 'Eco-Responsible', desc: 'Reusable container program reduces plastic waste by 70%.' },
                { icon: Globe, label: 'Kenya-Wide', desc: 'Operating across 15 counties with 40-vehicle dispatch fleet.' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="glass-card p-5 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="section-tag mx-auto mb-4">Our Journey</div>
            <h2 className="text-4xl font-display font-black text-white">A Decade of Pure Excellence</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
            <div className="flex flex-col gap-8">
              {MILESTONES.map(({ year, title, desc }) => (
                <div key={year} className="flex gap-6 items-start pl-4">
                  <div className="w-8 h-8 rounded-full bg-primary border-2 border-primary/50 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-glow-sm" />
                  <div className="glass-card p-5 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-primary bg-primary/15 px-2.5 py-0.5 rounded-full border border-primary/25">{year}</span>
                      <h3 className="text-sm font-bold text-white">{title}</h3>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Purification process */}
        <section className="py-20 max-w-7xl mx-auto px-6">
          <div className="glass-card p-10 md:p-16">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col gap-6">
                <div className="section-tag w-fit">Purification Process</div>
                <h2 className="text-3xl font-display font-black text-white">7-Stage Scientific Purification</h2>
                <div className="flex flex-col gap-3">
                  {['Sediment Pre-filtration','Activated Carbon Filtration','Reverse Osmosis (RO)','UV Sterilization','Ozone Treatment','Remineralization','Quality Lab Certification'].map((step, i) => (
                    <div key={step} className="flex items-center gap-3 text-sm text-white/70">
                      <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <FlaskConical className="w-6 h-6 text-primary" />
                  <h3 className="font-bold text-white">Compliance & Standards</h3>
                </div>
                {COMPLIANCE.map((c) => (
                  <div key={c} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/8 text-sm text-white/65">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team stats */}
        <section className="py-20 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, val: '120+', label: 'Team Members' },
              { icon: Award, val: '12', label: 'Industry Awards' },
              { icon: Droplets, val: '2M+', label: 'Litres Delivered Monthly' },
              { icon: Globe, val: '15', label: 'Counties Covered' },
            ].map(({ icon: Icon, val, label }) => (
              <div key={label} className="glass-card p-6 text-center flex flex-col gap-3 items-center">
                <Icon className="w-6 h-6 text-primary" />
                <p className="text-3xl font-display font-black text-white">{val}</p>
                <p className="text-xs text-white/45 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
