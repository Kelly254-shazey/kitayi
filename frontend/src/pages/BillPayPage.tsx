import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Search, CheckCircle2, AlertCircle,
  RefreshCw, Droplets, ArrowRight, Phone
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type BillData = { account: string; name: string; address: string; balance: number; dueDate: string; period: string };

// Mock bill lookup by account number
const MOCK_BILLS: Record<string, BillData> = {
  'KS-8492-3015': { account: 'KS-8492-3015', name: 'Jane Mwangi', address: '123 Kilimani Rd, Nairobi', balance: 2350.00, dueDate: '2026-06-30', period: 'June 2026' },
  'KS-1234-5678': { account: 'KS-1234-5678', name: 'Bob Kariuki Ltd', address: 'Enterprise Road, Industrial Area', balance: 18750.00, dueDate: '2026-06-20', period: 'June 2026' },
  'KS-0000-0000': { account: 'KS-0000-0000', name: 'Demo Customer', address: 'Demo Address, Nairobi', balance: 0.00, dueDate: '2026-06-30', period: 'June 2026' },
};

type PageState = 'lookup' | 'bill' | 'paying' | 'success' | 'error';

export default function BillPayPage() {
  const [accountNo, setAccountNo] = useState('');
  const [pageState, setPageState] = useState<PageState>('lookup');
  const [bill, setBill] = useState<BillData | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [payMethod, setPayMethod] = useState<'mpesa' | 'stripe' | null>(null);
  const [payError, setPayError] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [txRef] = useState(`KY-BILL-${Date.now().toString().slice(-6)}`);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const found = MOCK_BILLS[accountNo.trim().toUpperCase()];
    if (found) {
      setBill(found);
      setPageState('bill');
    } else {
      setLookupError('Account number not found. Please check and try again, or call +254 700 000 000 for assistance.');
    }
  };

  const handlePay = async (method: 'mpesa' | 'stripe') => {
    setPayMethod(method);
    setPayError('');
    setPageState('paying');
    await new Promise(r => setTimeout(r, 2000));
    // Simulate rare failure for retry UX demo
    if (method === 'stripe' && Math.random() < 0.25) {
      setPayError('Your card was declined. Please check your card details or try M-Pesa.');
      setPageState('error');
      return;
    }
    setPageState('success');
  };

  return (
    <div className="page-bg">
      <Navbar />
      <div className="pt-24 pb-20 max-w-2xl mx-auto px-6">

        {/* Header */}
        <div className="py-12 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-black text-white">Pay Your Kitayi Bill</h1>
          <p className="text-white/50 leading-relaxed">
            Enter your Kitayi Customer Account Number to fetch and pay your current water utility balance — no login required.
          </p>
        </div>

        {/* STEP 1: Account Lookup */}
        {pageState === 'lookup' && (
          <div className="glass-card p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-display font-bold text-xl text-white">Find Your Account</h2>
              <p className="text-sm text-white/40">Your account number is printed on your monthly paper statement or welcome letter.</p>
            </div>

            <form onSubmit={handleLookup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Kitayi Account Number</label>
                <input
                  type="text" value={accountNo}
                  onChange={e => setAccountNo(e.target.value)}
                  placeholder="e.g. KS-8492-3015"
                  className="glass-input text-center tracking-widest font-mono text-lg"
                  required
                />
              </div>
              {lookupError && (
                <div className="bg-danger/10 border border-danger/25 p-3.5 rounded-xl flex items-start gap-2.5 text-sm text-danger">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{lookupError}</span>
                </div>
              )}
              <button type="submit" className="btn-primary py-4">
                <Search className="w-4 h-4" /> Look Up My Balance
              </button>
            </form>

            <div className="border-t border-white/8 pt-5 flex flex-col gap-3 text-sm text-center text-white/40">
              <p>Have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link> to see full billing history.</p>
              <a href="tel:+254700000000" className="flex items-center justify-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> Can't find your number? Call us: +254 700 000 000
              </a>
            </div>

            {/* Demo hint */}
            <div className="bg-white/5 border border-white/8 rounded-xl p-4 text-xs text-white/40">
              <span className="font-bold text-white/60 block mb-1">Demo Account Numbers:</span>
              <span className="font-mono">KS-8492-3015</span> (Residential) •{' '}
              <span className="font-mono">KS-1234-5678</span> (Corporate) •{' '}
              <span className="font-mono">KS-0000-0000</span> (Zero balance)
            </div>
          </div>
        )}

        {/* STEP 2: Bill Details */}
        {pageState === 'bill' && bill && (
          <div className="flex flex-col gap-5">
            <div className="glass-card p-8 flex flex-col gap-6">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-white/35 uppercase tracking-wider">Account Holder</p>
                  <h2 className="font-display font-bold text-2xl text-white">{bill.name}</h2>
                  <p className="text-sm text-white/45">{bill.address}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-xs text-white/35 uppercase tracking-wider">Account Number</p>
                  <p className="font-mono font-bold text-primary">{bill.account}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
                <div className="flex justify-between text-sm text-white/50">
                  <span>Billing Period</span><span className="text-white">{bill.period}</span>
                </div>
                <div className="flex justify-between text-sm text-white/50">
                  <span>Due Date</span><span className="text-white">{bill.dueDate}</span>
                </div>
                <div className="border-t border-white/10 pt-3 mt-1 flex justify-between items-center">
                  <span className="text-sm text-white/50">Amount Due</span>
                  <span className={`font-display font-black text-3xl ${bill.balance === 0 ? 'text-success' : 'text-white'}`}>
                    Ksh {bill.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {bill.balance === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/25 rounded-xl text-success text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Your account is fully paid. No balance outstanding.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">M-Pesa Phone Number</label>
                    <input
                      type="tel" value={mpesaPhone}
                      onChange={e => setMpesaPhone(e.target.value)}
                      placeholder="+254700000000"
                      className="glass-input"
                    />
                  </div>
                  <button onClick={() => handlePay('mpesa')} className="btn-success py-4">
                    📱 Pay Ksh {bill.balance.toLocaleString()} via M-Pesa
                  </button>
                  <button onClick={() => handlePay('stripe')} className="btn-primary py-4">
                    💳 Pay with Card (Stripe)
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => { setPageState('lookup'); setAccountNo(''); setBill(null); }} className="text-sm text-white/35 hover:text-white/60 text-center transition-colors">
              ← Search a different account
            </button>
          </div>
        )}

        {/* STEP 3: Paying */}
        {pageState === 'paying' && (
          <div className="glass-card p-16 text-center flex flex-col items-center gap-5">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <h2 className="font-display font-bold text-xl text-white">
              {payMethod === 'mpesa' ? 'Sending STK Push to your phone...' : 'Connecting to secure card gateway...'}
            </h2>
            <p className="text-sm text-white/40">
              {payMethod === 'mpesa' ? 'Check your phone and enter your M-Pesa PIN to complete the payment.' : 'Please wait while we process your payment securely.'}
            </p>
          </div>
        )}

        {/* Success */}
        {pageState === 'success' && (
          <div className="glass-card p-12 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success/40 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-display font-black text-3xl text-white">Payment Successful!</h2>
              <p className="text-white/55">Account <strong className="text-white font-mono">{bill?.account}</strong> has been settled.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
              <p className="text-xs text-white/35 mb-1">Transaction Reference</p>
              <p className="font-mono font-bold text-primary text-base tracking-widest">{txRef}</p>
            </div>
            <p className="text-xs text-white/35">A receipt has been sent to your registered email address.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/" className="btn-secondary px-6 py-3"><Droplets className="w-4 h-4" /> Return Home</Link>
              <Link to="/shop" className="btn-primary px-6 py-3">Order Water <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        )}

        {/* Error with Retry */}
        {pageState === 'error' && (
          <div className="glass-card p-10 flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-danger/20 border-2 border-danger/40 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-danger" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-display font-bold text-2xl text-white">Payment Failed</h2>
              <p className="text-sm text-white/55 max-w-sm">{payError}</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => setPageState('bill')} className="btn-primary px-6 py-3">
                <RefreshCw className="w-4 h-4" /> Retry Payment
              </button>
              <a href="tel:+254700000000" className="btn-secondary px-6 py-3">
                <Phone className="w-4 h-4" /> Call Support
              </a>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
