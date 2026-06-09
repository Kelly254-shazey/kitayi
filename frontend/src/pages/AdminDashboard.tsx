import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { ordersApi, deliveriesApi, productsApi } from '../services/api';
import {
  DollarSign, CheckCircle, Truck, MapPin, AlertCircle,
  BarChart2, Play, X, Download, Keyboard, LogOut, Menu,
  Eye, FileText, TrendingUp, Package, Calendar, ChevronLeft, ChevronRight,
  Search, Home
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import AdminAddProduct from '../components/AdminAddProduct';

type Product = { id: string; name: string; sku: string; category: string; price: number; stock_qty: number; safety_level: number; reorder_threshold: number };
type OrderItem = { product_name: string; quantity: number; price?: number };
type Order = { 
  id: string; 
  tracking_number: string; 
  customer_email?: string; 
  status: string; 
  total_amount: number; 
  items: OrderItem[]; 
  driver_name?: string; 
  vehicle_plate?: string;
  created_at?: string;
  delivery_address?: string;
  payment_status?: string;
};
type Vehicle = { id: string; plate_number: string; model: string; capacity_liters: number; status: string; maintenance_due_date: string; fuel_usage: number };


type Tab = 'ops' | 'orders' | 'billing' | 'inventory' | 'fleet' | 'analytics' | 'add-product';

const TABS_CONFIG = [
  { id: 'ops' as Tab, label: 'Operations', shortcut: 'O' },
  { id: 'orders' as Tab, label: 'Orders', shortcut: '1' },
  { id: 'billing' as Tab, label: 'Billing', shortcut: '2' },
  { id: 'inventory' as Tab, label: 'Inventory', shortcut: '3' },
  { id: 'fleet' as Tab, label: 'Fleet', shortcut: '4' },
  { id: 'analytics' as Tab, label: 'Analytics', shortcut: '5' },
  { id: 'add-product' as Tab, label: 'Add Product', shortcut: 'N' },
];

const VEHICLE_STATUS_CLASSES: Record<string, string> = { Available: 'badge-success', 'In Use': 'badge-info', Maintenance: 'badge-danger' };
const ORDER_STATUS_CLASSES: Record<string, string> = { 
  Pending: 'badge-warning', 
  Approved: 'badge-info',
  Assigned: 'badge-info', 
  'In Transit': 'badge-info', 
  Delivered: 'badge-success', 
  Cancelled: 'badge-danger',
  Rejected: 'badge-danger'
};
const PAYMENT_STATUS_CLASSES: Record<string, string> = {
  Pending: 'badge-warning',
  Completed: 'badge-success',
  Failed: 'badge-danger',
  Refunded: 'badge-info'
};

// Generate Invoice PDF moved outside to maintain component purity
const generateInvoicePDF = (order: Order) => {
  const invoiceHTML = `
  <html>
    <head>
      <title>Invoice - ${order.tracking_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .invoice { background: white; max-width: 800px; margin: 0 auto; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 3px solid #1b4fd8; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #1b4fd8; }
        .company-info { text-align: right; font-size: 12px; }
        .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .detail-section h4 { margin: 0 0 10px 0; color: #333; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .detail-section p { margin: 5px 0; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { background: #1b4fd8; color: white; padding: 12px; text-align: left; font-size: 12px; font-weight: bold; }
        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
        tr:last-child td { border-bottom: 2px solid #1b4fd8; }
        .totals { display: grid; grid-template-columns: 1fr 200px; gap: 40px; margin-bottom: 40px; }
        .totals-table { text-align: right; }
        .totals-table .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .totals-table .total { border-top: 2px solid #333; padding-top: 8px; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; }
        .status-paid { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
      </style>
    </head>
    <body onload="window.print()">
      <div class="invoice">
        <div class="header">
          <div class="logo">KITAYI<br/>Solutions Limited</div>
          <div class="company-info">
            <p><strong>Kitayi Solutions Limited</strong></p>
            <p>Industrial Area, Enterprise Road</p>
            <p>Nairobi, Kenya</p>
            <p>📧 billing@kitayisolutions.com</p>
            <p>📞 +254 700 000 000</p>
            <p>🏛️ PIN: A000123456A</p>
          </div>
        </div>

        <div class="invoice-title">INVOICE</div>

        <div class="invoice-details">
          <div class="detail-section">
            <h4>Bill To</h4>
            <p><strong>${order.customer_email || 'Customer'}</strong></p>
            <p>${order.delivery_address || 'Nairobi, Kenya'}</p>
          </div>
          <div class="detail-section">
            <h4>Invoice Details</h4>
            <p><strong>Invoice #:</strong> ${order.tracking_number}</p>
            <p><strong>Date:</strong> ${new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status ${order.payment_status === 'Completed' ? 'status-paid' : 'status-pending'}">${order.payment_status || 'Pending'}</span></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Quantity</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item) => `
              <tr>
                <td>${item.product_name}</td>
                <td style="text-align: right;">${item.quantity}</td>
                <td style="text-align: right;">Ksh ${(item.price || 0).toLocaleString()}</td>
                <td style="text-align: right;">Ksh ${((item.price || 0) * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div></div>
          <div class="totals-table">
            <div class="row">
              <span>Subtotal:</span>
              <span>Ksh ${order.total_amount.toLocaleString()}</span>
            </div>
            <div class="row">
              <span>Tax (16%):</span>
              <span>Ksh ${Math.round(order.total_amount * 0.16).toLocaleString()}</span>
            </div>
            <div class="row total">
              <span>Total:</span>
              <span>Ksh ${Math.round(order.total_amount * 1.16).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing Kitayi Solutions for your water needs.</p>
          <p>Payment Methods: M-Pesa, Stripe, Bank Transfer | Customer Support: support@kitayisolutions.com</p>
          <p>This is a system-generated invoice. No signature required.</p>
        </div>
      </div>
    </body>
  </html>
  `;
  
  const printWindow = window.open('', '', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  }
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('ops');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  
  // Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [now] = useState(() => Date.now());

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes, vehiclesRes] = await Promise.all([
          ordersApi.list(),
          productsApi.list(),
          deliveriesApi.vehicles(),
        ]);
        
        const ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.results || [];
        const productsList = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.results || [];
        const vehiclesList = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : vehiclesRes.data?.results || [];
        
        setOrders(ordersList);
        setProducts(productsList);
        setVehicles(vehiclesList);
        
        if (vehiclesList.length > 0) {
          const available = vehiclesList.find((v: Vehicle) => v.status === 'Available');
          if (available) setSelectedVehicle(available.id);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el?.tagName)) return;
      
      const key = e.key.toLowerCase();
      if (key === '?') setShortcutsOpen(p => !p);
      
      const matchedTab = TABS_CONFIG.find(t => t.shortcut.toLowerCase() === key || t.shortcut === e.key);
      if (matchedTab) setTab(matchedTab.id);
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Approve Order
  const approveOrder = async (orderId: string) => {
    try {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Approved' } : o));
    } catch (error) {
      console.error('Failed to approve order:', error);
    }
  };

  // Assign Driver & Vehicle
  const assignDriver = async (orderId: string) => {
    if (!selectedDriver || !selectedVehicle) {
      alert('Please select a driver and vehicle');
      return;
    }
    try {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'Assigned', driver_name: selectedDriver, vehicle_plate: vehicle?.plate_number } : o
      ));
    } catch (error) {
      console.error('Failed to assign driver:', error);
    }
  };

  // Dispatch Order
  const dispatchOrder = async (orderId: string) => {
    try {
      await deliveriesApi.updateStatus(orderId, 'In Transit');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'In Transit' } : o));
    } catch (error) {
      console.error('Failed to dispatch order:', error);
    }
  };

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesSearch = !searchQuery || 
      order.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Calculate KPIs from real data
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const activeFleet = vehicles.filter(v => v.status === 'In Use').length;

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell flex flex-col text-slate-900">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 overflow-hidden flex items-center justify-center border border-white/20">
              <BrandLogo variant="mark" className="w-full h-full" />
            </div>
            <span className="font-display font-bold text-white text-sm tracking-tight hidden md:block">
              KITAYI <span className="text-cyan-400">ADMIN</span>
            </span>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {TABS_CONFIG.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === t.id ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'text-slate-500 hover:text-slate-900'
                }`}
                title={`${t.label} (${t.shortcut})`}>
                {t.label}
              </button>
            ))}
          </nav>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)} title="Open navigation">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShortcutsOpen(true)} className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="Keyboard shortcuts (?)">
            <Keyboard className="w-4 h-4" />
          </button>
          <button onClick={() => window.print()} className="btn-ghost text-xs px-3 py-2 hidden md:flex border-slate-200">
            <Download className="w-3.5 h-3.5" /> <span>Export</span>
          </button>
          <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-bold hidden md:block">
            {user?.user_type || 'Admin'}
          </span>
          <button onClick={logout} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Logout">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Nav */}
      {sidebarOpen && (
        <div className="lg:hidden border-b border-white/8 px-4 py-2 flex flex-col gap-1">
          {TABS_CONFIG.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-left transition-all border border-transparent ${
                tab === t.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-4 overflow-y-auto">
        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: 'Total Revenue', value: `Ksh ${totalRevenue.toLocaleString()}`, sub: 'All-time', bg: 'bg-cyan-500/10', iconColor: 'text-cyan-400' },
            { icon: Package, label: 'Orders Completed', value: deliveredOrders.toString(), sub: 'Successfully delivered', bg: 'bg-green-500/10', iconColor: 'text-green-400' },
            { icon: Truck, label: 'Active Fleet', value: `${activeFleet}/${vehicles.length}`, sub: 'Vehicles in use', bg: 'bg-blue-500/10', iconColor: 'text-blue-600' },
            { icon: AlertCircle, label: 'Low Stock Items', value: products.filter(p => p.stock_qty <= p.safety_level).length.toString(), sub: 'Need attention', bg: 'bg-red-500/10', iconColor: 'text-red-400' },
          ].map(({ icon: Icon, label, value, sub, bg, iconColor }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-black text-white/70 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-display font-black text-white">{value}</p>
                <p className="text-xs text-white/40">{sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
          ))}
        </div>

        {/* OPERATIONS TAB */}
        {tab === 'ops' && (
          <div className="grid lg:grid-cols-3 gap-4 items-start">
            {/* Dispatch Queue */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
              <h3 className="font-display font-bold text-white text-lg">Real-Time Dispatch Queue</h3>
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="text" placeholder="Search tracking #, email..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                    className="glass-input pl-10 text-sm w-full" />
                </div>
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="glass-input text-sm" title="Filter by status">
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                {paginatedOrders.length === 0 ? (
                  <div className="text-center py-8 text-white/40">No orders found</div>
                ) : (
                  paginatedOrders.map(order => (
                    <div key={order.id} className="border border-white/8 rounded-xl p-4 hover:bg-white/4 transition-all">
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm font-bold text-white">{order.tracking_number}</p>
                          <p className="text-xs text-white/60">{order.customer_email}</p>
                        </div>
                        <span className={`${ORDER_STATUS_CLASSES[order.status]} flex-shrink-0`}>{order.status}</span>
                      </div>

                      <div className="text-xs text-white/70 mb-3 flex flex-wrap gap-1">
                        {order.items.map((item, i) => (
                          <span key={i} className="bg-white/5 px-2 py-1 rounded">
                            {item.product_name} ×{item.quantity}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <p className="font-bold text-white">Ksh {order.total_amount.toLocaleString()}</p>
                          <p className="text-xs text-white/40">{order.payment_status || 'Pending Payment'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedOrder(order); setShowOrderDetail(true); }} 
                            className="btn-secondary text-xs px-3 py-2">
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                          {order.status === 'Pending' && (
                            <button onClick={() => approveOrder(order.id)} className="btn-primary text-xs px-3 py-2">
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                          )}
                          {order.status === 'Approved' && (
                            <button onClick={() => assignDriver(order.id)} className="btn-primary text-xs px-3 py-2">
                              Assign
                            </button>
                          )}
                          {order.status === 'Assigned' && (
                            <button onClick={() => dispatchOrder(order.id)} className="btn-primary text-xs px-3 py-2">
                              <Play className="w-3.5 h-3.5 fill-current" /> Dispatch
                            </button>
                          )}
                        </div>
                      </div>

                      {order.status === 'Approved' && (
                        <div className="mt-3 pt-3 border-t border-white/8 flex gap-2">
                          <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} 
                            className="glass-input text-xs flex-1 py-1.5" title="Select driver">
                            <option value="">Select Driver</option>
                            <option>John Kamau</option>
                            <option>Jane Wanjiru</option>
                            <option>Peter Odhiambo</option>
                          </select>
                          <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} 
                            className="glass-input text-xs flex-1 py-1.5" title="Select vehicle">
                            {vehicles.filter(v => v.status === 'Available').map(v => (
                              <option key={v.id} value={v.id}>{v.plate_number}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Dispatch Queue Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Showing {paginatedOrders.length} of {filteredOrders.length} orders
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} title="Previous page"
                        className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white disabled:opacity-10 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} title="Next page"
                        className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white disabled:opacity-10 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fleet Status */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" /> Fleet Status
              </h3>
              <div className="space-y-3">
                {vehicles.slice(0, 5).map(v => (
                  <div key={v.id} className="bg-white/5 border border-white/8 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-white text-sm">{v.model}</p>
                        <p className="font-mono text-xs text-white/60">{v.plate_number}</p>
                      </div>
                      <span className={VEHICLE_STATUS_CLASSES[v.status]}>{v.status}</span>
                    </div>
                    <div className="text-xs text-white/60 space-y-1">
                      <p>📦 {v.capacity_liters.toLocaleString()}L capacity</p>
                      <p>⚙️ Maintenance: {v.maintenance_due_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-white text-lg">Order Management</h3>
              <div className="flex gap-2">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="glass-input text-sm" title="Filter orders">
                  <option value="">All Orders ({orders.length})</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs text-white/70 font-bold uppercase">
                      <th className="px-4 py-3 text-left"><span>Tracking #</span></th>
                      <th className="px-4 py-3 text-left"><span>Customer</span></th>
                      <th className="px-4 py-3 text-right"><span>Amount</span></th>
                      <th className="px-4 py-3 text-left"><span>Status</span></th>
                      <th className="px-4 py-3 text-left"><span>Payment</span></th>
                      <th className="px-4 py-3 text-center"><span>Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-white/5 transition-all">
                      <td className="px-4 py-3 font-mono font-bold text-white">{order.tracking_number}</td>
                      <td className="px-4 py-3 text-white/70">{order.customer_email}</td>
                      <td className="px-4 py-3 font-bold text-white text-right">Ksh {order.total_amount.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={ORDER_STATUS_CLASSES[order.status]}>{order.status}</span></td>
                      <td className="px-4 py-3"><span className={PAYMENT_STATUS_CLASSES[order.payment_status || 'Pending']}>{order.payment_status || 'Pending'}</span></td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => generateInvoicePDF(order)} className="text-cyan-400 hover:text-white text-xs font-bold">
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {tab === 'billing' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
              <h3 className="font-display font-bold text-white text-lg">Invoices & Billing</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-xs text-white/70 font-bold uppercase">
                      <th className="px-4 py-3 text-left"><span>Ref #</span></th>
                      <th className="px-4 py-3 text-left"><span>Order</span></th>
                      <th className="px-4 py-3 text-right"><span>Amount</span></th>
                      <th className="px-4 py-3 text-left"><span>Status</span></th>
                      <th className="px-4 py-3 text-left"><span>Due Date</span></th>
                      <th className="px-4 py-3 text-center"><span>Action</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 10).map((order, idx) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-4 py-3 font-mono font-bold text-blue-600">INV-{String(idx + 1).padStart(4, '0')}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{order.tracking_number}</td>
                        <td className="px-4 py-3 font-bold text-white text-right"><span>Ksh {order.total_amount.toLocaleString()}</span></td>
                        <td className="px-4 py-3">
                          <span className={`${order.payment_status === 'Completed' ? PAYMENT_STATUS_CLASSES['Completed'] : PAYMENT_STATUS_CLASSES['Pending']}`}>
                            {order.payment_status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/60">
                          <span>{new Date(now + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => generateInvoicePDF(order)} className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center justify-center gap-1 mx-auto">
                            <FileText className="w-3.5 h-3.5" /> Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Billing Summary */}
            <div className="glass-card p-6 flex flex-col gap-4">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" /> Financial Summary
              </h3>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3 border border-white/8">
                  <p className="text-white/60 text-xs mb-1">Total Revenue</p>
                  <p className="font-display font-black text-white text-xl">Ksh {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/8">
                  <p className="text-white/60 text-xs mb-1">Pending Payments</p>
                  <p className="font-display font-black text-white text-xl">
                    Ksh {orders.filter(o => o.payment_status !== 'Completed').reduce((s, o) => s + (o.total_amount || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/8">
                  <p className="text-white/60 text-xs mb-1">Completed Orders</p>
                  <p className="font-display font-black text-emerald-600 text-xl">{deliveredOrders}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {tab === 'inventory' && (
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-display font-bold text-white text-lg">Inventory Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs text-white/70 font-bold uppercase">
                    <th className="px-4 py-3 text-left"><span>SKU</span></th>
                    <th className="px-4 py-3 text-left"><span>Item Name</span></th>
                    <th className="px-4 py-3 text-left"><span>Category</span></th>
                    <th className="px-4 py-3 text-right"><span>Stock</span></th>
                    <th className="px-4 py-3 text-right"><span>Safety Level</span></th>
                    <th className="px-4 py-3 text-left"><span>Status</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {products.map(p => {
                    const isLow = p.stock_qty <= p.safety_level;
                    return (
                      <tr key={p.id} className={`hover:bg-white/5 transition-all ${isLow ? 'bg-red-500/10' : ''}`}>
                        <td className="px-4 py-3 font-mono text-xs text-white/60">{p.sku}</td>
                        <td className="px-4 py-3 font-bold text-white">{p.name}</td>
                        <td className="px-4 py-3 text-white/50">{p.category}</td>
                        <td className="px-4 py-3 font-bold text-white text-right">{p.stock_qty}</td>
                        <td className="px-4 py-3 text-white/50 text-right">{p.safety_level}</td>
                        <td className="px-4 py-3">
                          {isLow ? (
                            <span className="badge-danger flex items-center gap-1 w-fit">
                              <AlertCircle className="w-3 h-3" /> Critical
                            </span>
                          ) : p.stock_qty <= p.reorder_threshold ? (
                            <span className="badge-warning w-fit">Reorder</span>
                          ) : (
                            <span className="badge-success w-fit">Healthy</span>
                          )}
                        </td>
                      </tr> 
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )} 

        {/* FLEET TAB */}
        {tab === 'fleet' && (
          <div>
            <h3 className="font-display font-bold text-white text-lg mb-4">Fleet Management</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map(v => (
                <div key={v.id} className="glass-card p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-lg">{v.model}</p>
                      <p className="font-mono text-xs text-cyan-400 font-bold">{v.plate_number}</p>
                    </div>
                    <span className={VEHICLE_STATUS_CLASSES[v.status]}>{v.status}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
                    <div>
                      <p className="text-white/60 mb-1">Capacity</p>
                      <p className="font-bold text-white text-sm">{v.capacity_liters.toLocaleString()}L</p>
                    </div>
                    <div>
                      <p className="text-white/60 mb-1">Fuel Usage</p>
                      <p className="font-bold text-white text-sm">{v.fuel_usage}L/100km</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-white/60 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Next Maintenance
                      </p>
                      <p className={`font-bold text-sm ${
                        new Date(v.maintenance_due_date) < new Date() ? 'text-red-600' : 'text-white'
                      }`}>
                        {v.maintenance_due_date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'add-product' && <AdminAddProduct />}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="glass-card p-6 flex flex-col gap-4">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" /> Order Trends
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Total Orders</span>
                  <span className="font-bold text-white text-lg">{orders.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Pending</span>
                  <span className="font-bold text-white">{orders.filter(o => o.status === 'Pending').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">In Transit</span>
                  <span className="font-bold text-white">{orders.filter(o => o.status === 'In Transit').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Delivered</span>
                  <span className="font-bold text-green-400">{deliveredOrders}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col gap-4">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-400" /> Fleet Analytics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Total Vehicles</span>
                  <span className="font-bold text-white text-lg">{vehicles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Available</span>
                  <span className="font-bold text-green-400">{vehicles.filter(v => v.status === 'Available').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">In Use</span>
                  <span className="font-bold text-cyan-400">{activeFleet}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Maintenance</span>
                  <span className="font-bold text-red-400">{vehicles.filter(v => v.status === 'Maintenance').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-display font-bold text-white text-xl">{selectedOrder.tracking_number}</h3>
              <button onClick={() => setShowOrderDetail(false)} className="text-white/50 hover:text-white" title="Close details">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/8">
                <div>
                  <p className="text-white/60 text-xs mb-1">Customer</p>
                  <p className="font-bold text-white">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Status</p>
                  <span className={ORDER_STATUS_CLASSES[selectedOrder.status]}>{selectedOrder.status}</span>
                </div>
              </div>

              <div>
                <p className="text-white/60 text-xs mb-2">Delivery Address</p>
                <p className="text-white flex items-start gap-2">
                  <Home className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-400" />
                  {selectedOrder.delivery_address || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-white/60 text-xs mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-white">
                      <span>{item.product_name}</span>
                      <span>×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/8">
                <p className="text-xl font-bold text-white">Total: Ksh {selectedOrder.total_amount.toLocaleString()}</p>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => generateInvoicePDF(selectedOrder)} className="btn-primary flex-1">
                  <FileText className="w-4 h-4" /> Generate Invoice
                </button>
                <button onClick={() => setShowOrderDetail(false)} className="btn-secondary flex-1">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {shortcutsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 rounded-2xl max-w-md w-full">
            <h3 className="font-display font-bold text-white text-xl mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              {TABS_CONFIG.map(t => (
                <div key={t.id} className="flex justify-between text-white/70">
                  <span>{t.label}</span>
                  <kbd className="bg-white/10 px-2 py-1 rounded font-mono text-white/50">{t.shortcut}</kbd>
                </div>
              ))}
              <div className="flex justify-between text-white/70 pt-2 border-t border-white/8 mt-2">
                <span>Shortcuts</span>
                <kbd className="bg-white/10 px-2 py-1 rounded font-mono text-white/50">?</kbd>
              </div>
            </div>
            <button onClick={() => setShortcutsOpen(false)} className="btn-secondary w-full mt-6">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
