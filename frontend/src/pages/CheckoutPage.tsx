import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Droplets, ArrowRight, AlertCircle, RefreshCw, X } from 'lucide-react';
import Navbar from '../components/Navbar';

type CartItem = { product: { id: string; name: string; price: number; volume_liters: number }; qty: number };

const STEPS = ['Cart', 'Delivery Info', 'Payment', 'Confirmation'];

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCart: CartItem[] = location.state?.cart ?? [];

  const [step, setStep] = useState(initialCart.length > 0 ? 1 : 0);
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  // Step 2 fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Morning (8am–12pm)');
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [discount, setDiscount] = useState(0);

  // Step 3 fields
  const [payError, setPayError] = useState('');
  const [paying, setPaying] = useState(false);
  const [trackingNumber] = useState(`KY-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`);

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
    else { setDiscount(0); setCouponMsg('Invalid coupon code. Please try again.'); }
  };

  const handlePay = async (method: 'mpesa' | 'stripe') => {
    setPayError('');
    setPaying(true);
    await new Promise(r => setTimeout(r, 1800));
    // Simulate occasional failure for demo retry UX
    if (method === 'stripe' && Math.random() < 0.2) {
      setPayError('Payment declined by card issuer. Please verify your card details or try a different method.');
      setPaying(false);
      return;
    }
    setPaying(false);
    setStep(4);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <div className="pt-24 pb-20 max-w-4xl mx-auto px-6">

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-0 mb-12 mt-8">
          {STEPS.map((label, idx) => (
            <div key={label} className="flex items-center">
              <div className={`flex flex-col items-center gap-1.5 transition-all`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  idx < step ? 'bg-success border-success text-white' :
                  idx === step ? 'bg-primary border-primary text-white shadow-glow-sm' :
                  'border-white/20 text-white/30 bg-white/5'
                }`}>
                  {idx < step ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider transition-all ${idx === step ? 'text-primary' : idx < step ? 'text-success' : 'text-white/25'}`}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-px w-16 md:w-24 mx-2 mb-5 transition-all ${idx < step ? 'bg-success' : 'bg-white/15'}`} />
              )}
            </div>
          ))}
        </div>

        {/* STEP 0: Empty cart redirect */}
        {step === 0 && (
          <div className="glass-card p-16 text-center flex flex-col items-center gap-5">
            <Droplets className="w-14 h-14 text-white/15" />
            <h2 className="font-display font-black text-2xl text-white">Your cart is empty</h2>
            <p className="text-white/50">Head back to the shop to add items before checking out.</p>
            <Link to="/shop" className="btn-primary px-8 py-3.5">Browse Products</Link>
          </div>
        )}

        {/* STEP 1: Cart Review */}
        {step === 1 && (
          <div className="glass-card p-8 flex flex-col gap-6">
            <h2 className="font-display font-black text-2xl text-white">Review Your Cart</h2>
            <div className="flex flex-col gap-3">
              {cart.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/8">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold text-white">{product.name}</p>
                    <p className="text-xs text-white/40">×{qty} unit{qty > 1 ? 's' : ''} @ Ksh {product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display font-black text-white">Ksh {(product.price * qty).toLocaleString()}</span>
                    <button onClick={() => removeItem(product.id)} className="text-white/25 hover:text-danger transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text" placeholder="e.g. WELCOME10" value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="glass-input flex-1"
                />
                <button onClick={applyCoupon} className="btn-secondary px-5 py-2.5 text-sm">Apply</button>
              </div>
              {couponMsg && (
                <p className={`text-xs font-semibold ${discount > 0 ? 'text-success' : 'text-danger'}`}>{couponMsg}</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-white/10 pt-5 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-white/50"><span>Subtotal</span><span>Ksh {subtotal.toLocaleString()}</span></div>
              {discountAmt > 0 && <div className="flex justify-between text-success font-semibold"><span>Discount</span><span>-Ksh {discountAmt.toFixed(2)}</span></div>}
              <div className="flex justify-between text-white/50"><span>VAT (16%)</span><span>Ksh {tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-display font-black text-white text-base border-t border-white/10 pt-3 mt-1">
                <span>Total</span><span>Ksh {total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => cart.length > 0 && setStep(2)}
              disabled={cart.length === 0}
              className="btn-primary py-4 disabled:opacity-40"
            >
              Continue to Delivery Info <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Delivery Info */}
        {step === 2 && (
          <div className="glass-card p-8 flex flex-col gap-6">
            <h2 className="font-display font-black text-2xl text-white">Delivery Information</h2>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Street Address *</label>
                <input
                  type="text" placeholder="e.g. 123 Kilimani Road, Apt 4B"
                  value={address} onChange={e => setAddress(e.target.value)}
                  className="glass-input" required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">City / Town</label>
                <input
                  type="text" value={city} onChange={e => setCity(e.target.value)}
                  className="glass-input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Preferred Delivery Date *</label>
                <input
                  type="date" value={deliveryDate} min={todayStr}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="glass-input"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Time Slot</label>
                <select value={deliverySlot} onChange={e => setDeliverySlot(e.target.value)} className="glass-input">
                  <option>Morning (8am–12pm)</option>
                  <option>Afternoon (12pm–5pm)</option>
                  <option>Evening (5pm–8pm)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3.5">← Back</button>
              <button
                onClick={() => address.trim() && deliveryDate ? setStep(3) : null}
                disabled={!address.trim() || !deliveryDate}
                className="btn-primary flex-1 py-3.5 disabled:opacity-40"
              >
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment */}
        {step === 3 && (
          <div className="glass-card p-8 flex flex-col gap-7">
            <div>
              <h2 className="font-display font-black text-2xl text-white mb-1">Secure Payment</h2>
              <p className="text-white/40 text-sm">PCI-DSS compliant — your card data is never stored on our servers.</p>
            </div>

            {/* Order summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-white/50"><span>Subtotal</span><span>Ksh {subtotal.toLocaleString()}</span></div>
              {discountAmt > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-Ksh {discountAmt.toFixed(2)}</span></div>}
              <div className="flex justify-between text-white/50"><span>VAT (16%)</span><span>Ksh {tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-display font-black text-white text-lg border-t border-white/10 pt-3 mt-1">
                <span>Total Due</span><span>Ksh {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white/50 flex flex-col gap-1.5">
              <p><span className="text-white/25">Address:</span> {address}, {city}</p>
              <p><span className="text-white/25">Scheduled:</span> {deliveryDate} — {deliverySlot}</p>
            </div>

            {/* Error with Retry */}
            {payError && (
              <div className="bg-danger/10 border border-danger/25 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-sm text-danger font-semibold">Payment Failed</p>
                  <p className="text-xs text-danger/80">{payError}</p>
                  <button
                    onClick={() => setPayError('')}
                    className="flex items-center gap-1.5 text-xs font-bold text-danger border border-danger/30 rounded-lg px-3 py-1.5 w-fit hover:bg-danger/10 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Payment
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePay('mpesa')}
                disabled={paying}
                className="btn-success py-4 disabled:opacity-50"
              >
                {paying ? 'Processing...' : '📱 Pay with M-Pesa STK Push'}
              </button>
              <button
                onClick={() => handlePay('stripe')}
                disabled={paying}
                className="btn-primary py-4 disabled:opacity-50"
              >
                {paying ? 'Processing...' : '💳 Pay with Card (Stripe)'}
              </button>
            </div>

            <button onClick={() => setStep(2)} className="text-xs text-white/30 hover:text-white/60 text-center transition-colors">
              ← Back to Delivery Info
            </button>
          </div>
        )}

        {/* STEP 4: Confirmation */}
        {step === 4 && (
          <div className="glass-card p-12 text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success/40 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-display font-black text-3xl text-white">Order Confirmed!</h2>
              <p className="text-white/55 leading-relaxed max-w-md">
                Your water delivery is scheduled. You'll receive an SMS confirmation with live GPS tracking details shortly.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-center">
              <p className="text-xs text-white/35 mb-1">Tracking Number</p>
              <p className="font-mono font-black text-primary text-lg tracking-widest">{trackingNumber}</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <Link to="/dashboard" className="btn-primary px-8 py-3.5">Go to Dashboard <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/shop" className="btn-secondary px-8 py-3.5">Continue Shopping</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
