import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle2, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { communicationsApi } from '../services/api';

const OFFICES = [
  { name: 'Head Office — Kimilli, Bungoma', address: 'P.O Box 132-50204, Kimilli, Bungoma', phone: '+254 705 002 891', hours: 'Mon–Fri 7am–7pm, Sat 8am–4pm' },
  
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await communicationsApi.contactInquiry({ name, email, subject, message });
      setSent(true);
    } catch (err) {
      console.error('Contact inquiry failed:', err);
      setError('Message could not be sent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <div className="flex-1 pt-20">

        {/* Hero */}
        <section className="py-12 max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-5">
          <div className="section-tag flex items-center gap-2"><BrandLogo variant="mark" className="w-3 h-3" /> Contact Us</div>
          <h1 className="text-5xl font-display font-black text-premium-gradient uppercase tracking-tighter">Get in Touch</h1>
          <p className="text-ink dark:text-white/80 font-semibold max-w-xl leading-relaxed">
            For orders, account inquiries, or emergency deliveries — our team is available to help you.
          </p>
          <a href="tel:+254705002891" className="btn-premium px-8 py-4">
            <Phone className="w-4 h-4 mr-2" /> Helpline: +254 705 002 891
          </a>
        </section>

        {/* Contact grid */}
        <section className="py-6 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Inquiry Form */}
            <div className="glass-card p-8 flex flex-col gap-6 bg-white/60 dark:bg-white/5 border-brand-primary/5">
              <div className="flex flex-col gap-1">
                <h2 className="font-display font-black text-2xl text-brand-navy dark:text-white uppercase tracking-tight">Send an Inquiry</h2>
                <p className="text-sm text-ink/60 dark:text-white/60 font-bold uppercase tracking-widest">We typically respond within 2 hours.</p>
              </div>

              {sent ? (
                <div className="flex flex-col items-center text-center gap-5 py-12">
                  <div className="w-16 h-16 rounded-full bg-success/20 border-2 border-success/40 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white mb-2">Message Sent!</h3>
                    <p className="text-sm text-white font-bold">Our team will contact you at <strong className="text-white font-black">{email}</strong> shortly.</p>
                  </div>
                  <button onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }} className="btn-secondary px-6 py-2.5 text-sm">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {error && <div className="alert-danger text-sm">{error}</div>}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-brand-primary dark:text-white/40 uppercase tracking-widest">Full Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Mwangi" className="glass-input text-base bg-white/40 dark:bg-white/5 border-brand-primary/10 rounded-xl px-4 py-3" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-brand-primary dark:text-white/40 uppercase tracking-widest">Email Address</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@gmail.com" className="glass-input text-base bg-white/40 dark:bg-white/5 border-brand-primary/10 rounded-xl px-4 py-3" required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-subject" className="text-[10px] font-black text-brand-primary dark:text-white/40 uppercase tracking-widest">Subject</label>
                    <select id="contact-subject" value={subject} onChange={e => setSubject(e.target.value)} className="glass-input text-base bg-white/40 dark:bg-white/5 border-brand-primary/10 rounded-xl px-4 py-3">
                      <option>General Inquiry</option>
                      <option>Business Account / Bulk Order</option>
                      <option>Emergency Delivery</option>
                      <option>Billing & Payment</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-brand-primary dark:text-white/40 uppercase tracking-widest">Message</label>
                    <textarea
                      value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="How can we help you?"
                      rows={5} className="glass-input resize-none text-base bg-white/40 dark:bg-white/5 border-brand-primary/10 rounded-xl px-4 py-3" required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-premium py-4 disabled:opacity-50">
                    <Send className="w-4 h-4 mr-2" /> {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Office Locations */}
            <div className="flex flex-col gap-5">
              {OFFICES.map(({ name, address, phone, hours }) => (
                <div key={name} className="glass-card p-6 flex flex-col gap-4 bg-white/60 dark:bg-white/5 border-brand-primary/5">
                  <h3 className="font-display font-bold text-brand-navy dark:text-white text-lg uppercase tracking-tight">{name}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 text-sm font-bold text-ink/60 dark:text-white/60">
                      <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" /> {address}
                    </div>
                    <a href={`tel:${phone}`} className="flex items-center gap-3 text-sm font-bold text-brand-primary hover:text-brand-navy transition-colors">
                      <Phone className="w-4 h-4 shrink-0" /> {phone}
                    </a>
                    <div className="flex items-center gap-3 text-sm font-bold text-ink/60 dark:text-white/60">
                      <Clock className="w-4 h-4 text-brand-primary shrink-0" /> {hours}
                    </div>
                  </div>
                </div>
              ))}

              <div className="glass-card p-6 flex flex-col gap-3 bg-brand-navy dark:bg-white/5 border-none text-white">
                <h3 className="font-display font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                  <Mail className="w-5 h-5 text-brand-cyan" /> Email Support
                </h3>
                <div className="flex flex-col gap-2">
                  <a href="mailto:info@kitayi.co.ke" className="text-sm text-white/80 hover:text-white transition-colors">
                    info@kitayi.co.ke — General Support
                  </a>
                  <a href="https://www.kitayi.co.ke" className="text-sm text-white/80 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                    www.kitayi.co.ke — Official Website
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="py-10" />
      </div>
      <Footer />
    </div>
  );
}
