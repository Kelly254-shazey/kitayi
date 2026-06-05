import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle2, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OFFICES = [
  { name: 'Head Office — Nairobi', address: 'Industrial Area, Enterprise Road, Nairobi', phone: '+254 700 000 000', hours: 'Mon–Fri 7am–7pm, Sat 8am–4pm' },
  { name: 'Mombasa Branch', address: 'Changamwe Industrial Zone, Mombasa', phone: '+254 711 000 001', hours: 'Mon–Fri 8am–6pm' },
  { name: 'Kisumu Branch', address: 'Kondele Commercial Area, Kisumu', phone: '+254 722 000 002', hours: 'Mon–Fri 8am–6pm' },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="page-bg">
      <Navbar />
      <div className="pt-24">

        {/* Hero */}
        <section className="py-20 max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-5">
          <div className="section-tag">Contact Us</div>
          <h1 className="text-5xl font-display font-black text-white">Get in Touch</h1>
          <p className="text-white/50 max-w-xl leading-relaxed">
            For bulk orders, corporate account inquiries, or emergency deliveries — our team is available 24/7.
          </p>
          <a href="tel:+254700000000" className="btn-primary px-8 py-4">
            <Phone className="w-4 h-4" /> Emergency Helpline: +254 700 000 000
          </a>
        </section>

        {/* Contact grid */}
        <section className="py-8 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Inquiry Form */}
            <div className="glass-card p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 className="font-display font-black text-2xl text-white">Send an Inquiry</h2>
                <p className="text-sm text-white/45">We respond to all inquiries within 2 business hours.</p>
              </div>

              {sent ? (
                <div className="flex flex-col items-center text-center gap-5 py-12">
                  <div className="w-16 h-16 rounded-full bg-success/20 border-2 border-success/40 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white mb-2">Message Sent!</h3>
                    <p className="text-sm text-white/50">Our team will contact you at <strong className="text-white">{email}</strong> shortly.</p>
                  </div>
                  <button onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }} className="btn-secondary px-6 py-2.5 text-sm">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/45 uppercase tracking-wider">Full Name *</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Mwangi" className="glass-input" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-white/45 uppercase tracking-wider">Email Address *</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@gmail.com" className="glass-input" required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/45 uppercase tracking-wider">Subject</label>
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="glass-input">
                      <option>General Inquiry</option>
                      <option>Corporate Account / Bulk Order</option>
                      <option>Emergency Delivery</option>
                      <option>Billing & Payment</option>
                      <option>Complaint / Feedback</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/45 uppercase tracking-wider">Message *</label>
                    <textarea
                      value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Describe your inquiry or request in detail..."
                      rows={5} className="glass-input resize-none" required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary py-4 disabled:opacity-50">
                    <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Office Locations */}
            <div className="flex flex-col gap-5">
              {OFFICES.map(({ name, address, phone, hours }) => (
                <div key={name} className="glass-card p-6 flex flex-col gap-4">
                  <h3 className="font-display font-bold text-white">{name}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 text-sm text-white/55">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {address}
                    </div>
                    <a href={`tel:${phone}`} className="flex items-center gap-3 text-sm text-white/55 hover:text-white transition-colors">
                      <Phone className="w-4 h-4 text-primary shrink-0" /> {phone}
                    </a>
                    <div className="flex items-center gap-3 text-sm text-white/55">
                      <Clock className="w-4 h-4 text-primary shrink-0" /> {hours}
                    </div>
                  </div>
                </div>
              ))}

              <div className="glass-card p-6 flex flex-col gap-3">
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" /> Email Support
                </h3>
                <div className="flex flex-col gap-2">
                  <a href="mailto:support@kitayisolutions.com" className="text-sm text-white/55 hover:text-white transition-colors">
                    support@kitayisolutions.com — General & Customer Support
                  </a>
                  <a href="mailto:corporate@kitayisolutions.com" className="text-sm text-white/55 hover:text-white transition-colors">
                    corporate@kitayisolutions.com — Corporate Accounts
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="py-20" />
      </div>
      <Footer />
    </div>
  );
}
