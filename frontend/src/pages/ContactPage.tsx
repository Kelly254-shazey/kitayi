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
    } catch { setError('Message could not be sent. Please try again.'); } finally { setLoading(false); }
  };

  return (
    <div style={{ backgroundColor: 'var(--surface-secondary)', minHeight: '100vh' }}>
      <Navbar />
      <div className="pt-24 pb-12 page-container">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#eff6ff' }}>
            <Mail className="w-7 h-7" style={{ color: '#2563eb' }} />
          </div>
          <h1 className="text-h1 mb-2">Get in Touch</h1>
          <p className="text-body-sm mx-auto max-w-xl" style={{ color: 'var(--text-secondary)' }}>
            For orders, account inquiries, or emergency deliveries — our team is available to help you.
          </p>
          <a href="tel:+254705002891" className="btn-primary btn-lg mt-4 inline-flex items-center gap-2">
            <Phone className="w-4 h-4" /> Helpline: +254 705 002 891
          </a>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="card-body flex flex-col gap-6">
              <div>
                <h2 className="text-h2 mb-1">Send an Inquiry</h2>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>We typically respond within 2 hours.</p>
              </div>

              {sent ? (
                <div className="flex flex-col items-center text-center gap-5 py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac' }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <h3 className="text-h3 mb-2">Message Sent!</h3>
                    <p className="text-body-sm">Our team will contact you at <strong>{email}</strong> shortly.</p>
                  </div>
                  <button onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }} className="btn-secondary btn-md">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {error && <div className="alert-error">{error}</div>}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contactName" className="label">Full Name</label>
                      <input id="contactName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Mwangi" className="input" required />
                    </div>
                    <div>
                      <label htmlFor="contactEmail" className="label">Email Address</label>
                      <input id="contactEmail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@gmail.com" className="input" required />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="label">Subject</label>
                    <select id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="select">
                      <option>General Inquiry</option>
                      <option>Business Account / Bulk Order</option>
                      <option>Emergency Delivery</option>
                      <option>Billing & Payment</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="label">Message</label>
                    <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help you?" rows={5} className="input resize-none" required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                    <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {OFFICES.map(({ name, address, phone, hours }) => (
              <div key={name} className="card">
                <div className="card-body flex flex-col gap-4">
                  <h3 className="text-h3">{name}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3 text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#2563eb' }} /> {address}
                    </div>
                    <a href={`tel:${phone}`} className="flex items-center gap-3 text-body-sm font-semibold" style={{ color: '#2563eb' }}>
                      <Phone className="w-4 h-4 shrink-0" /> {phone}
                    </a>
                    <div className="flex items-center gap-3 text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Clock className="w-4 h-4 shrink-0" style={{ color: '#2563eb' }} /> {hours}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="card" style={{ backgroundColor: '#0f172a' }}>
              <div className="card-body flex flex-col gap-4">
                <h3 className="text-h3 flex items-center gap-2" style={{ color: 'white' }}>
                  <Mail className="w-5 h-5" style={{ color: '#06b6d4' }} /> Email Support
                </h3>
                <div className="flex flex-col gap-2">
                  <a href="mailto:info@kitayi.co.ke" className="text-body-sm transition-colors" style={{ color: '#94a3b8' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    info@kitayi.co.ke — General Support
                  </a>
                  <a href="https://www.kitayi.co.ke" className="text-body-sm transition-colors" style={{ color: '#94a3b8' }}
                    target="_blank" rel="noopener noreferrer"
                    onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    www.kitayi.co.ke — Official Website
                  </a>
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
