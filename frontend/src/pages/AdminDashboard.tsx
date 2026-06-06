import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { ordersApi, deliveriesApi, productsApi } from '../services/api';
import {
  Droplets, DollarSign, CheckCircle, Truck, MapPin, ShieldAlert,
  Wrench, BarChart2, Plus, Play, X, Download, Keyboard, LogOut, Menu
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

type Product = { id: string; name: string; sku: string; category: string; price: number; stock_qty: number; safety_level: number; reorder_threshold: number };
type OrderItem = { product_name: string; quantity: number };
type Order = { id: string; tracking_number: string; customer_email?: string; status: string; total_amount: number; items: OrderItem[]; driver_name?: string; vehicle_plate?: string };
type Vehicle = { id: string; plate_number: string; model: string; capacity_liters: number; status: string; maintenance_due_date: string; fuel_usage: number };

// Define an interface for productsApi to provide a more specific type than 'any'
interface ProductsApiWithCreate {
  list: () => Promise<{ data: Product[] | { results: Product[] } }>;
  create: (data: FormData) => Promise<{ data: Product }>;
}
type Tab = 'ops' | 'inventory' | 'fleet' | 'analytics';

const TABS_CONFIG = [
  { id: 'ops' as Tab, label: 'Operations (O)' },
  { id: 'inventory' as Tab, label: 'Inventory (I)' },
  { id: 'fleet' as Tab, label: 'Fleet (F)' },
  { id: 'analytics' as Tab, label: 'Analytics (A)' },
];

const DRIVER_OPTIONS = ['John Kamau', 'Jane Wanjiru', 'Peter Odhiambo'];

const VEHICLE_STATUS_CLASSES: Record<string, string> = { Available: 'badge-success', 'In Use': 'badge-info', Maintenance: 'badge-danger' };
const ORDER_STATUS_CLASSES: Record<string, string> = { Pending: 'badge-warning', Assigned: 'badge-info', 'In Transit': 'badge-info', Delivered: 'badge-success', Cancelled: 'badge-danger' };

const getBarHeightClass = (value: number, max: number) => {
  const percent = Math.round((value / max) * 160);
  switch (percent) {
    case 39: return 'h-[39px]';
    case 50: return 'h-[50px]';
    case 71: return 'h-[71px]';
    case 112: return 'h-[112px]';
    case 156: return 'h-[156px]';
    case 14: return 'h-[14px]';
    case 21: return 'h-[21px]';
    case 41: return 'h-[41px]';
    case 69: return 'h-[69px]';
    case 146: return 'h-[146px]';
    default: return 'h-40';
  }
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('ops');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [replenishOpen, setReplenishOpen] = useState(false);
  const [replenishProduct, setReplenishProduct] = useState('');
  const [replenishQty, setReplenishQty] = useState(50);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Drinking Water');
  const [newProductPrice, setNewProductPrice] = useState(100);
  const [newProductStock, setNewProductStock] = useState(0);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    ordersApi.list().then(r => setOrders(Array.isArray(r.data) ? r.data : r.data?.results || []));
    productsApi.list().then(r => {
      const prods = Array.isArray(r.data) ? r.data : r.data?.results || [];
      setProducts(prods);
      if (prods.length > 0) setReplenishProduct(prods[0].id);
    });
    deliveriesApi.vehicles().then(r => {
      const vList = Array.isArray(r.data) ? r.data : r.data?.results || [];
      setVehicles(vList);
      const available = vList.find((v: Vehicle) => v.status === 'Available');
      if (available) setSelectedVehicle(available.id);
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement;
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el?.tagName)) return;
      const key = e.key.toLowerCase();
      if (key === 'o') setTab('ops');
      else if (key === 'i') setTab('inventory');
      else if (key === 'f') setTab('fleet');
      else if (key === 'a') setTab('analytics');
      else if (key === 'h' || key === '?') setShortcutsOpen(p => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const assignDriver = (id: string) => {
    const veh = vehicles.find(v => v.id === selectedVehicle);
    setOrders(prev => prev.map(o =>
      o.id === id ? { ...o, status: 'Assigned', driver_name: selectedDriver, vehicle_plate: veh?.plate_number } : o
    ));
  };

  const dispatchOrder = async (id: string) => {
    try {
      await deliveriesApi.updateStatus(id, 'In Transit');
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'In Transit' } : o));
    } catch (error) {
      console.error('Failed to dispatch order:', error);
      alert('Failed to dispatch order');
    }
  };

  const replenish = async () => {
    try {
      // Update via API would need an endpoint - for now just update local state
      setProducts(prev => prev.map(p => p.id === replenishProduct ? { ...p, stock_qty: p.stock_qty + replenishQty } : p));
      setReplenishOpen(false);
    } catch (error) {
      console.error('Failed to replenish stock:', error);
      alert('Failed to replenish stock');
    }
  };

  const addProduct = async () => {
    if (!newProductName.trim() || !newProductSku.trim()) {
      alert('Product name and SKU are required');
      return;
    }

    const formData = new FormData();
    formData.append('name', newProductName);
    formData.append('sku', newProductSku);
    formData.append('category', newProductCategory);
    formData.append('price', String(newProductPrice));
    formData.append('stock_qty', String(newProductStock));
    if (newProductImage) formData.append('image', newProductImage);

    try {
      // Using type assertion as productsApi.create may not be defined in the interface
      // but is implemented on the backend.
      const res = await (productsApi as unknown as ProductsApiWithCreate).create(formData);
      setProducts(prev => [res.data, ...prev]);
      setNewProductName('');
      setNewProductSku('');
      setNewProductPrice(100);
      setNewProductStock(0);
      setNewProductImage(null);
      setAddProductOpen(false);
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product');
      alert('Failed to create product. Check file size and network.');
    }
  };

  return (
    <div className="page-shell min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40 brand-surface">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white overflow-hidden flex items-center justify-center">
              <BrandLogo variant="mark" className="w-full h-full" />
            </div>
            <span className="font-display font-bold text-white text-sm tracking-tight hidden md:block">
              KITAYI <span className="text-primary">OPS</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {TABS_CONFIG.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-white/10 text-white border border-white/15' : 'text-white/45 hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </nav>
          <button aria-label="Open navigation" title="Open navigation" className="md:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="Keyboard shortcuts" title="Keyboard shortcuts" onClick={() => setShortcutsOpen(true)}
            className="p-2 rounded-lg text-white/35 hover:text-white hover:bg-white/8 transition-all">
            <Keyboard className="w-4 h-4" />
          </button>
          <button onClick={() => window.print()} className="btn-secondary text-xs px-3 py-2 hidden md:flex">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <span className="text-xs bg-primary/15 text-primary border border-primary/25 px-3 py-1 rounded-full font-bold hidden md:block">
            {user?.user_type || 'Super Admin'}
          </span>
          <button aria-label="Logout" title="Logout" onClick={logout} className="p-2 rounded-lg text-white/35 hover:text-danger hover:bg-danger/10 transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile tab nav */}
      {sidebarOpen && (
        <div className="md:hidden border-b border-white/8 px-4 py-2 flex flex-col gap-1 panel-bg-soft">
          {TABS_CONFIG.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-left transition-all ${tab === t.id ? 'bg-primary/20 text-white' : 'text-white/50 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: 'Gross Revenue', value: 'Ksh 342,500', sub: '+12.5% this week', subColor: 'text-success', bg: 'bg-success/10', iconColor: 'text-success' },
            { icon: Droplets, label: 'Water Shipped', value: '48,500 L', sub: 'Bottled & tanker', subColor: 'text-white/35', bg: 'bg-primary/10', iconColor: 'text-primary' },
            { icon: CheckCircle, label: 'Payment Success', value: '95.8%', sub: 'Daraja callback rate', subColor: 'text-white/35', bg: 'bg-white/10', iconColor: 'text-white/60' },
            { icon: Truck, label: 'Active Fleet', value: `${vehicles.filter(v => v.status === 'In Use').length}/${vehicles.length}`, sub: `${vehicles.filter(v => v.status === 'Maintenance').length} under maintenance`, subColor: 'text-warning', bg: 'bg-warning/10', iconColor: 'text-warning' },
          ].map(({ icon: Icon, label, value, sub, subColor, bg, iconColor }) => (
            <div key={label} className="glass-card p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-black text-white uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-display font-black text-white">{value}</p>
                <p className={`text-[10px] font-bold ${subColor}`}>{sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
          ))}
        </div>

        {/* OPS */}
        {tab === 'ops' && (
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 glass-card p-6 flex flex-col gap-4">
              <h3 className="font-display font-bold text-white">Dispatch Queue</h3>
              {orders.map(o => (
                <div key={o.id} className="border border-white/8 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
                    <div>
                      <p className="font-bold text-sm text-white font-mono">{o.tracking_number}</p>
                      <p className="text-white font-bold">{o.customer_email}</p>
                    </div>
                    <span className={ORDER_STATUS_CLASSES[o.status] ?? 'badge-gray'}>{o.status}</span>
                  </div>
                  <div className="text-xs text-white font-semibold flex flex-col gap-1">
                    {o.items.map((it, i) => <p key={i}>• {it.product_name} ×{it.quantity}</p>)}
                  </div>
                  {o.status === 'Pending' && (
                    <div className="bg-white/5 border border-white/8 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex gap-3 flex-wrap">
                        <div className="flex flex-col gap-0.5">
                          <label htmlFor={`driver-select-${o.id}`} className="text-[10px] text-white font-bold">Driver</label>
                          <select id={`driver-select-${o.id}`} value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="glass-input text-xs py-1.5 px-2">
                            <option value="">Select Driver</option>
                            {DRIVER_OPTIONS.map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label htmlFor={`vehicle-select-${o.id}`} className="text-[10px] text-white font-bold">Vehicle</label>
                          <select id={`vehicle-select-${o.id}`} value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="glass-input text-xs py-1.5 px-2">
                            {vehicles.filter(v => v.status === 'Available').map(v => <option key={v.id} value={v.id}>{v.plate_number}</option>)}
                          </select>
                        </div>
                      </div>
                      <button onClick={() => assignDriver(o.id)} className="btn-primary text-xs px-4 py-2">Assign Driver</button>
                    </div>
                  )}
                  {o.status === 'Assigned' && (
                    <div className="flex items-center justify-between bg-white/5 border border-white/8 rounded-xl p-3">
                      <div className="text-xs text-white font-semibold">
                        <p>Driver: <strong className="text-white">{o.driver_name}</strong></p>
                        <p>Vehicle: <strong className="text-white">{o.vehicle_plate}</strong></p>
                      </div>
                      <button onClick={() => dispatchOrder(o.id)} className="btn-primary text-xs px-4 py-2">
                        <Play className="w-3.5 h-3.5 fill-current" /> Dispatch
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Fleet Map */}
            <div className="glass-card p-6 flex flex-col gap-5">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Fleet Map
              </h3>
              <div className="h-56 rounded-xl bg-white/5 border border-white/8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 grid-track-bg" />
                <p className="absolute top-3 left-3 text-[9px] text-white/30 font-bold uppercase">Nairobi Central Grid</p>
                <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-primary rounded-full shadow-glow-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 left-0.5 animate-ping" />
                  <span className="absolute left-4 -top-1 bg-black/80 text-[9px] px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap text-white/70">KCD 456Y (Transit)</span>
                </div>
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-success rounded-full">
                  <span className="absolute right-4 -top-1 bg-black/80 text-[9px] px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap text-white/70">KBA 123X (Available)</span>
                </div>
              </div>
              <div className="glass-card p-4 text-xs flex flex-col gap-2">
                <p className="font-semibold text-white/60 mb-1">Operations Feed</p>
                {[
                  ['KY-F4D9 dispatched', '10m ago', 'text-white/45'],
                  ['Dispenser 20L — Low Stock Alert', 'Now', 'text-warning'],
                  ['M-Pesa QWE789RTY verified', '1h ago', 'text-white/45'],
                ].map(([msg, time, color]) => (
                  <div key={msg} className="flex justify-between border-b border-white/6 pb-1.5">
                    <span className={`${color} text-[10px]`}>• {msg}</span>
                    <span className="text-white/25 text-[10px]">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY */}
        {tab === 'inventory' && (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-white">Warehouse Stock Ledger</h3>
              <div className="flex gap-2">
                <button onClick={() => setAddProductOpen(true)} className="btn-primary text-xs px-4 py-2">
                  <Plus className="w-3.5 h-3.5" /> Add Product
                </button>
                <button onClick={() => setReplenishOpen(true)} className="btn-secondary text-xs px-4 py-2">
                  <Plus className="w-3.5 h-3.5" /> Replenish Stock
                </button>
              </div>
            </div>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/8 text-xs text-white font-black uppercase tracking-wider">
                    {['SKU', 'Product', 'Category', 'Stock', 'Safety Level', 'Reorder At', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => {
                    const isLow = p.stock_qty <= p.safety_level;
                    const isReorder = !isLow && p.stock_qty <= p.reorder_threshold;
                    return (
                      <tr key={p.id} className={`hover:bg-white/4 transition-colors ${isLow ? 'bg-danger/5' : ''}`}>
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-white">{p.sku}</td>
                        <td className="px-5 py-3.5 font-bold text-white">{p.name}</td>
                        <td className="px-5 py-3.5 font-bold text-white">{p.category}</td>
                        <td className={`px-5 py-3.5 font-black ${isLow ? 'text-danger' : 'text-white'}`}>{p.stock_qty}</td>
                        <td className="px-5 py-3.5 font-bold text-white">{p.safety_level}</td>
                        <td className="px-5 py-3.5 font-bold text-white">{p.reorder_threshold}</td>
                        <td className="px-5 py-3.5">
                          {isLow
                            ? <span className="badge-danger flex items-center gap-1 w-fit"><ShieldAlert className="w-3 h-3" /> Critical</span>
                            : isReorder
                            ? <span className="badge-warning w-fit">Reorder</span>
                            : <span className="badge-success w-fit">Healthy</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FLEET */}
        {tab === 'fleet' && (
          <div className="flex flex-col gap-5">
            <h3 className="font-display font-bold text-white">Delivery Fleet</h3>
            <div className="grid md:grid-cols-3 gap-5">
              {vehicles.map(v => (
                <div key={v.id} className="glass-card p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-base">{v.model}</p>
                      <p className="font-mono text-xs text-white font-bold">{v.plate_number}</p>
                    </div>
                    <span className={VEHICLE_STATUS_CLASSES[v.status] ?? 'badge-gray'}>{v.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t border-white/8 pt-4 text-xs">
                    <div><p className="font-bold text-white mb-0.5">Capacity</p><p className="font-black text-white">{v.capacity_liters.toLocaleString()}L</p></div>
                    <div><p className="font-bold text-white mb-0.5">Fuel (L/100km)</p><p className="font-black text-white">{v.fuel_usage}</p></div>
                    <div className="col-span-2">
                      <p className="font-bold text-white mb-0.5">Next Maintenance</p>
                      <p className={`font-bold flex items-center gap-1 ${new Date(v.maintenance_due_date) < new Date() ? 'text-danger' : 'text-white'}`}>
                        <Wrench className="w-3.5 h-3.5" /> {v.maintenance_due_date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Weekly Revenue (Ksh)', data: [{ l: 'W1', v: 85 }, { l: 'W2', v: 110 }, { l: 'W3', v: 155 }, { l: 'W4', v: 245 }, { l: 'W5', v: 342 }], color: 'bg-primary', max: 350, unit: 'K' },
              { title: 'Customer Registrations', data: [{ l: 'Jan', v: 30 }, { l: 'Feb', v: 45 }, { l: 'Mar', v: 90 }, { l: 'Apr', v: 150 }, { l: 'May', v: 320 }], color: 'bg-success', max: 350, unit: '' },
            ].map(({ title, data, color, max, unit }) => (
              <div key={title} className="glass-card p-7 flex flex-col gap-5">
                <h3 className="font-display font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" /> {title}
                </h3>
                <div className="h-48 flex items-end justify-between gap-3 pt-6">
                  {data.map(({ l, v }) => (
                    <div key={l} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-black text-white">{v}{unit}</span>
                      <div className={`w-full rounded-t-lg bg-white/8 relative overflow-hidden ${getBarHeightClass(v, max)}`}>
                        <div className={`absolute inset-x-0 bottom-0 ${color} rounded-t-lg opacity-80 h-[60%]`} />
                      </div>
                      <span className="text-xs font-bold text-white">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {addProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-light p-8 w-full max-w-md flex flex-col gap-5 animate-slide-up">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-xl text-white">Add Product</h3>
              <button aria-label="Close add product modal" title="Close add product modal" onClick={() => setAddProductOpen(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="product-name" className="text-xs font-bold text-white uppercase tracking-wider">Product Name</label>
                <input id="product-name" type="text" value={newProductName} onChange={e => setNewProductName(e.target.value)} className="glass-input" placeholder="e.g. Spring Water" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="product-sku" className="text-xs font-bold text-white uppercase tracking-wider">SKU</label>
                <input id="product-sku" type="text" value={newProductSku} onChange={e => setNewProductSku(e.target.value)} className="glass-input" placeholder="e.g. SW-001" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="product-category" className="text-xs font-bold text-white uppercase tracking-wider">Category</label>
                <select id="product-category" value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} className="glass-input">
                  {['Drinking Water', 'Mineral Water', 'Bottled Water', 'Water Cooler', 'Water Tank'].map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="product-image" className="text-xs font-bold text-white uppercase tracking-wider">Product Image</label>
                <input id="product-image" type="file" title="Product Image" onChange={e => setNewProductImage(e.target.files?.[0] || null)} className="glass-input text-xs file:bg-primary file:border-0 file:rounded-md file:text-white file:px-2 file:py-1 file:mr-3" accept="image/*" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="product-price" className="text-xs font-bold text-white uppercase tracking-wider">Price (Ksh)</label>
                  <input id="product-price" type="number" min={0} value={newProductPrice} onChange={e => setNewProductPrice(+e.target.value)} className="glass-input" placeholder="0" title="Price (Ksh)" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="product-stock" className="text-xs font-bold text-white uppercase tracking-wider">Initial Stock</label>
                  <input id="product-stock" type="number" min={0} value={newProductStock} onChange={e => setNewProductStock(+e.target.value)} className="glass-input" placeholder="0" title="Initial Stock" />
                </div>
              </div>
              <button onClick={addProduct} className="btn-primary py-4">Create Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Replenish Modal */}
      {replenishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-light p-8 w-full max-w-md flex flex-col gap-5 animate-slide-up">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-xl text-white">Replenish Stock</h3>
              <button aria-label="Close replenishment modal" title="Close replenishment modal" onClick={() => setReplenishOpen(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="replenish-product-select" className="text-xs font-semibold text-white/45 uppercase tracking-wider">Product</label>
                <select id="replenish-product-select" value={replenishProduct} onChange={e => setReplenishProduct(e.target.value)} className="glass-input">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_qty})</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="replenish-qty-input" className="text-xs font-semibold text-white/45 uppercase tracking-wider">Quantity to Add</label>
                <input id="replenish-qty-input" type="number" min={1} value={replenishQty} onChange={e => setReplenishQty(+e.target.value)} className="glass-input" />
              </div>
              <button onClick={replenish} className="btn-primary py-4">Confirm Replenishment</button>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="glass-card-light p-7 w-full max-w-sm flex flex-col gap-4 animate-slide-up">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-primary" /> Keyboard Shortcuts
              </h3>
              <button aria-label="Close keyboard shortcuts" title="Close keyboard shortcuts" onClick={() => setShortcutsOpen(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-3">
              {[['Operations', 'O'], ['Inventory', 'I'], ['Fleet', 'F'], ['Analytics', 'A'], ['Toggle Help', 'H']].map(([label, key]) => (
                <div key={label} className="flex justify-between items-center text-sm text-white/60">
                  <span>{label}</span>
                  <kbd className="bg-white/8 border border-white/15 px-2.5 py-1 rounded-lg text-xs font-bold text-primary">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
