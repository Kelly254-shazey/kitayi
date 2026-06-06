import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { ordersApi, paymentsApi, productsApi, subscriptionsApi } from '../services/api';
import {
  Droplets, LogOut, ShoppingBag, CreditCard, Calendar, Truck,
  MapPin, Plus, Play, Pause, X, Map, FileText, Sparkles,
  ChevronRight, ArrowRight, Home, Menu
} from 'lucide-react';

type OrderItem = { product_name: string; quantity: number; total_price: number };
type Order = { id: string; tracking_number: string; status: string; payment_status: string; total_amount: number; delivery_date: string; delivery_slot: string; items: OrderItem[]; created_at: string };
type Subscription = { id: string; product_name: string; quantity: number; frequency: string; status: string; next_delivery_date: string; billing_cycle: string };
type Payment = { id: string; order_tracking?: string; amount: number; provider: string; transaction_reference: string; status: string; payment_date: string };
type Product = { id: string; name: string; category: string; price: number; image_url: string; volume_liters: number; stock_qty: number; safety_level: number; sku: string };
type Tab = 'overview' | 'orders' | 'subscriptions' | 'billing';

const TABS_CONFIG: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'orders', label: 'Orders & Tracking', icon: Truck },
  { id: 'subscriptions', label: 'Subscriptions', icon: Calendar },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const STATUS_BADGE_CLASSES: Record<string, string> = {
  Delivered: 'badge-success', 'In Transit': 'badge-info', Pending: 'badge-warning',
  Assigned: 'badge-info', Dispatched: 'badge-info', Cancelled: 'badge-danger', Failed: 'badge-danger',
};

const gpsProgressWidthClasses: Record<number, string> = {
  0: 'w-[0%]', 10: 'w-[10%]', 20: 'w-[20%]', 30: 'w-[30%]', 40: 'w-[40%]',
  50: 'w-[50%]', 60: 'w-[60%]', 70: 'w-[70%]', 80: 'w-[80%]', 90: 'w-[90%]', 100: 'w-[100%]',
};
const gpsPinPositionClasses: Record<number, string> = {
  0: 'top-[10%] left-[10%]', 10: 'top-[17%] left-[17%]', 20: 'top-[23%] left-[23%]', 30: 'top-[29%] left-[29%]',
  40: 'top-[35%] left-[35%]', 50: 'top-[42%] left-[42%]', 60: 'top-[48%] left-[48%]', 70: 'top-[54%] left-[54%]',
  80: 'top-[60%] left-[60%]', 90: 'top-[66%] left-[66%]', 100: 'top-[72%] left-[72%]',
};
const getProgressWidthClass = (progress: number) => gpsProgressWidthClasses[Math.min(100, Math.round(progress / 10) * 10)] ?? 'w-[0%]';
const getGpsPinPositionClass = (progress: number) => gpsPinPositionClasses[Math.min(100, Math.round(progress / 10) * 10)] ?? 'top-[10%] left-[10%]';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tracking, setTracking] = useState<Order | null>(null);
  const [gpsProgress, setGpsProgress] = useState(0);
  const [newSubOpen, setNewSubOpen] = useState(false);
  const [subProduct, setSubProduct] = useState('');
  const [subQty, setSubQty] = useState(2);
  const [subFreq, setSubFreq] = useState('Weekly');

  useEffect(() => {
    productsApi.list().then(r => setProducts(Array.isArray(r.data) ? r.data : r.data?.results || []));
    ordersApi.list().then(r => setOrders(Array.isArray(r.data) ? r.data : r.data?.results || []));
    paymentsApi.list().then(r => setPayments(Array.isArray(r.data) ? r.data : r.data?.results || []));
    subscriptionsApi.list().then(r => setSubs(Array.isArray(r.data) ? r.data : r.data?.results || []));
  }, []);

  useEffect(() => {
    if (products.length > 0 && !subProduct) {
      setSubProduct(products[0].id);
    }
  }, [products, subProduct]);

  // GPS tracker — only runs interval when In Transit; resets via cleanup
  useEffect(() => {
    if (!tracking || tracking.status !== 'In Transit') return;
    const iv = setInterval(() => {
      setGpsProgress(p => (p >= 100 ? 100 : p + 8));
    }, 2500);
    return () => {
      clearInterval(iv);
      setGpsProgress(0);
    };
  }, [tracking]);

  const startTracking = (order: Order) => {
    setGpsProgress(0);
    setTracking(order);
  };

  const toggleSub = (id: string) =>
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s));

  const handleCreateSub = () => {
    const prod = products.find(p => p.id === subProduct);
    setSubs(prev => [{
      id: `s${Date.now()}`, product_name: prod?.name ?? 'Water',
      quantity: subQty, frequency: subFreq, status: 'Active',
      next_delivery_date: '2026-06-12', billing_cycle: 'Prepaid',
    }, ...prev]);
    setNewSubOpen(false);
  };

  const payNow = async (order: Order) => {
    try {
      await paymentsApi.mpesaPush(order.id);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_status: 'Paid' } : o));
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="page-shell min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col justify-between border-r border-slate-200 transition-transform duration-300 md:translate-x-0 md:static md:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} brand-surface`}>
        <div>
          <div className="h-16 px-5 flex items-center gap-2.5 border-b border-white/8">
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-white text-sm tracking-tight">KITAYI<span className="text-primary">SOLUTIONS</span></span>
          </div>
          <nav className="p-3 flex flex-col gap-1 mt-2">
            {TABS_CONFIG.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === id ? 'bg-primary/20 text-white border border-primary/30' : 'text-white/50 hover:text-white hover:bg-white/6'}`}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-white/8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">{user?.full_name}</p>
            <p className="text-[10px] text-white/35 truncate max-w-[140px]">{user?.email}</p>
          </div>
          <button aria-label="Logout" title="Logout" onClick={logout} className="p-2 rounded-lg text-white/35 hover:text-danger hover:bg-danger/10 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-white/8 px-6 flex items-center justify-between shrink-0 panel-bg-soft">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" title="Open navigation" className="md:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-display font-bold text-white capitalize text-sm md:text-base">
              {TABS_CONFIG.find(t => t.id === tab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-primary/15 text-primary border border-primary/25 px-3 py-1 rounded-full font-bold">{user?.user_type}</span>
            <Link to="/shop" className="btn-primary text-xs px-4 py-2 hidden md:flex">
              <ShoppingBag className="w-3.5 h-3.5" /> Shop
            </Link>
          </div>
        </header>

        <div className="p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <>
              <div className="glass-card p-6 bg-gradient-to-r from-primary/20 to-cyan-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5" /> Welcome back
                  </div>
                  <h3 className="font-display font-black text-2xl text-white">{user?.full_name}</h3>
                    <p className="font-semibold text-white/60 text-sm">Use code <strong className="text-primary">WELCOME10</strong> for 10% off your next order.</p>
                </div>
                <button onClick={() => navigate('/shop')} className="btn-primary px-6 py-3 shrink-0">
                  Order Water <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[  
                  { label: 'Account Balance', value: 'Ksh 0.00', sub: 'No outstanding balance' },
                  { label: 'Active Orders', value: orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length, sub: 'In progress' },
                  { label: 'Subscriptions', value: subs.filter(s => s.status === 'Active').length, sub: 'Active plans' },
                  { label: 'Total Deliveries', value: orders.filter(o => o.status === 'Delivered').length, sub: 'Completed' },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="glass-card p-5 flex flex-col gap-1">
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-display font-black text-white">{value}</p>
                    <p className="text-[10px] font-semibold text-white/60">{sub}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-white">Water Catalog</h3>
                  <Link to="/shop" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ChevronRight className="w-3.5 h-3.5" /></Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.slice(0, 4).map(p => (
                    <div key={p.id} className="glass-card overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300 cursor-pointer" onClick={() => navigate('/shop')}>
                      <img src={p.image_url} alt={p.name} className="h-32 w-full object-cover"
                        onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1548839133-9aa08246bc61?w=400')} />
                      <div className="p-4 flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{p.category}</p>
                        <p className="text-xs font-bold text-white leading-tight">{p.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-display font-black text-sm text-white">Ksh {p.price.toLocaleString()}</span>
                          <button aria-label="View product in shop" title="View product in shop" onClick={e => { e.stopPropagation(); navigate('/shop'); }}
                            className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="font-display font-bold text-white">Order History</h3>
                {orders.map(o => (
                  <div key={o.id} className={`glass-card p-5 flex flex-col gap-4 transition-all ${tracking?.id === o.id ? 'border-primary/40' : ''}`}>
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <p className="font-bold text-sm text-white font-mono">{o.tracking_number}</p>
                          <p className="text-[10px] font-semibold text-white/60">{o.delivery_date} · {o.delivery_slot}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className={STATUS_BADGE_CLASSES[o.status] ?? 'badge-gray'}>{o.status}</span>
                        <span className={o.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}>{o.payment_status}</span>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-white/70 flex flex-col gap-1 border-t border-white/6 pt-3">
                      {o.items.map((it, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{it.product_name} <strong className="text-white">×{it.quantity}</strong></span>
                          <span>Ksh {it.total_price ? it.total_price.toLocaleString() : '0'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center border-t border-white/6 pt-3">
                      <span className="font-display font-black text-sm text-white">Ksh {o.total_amount.toLocaleString()}</span>
                      <div className="flex gap-2">
                        {o.status === 'In Transit' && (
                          <button onClick={() => startTracking(o)} className="btn-primary text-xs px-3 py-1.5">
                            <Map className="w-3.5 h-3.5" /> Track
                          </button>
                        )}
                        {o.payment_status === 'Pending' && (
                          <button onClick={() => payNow(o)} className="btn-success text-xs px-3 py-1.5">Pay Now</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* GPS Panel */}
              <div className="glass-card p-6 flex flex-col gap-5 sticky top-6">
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Live GPS Tracker
                </h3>
                {tracking ? (
                  <>
                    <p className="text-xs text-white/40">Tracking: <span className="font-mono text-primary">{tracking.tracking_number}</span></p>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs text-white/35">
                        <span>Warehouse</span><span>Your Location</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-1000 rounded-full ${getProgressWidthClass(gpsProgress)}`} />
                      </div>
                      <p className="text-xs text-primary font-semibold">
                        {gpsProgress >= 100 ? 'Arrived!' : `${gpsProgress}% — ETA ~${Math.ceil((100 - gpsProgress) / 8 * 2.5 / 60)} min`}
                      </p>
                    </div>
                    <div className="h-44 rounded-xl bg-white/5 border border-white/8 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 grid-track-bg" />
                      <p className="absolute top-3 left-3 text-[9px] text-white/30 font-bold uppercase">Nairobi Grid</p>
                      <div className={`absolute w-4 h-4 bg-primary rounded-full shadow-glow-sm transition-all duration-1000 flex items-center justify-center ${getGpsPinPositionClass(gpsProgress)}`}>
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      </div>
                      <div className="absolute bottom-3 right-3 w-3 h-3 bg-success rounded-full" />
                    </div>
                    <div className="glass-card p-4 text-xs flex flex-col gap-2">
                      <div className="flex justify-between text-white/40"><span>Driver</span><strong className="text-white">John Kamau</strong></div>
                      <div className="flex justify-between text-white/40"><span>Vehicle</span><strong className="text-white">KCD 456Y</strong></div>
                      <div className="flex justify-between text-white/40"><span>OTP Code</span><strong className="text-primary text-base">482015</strong></div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center flex flex-col items-center gap-3 text-white/25">
                    <Truck className="w-10 h-10" />
                    <p className="text-sm">Select an 'In Transit' order to track it live.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBSCRIPTIONS */}
          {tab === 'subscriptions' && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-white">Recurring Delivery Plans</h3>
                <button onClick={() => setNewSubOpen(true)} className="btn-primary text-xs px-4 py-2">
                  <Plus className="w-3.5 h-3.5" /> New Subscription
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {subs.map(s => (
                  <div key={s.id} className="glass-card p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white">{s.product_name}</h4>
                        <p className="text-xs text-white/40 mt-0.5">Qty: {s.quantity} units · {s.billing_cycle}</p>
                      </div>
                      <span className={s.status === 'Active' ? 'badge-success' : 'badge-gray'}>{s.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-white/6 pt-4 text-xs">
                      {[['Frequency', s.frequency], ['Next Delivery', s.next_delivery_date]].map(([k, v]) => (
                        <div key={k}><p className="text-white/35 mb-0.5">{k}</p><p className="font-bold text-white">{v}</p></div>
                      ))}
                    </div>
                    <button onClick={() => toggleSub(s.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all w-fit ${s.status === 'Active' ? 'border-white/15 text-white/60 hover:bg-white/8' : 'btn-primary border-transparent'}`}>
                      {s.status === 'Active' ? <><Pause className="w-3.5 h-3.5" /> Pause Plan</> : <><Play className="w-3.5 h-3.5" /> Resume Plan</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BILLING */}
          {tab === 'billing' && (
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="font-display font-bold text-white">Transaction History</h3>
                <div className="glass-card overflow-hidden">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/8 text-xs text-white/35 uppercase tracking-wider">
                        {['Reference', 'Order', 'Provider', 'Amount', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {payments.map(p => (
                        <tr key={p.id} className="hover:bg-white/4 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xs text-white/70">{p.transaction_reference}</td>
                          <td className="px-5 py-3.5 text-white/55">{p.order_tracking ?? '—'}</td>
                          <td className="px-5 py-3.5 text-white/70">{p.provider}</td>
                          <td className="px-5 py-3.5 font-bold text-white">Ksh {p.amount.toLocaleString()}</td>
                          <td className="px-5 py-3.5"><span className={p.status === 'Successful' ? 'badge-success' : 'badge-warning'}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="glass-card p-6 flex flex-col gap-5">
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Utility Account
                </h3>
                <div className="flex flex-col gap-2 text-xs">
                  {[['Account No.', 'KS-8492-3015'], ['Name', user?.full_name ?? '—'], ['Billing', 'Prepaid']].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-white/40">
                      <span>{k}</span><strong className="text-white">{v}</strong>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 border border-white/8 rounded-xl p-5 flex flex-col gap-1">
                  <p className="text-xs text-white/35">Current Balance Due</p>
                  <p className="text-3xl font-display font-black text-success">Ksh 0.00</p>
                  <p className="text-[10px] text-white/25">All invoices paid. No balance outstanding.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Subscription Modal */}
      {newSubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-light p-8 w-full max-w-md flex flex-col gap-5 animate-slide-up">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-xl text-white">New Subscription</h3>
              <button aria-label="Close new subscription modal" title="Close new subscription modal" onClick={() => setNewSubOpen(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="new-sub-product" className="text-xs font-semibold text-white/45 uppercase tracking-wider">Product</label>
                <select id="new-sub-product" value={subProduct} onChange={e => setSubProduct(e.target.value)} className="glass-input">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} — Ksh {p.price}/unit</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-sub-qty" className="text-xs font-semibold text-white/45 uppercase tracking-wider">Quantity</label>
                  <input id="new-sub-qty" type="number" value={subQty} min={1} onChange={e => setSubQty(+e.target.value)} className="glass-input" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="new-sub-frequency" className="text-xs font-semibold text-white/45 uppercase tracking-wider">Frequency</label>
                  <select id="new-sub-frequency" value={subFreq} onChange={e => setSubFreq(e.target.value)} className="glass-input">
                    {['Weekly', 'Bi-Weekly', 'Monthly'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleCreateSub} className="btn-primary py-4">Confirm Subscription</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
