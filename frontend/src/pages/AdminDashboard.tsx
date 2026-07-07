import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
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
type Order = { id: string; tracking_number: string; customer_email?: string; status: string; total_amount: number; items: OrderItem[]; driver_name?: string; vehicle_plate?: string; created_at?: string; delivery_address?: string; payment_status?: string; };
type Vehicle = { id: string; plate_number: string; model: string; capacity_liters: number; status: string; maintenance_due_date: string; fuel_usage: number };
type Tab = 'ops' | 'orders' | 'billing' | 'inventory' | 'fleet' | 'analytics' | 'add-product';

const TABS_CONFIG = [
  { id: 'ops' as Tab, label: 'Employee Ops', shortcut: 'O' },
  { id: 'orders' as Tab, label: 'Orders', shortcut: '1' },
  { id: 'billing' as Tab, label: 'Billing', shortcut: '2' },
  { id: 'inventory' as Tab, label: 'Inventory', shortcut: '3' },
  { id: 'fleet' as Tab, label: 'Fleet', shortcut: '4' },
  { id: 'analytics' as Tab, label: 'Analytics', shortcut: '5' },
  { id: 'add-product' as Tab, label: 'Add Product', shortcut: 'N' },
];

const OPERATIONS_MODULES = [
  { title: 'Cashier Shift', detail: 'Walk-in sales, cash, M-Pesa, receipts, close shift.', icon: DollarSign },
  { title: 'Branch Manager', detail: 'Approve orders, assign teams, review daily reports.', icon: CheckCircle },
  { title: 'Inventory Control', detail: 'Stock in, stock out, low-stock alerts, audit trail.', icon: Package },
  { title: 'Delivery Dispatch', detail: 'Driver assignment, vehicle status, delivery updates.', icon: Truck },
];

const VEHICLE_STATUS_CLASSES: Record<string, string> = { Available: 'badge-success', 'In Use': 'badge-info', Maintenance: 'badge-error' };
const ORDER_STATUS_CLASSES: Record<string, string> = {
  Pending: 'badge-warning', Approved: 'badge-info', Assigned: 'badge-info',
  'In Transit': 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-error', Rejected: 'badge-error'
};
const PAYMENT_STATUS_CLASSES: Record<string, string> = {
  Pending: 'badge-warning', Completed: 'badge-success', Failed: 'badge-error', Refunded: 'badge-info'
};

const generateInvoicePDF = (_order: Order) => {
  const invoiceHTML = `...`; // truncated for brevity
  const printWindow = window.open('', '', 'width=900,height=700');
  if (printWindow) { printWindow.document.write(invoiceHTML); printWindow.document.close(); }
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('ops');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes, vehiclesRes] = await Promise.all([
          ordersApi.list(), productsApi.list(), deliveriesApi.vehicles(),
        ]);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.results || []);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.results || []);
        const vehiclesList = Array.isArray(vehiclesRes.data) ? vehiclesRes.data : vehiclesRes.data?.results || [];
        setVehicles(vehiclesList);
        if (vehiclesList.length > 0) {
          const available = vehiclesList.find((v: Vehicle) => v.status === 'Available');
          if (available) setSelectedVehicle(available.id);
        }
      } catch (error) { console.error('Failed to load dashboard data:', error); } finally { setLoading(false); }
    };
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) return;
      const key = e.key.toLowerCase();
      if (key === '?') setShortcutsOpen(p => !p);
      const matchedTab = TABS_CONFIG.find(t => t.shortcut.toLowerCase() === key || t.shortcut === e.key);
      if (matchedTab) setTab(matchedTab.id);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const approveOrder = async (orderId: string) => setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Approved' } : o));
  const assignDriver = async (orderId: string) => {
    if (!selectedDriver || !selectedVehicle) { alert('Please select a driver and vehicle'); return; }
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Assigned', driver_name: selectedDriver, vehicle_plate: vehicle?.plate_number } : o));
  };
  const dispatchOrder = async (orderId: string) => {
    await deliveriesApi.updateStatus(orderId, 'In Transit');
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'In Transit' } : o));
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesSearch = !searchQuery || order.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) || order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const activeFleet = vehicles.filter(v => v.status === 'In Use').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#2563eb', borderTopColor: 'transparent' }} />
          <span className="text-body-sm" style={{ color: 'var(--text-muted)' }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40" style={{ backgroundColor: 'white', borderColor: '#e2e8f0' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center border" style={{ borderColor: '#e2e8f0' }}>
              <BrandLogo variant="mark" className="w-full h-full" />
            </div>
            <span className="font-display font-bold text-sm hidden md:block">
              KITAYI <span style={{ color: '#2563eb' }}>ADMIN</span>
            </span>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {TABS_CONFIG.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: tab === t.id ? '#eff6ff' : 'transparent',
                  color: tab === t.id ? '#2563eb' : '#64748b',
                  border: tab === t.id ? '1px solid #bfdbfe' : '1px solid transparent',
                }}>
                {t.label}
              </button>
            ))}
          </nav>
          <button className="lg:hidden p-2" style={{ color: '#64748b' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShortcutsOpen(true)} className="btn-ghost btn-sm">
            <Keyboard className="w-4 h-4" />
          </button>
          <button onClick={() => window.print()} className="btn-secondary btn-sm hidden md:flex">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <span className="badge-info hidden md:block">{user?.user_type || 'Admin'}</span>
          <button onClick={logout} className="btn-ghost btn-sm" style={{ color: '#64748b' }} title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {sidebarOpen && (
        <div className="lg:hidden border-b px-4 py-2 flex flex-col gap-1" style={{ backgroundColor: 'white', borderColor: '#e2e8f0' }}>
          {TABS_CONFIG.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-left"
              style={{
                backgroundColor: tab === t.id ? '#eff6ff' : 'transparent',
                color: tab === t.id ? '#2563eb' : '#64748b',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-6">

          {/* Operations Modules */}
          <div className="kpi-grid">
            {OPERATIONS_MODULES.map(({ title, detail, icon: Icon }) => (
              <div key={title} className="card">
                <div className="card-body">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#eff6ff' }}>
                    <Icon className="w-5 h-5" style={{ color: '#2563eb' }} />
                  </div>
                  <h3 className="text-h3 mb-1">{title}</h3>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid">
            {[
              { icon: DollarSign, label: 'Total Revenue', value: `Ksh ${totalRevenue.toLocaleString()}`, sub: 'All-time', bg: '#eff6ff', iconColor: '#2563eb' },
              { icon: Package, label: 'Orders Completed', value: deliveredOrders.toString(), sub: 'Delivered', bg: '#f0fdf4', iconColor: '#10b981' },
              { icon: Truck, label: 'Active Fleet', value: `${activeFleet}/${vehicles.length}`, sub: 'Vehicles in use', bg: '#eff6ff', iconColor: '#2563eb' },
              { icon: AlertCircle, label: 'Low Stock Items', value: products.filter(p => p.stock_qty <= p.safety_level).length.toString(), sub: 'Need attention', bg: '#fef2f2', iconColor: '#ef4444' },
            ].map(({ icon: Icon, label, value, sub, bg, iconColor }) => (
              <div key={label} className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="kpi-label">{label}</p>
                      <p className="kpi-value">{value}</p>
                      <p className="kpi-trend" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                      <Icon className="w-5 h-5" style={{ color: iconColor }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* OPS TAB */}
          {tab === 'ops' && (
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 card">
                <div className="card-body flex flex-col gap-4">
                  <h3 className="text-h3">Real-Time Dispatch Queue</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <input type="text" placeholder="Search tracking #..." value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="input pl-10" />
                    </div>
                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="select">
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
                      <div className="text-center py-8 text-body-sm" style={{ color: 'var(--text-muted)' }}>No orders found</div>
                    ) : (
                      paginatedOrders.map(order => (
                        <div key={order.id} className="rounded-lg p-4" style={{ border: '1px solid var(--border)' }}>
                          <div className="flex justify-between items-start gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-sm font-bold truncate">{order.tracking_number}</p>
                              <p className="text-body-sm truncate" style={{ color: 'var(--text-secondary)' }}>{order.customer_email}</p>
                            </div>
                            <span className={ORDER_STATUS_CLASSES[order.status]}>{order.status}</span>
                          </div>
                          <div className="text-body-sm mb-3 flex flex-wrap gap-1" style={{ color: 'var(--text-secondary)' }}>
                            {order.items.map((item, i) => (
                              <span key={i} className="px-2 py-1 rounded" style={{ backgroundColor: '#f1f5f9' }}>
                                {item.product_name} &times;{item.quantity}
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold">Ksh {order.total_amount.toLocaleString()}</p>
                              <p className="text-caption" style={{ color: 'var(--text-muted)' }}>{order.payment_status || 'Pending Payment'}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { setSelectedOrder(order); setShowOrderDetail(true); }} className="btn-secondary btn-sm">
                                <Eye className="w-3.5 h-3.5" /> Details
                              </button>
                              {order.status === 'Pending' && (
                                <button onClick={() => approveOrder(order.id)} className="btn-primary btn-sm">
                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                                </button>
                              )}
                              {order.status === 'Approved' && (
                                <button onClick={() => assignDriver(order.id)} className="btn-primary btn-sm">Assign</button>
                              )}
                              {order.status === 'Assigned' && (
                                <button onClick={() => dispatchOrder(order.id)} className="btn-primary btn-sm">
                                  <Play className="w-3.5 h-3.5" /> Dispatch
                                </button>
                              )}
                            </div>
                          </div>
                          {order.status === 'Approved' && (
                            <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                              <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="select flex-1">
                                <option value="">Select Driver</option>
                                <option>John Kamau</option>
                                <option>Jane Wanjiru</option>
                                <option>Peter Odhiambo</option>
                              </select>
                              <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="select flex-1">
                                {vehicles.filter(v => v.status === 'Available').map(v => (
                                  <option key={v.id} value={v.id}>{v.plate_number}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <p className="text-caption" style={{ color: 'var(--text-muted)' }}>
                          Showing {paginatedOrders.length} of {filteredOrders.length} orders
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-secondary btn-sm">
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-secondary btn-sm">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fleet Status */}
              <div className="card">
                <div className="card-body flex flex-col gap-4">
                  <h3 className="text-h3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: '#2563eb' }} /> Fleet Status
                  </h3>
                  <div className="space-y-3">
                    {vehicles.slice(0, 5).map(v => (
                      <div key={v.id} className="rounded-lg p-3" style={{ border: '1px solid var(--border)' }}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-sm">{v.model}</p>
                            <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{v.plate_number}</p>
                          </div>
                          <span className={VEHICLE_STATUS_CLASSES[v.status]}>{v.status}</span>
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <p>{v.capacity_liters.toLocaleString()}L capacity</p>
                          <p>Maintenance: {v.maintenance_due_date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="card">
              <div className="card-body flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-h3">Order Management</h3>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select">
                    <option value="">All Orders ({orders.length})</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Tracking #</th>
                        <th>Customer</th>
                        <th className="text-right">Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td className="font-mono font-bold">{order.tracking_number}</td>
                          <td>{order.customer_email}</td>
                          <td className="text-right font-bold">Ksh {order.total_amount.toLocaleString()}</td>
                          <td><span className={ORDER_STATUS_CLASSES[order.status]}>{order.status}</span></td>
                          <td><span className={PAYMENT_STATUS_CLASSES[order.payment_status || 'Pending']}>{order.payment_status || 'Pending'}</span></td>
                          <td className="text-center">
                            <button onClick={() => generateInvoicePDF(order)} className="btn-ghost btn-sm" style={{ color: '#2563eb' }}>
                              Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* BILLING TAB */}
          {tab === 'billing' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card">
                <div className="card-body flex flex-col gap-4">
                  <h3 className="text-h3">Invoices &amp; Billing</h3>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Ref #</th>
                          <th>Order</th>
                          <th className="text-right">Amount</th>
                          <th>Status</th>
                          <th>Due Date</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 10).map((order, idx) => (
                          <tr key={order.id}>
                            <td className="font-mono font-bold" style={{ color: '#2563eb' }}>INV-{String(idx + 1).padStart(4, '0')}</td>
                            <td className="font-bold">{order.tracking_number}</td>
                            <td className="text-right font-bold">Ksh {order.total_amount.toLocaleString()}</td>
                            <td><span className={order.payment_status === 'Completed' ? PAYMENT_STATUS_CLASSES['Completed'] : PAYMENT_STATUS_CLASSES['Pending']}>{order.payment_status || 'Pending'}</span></td>
                            <td style={{ color: 'var(--text-secondary)' }}>{new Date(now + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                            <td className="text-center">
                              <button onClick={() => generateInvoicePDF(order)} className="btn-ghost btn-sm" style={{ color: '#2563eb' }}>
                                <FileText className="w-3.5 h-3.5" /> Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body flex flex-col gap-5">
                  <h3 className="text-h3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" style={{ color: '#2563eb' }} /> Financial Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="rounded-lg p-4" style={{ border: '1px solid var(--border)' }}>
                      <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Total Revenue</p>
                      <p className="text-xl font-bold">Ksh {totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg p-4" style={{ border: '1px solid var(--border)' }}>
                      <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Pending Payments</p>
                      <p className="text-xl font-bold">
                        Ksh {orders.filter(o => o.payment_status !== 'Completed').reduce((s, o) => s + (o.total_amount || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg p-4" style={{ border: '1px solid var(--border)' }}>
                      <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Completed Orders</p>
                      <p className="text-xl font-bold" style={{ color: '#059669' }}>{deliveredOrders}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INVENTORY TAB */}
          {tab === 'inventory' && (
            <div className="card">
              <div className="card-body flex flex-col gap-4">
                <h3 className="text-h3">Inventory Management</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th className="text-right">Stock</th>
                        <th className="text-right">Safety Level</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const isLow = p.stock_qty <= p.safety_level;
                        return (
                          <tr key={p.id} style={isLow ? { backgroundColor: '#fef2f2' } : {}}>
                            <td className="font-mono text-xs">{p.sku}</td>
                            <td className="font-bold">{p.name}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{p.category}</td>
                            <td className="text-right font-bold">{p.stock_qty}</td>
                            <td className="text-right">{p.safety_level}</td>
                            <td>
                              {isLow ? (
                                <span className="badge-error flex items-center gap-1 w-fit">
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
            </div>
          )}

          {/* FLEET TAB */}
          {tab === 'fleet' && (
            <div>
              <h3 className="text-h3 mb-4">Fleet Management</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map(v => (
                  <div key={v.id} className="card">
                    <div className="card-body flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-h3">{v.model}</p>
                          <p className="font-mono text-sm" style={{ color: '#2563eb' }}>{v.plate_number}</p>
                        </div>
                        <span className={VEHICLE_STATUS_CLASSES[v.status]}>{v.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-body-sm" style={{ borderTop: '1px solid var(--border)' }}>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Capacity</span><br /><strong>{v.capacity_liters.toLocaleString()}L</strong></div>
                        <div><span style={{ color: 'var(--text-secondary)' }}>Fuel</span><br /><strong>{v.fuel_usage}L/100km</strong></div>
                        <div className="col-span-2">
                          <span style={{ color: 'var(--text-secondary)' }} className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Next Maintenance
                          </span>
                          <strong className={new Date(v.maintenance_due_date) < new Date() ? 'text-red-600' : ''}>
                            {v.maintenance_due_date}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {tab === 'analytics' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-body flex flex-col gap-4">
                  <h3 className="text-h3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: '#2563eb' }} /> Order Trends
                  </h3>
                  <div className="space-y-3">
                    {[
                      ['Total Orders', orders.length, ''],
                      ['Pending', orders.filter(o => o.status === 'Pending').length, ''],
                      ['In Transit', orders.filter(o => o.status === 'In Transit').length, ''],
                      ['Delivered', deliveredOrders, '#059669'],
                    ].map((row) => {
                      const label = row[0] as string;
                      const value = row[1] as number;
                      const color = row[2] as string;
                      return (
                        <div key={label} className="flex items-center justify-between">
                          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                          <span className="font-bold text-lg" style={{ color: color || 'inherit' }}>{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body flex flex-col gap-4">
                  <h3 className="text-h3 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5" style={{ color: '#2563eb' }} /> Fleet Analytics
                  </h3>
                  <div className="space-y-3">
                    {[
                      ['Total Vehicles', vehicles.length, ''],
                      ['Available', vehicles.filter(v => v.status === 'Available').length, '#059669'],
                      ['In Use', activeFleet, '#2563eb'],
                      ['Maintenance', vehicles.filter(v => v.status === 'Maintenance').length, '#ef4444'],
                    ].map((row) => {
                      const label = row[0] as string;
                      const value = row[1] as number;
                      const color = row[2] as string;
                      return (
                        <div key={label} className="flex items-center justify-between">
                          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                          <span className="font-bold text-lg" style={{ color: color || 'inherit' }}>{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'add-product' && <AdminAddProduct />}
        </div>
      </main>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="modal-backdrop" onClick={() => setShowOrderDetail(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="card-body flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <h3 className="text-h3">{selectedOrder.tracking_number}</h3>
                <button onClick={() => setShowOrderDetail(false)} className="btn-ghost btn-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Customer</p>
                  <p className="font-bold">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Status</p>
                  <span className={ORDER_STATUS_CLASSES[selectedOrder.status]}>{selectedOrder.status}</span>
                </div>
              </div>
              <div>
                <p className="text-caption mb-1" style={{ color: 'var(--text-secondary)' }}>Delivery Address</p>
                <p className="flex items-start gap-2">
                  <Home className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2563eb' }} />
                  {selectedOrder.delivery_address || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-caption mb-2" style={{ color: 'var(--text-secondary)' }}>Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.product_name}</span>
                      <span>&times;{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xl font-bold pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                Total: Ksh {selectedOrder.total_amount.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button onClick={() => generateInvoicePDF(selectedOrder)} className="btn-primary btn-md flex-1">
                  <FileText className="w-4 h-4" /> Invoice
                </button>
                <button onClick={() => setShowOrderDetail(false)} className="btn-secondary btn-md flex-1">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {shortcutsOpen && (
        <div className="modal-backdrop" onClick={() => setShortcutsOpen(false)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="card-body flex flex-col gap-5">
              <h3 className="text-h3">Keyboard Shortcuts</h3>
              <div className="space-y-2 text-body-sm">
                {TABS_CONFIG.map(t => (
                  <div key={t.id} className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>{t.label}</span>
                    <kbd className="px-2 py-1 rounded font-mono text-xs" style={{ backgroundColor: '#f1f5f9' }}>{t.shortcut}</kbd>
                  </div>
                ))}
                <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Shortcuts</span>
                  <kbd className="px-2 py-1 rounded font-mono text-xs" style={{ backgroundColor: '#f1f5f9' }}>?</kbd>
                </div>
              </div>
              <button onClick={() => setShortcutsOpen(false)} className="btn-secondary btn-md w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
