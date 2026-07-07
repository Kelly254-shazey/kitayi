import { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { CheckCircle2, Droplets, ArrowRight, AlertCircle, RefreshCw, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ordersApi, paymentsApi } from '../services/api';

type CartItem = { product: { id: string; name: string; price: number; volume_liters: number }; qty: number };

const STEPS = ['Cart', 'Delivery Info', 'Payment', 'Confirmation'];

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialCart: CartItem[] = useMemo(() => location.state?.cart ?? [], [location.state?.cart]);

  useEffect(() => {
    if (!user) navigate('/login', { state: { from: '/checkout', cart: initialCart } });
  }, [user, navigate, initialCart]);

  const [step, setStep] = useState(user && initialCart.length > 0 ? 1 : 0);
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Morning (8am–12pm)');
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [discount, setDiscount] = useState(0);
  const [payError, setPayError] = useState('');
  const [paying, setPaying] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(() => `KY-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`);

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));
  const subtotal = cart.reduce((acc, i) => acc + i.product.price * i.qty, 0);
  const discountAmt = discount < 1 ? subtotal * discount : Math.min(discount, subtotal);
  const taxable = subtotal - discountAmt;
  const tax = taxable * 0.16;
  const total = taxable + tax;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === 'WELCOME10') { setDiscount(0.1); setCouponMsg('10% discount applied!'); }
    else if (code === 'KSH500') { setDiscount(500); setCouponMsg('Ksh 500 flat discount applied!'); }
    else { setDiscount(0); setCouponMsg('Invalid coupon code.'); }
  };

  const handlePay = async (method: 'mpesa' | 'stripe' | 'paypal' | 'apple-pay' | 'google-pay') => {
    setPayError('');
    setPaying(true);
    try {
      const payload = {
        items: cart.map(({ product, qty }) => ({ product: product.id, quantity: qty })),
        delivery_address: address, delivery_date: deliveryDate, delivery_slot: deliverySlot,
        coupon_code: coupon.trim() || undefined,
      };
      const orderRes = await ordersApi.create(payload);
      const order = orderRes.data;
      setTrackingNumber(order.tracking_number || trackingNumber);

      const paymentRes = method === 'mpesa'
        ? await paymentsApi.mpesaPush(order.id)
        : method === 'stripe'
        ? await paymentsApi.stripeCheckout(order.id)
        : await paymentsApi.otherCheckout(order.id, method);

      if (paymentRes.data?.checkout_url) { window.location.href = paymentRes.data.checkout_url; return; }
      setStep(4);
    } catch (error: unknown) {
      let message = 'Payment failed. Please review your details and try again.';
      if (error instanceof Error) message = error.message || message;
      else if (error && typeof error === 'object') {
        const maybe = error as { response?: { data?: { detail?: unknown } } };
        if (maybe.response?.data && typeof maybe.response.data === 'object') {
          const detail = (maybe.response.data as { detail?: unknown }).detail;
          if (typeof detail === 'string') message = detail;
        }
      }
      setPayError(message);
    } finally { setPaying(false); }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--surface-secondary)' }}>
      <Navbar />
      <div className="flex-1 pt-24 pb-12 page-container max-w-2xl">

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto">
          {STEPS.map((label, idx) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
                  style={{
                    backgroundColor: idx < step ? '#10b981' : idx === step ? '#2563eb' : 'transparent',
                    borderColor: idx < step ? '#10b981' : idx === step ? '#2563eb' : '#cbd5e1',
                    color: idx <= step ? 'white' : '#94a3b8',
                  }}>
                  {idx < step ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className="text-caption" style={{ color: idx <= step ? '#2563eb' : '#94a3b8' }}>{label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="h-px w-12 md:w-20 mx-2 mb-5" style={{ backgroundColor: idx < step ? '#10b981' : '#e2e8f0' }} />
              )}
            </div>
          ))}
        </div>

        {/* Empty cart */}
        {step === 0 && (
          <div className="card text-center p-12">
            <Droplets className="w-14 h-14 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h2 className="text-h2 mb-2">Your cart is empty</h2>
            <p className="text-body-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Add items from the shop before checking out.</p>
            <Link to="/shop" className="btn-primary btn-md">Browse Products</Link>
          </div>
        )}

        {/* Cart Review */}
        {step === 1 && (
          <div className="card">
            <div className="card-body flex flex-col gap-6">
              <h2 className="text-h2">Review Your Cart</h2>
              <div className="flex flex-col gap-3">
                {cart.map(({ product, qty }) => (
                  <div key={product.id} className="flex items-center justify-between p-4 rounded-lg" style={{ border: '1px solid var(--border)' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{product.name}</p>
                      <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                        &times;{qty} @ Ksh {product.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-2">
                      <span className="font-bold text-sm">Ksh {(product.price * qty).toLocaleString()}</span>
                      <button onClick={() => removeItem(product.id)} className="btn-ghost btn-sm p-1" style={{ color: 'var(--text-muted)' }}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div>
                <label htmlFor="coupon" className="label mb-2">Coupon Code</label>
                <div className="flex gap-2">
                  <input id="coupon" type="text" placeholder="e.g. WELCOME10" value={coupon}
                    onChange={e => setCoupon(e.target.value)} className="input flex-1" />
                  <button onClick={applyCoupon} className="btn-secondary btn-md">Apply</button>
                </div>
                {couponMsg && (
                  <p className="text-xs font-semibold mt-1" style={{ color: discount > 0 ? '#059669' : '#ef4444' }}>{couponMsg}</p>
                )}
              </div>

              {/* Totals */}
              <div className="flex flex-col gap-2 text-body-sm" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex justify-between pt-4" style={{ color: 'var(--text-secondary)' }}>
                  <span>Subtotal</span><span>Ksh {subtotal.toLocaleString()}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between" style={{ color: '#059669' }}>
                    <span>Discount</span><span>-Ksh {discountAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                  <span>VAT (16%)</span><span>Ksh {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <span>Total</span><span>Ksh {total.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={() => cart.length > 0 && setStep(2)} disabled={cart.length === 0} className="btn-primary btn-lg w-full">
                Continue to Delivery <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Delivery Info */}
        {step === 2 && (
          <div className="card">
            <div className="card-body flex flex-col gap-6">
              <h2 className="text-h2">Delivery Information</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="label">Street Address *</label>
                  <input id="address" type="text" placeholder="e.g. 123 Kilimani Road, Apt 4B"
                    value={address} onChange={e => setAddress(e.target.value)} className="input" required />
                </div>
                <div>
                  <label htmlFor="city" className="label">City / Town</label>
                  <input id="city" type="text" value={city} onChange={e => setCity(e.target.value)} className="input" />
                </div>
                <div>
                  <label htmlFor="deliveryDate" className="label">Delivery Date *</label>
                  <input id="deliveryDate" type="date" value={deliveryDate} min={todayStr}
                    onChange={e => setDeliveryDate(e.target.value)} className="input" />
                </div>
                <div>
                  <label htmlFor="deliverySlot" className="label">Time Slot</label>
                  <select id="deliverySlot" value={deliverySlot} onChange={e => setDeliverySlot(e.target.value)} className="select">
                    <option>Morning (8am–12pm)</option>
                    <option>Afternoon (12pm–5pm)</option>
                    <option>Evening (5pm–8pm)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary btn-md flex-1">&larr; Back</button>
                <button onClick={() => address.trim() && deliveryDate ? setStep(3) : null}
                  disabled={!address.trim() || !deliveryDate}
                  className="btn-primary btn-md flex-1 disabled:opacity-40">
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment */}
        {step === 3 && (
          <div className="card">
            <div className="card-body flex flex-col gap-7">
              <div>
                <h2 className="text-h2 mb-1">Secure Payment</h2>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Your payment data is encrypted.</p>
              </div>

              {/* Summary */}
              <div className="p-5 rounded-xl" style={{ backgroundColor: '#f1f5f9' }}>
                <div className="flex flex-col gap-2 text-body-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>Ksh {subtotal.toLocaleString()}</span></div>
                  {discountAmt > 0 && <div className="flex justify-between" style={{ color: '#059669' }}><span>Discount</span><span>-Ksh {discountAmt.toFixed(2)}</span></div>}
                  <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}><span>VAT (16%)</span><span>Ksh {tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-lg pt-3" style={{ borderTop: '1px solid #cbd5e1' }}>
                    <span>Total Due</span><span>Ksh {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl text-body-sm" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p><span style={{ color: 'var(--text-secondary)' }}>Address:</span> {address}, {city}</p>
                <p><span style={{ color: 'var(--text-secondary)' }}>Scheduled:</span> {deliveryDate} &mdash; {deliverySlot}</p>
              </div>

              {/* Error */}
              {payError && (
                <div className="alert-error flex-col items-start">
                  <div className="flex items-start gap-3 w-full">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Payment Failed</p>
                      <p className="text-xs mt-1">{payError}</p>
                    </div>
                  </div>
                  <button onClick={() => setPayError('')}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ border: '1px solid #fecaca' }}>
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Payment
                  </button>
                </div>
              )}

              {/* Payment Methods */}
              <div className="flex flex-col gap-3">
                <button onClick={() => handlePay('mpesa')} disabled={paying}
                  className="btn-lg w-full" style={{ backgroundColor: '#059669', color: 'white', borderRadius: '0.5rem', fontWeight: 600 }}>
                  {paying ? 'Processing...' : 'Pay with M-Pesa STK Push'}
                </button>
                <button onClick={() => handlePay('stripe')} disabled={paying}
                  className="btn-primary btn-lg w-full">
                  {paying ? 'Processing...' : 'Pay with Card (Stripe)'}
                </button>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handlePay('paypal')} disabled={paying}
                    className="btn-sm" style={{ backgroundColor: '#0070BA', color: 'white', borderRadius: '0.5rem', fontWeight: 600, padding: '0.75rem 1rem' }}>
                    PayPal
                  </button>
                  <button onClick={() => handlePay('apple-pay')} disabled={paying}
                    className="btn-sm" style={{ backgroundColor: '#000', color: 'white', borderRadius: '0.5rem', fontWeight: 600, padding: '0.75rem 1rem' }}>
                    Apple Pay
                  </button>
                  <button onClick={() => handlePay('google-pay')} disabled={paying}
                    className="btn-sm" style={{ backgroundColor: '#4285F4', color: 'white', borderRadius: '0.5rem', fontWeight: 600, padding: '0.75rem 1rem' }}>
                    Google Pay
                  </button>
                </div>
              </div>

              <button onClick={() => setStep(2)} className="text-body-sm text-center" style={{ color: 'var(--text-muted)' }}>
                &larr; Back to Delivery
              </button>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {step === 4 && (
          <div className="card text-center p-12">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac' }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: '#10b981' }} />
            </div>
            <h2 className="text-h1 mb-2">Order Confirmed!</h2>
            <p className="text-body-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Your water delivery is scheduled. You'll receive an SMS with tracking details.
            </p>
            <div className="inline-block px-8 py-4 rounded-xl mb-6" style={{ backgroundColor: '#f1f5f9' }}>
              <p className="text-caption mb-1" style={{ color: 'var(--text-muted)' }}>Tracking Number</p>
              <p className="font-mono font-bold text-lg tracking-wider" style={{ color: '#2563eb' }}>{trackingNumber}</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/dashboard" className="btn-primary btn-md">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/shop" className="btn-secondary btn-md">Continue Shopping</Link>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
