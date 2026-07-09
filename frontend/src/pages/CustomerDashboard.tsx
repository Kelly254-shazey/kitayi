import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ordersApi, paymentsApi, productsApi, subscriptionsApi, deliveriesApi } from '../services/api';
import {
  LogOut, ShoppingBag, CreditCard, Calendar, Truck,
  MapPin, Plus, Play, Pause, X, Map, FileText, ChevronLeft,
  ChevronRight, ArrowRight,   Home, Menu, Bell, Building2, Sparkles
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

type OrderItem = { product_name: string; quantity: number; total_price: number };
type Order = { id: string; tracking_number: string; status: string; payment_status: string; total_amount: number; delivery_date: string; delivery_slot: string; items: OrderItem[]; created_at: string };
type Subscription = { id: string; product_name: string; quantity: number; frequency: string; status: string; next_delivery_date: string; billing_cycle: string };
type Payment = { id: string; order_tracking?: string; amount: number; provider: string; transaction_reference: string; status: string; payment_date: string };
type Product = { id: string; name: string; category: string; price: number; image_url: string; volume_liters: number; stock_qty: number; safety_level: number; sku: string };
type Tab = 'overview' | 'orders' | 'subscriptions' | 'billing';

const TABS_CONFIG: { id: Tab; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'orders', label: 'Orders & Tracking', icon: Truck },
  { id: 'subscriptions', label: 'Subscriptions', icon: Calendar },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const CUSTOMER_CAPABILITIES: Record<string, { title: string; detail: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[]> = {
  Residential: [
    { title: 'Home Refills', detail: '20L refills and bottled water for family use.', icon: Home },
    { title: 'Saved Addresses', detail: 'Keep home delivery locations ready for checkout.', icon: MapPin },
    { title: 'Delivery Alerts', detail: 'Track orders and receive status updates.', icon: Bell },
  ],
  Commercial: [
    { title: 'Corporate Orders', detail: 'Large office orders with billing history.', icon: Building2 },
    { title: 'VAT Invoices', detail: 'Download invoices for finance reconciliation.', icon: FileText },
    { title: 'Recurring Supply', detail: 'Schedule weekly or monthly office deliveries.', icon: Calendar },
  ],
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  Delivered: 'badge-success', 'In Transit': 'badge-info', Pending: 'badge-warning',
  Assigned: 'badge-info', Dispatched: 'badge-info', Cancelled: 'badge-error', Failed: 'badge-error',
};

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
  const [savingSub, setSavingSub] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 2;

  const accountNumber = user?.account_number || 'Pending verification';
  const roleCapabilities = CUSTOMER_CAPABILITIES[user?.user_type || 'Residential'] || CUSTOMER_CAPABILITIES.Residential;

  useEffect(() => {
    productsApi.list().then(r => {
      const pList = Array.isArray(r.data) ? r.data : r.data?.results || [];
      setProducts(pList);
      if (pList.length > 0) setSubProduct(pList[0].id);
    }).catch(() => {});
    ordersApi.list().then(r => setOrders(Array.isArray(r.data) ? r.data : r.data?.results || [])).catch(() => {});
    paymentsApi.list().then(r => setPayments(Array.isArray(r.data) ? r.data : r.data?.results || [])).catch(() => {});
    subscriptionsApi.list().then(r => setSubs(Array.isArray(r.data) ? r.data : r.data?.results || [])).catch(() => {});
  }, []);

  const totalOrderPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage);

  useEffect(() => {
    if (!tracking || tracking.status !== 'In Transit') return;
    const iv = setInterval(() => {
      setGpsProgress(p => (p >= 100 ? 100 : p + 8));
    }, 2500);
    return () => { clearInterval(iv); setGpsProgress(0); };
  }, [tracking]);

  const startTracking = (order: Order) => { setGpsProgress(0); setTracking(order); };
  const toggleSub = async (id: string) => {
    const current = subs.find(s => s.id === id);
    if (!current) return;
    const nextStatus = current.status === 'Active' ? 'Paused' : 'Active';
    try {
      const res = await subscriptionsApi.update(id, { status: nextStatus });
      setSubs(prev => prev.map(s => s.id === id ? res.data : s));
    } catch { alert('Failed to update subscription.'); }
  };
  const handleCreateSub = async () => {
    if (!subProduct) return;
    const nextDeliveryDate = new Date(); nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 7);
    setSavingSub(true);
    try {
      const res = await subscriptionsApi.create({
        product: subProduct, quantity: subQty, frequency: subFreq,
        next_delivery_date: nextDeliveryDate.toISOString().slice(0, 10), billing_cycle: 'Prepaid',
      });
      setSubs(prev => [res.data, ...prev]);
      setNewSubOpen(false);
    } catch { alert('Failed to create subscription.'); } finally { setSavingSub(false); }
  };
  const confirmDelivery = async (orderId: string) => {
    try {
      await deliveriesApi.updateStatus(orderId, 'Delivered');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Delivered' } : o));
      setTracking(null);
    } catch { alert('Failed to confirm delivery.'); }
  };
  const payNow = async (order: Order) => {
    try {
      await paymentsApi.mpesaPush(order.id);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_status: 'Paid' } : o));
    } catch { alert('Payment failed.'); }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#0f172a', borderRight: '1px solid #1e293b' }}>
        <div className="flex-1">
          <div className="h-16 px-5 flex items-center gap-2.5 border-b" style={{ borderColor: '#1e293b' }}>
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'white' }}>
              <BrandLogo variant="mark" className="w-full h-full" />
            </div>
            <span className="font-display font-bold text-sm" style={{ color: 'white' }}>
              KITAYI <span style={{ color: '#06b6d4' }}>PORTAL</span>
            </span>
          </div>
          <nav className="p-3 flex flex-col gap-1 mt-2">
            {TABS_CONFIG.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: tab === id ? '#1e3a5f' : 'transparent',
                  color: tab === id ? '#60a5fa' : '#64748b',
                }}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: '#1e293b' }}>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: 'white' }}>{user?.full_name}</p>
            <p className="text-xs truncate" style={{ color: '#475569' }}>{user?.email}</p>
          </div>
          <button onClick={logout} title="Sign out" className="p-2 rounded-lg" style={{ color: '#64748b' }}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b px-6 flex items-center justify-between shrink-0" style={{ backgroundColor: 'white', borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg" aria-label="Toggle sidebar" style={{ color: '#64748b' }} onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-display font-bold text-sm md:text-base" style={{ color: '#0f172a' }}>
              {TABS_CONFIG.find(t => t.id === tab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge-info">{user?.user_type}</span>
            <Link to="/shop" className="btn-primary btn-sm hidden md:flex">
              <ShoppingBag className="w-3.5 h-3.5" /> Shop
            </Link>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <div className="flex flex-col gap-6">

            {/* OVERVIEW */}
            {tab === 'overview' && (
              <>
                <div className="card">
                  <div className="card-body">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-caption mb-1" style={{ color: '#2563eb' }}>
                          <Sparkles className="w-3.5 h-3.5" /> Welcome back
                        </div>
                        <h3 className="text-h3">{user?.full_name}</h3>
                        <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                          {user?.user_type} account &middot; <strong>{accountNumber}</strong>
                        </p>
                      </div>
                      <button onClick={() => navigate('/shop')} className="btn-primary btn-md shrink-0">
                        Order Water <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid-3">
                  {roleCapabilities.map(({ title, detail, icon: Icon }) => (
                    <div key={title} className="card">
                      <div className="card-body">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#eff6ff' }}>
                          <Icon className="w-5 h-5" style={{ color: '#2563eb' }} />
                        </div>
                        <h4 className="text-h3 mb-1">{title}</h4>
                        <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="kpi-grid">
                  {[
                    { label: 'Balance', value: 'Ksh 0.00', sub: 'No balance', icon: CreditCard },
                    { label: 'Active Orders', value: orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length.toString(), sub: 'In progress', icon: ShoppingBag },
                    { label: 'Subscriptions', value: subs.filter(s => s.status === 'Active').length.toString(), sub: 'Active plans', icon: Calendar },
                    { label: 'Total Deliveries', value: orders.filter(o => o.status === 'Delivered').length.toString(), sub: 'Completed', icon: Truck },
                  ].map(({ label, value, sub, icon: Icon }) => (
                    <div key={label} className="kpi-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="kpi-label">{label}</p>
                          <p className="kpi-value">{value}</p>
                          <p className="kpi-trend" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#eff6ff' }}>
                          <Icon className="w-5 h-5" style={{ color: '#2563eb' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-h3">Water Catalog</h3>
                    <Link to="/shop" className="btn-ghost btn-sm">View all <ChevronRight className="w-3.5 h-3.5" /></Link>
                  </div>
                  <div className="grid-4">
                    {products.slice(0, 4).map(p => (
                      <div key={p.id} className="card cursor-pointer" onClick={() => navigate('/shop')}>
                        <img src={p.image_url || 'https://images.unsplash.com/photo-1548839133-9aa08246bc61?w=400'}
                          alt={p.name} className="h-32 w-full object-cover rounded-t-xl" />
                        <div className="card-body">
                          <p className="badge-neutral mb-2">{p.category}</p>
                          <p className="font-semibold text-sm mb-1">{p.name}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold" style={{ color: '#2563eb' }}>Ksh {p.price.toLocaleString()}</span>
                            <button aria-label="Add to cart" className="btn-ghost btn-sm p-1"><Plus className="w-3.5 h-3.5" /></button>
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
                  <h3 className="text-h3">Order History</h3>
                  {paginatedOrders.map(o => (
                    <div key={o.id} className={`card ${tracking?.id === o.id ? 'ring-2 ring-[#2563eb]' : ''}`}>
                      <div className="card-body flex flex-col gap-4">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <p className="font-bold text-sm font-mono">{o.tracking_number}</p>
                            <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>{o.delivery_date} &middot; {o.delivery_slot}</p>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <span className={STATUS_BADGE_CLASSES[o.status] || 'badge-neutral'}>{o.status}</span>
                            <span className={o.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}>{o.payment_status}</span>
                          </div>
                        </div>
                        <div className="text-body-sm flex flex-col gap-1" style={{ color: 'var(--text-secondary)' }}>
                          {o.items.map((it, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{it.product_name} <strong>&times;{it.quantity}</strong></span>
                              <span>Ksh {it.total_price ? it.total_price.toLocaleString() : '0'}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                          <span className="font-bold text-lg">Ksh {o.total_amount.toLocaleString()}</span>
                          <div className="flex gap-2 flex-wrap">
                            {o.status === 'In Transit' && (
                              <>
                                <button onClick={() => startTracking(o)} className="btn-secondary btn-sm">
                                  <Map className="w-3.5 h-3.5" /> Track
                                </button>
                                <button onClick={() => confirmDelivery(o.id)}
                                  className="btn-sm" style={{ backgroundColor: '#10b981', color: 'white', borderRadius: '0.5rem' }}>
                                  &check; Confirm Arrived
                                </button>
                              </>
                            )}
                            {o.payment_status === 'Pending' && (
                              <button onClick={() => payNow(o)}
                                className="btn-sm" style={{ backgroundColor: '#10b981', color: 'white', borderRadius: '0.5rem' }}>
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {totalOrderPages > 1 && (
                    <div className="flex items-center justify-center gap-4 py-4">
                      <button onClick={() => setOrderPage(p => Math.max(1, p - 1))} disabled={orderPage === 1} aria-label="Previous page"
                        className="btn-secondary btn-sm" style={{ borderRadius: '0.5rem' }}>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-caption" style={{ color: 'var(--text-muted)' }}>
                        Page {orderPage} / {totalOrderPages}
                      </span>
                      <button onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))} disabled={orderPage === totalOrderPages} aria-label="Next page"
                        className="btn-secondary btn-sm" style={{ borderRadius: '0.5rem' }}>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* GPS Panel */}
                <div className="card">
                  <div className="card-body flex flex-col gap-5 sticky top-6">
                    <h3 className="text-h3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: '#2563eb' }} /> Live GPS
                    </h3>
                    {tracking ? (
                      <>
                        <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                          Tracking: <span className="font-mono font-semibold">{tracking.tracking_number}</span>
                        </p>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-caption" style={{ color: 'var(--text-muted)' }}>
                            <span>Warehouse</span><span>Your Location</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e2e8f0' }}>
                            <div className="h-full rounded-full transition-all duration-1000" style={{
                              width: `${Math.min(100, gpsProgress)}%`,
                              background: 'linear-gradient(to right, #2563eb, #06b6d4)'
                            }} />
                          </div>
                          <p className="text-sm font-semibold" style={{ color: '#2563eb' }}>
                            {gpsProgress >= 100 ? 'Arrived!' : `${gpsProgress}% — ETA ~${Math.ceil((100 - gpsProgress) / 8 * 2.5 / 60)} min`}
                          </p>
                        </div>
                        <div className="h-44 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f1f5f9' }}>
                          <p className="text-caption" style={{ color: 'var(--text-muted)' }}>Map placeholder</p>
                        </div>
                        <div className="card">
                          <div className="card-body text-body-sm flex flex-col gap-2">
                            <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Driver</span><strong>John Kamau</strong></div>
                            <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Vehicle</span><strong>KCD 456Y</strong></div>
                            <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>OTP</span><strong style={{ color: '#2563eb' }}>482015</strong></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-12 text-center flex flex-col items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                        <Truck className="w-10 h-10" />
                        <p className="text-body-sm">Select an 'In Transit' order to track it live.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUBSCRIPTIONS */}
            {tab === 'subscriptions' && (
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-h3">Recurring Delivery Plans</h3>
                  <button onClick={() => setNewSubOpen(true)} className="btn-primary btn-sm">
                    <Plus className="w-3.5 h-3.5" /> New Subscription
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {subs.map(s => (
                    <div key={s.id} className="card">
                      <div className="card-body flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{s.product_name}</h4>
                            <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Qty: {s.quantity} units &middot; {s.billing_cycle}</p>
                          </div>
                          <span className={s.status === 'Active' ? 'badge-success' : 'badge-neutral'}>{s.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-body-sm pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                          <div><span style={{ color: 'var(--text-secondary)' }}>Frequency</span><br /><strong>{s.frequency}</strong></div>
                          <div><span style={{ color: 'var(--text-secondary)' }}>Next Delivery</span><br /><strong>{s.next_delivery_date}</strong></div>
                        </div>
                        <button onClick={() => toggleSub(s.id)}
                          className={s.status === 'Active' ? 'btn-secondary btn-sm w-fit' : 'btn-primary btn-sm w-fit'}>
                          {s.status === 'Active' ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Resume</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BILLING */}
            {tab === 'billing' && (
              <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <h3 className="text-h3">Transaction History</h3>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Reference</th>
                          <th>Order</th>
                          <th>Provider</th>
                          <th className="text-right">Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(p => (
                          <tr key={p.id}>
                            <td className="font-mono text-xs">{p.transaction_reference}</td>
                            <td>{p.order_tracking ?? '—'}</td>
                            <td>{p.provider}</td>
                            <td className="text-right font-bold">Ksh {p.amount.toLocaleString()}</td>
                            <td><span className={p.status === 'Successful' ? 'badge-success' : 'badge-warning'}>{p.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body flex flex-col gap-5">
                    <h3 className="text-h3 flex items-center gap-2">
                      <FileText className="w-4 h-4" style={{ color: '#2563eb' }} /> Account
                    </h3>
                    <div className="flex flex-col gap-2 text-body-sm">
                      {[
                        ['Account No.', accountNumber],
                        ['Name', user?.full_name ?? '—'],
                        ['Billing', user?.user_type === 'Residential' ? 'Prepaid' : 'Credit eligible'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                          <strong>{v}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg p-5 flex flex-col gap-1" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <p className="text-caption" style={{ color: '#065f46' }}>Current Balance Due</p>
                      <p className="text-2xl font-bold" style={{ color: '#059669' }}>Ksh 0.00</p>
                      <p className="text-caption" style={{ color: '#065f46' }}>All invoices paid.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* New Subscription Modal */}
      {newSubOpen && (
        <div className="modal-backdrop" onClick={() => setNewSubOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="card-body flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="text-h3">New Subscription</h3>
                <button onClick={() => setNewSubOpen(false)} aria-label="Close" className="btn-ghost btn-sm"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="label" htmlFor="subProduct">Product</label>
                  <select id="subProduct" value={subProduct} onChange={e => setSubProduct(e.target.value)} className="select">
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} — Ksh {p.price}/unit</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="subQty">Quantity</label>
                    <input id="subQty" type="number" value={subQty} min={1} onChange={e => setSubQty(+e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label" htmlFor="subFreq">Frequency</label>
                    <select id="subFreq" value={subFreq} onChange={e => setSubFreq(e.target.value)} className="select">
                      {['Weekly', 'Bi-Weekly', 'Monthly'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={handleCreateSub} disabled={savingSub || !subProduct} className="btn-primary btn-lg w-full">
                  {savingSub ? 'Creating...' : 'Confirm Subscription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
