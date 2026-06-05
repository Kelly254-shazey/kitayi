import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { 
  MOCK_PRODUCTS, MOCK_ORDERS, MOCK_SUBSCRIPTIONS, MOCK_PAYMENTS
} from '../services/api';
import { 
  Droplets, LogOut, ShoppingBag, CreditCard, Calendar, Truck, 
  MapPin, Plus, Play, Pause, X, Map,
  FileText, Sparkles
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'subscriptions' | 'billing'>('overview');
  
  // Dashboard state
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS);
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [cart, setCart] = useState<{product: any, qty: number}[]>([]);
  const [addresses] = useState([
    { id: 'addr-1', street: '123 Kilimani Road, Apt 4B', city: 'Nairobi', type: 'Home', is_default: true },
    { id: 'addr-2', street: 'NSSF Building, Floor 14', city: 'Nairobi', type: 'Office', is_default: false },
  ]);

  // Modals & form state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [newSubModalOpen, setNewSubModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('addr-1');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Morning');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discountVal, setDiscountVal] = useState(0);

  // Subscription form state
  const [subProduct, setSubProduct] = useState(MOCK_PRODUCTS[2].id);
  const [subQty, setSubQty] = useState(2);
  const [subFreq, setSubFreq] = useState('Weekly');

  // Selected Order for GPS Tracking
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [gpsProgress, setGpsProgress] = useState(0);

  // Auto-simulate GPS tracking progress for In Transit orders
  useEffect(() => {
    let interval: any;
    if (trackingOrder && trackingOrder.status === 'In Transit') {
      interval = setInterval(() => {
        setGpsProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 3000);
    } else {
      setGpsProgress(0);
    }
    return () => clearInterval(interval);
  }, [trackingOrder]);

  const handleAddToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Coupon code logic
  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME10') {
      setDiscountVal(0.1);
      setCouponMessage('10% discount applied successfully!');
    } else if (couponCode.toUpperCase() === 'KSH500') {
      setDiscountVal(500);
      setCouponMessage('Ksh 500 flat discount applied successfully!');
    } else {
      setDiscountVal(0);
      setCouponMessage('Invalid coupon code.');
    }
  };

  const getCartTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);
    let discount = 0;
    if (discountVal > 0 && discountVal < 1) {
      discount = subtotal * discountVal;
    } else if (discountVal >= 1) {
      discount = Math.min(discountVal, subtotal);
    }
    const taxable = subtotal - discount;
    const tax = taxable * 0.16; // VAT 16%
    const total = taxable + tax;
    return { subtotal, discount, tax, total };
  };

  const handleCheckout = (paymentMethod: 'mpesa' | 'stripe') => {
    const totals = getCartTotals();
    const trackingNum = `KY-20260605-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      tracking_number: trackingNum,
      customer_email: user?.email || 'user@kitayi.com',
      status: 'Pending',
      total_amount: totals.total,
      tax_amount: totals.tax,
      discount_amount: totals.discount,
      delivery_date: deliveryDate || '2026-06-06',
      delivery_slot: deliverySlot,
      payment_status: paymentMethod === 'mpesa' ? 'Paid' : 'Pending',
      items: cart.map(item => ({
        id: `item-${Date.now()}`,
        product_name: item.product.name,
        quantity: item.qty,
        unit_price: item.product.price,
        total_price: item.product.price * item.qty
      })),
      created_at: new Date().toISOString(),
    };

    setOrders([newOrder, ...orders]);
    
    // Log Payment
    if (paymentMethod === 'mpesa') {
      const newPayment = {
        id: `pay-${Date.now()}`,
        order_tracking: trackingNum,
        amount: totals.total,
        provider: 'M-Pesa',
        transaction_reference: `MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'Successful',
        payment_date: new Date().toISOString(),
      };
      setPayments([newPayment, ...payments]);
    }

    setCart([]);
    setOrderModalOpen(false);
    setActiveTab('orders');
    alert(paymentMethod === 'mpesa' 
      ? 'M-Pesa payment triggered! Check your phone for STK Push prompt.' 
      : 'Redirecting to secure Stripe Card gateway...'
    );
  };

  const handleCreateSubscription = () => {
    const prod = MOCK_PRODUCTS.find(p => p.id === subProduct);
    const newSub = {
      id: `sub-${Date.now()}`,
      product_name: prod ? prod.name : 'Purified Refill',
      quantity: subQty,
      frequency: subFreq,
      status: 'Active',
      next_delivery_date: '2026-06-12',
      billing_cycle: 'Prepaid',
      last_billed_date: '2026-06-05',
    };

    setSubscriptions([newSub, ...subscriptions]);
    setNewSubModalOpen(false);
    setActiveTab('subscriptions');
  };

  const toggleSubscription = (subId: string) => {
    setSubscriptions(prev => prev.map(sub => {
      if (sub.id === subId) {
        const nextStatus = sub.status === 'Active' ? 'Paused' : 'Active';
        return { ...sub, status: nextStatus };
      }
      return sub;
    }));
  };

  const handleSimulatePayment = (order: any) => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, payment_status: 'Paid' } : o));
    const newPayment = {
      id: `pay-${Date.now()}`,
      order_tracking: order.tracking_number,
      amount: order.total_amount,
      provider: 'M-Pesa',
      transaction_reference: `MPESA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'Successful',
      payment_date: new Date().toISOString(),
    };
    setPayments([newPayment, ...payments]);
  };

  const { subtotal, discount, tax, total } = getCartTotals();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="flex flex-col">
          <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-2 text-white">
            <Droplets className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-sm tracking-wider">KITAYI SOLUTIONS</span>
          </div>

          <nav className="p-4 flex flex-col gap-1">
            <button 
              onClick={() => { setActiveTab('overview'); setTrackingOrder(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <ShoppingBag className="w-5 h-5" /> Overview
            </button>
            <button 
              onClick={() => { setActiveTab('orders'); setTrackingOrder(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Truck className="w-5 h-5" /> Orders & GPS Tracking
            </button>
            <button 
              onClick={() => { setActiveTab('subscriptions'); setTrackingOrder(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'subscriptions' ? 'bg-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Calendar className="w-5 h-5" /> Subscriptions
            </button>
            <button 
              onClick={() => { setActiveTab('billing'); setTrackingOrder(null); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'billing' ? 'bg-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <CreditCard className="w-5 h-5" /> Billing & Payments
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-200">{user?.full_name}</span>
            <span className="text-slate-500 text-[10px] truncate max-w-[120px]">{user?.email}</span>
          </div>
          <button onClick={logout} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 md:hidden">
            <Droplets className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-slate-800 text-sm">KITAYI</span>
          </div>

          <h2 className="font-display font-bold text-slate-800 hidden md:block capitalize">{activeTab} Panel</h2>
          
          <div className="flex items-center gap-4">
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold border border-border">
              {user?.user_type}
            </span>
            <button onClick={logout} className="md:hidden text-slate-500 hover:text-slate-800">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Promo Banner */}
              <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Promotional Discount</span>
                  </div>
                  <h3 className="font-display font-extrabold text-xl md:text-2xl">Use Coupon WELCOME10 for 10% Off</h3>
                  <p className="text-sm text-blue-100">Apply coupon WELCOME10 during checkout to reduce your utility invoice billings.</p>
                </div>
                <button 
                  onClick={() => setOrderModalOpen(true)}
                  className="bg-white hover:bg-slate-50 text-primary px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                  Order Now
                </button>
              </div>

              {/* KPI metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Account Balance</span>
                  <span className="text-2xl font-display font-extrabold text-secondary">Ksh 0.00</span>
                  <span className="text-[10px] text-slate-400">Monthly utility balance invoices</span>
                </div>
                <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Active Orders</span>
                  <span className="text-2xl font-display font-extrabold text-secondary">
                    {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length}
                  </span>
                  <span className="text-[10px] text-slate-400">Currently being dispatched or shipped</span>
                </div>
                <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Active Subscriptions</span>
                  <span className="text-2xl font-display font-extrabold text-secondary">
                    {subscriptions.filter(s => s.status === 'Active').length}
                  </span>
                  <span className="text-[10px] text-slate-400">Recurring delivery schedules</span>
                </div>
                <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Deliveries</span>
                  <span className="text-2xl font-display font-extrabold text-secondary">
                    {orders.filter(o => o.status === 'Delivered').length}
                  </span>
                  <span className="text-[10px] text-slate-400">Purified water shipments completed</span>
                </div>
              </div>

              {/* Product list */}
              <div className="flex flex-col gap-4">
                <h3 className="font-display font-extrabold text-lg">Purified Water Catalog</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {MOCK_PRODUCTS.map((prod) => (
                    <div key={prod.id} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                      <img src={prod.image_url} alt={prod.name} className="h-40 w-full object-cover" />
                      <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{prod.category}</span>
                          <h4 className="font-bold text-sm text-slate-800 leading-tight">{prod.name}</h4>
                          <span className="text-xs text-slate-500">Volume: {prod.volume_liters}L</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-display font-extrabold text-slate-800">Ksh {prod.price.toFixed(2)}</span>
                          <button 
                            onClick={() => { handleAddToCart(prod); setOrderModalOpen(true); }}
                            className="bg-primary hover:bg-primary-hover text-white p-2 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ORDERS & GPS TRACKING */}
          {activeTab === 'orders' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Order list */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="font-display font-extrabold text-lg">Purchase Order History</h3>
                <div className="flex flex-col gap-3">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className={`bg-white border p-5 rounded-2xl shadow-sm flex flex-col gap-4 transition-all hover:border-slate-300 ${trackingOrder?.id === order.id ? 'ring-2 ring-primary/30 border-primary' : ''}`}
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-800">{order.tracking_number}</span>
                          <span className="text-[10px] text-slate-500">Date: {order.delivery_date} ({order.delivery_slot})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            order.status === 'Delivered' ? 'bg-success-light text-success border-success/20' :
                            order.status === 'In Transit' ? 'bg-primary-light text-primary border-primary/20' :
                            order.status === 'Pending' ? 'bg-warning-light text-warning border-warning/20' :
                            'bg-slate-100 text-slate-600 border-border'
                          }`}>
                            {order.status}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            order.payment_status === 'Paid' ? 'bg-success-light text-success border-success/20' :
                            'bg-warning-light text-warning border-warning/20'
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-col gap-1 border-t border-slate-50 pt-3">
                        {order.items.map((item: any, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.product_name} <strong className="text-slate-800">x{item.quantity}</strong></span>
                            <span>Ksh {item.total_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                        <span className="text-sm font-display font-extrabold text-slate-800">Total: Ksh {order.total_amount.toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                          {order.status === 'In Transit' && (
                            <button 
                              onClick={() => { setTrackingOrder(order); setGpsProgress(0); }}
                              className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <Map className="w-3.5 h-3.5" /> Track GPS
                            </button>
                          )}
                          {order.payment_status === 'Pending' && (
                            <button 
                              onClick={() => handleSimulatePayment(order)}
                              className="bg-success hover:bg-success/90 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GPS Tracker Side panel */}
              <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 flex flex-col gap-6">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Live GPS Dispatcher
                </h3>

                {trackingOrder ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-slate-400">Tracking Number</span>
                      <span className="font-bold font-mono text-sm text-primary">{trackingOrder.tracking_number}</span>
                    </div>

                    {/* Delivery Progress Bar */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Warehouse Dispatch</span>
                        <span>Destination</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000 ease-out" 
                          style={{ width: `${gpsProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-primary font-bold text-right">
                        {gpsProgress === 100 ? 'Arrived at destination' : `Truck is ${gpsProgress}% close (ETA: ${15 - Math.round(gpsProgress * 0.15)} mins)`}
                      </span>
                    </div>

                    {/* Simulation Map graphic */}
                    <div className="h-48 bg-slate-800 rounded-xl relative border border-slate-700/50 overflow-hidden flex items-center justify-center">
                      {/* Grid background simulation */}
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                      
                      <div className="absolute top-10 left-10 text-xs text-slate-500">Kitayi Warehouse</div>
                      <div className="absolute bottom-10 right-10 text-xs text-slate-500">Your Location</div>

                      {/* Moving driver dot */}
                      <div 
                        className="absolute w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-lg transition-all duration-1000"
                        style={{
                          top: `${10 + (gpsProgress * 0.7)}%`,
                          left: `${10 + (gpsProgress * 0.7)}%`,
                        }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-xs flex flex-col gap-2">
                      <div className="flex justify-between text-slate-400">
                        <span>Driver Name:</span>
                        <strong className="text-white">John Kamau</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Vehicle:</span>
                        <strong className="text-white">KCD 456Y (Tanker)</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Verification OTP:</span>
                        <strong className="text-primary font-bold text-sm">482015</strong>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Provide this 6-digit OTP code to the driver upon delivery to verify and capture your invoice signature.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-sm flex flex-col items-center gap-3">
                    <Truck className="w-12 h-12 text-slate-700" />
                    <p>No active transit orders selected for GPS monitoring. Select an order currently marked as 'In Transit' to follow dispatch tracking.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-extrabold text-lg">My Recurring Delivery Agreements</h3>
                <button 
                  onClick={() => setNewSubModalOpen(true)}
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Subscription
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-slate-800 text-base">{sub.product_name}</h4>
                        <span className="text-xs text-slate-500">Quantity: <strong className="text-slate-700">{sub.quantity} units</strong></span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                        sub.status === 'Active' ? 'bg-success-light text-success border-success/20' : 'bg-slate-100 text-slate-600 border-border'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 grid grid-cols-2 gap-3 border-t border-slate-50 pt-4">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Frequency</span>
                        <strong className="text-slate-800 text-sm">{sub.frequency}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Next Delivery</span>
                        <strong className="text-slate-800 text-sm">{sub.next_delivery_date}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Billing Setup</span>
                        <strong className="text-slate-800 text-sm">{sub.billing_cycle}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Last Billed</span>
                        <strong className="text-slate-800 text-sm">{sub.last_billed_date || 'N/A'}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-50 pt-4 mt-1">
                      <button 
                        onClick={() => toggleSubscription(sub.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          sub.status === 'Active' 
                            ? 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100' 
                            : 'bg-primary text-white border-primary hover:bg-primary-hover'
                        }`}
                      >
                        {sub.status === 'Active' ? (
                          <><Pause className="w-3.5 h-3.5" /> Pause Plan</>
                        ) : (
                          <><Play className="w-3.5 h-3.5" /> Resume Plan</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BILLING & PAYMENTS */}
          {activeTab === 'billing' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Payment history */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="font-display font-extrabold text-lg">Billing Transaction Log</h3>
                <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold text-xs uppercase tracking-wider">
                        <th className="px-6 py-3.5">Reference</th>
                        <th className="px-6 py-3.5">Order</th>
                        <th className="px-6 py-3.5">Provider</th>
                        <th className="px-6 py-3.5">Amount</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-slate-700">
                      {payments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3.5 font-mono text-xs">{pay.transaction_reference}</td>
                          <td className="px-6 py-3.5">{pay.order_tracking}</td>
                          <td className="px-6 py-3.5">{pay.provider}</td>
                          <td className="px-6 py-3.5 font-bold">Ksh {pay.amount.toFixed(2)}</td>
                          <td className="px-6 py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              pay.status === 'Successful' ? 'bg-success-light text-success border-success/20' : 'bg-warning-light text-warning border-warning/20'
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Utility account info */}
              <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col gap-6">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Utility Invoices
                </h3>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Account Number:</span>
                    <strong className="text-slate-800">KS-8492-3015</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Account Name:</span>
                    <strong className="text-slate-800">{user?.full_name}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Billing Cycle:</span>
                    <strong className="text-slate-800">Prepaid</strong>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border border-border rounded-xl flex flex-col gap-2">
                  <span className="text-xs text-slate-500">Current Balance Due:</span>
                  <span className="text-3xl font-display font-extrabold text-secondary">Ksh 0.00</span>
                  <span className="text-[10px] text-slate-400">All current invoices paid. No balance outstanding.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* QUICK ORDER MODAL */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="font-display font-bold text-lg text-secondary">Place Purified Water Order</h3>
              <button onClick={() => setOrderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex flex-col md:grid md:grid-cols-5 gap-6">
              {/* Product selector & cart */}
              <div className="md:col-span-3 flex flex-col gap-4">
                <h4 className="font-semibold text-sm text-slate-700">Select Purified Water items</h4>
                
                {/* Catalog Quick Add */}
                <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto">
                  {MOCK_PRODUCTS.map(prod => (
                    <div key={prod.id} className="border border-border p-3 rounded-xl flex items-center justify-between hover:bg-slate-50">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-800">{prod.name}</span>
                        <span className="text-xs text-slate-500">Ksh {prod.price.toFixed(2)} / unit</span>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(prod)}
                        className="bg-primary-light text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>

                <hr className="border-border" />

                {/* Cart list */}
                <div className="flex flex-col gap-3">
                  <span className="font-semibold text-xs text-slate-600 uppercase tracking-widest">Shopping Cart</span>
                  {cart.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Cart is empty. Select items above.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex justify-between items-center text-xs text-slate-700">
                          <span>{item.product.name} <strong>x{item.qty}</strong></span>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">Ksh {(item.product.price * item.qty).toFixed(2)}</span>
                            <button onClick={() => handleRemoveFromCart(item.product.id)} className="text-red-500 hover:text-red-700">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout billing details */}
              <div className="md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-border flex flex-col gap-4">
                <h4 className="font-semibold text-sm text-slate-700">Delivery & Checkout</h4>

                <div className="flex flex-col gap-3 text-xs">
                  {/* Address */}
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 font-semibold">Delivery Address</span>
                    <select 
                      value={selectedAddress} 
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="border border-border rounded-lg p-2 bg-white"
                    >
                      {addresses.map(addr => (
                        <option key={addr.id} value={addr.id}>{addr.street}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 font-semibold">Delivery Date</span>
                    <input 
                      type="date" 
                      value={deliveryDate} 
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="border border-border rounded-lg p-2 bg-white" 
                    />
                  </div>

                  {/* Slot */}
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 font-semibold">Delivery Slot</span>
                    <select 
                      value={deliverySlot} 
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="border border-border rounded-lg p-2 bg-white"
                    >
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                    </select>
                  </div>

                  {/* Coupon */}
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 font-semibold">Coupon Code</span>
                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        placeholder="e.g. WELCOME10" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="border border-border rounded-lg p-2 bg-white flex-1" 
                      />
                      <button 
                        type="button" 
                        onClick={handleApplyCoupon}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-semibold"
                      >
                        Apply
                      </button>
                    </div>
                    {couponMessage && <span className="text-[10px] text-primary font-semibold mt-0.5">{couponMessage}</span>}
                  </div>
                </div>

                <hr className="border-border" />

                {/* Math */}
                <div className="flex flex-col gap-2 text-xs border-t border-border pt-3">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>Ksh {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-primary font-semibold">
                      <span>Discount:</span>
                      <span>-Ksh {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>VAT (16%):</span>
                    <span>Ksh {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-display font-extrabold text-secondary border-t border-dashed border-border pt-2 mt-1">
                    <span>Total Price:</span>
                    <span>Ksh {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="flex flex-col gap-2 mt-4">
                  <button 
                    disabled={cart.length === 0}
                    onClick={() => handleCheckout('mpesa')}
                    className="bg-success hover:bg-success/90 text-white py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    Pay with M-Pesa STK
                  </button>
                  <button 
                    disabled={cart.length === 0}
                    onClick={() => handleCheckout('stripe')}
                    className="bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    Pay with Stripe (Card)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW SUBSCRIPTION MODAL */}
      {newSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-secondary">Schedule Recurring Deliveries</h3>
              <button onClick={() => setNewSubModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Select Product</label>
                <select 
                  value={subProduct} 
                  onChange={(e) => setSubProduct(e.target.value)}
                  className="border border-border rounded-lg p-2.5 bg-white text-sm"
                >
                  {MOCK_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - Ksh {p.price}/unit</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Quantity per Delivery</label>
                <input 
                  type="number" 
                  value={subQty}
                  onChange={(e) => setSubQty(parseInt(e.target.value) || 1)}
                  className="border border-border rounded-lg p-2.5 bg-white text-sm"
                  min="1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Delivery Frequency</label>
                <select 
                  value={subFreq} 
                  onChange={(e) => setSubFreq(e.target.value)}
                  className="border border-border rounded-lg p-2.5 bg-white text-sm"
                >
                  <option>Weekly</option>
                  <option>Bi-Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              <button 
                onClick={handleCreateSubscription}
                className="bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-sm font-semibold transition-all mt-2"
              >
                Confirm Subscription Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
