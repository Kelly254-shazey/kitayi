import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Search, CheckCircle2, AlertCircle, RefreshCw, Droplets, ArrowRight, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { customersApi, paymentsApi } from '../services/api';

type PendingOrder = { id: string; tracking_number: string; delivery_date: string; delivery_slot: string; total_amount: string; payment_status: string; status: string };
type BillData = { account_number: string; name: string; address: string; outstanding_balance: number; pending_orders: PendingOrder[] };
type PageState = 'lookup' | 'bill' | 'paying' | 'success' | 'error';

function getErrMsg(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { detail?: string } } };
    return e.response?.data?.detail || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

export default function BillPayPage() {
  const [accountNo, setAccountNo] = useState('');
  const [pageState, setPageState] = useState<PageState>('lookup');
  const [bill, setBill] = useState<BillData | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [payMethod, setPayMethod] = useState<'mpesa' | 'stripe' | 'paypal' | 'apple-pay' | 'google-pay' | null>(null);
  const [payError, setPayError] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [txRef] = useState(() => `KY-BILL-${Date.now().toString().slice(-6)}`);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setBill(null);
    setSelectedOrderId(null);
    try {
      const res = await customersApi.lookupBill(accountNo.trim());
      const data = res.data;
      setBill({ account_number: data.account_number, name: data.name, address: data.address, outstanding_balance: Number(data.outstanding_balance), pending_orders: data.pending_orders });
      setSelectedOrderId(data.pending_orders?.[0]?.id ?? null);
      setPageState('bill');
    } catch { setLookupError('Account number not found. Please check and try again.'); }
  };

  const handlePay = async (method: 'mpesa' | 'stripe' | 'paypal' | 'apple-pay' | 'google-pay') => {
    setPayMethod(method);
    setPayError('');
    setPageState('paying');
    if (!selectedOrderId) { setPayError('No pending order available for payment.'); setPageState('error'); return; }
    try {
      const res = method === 'mpesa'
        ? await paymentsApi.mpesaPush(selectedOrderId)
        : method === 'stripe'
        ? await paymentsApi.stripeCheckout(selectedOrderId)
        : await paymentsApi.otherCheckout(selectedOrderId, method);
      if (res.data?.checkout_url) { window.location.href = res.data.checkout_url; return; }
      setPageState('success');
    } catch (err: unknown) {
      setPayError(getErrMsg(err, 'Payment initiation failed. Please try again.'));
      setPageState('error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--surface-secondary)' }}>
      <Navbar />
      <div className="flex-1 pt-24 pb-12 page-container max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#eff6ff' }}>
            <CreditCard className="w-7 h-7" style={{ color: '#2563eb' }} />
          </div>
          <h1 className="text-h1 mb-2">Pay Your Kitayi Bill</h1>
          <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter your Customer Account Number to fetch and pay your balance — no login required.
          </p>
        </div>

        {/* Lookup */}
        {pageState === 'lookup' && (
          <div className="card">
            <div className="card-body flex flex-col gap-6">
              <div>
                <h2 className="text-h3 mb-1">Find Your Account</h2>
                <p className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Your account number is printed on your monthly paper statement.</p>
              </div>
              <form onSubmit={handleLookup} className="flex flex-col gap-5">
                <div>
                  <label htmlFor="accountNo" className="label">Kitayi Account Number</label>
                  <input id="accountNo" type="text" value={accountNo}
                    onChange={e => setAccountNo(e.target.value)} placeholder="e.g. KS-8492-3015"
                    className="input text-center tracking-widest font-mono text-lg" required />
                </div>
                {lookupError && (
                  <div className="alert-error">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{lookupError}</span>
                  </div>
                )}
                <button type="submit" className="btn-primary btn-lg w-full">
                  <Search className="w-4 h-4" /> Look Up My Balance
                </button>
              </form>
              <div className="flex flex-col gap-3 text-center text-body-sm" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="pt-4" style={{ color: 'var(--text-muted)' }}>
                  Have an account? <Link to="/login" className="font-semibold" style={{ color: '#2563eb' }}>Sign in</Link>
                </p>
                <a href="tel:+254700000000" className="flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <Phone className="w-3.5 h-3.5" /> Can't find your number? Call: +254 700 000 000
                </a>
              </div>
              <div className="rounded-xl p-4 text-body-sm" style={{ backgroundColor: '#f1f5f9' }}>
                <span className="font-semibold block mb-1">Demo Account Numbers:</span>
                <span className="font-mono">KS-8492-3015</span> (Residential) &bull; <span className="font-mono">KS-1234-5678</span> (Corporate)
              </div>
            </div>
          </div>
        )}

        {/* Bill Display */}
        {pageState === 'bill' && bill && (
          <div className="flex flex-col gap-5">
            <div className="card">
              <div className="card-body flex flex-col gap-6">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="label mb-1">Account Holder</p>
                    <h2 className="text-h2">{bill.name}</h2>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{bill.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="label mb-1">Account Number</p>
                    <p className="font-mono font-bold" style={{ color: '#2563eb' }}>{bill.account_number}</p>
                  </div>
                </div>
                <div className="p-6 rounded-xl" style={{ backgroundColor: '#f1f5f9' }}>
                  <div className="flex justify-between text-body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    <span>Pending Orders</span><span>{bill.pending_orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid #cbd5e1' }}>
                    <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Payable Amount</span>
                    <span className="text-3xl font-bold" style={{ color: bill.outstanding_balance === 0 ? '#059669' : 'var(--text-primary)' }}>
                      Ksh {bill.outstanding_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                {bill.outstanding_balance === 0 ? (
                  <div className="alert-success">
                    <CheckCircle2 className="w-5 h-5 shrink-0" /> Your account is fully paid.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div>
                      <label htmlFor="mpesaPhone" className="label">M-Pesa Phone Number</label>
                      <input id="mpesaPhone" type="tel" value={mpesaPhone}
                        onChange={e => setMpesaPhone(e.target.value)} placeholder="+254700000000" className="input" />
                    </div>
                    <button onClick={() => handlePay('mpesa')}
                      className="btn-lg w-full" style={{ backgroundColor: '#059669', color: 'white', borderRadius: '0.5rem', fontWeight: 600 }}>
                      Pay Ksh {bill.outstanding_balance.toLocaleString()} via M-Pesa
                    </button>
                    <button onClick={() => handlePay('stripe')} className="btn-primary btn-lg w-full">
                      Pay with Card (Stripe)
                    </button>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handlePay('paypal')}
                        className="btn-sm" style={{ backgroundColor: '#0070BA', color: 'white', borderRadius: '0.5rem', fontWeight: 600, padding: '0.75rem' }}>
                        PayPal
                      </button>
                      <button onClick={() => handlePay('apple-pay')}
                        className="btn-sm" style={{ backgroundColor: '#000', color: 'white', borderRadius: '0.5rem', fontWeight: 600, padding: '0.75rem' }}>
                        Apple Pay
                      </button>
                      <button onClick={() => handlePay('google-pay')}
                        className="btn-sm" style={{ backgroundColor: '#4285F4', color: 'white', borderRadius: '0.5rem', fontWeight: 600, padding: '0.75rem' }}>
                        Google Pay
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => { setPageState('lookup'); setAccountNo(''); setBill(null); }}
              className="text-body-sm text-center" style={{ color: 'var(--text-muted)' }}>
              &larr; Search a different account
            </button>
          </div>
        )}

        {/* Paying */}
        {pageState === 'paying' && (
          <div className="card text-center p-16 flex flex-col items-center gap-5">
            <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }} />
            <h2 className="text-h2">
              {payMethod === 'mpesa' ? 'Sending STK Push...' : 'Connecting to payment gateway...'}
            </h2>
            <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
              {payMethod === 'mpesa' ? 'Check your phone and enter your M-Pesa PIN.' : 'Please wait while we process your payment.'}
            </p>
          </div>
        )}

        {/* Success */}
        {pageState === 'success' && (
          <div className="card text-center p-12 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac' }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: '#10b981' }} />
            </div>
            <div>
              <h2 className="text-h1 mb-2">Payment Successful!</h2>
              <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                Account <strong className="font-mono">{bill?.account_number}</strong> has been settled.
              </p>
            </div>
            <div className="px-8 py-4 rounded-xl" style={{ backgroundColor: '#f1f5f9' }}>
              <p className="text-caption mb-1" style={{ color: 'var(--text-muted)' }}>Transaction Reference</p>
              <p className="font-mono font-bold tracking-wider" style={{ color: '#2563eb' }}>{txRef}</p>
            </div>
            <p className="text-caption" style={{ color: 'var(--text-muted)' }}>A receipt has been sent to your registered email.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/" className="btn-secondary btn-md"><Droplets className="w-4 h-4" /> Return Home</Link>
              <Link to="/shop" className="btn-primary btn-md">Order Water <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        )}

        {/* Error */}
        {pageState === 'error' && (
          <div className="card text-center p-10 flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fef2f2', border: '2px solid #fecaca' }}>
              <AlertCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h2 className="text-h2 mb-2">Payment Failed</h2>
              <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{payError}</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => setPageState('bill')} className="btn-primary btn-md">
                <RefreshCw className="w-4 h-4" /> Retry Payment
              </button>
              <a href="tel:+254700000000" className="btn-secondary btn-md">
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
