import { useNavigate } from 'react-router-dom';
import { Shield, Droplets, Truck, BarChart3, Building2, Factory, TruckIcon, FlaskConical, Wrench, BadgeCheck, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CORE_SERVICES = [
  { icon: Droplets, title: 'Home Water Delivery', desc: 'Affordable weekly or monthly clean water delivery for private homes and residential estates.', features: ['Flexible scheduling (weekly / monthly)', '5L, 10L & 20L reusable containers', 'Hassle-free upfront subscription'], cta: 'Order Water', path: '/shop' },
  { icon: Building2, title: 'Business & Corporate Supply', desc: 'Reliable bulk water supply with invoicing, scheduled delivery, and priority support.', features: ['Monthly invoicing and expense reporting', 'Dedicated account manager and support', 'Bulk tanker delivery available'], cta: 'Inquire', path: '/contact' },
  { icon: Factory, title: 'Industrial & Bulk Sourcing', desc: 'High-volume water supply for construction, factories, agriculture, and public utilities.', features: ['Direct billing & signed SLAs', 'Tanker fleet for large deliveries', '24/7 emergency supply service'], cta: 'Talk to Sales', path: '/contact' },
  { icon: BarChart3, title: 'Water Quality Testing', desc: 'Comprehensive certified testing for residential, commercial, and industrial clients.', features: ['Full physicochemical analysis', 'Microbiological testing (E. coli, coliforms)', 'Results within 48–72 hours'], cta: 'Book a Test', path: '/contact' },
  { icon: Wrench, title: 'Tank & Plumbing Services', desc: 'Professional installation, cleaning, and repair of storage tanks, pumps, and home plumbing.', features: ['Tank installation (plastic, steel, concrete)', 'Pump repair & maintenance', 'Emergency plumbing and leak detection'], cta: 'Get a Quote', path: '/contact' },
  { icon: Shield, title: 'Emergency Water Response', desc: 'Same-day emergency supply dispatch for outages, events, firefighting, and temporary needs.', features: ['Same-day dispatch guarantee', 'Backup tanker fleet on standby', 'Priority for hospitals & schools'], cta: 'Request Now', path: '/contact' },
];

const COMBO_PLANS = [
  { title: 'Home Care', items: ['Water delivery (4 × 20L/week)', 'Annual tank cleaning', 'Basic plumbing check-up'], price: 'KSh 6,500/mo' },
  { title: 'Business Care', items: ['Water delivery (12 × 20L/week)', 'Quarterly water testing', 'Priority emergency response'], price: 'KSh 15,500/mo' },
  { title: 'Enterprise', items: ['Bulk tanker (5,000L – 10,000L)', 'Monthly certified testing', 'Dedicated account manager'], price: 'Custom Quote' },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  return (
    <div style={{ backgroundColor: 'var(--surface-secondary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="section">
        <div className="page-container">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#eff6ff' }}>
              <Truck className="w-8 h-8" style={{ color: '#2563eb' }} />
            </div>
            <h1 className="text-display-md mb-4">From Tap to Tank — <span style={{ color: '#2563eb' }}>We Deliver it All</span></h1>
            <p className="text-body mx-auto max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
              Whether you need a single 20L jerrican for your home or a 10,000L tanker for a construction site, Kitayi provides clean, safe water solutions across every segment.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {['30,000+ Customers', '7 Purification Stages', '24/7 Dispatch', 'KEBS Certified'].map((tag) => (
                <span key={tag} className="badge-info text-sm">{tag}</span>
              ))}
            </div>
          </div>

          {/* Core Services Grid */}
          <div className="grid-3 mb-20">
            {CORE_SERVICES.map(({ icon: Icon, title, desc, features, cta, path }) => (
              <div key={title} className="card flex flex-col">
                <div className="card-body flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                    <Icon className="w-6 h-6" style={{ color: '#2563eb' }} />
                  </div>
                  <h3 className="text-h3">{title}</h3>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                  <div className="flex flex-col gap-2">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-caption" style={{ color: 'var(--text-muted)' }}>
                        <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: '#10b981' }} /> {f}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate(path)} className="btn-primary btn-md w-full mt-2">
                    {cta} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Combo Plans */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <span className="text-label mb-2 block" style={{ color: '#2563eb' }}>Bundle & Save</span>
              <h2 className="text-h1">Combo Care Plans</h2>
              <p className="text-body-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Combine water delivery with maintenance and testing for a discounted monthly rate.</p>
            </div>
            <div className="grid-3">
              {COMBO_PLANS.map(({ title, items, price }) => (
                <div key={title} className="card text-center" style={{ borderTop: '3px solid #2563eb' }}>
                  <div className="card-body flex flex-col gap-4 items-center">
                    <h3 className="text-h2">{title}</h3>
                    <p className="text-2xl font-bold" style={{ color: '#2563eb' }}>{price}</p>
                    <div className="w-full flex flex-col gap-2">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                          <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} /> {item}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => navigate('/register')} className="btn-primary btn-md w-full mt-2">
                      Get Started <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust + CTA */}
          <div className="rounded-xl p-12 md:p-16 grid md:grid-cols-2 gap-12 items-center" style={{ backgroundColor: '#0f172a' }}>
            <div className="space-y-6">
              <span className="text-label" style={{ color: '#06b6d4' }}>Why Kitayi?</span>
              <h2 className="text-h1" style={{ color: 'white' }}>Reliable, Certified, and <span style={{ color: '#06b6d4' }}>Always Available</span>.</h2>
              <p className="text-body-sm" style={{ color: '#94a3b8' }}>
                From single jerricans to full tanker loads, every delivery is tracked, tested, and backed by our quality guarantee.
              </p>
              <button onClick={() => navigate('/contact')} className="btn-primary btn-lg">
                Get in Touch <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: FlaskConical, value: '7', label: 'Purification Stages' },
                { icon: TruckIcon, value: '40+', label: 'Delivery Fleet' },
                { icon: Shield, value: '15', label: 'Counties Served' },
                { icon: BadgeCheck, value: '99.9%', label: 'Uptime Rate' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center p-6 rounded-xl" style={{ backgroundColor: '#1e293b' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#334155' }}>
                    <Icon className="w-5 h-5" style={{ color: '#06b6d4' }} />
                  </div>
                  <p className="text-2xl font-bold" style={{ color: 'white' }}>{value}</p>
                  <p className="text-caption" style={{ color: '#94a3b8' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
