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
    <div style={{ backgroundColor: 'var(--surface-secondary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="section">
        <div className="page-container">
          {/* Hero */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="flex flex-col gap-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-caption w-fit" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#2563eb' }} />
                Our Story
              </span>
              <h1 className="text-display-md mb-4">
                Trusted <br/><span style={{ color: '#2563eb' }}>Water Supply.</span>
              </h1>
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                Since 2014, Kitayi Solutions Limited has been providing clean and safe water to
                homes and businesses across the region with reliable and sustainable delivery.
              </p>
              <div className="flex flex-wrap gap-2">
                {['KEBS Certified', 'WHO Compliant', 'ISO 9001', 'PCI-DSS Secure'].map((b) => (
                  <span key={b} className="badge-info">
                    <CheckCircle2 className="w-3 h-3" style={{ color: '#10b981' }} /> {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'Safety Verified', desc: 'Every batch tested in our accredited lab before network entry.' },
                { icon: Droplets, label: 'Pure Source', desc: 'Water provisioned from protected natural aquifers.' },
                { icon: Leaf, label: 'Sustainable', desc: 'Reduced plastic waste through reusable container protocols.' },
                { icon: Globe, label: 'Kenya-Wide', desc: 'Operating across 15 counties with a precision dispatch fleet.' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="card">
                  <div className="card-body">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#eff6ff' }}>
                      <Icon className="w-6 h-6" style={{ color: '#2563eb' }} />
                    </div>
                    <h3 className="text-h3 mb-1">{label}</h3>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Markers */}
          <div className="py-12 mb-20" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24">
              {TRUST_MARKERS.map((marker, i) => (
                <div key={i} className="flex items-center gap-4">
                  <marker.icon className="w-8 h-8" style={{ color: '#2563eb' }} />
                  <div>
                    <span className="text-sm font-bold">{marker.title}</span>
                    <p className="text-caption" style={{ color: 'var(--text-muted)' }}>{marker.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Impact */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <span className="text-label mb-2 block" style={{ color: '#2563eb' }}>Our Impact</span>
              <h2 className="text-h1">Serving Communities</h2>
            </div>
            <div className="grid-3">
              {[
                { value: '15+', label: 'Counties Served', desc: 'Clean water delivered across Kenya through our expanding distribution network.' },
                { value: '75k+', label: 'Families & Businesses', desc: 'Trusted by thousands for reliable daily water supply and delivery services.' },
                { value: '200+', label: 'Local Jobs Created', desc: 'Employing drivers, plant operators, and support staff from local communities.' },
              ].map(({ value, label, desc }) => (
                <div key={label} className="card text-center">
                  <div className="card-body">
                    <p className="text-4xl font-bold mb-2" style={{ color: '#2563eb' }}>{value}</p>
                    <h3 className="text-h3 mb-2">{label}</h3>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-6 rounded-xl text-center" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p className="text-body-sm" style={{ color: '#065f46' }}>
                Kitayi Solutions is committed to providing clean water access to underserved communities, supporting local schools with water donations, and promoting environmental sustainability through reusable container programs and responsible water sourcing.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="text-center mb-12">
              <span className="text-label mb-2 block" style={{ color: '#2563eb' }}>Our Journey</span>
              <h2 className="text-h1">A Decade of Leadership</h2>
            </div>
            <div className="relative">
              <div className="absolute left-[17px] top-0 bottom-0 w-px" style={{ backgroundColor: '#e2e8f0' }} />
              <div className="space-y-10">
                {MILESTONES.map(({ year, title, desc }, i) => (
                  <motion.div key={year} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-8 items-start pl-4">
                    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#2563eb', color: 'white' }}>
                      {year.slice(2)}
                    </div>
                    <div className="card flex-1">
                      <div className="card-body">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="badge-info">{year}</span>
                          <h3 className="text-h3">{title}</h3>
                        </div>
                        <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Purification */}
          <div className="rounded-xl p-12 md:p-16 grid md:grid-cols-2 gap-12 items-center" style={{ backgroundColor: '#0f172a' }}>
            <div className="space-y-8">
              <span className="text-label" style={{ color: '#06b6d4' }}>Our Process</span>
              <h2 className="text-display-md mb-4" style={{ color: 'white' }}>Guaranteed <br/>Purity.</h2>
              <div className="space-y-3">
                {['Multi-stage Filtration', 'Activated Carbon', 'Reverse Osmosis', 'UV Sterilization', 'Ozone Treatment', 'Final Mineral Balance', 'Quality Testing'].map((step, i) => (
                  <div key={step} className="flex items-center gap-4 text-sm font-semibold" style={{ color: '#94a3b8' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: '#1e293b', color: '#06b6d4' }}>{i + 1}</div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}>
              <div className="card-body">
                <FlaskConical className="w-16 h-16 mb-6" style={{ color: '#06b6d4', opacity: 0.4 }} />
                <h3 className="text-h3 mb-4" style={{ color: 'white' }}>Clean and Safe Water</h3>
                <p className="text-body-sm mb-6" style={{ color: '#94a3b8' }}>
                  Our rigorous testing and purification process ensures that every drop of water
                  exceeds safety standards.
                </p>
                <div className="flex items-center gap-4 pt-6" style={{ borderTop: '1px solid #334155' }}>
                  <BadgeCheck className="w-6 h-6" style={{ color: '#10b981' }} />
                  <span className="text-caption" style={{ color: '#94a3b8' }}>Verified Pure Water</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
