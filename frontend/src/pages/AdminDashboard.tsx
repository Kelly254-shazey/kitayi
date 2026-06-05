import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { 
  MOCK_PRODUCTS, MOCK_ORDERS, MOCK_VEHICLES
} from '../services/api';
import { 
  Droplets, DollarSign, CheckCircle, Truck, X,
  MapPin, ShieldAlert, Wrench, BarChart2, Plus, 
  Play, Download, Keyboard
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ops' | 'inventory' | 'fleet' | 'analytics'>('ops');
  
  // Admin Data state
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  // Dispatch selector state
  const [selectedDriver, setSelectedDriver] = useState('Driver John');
  const [selectedVehicle, setSelectedVehicle] = useState('v-1');

  // Inventory replenishment modal
  const [replenishModalOpen, setReplenishModalOpen] = useState(false);
  const [replenishProduct, setReplenishProduct] = useState(MOCK_PRODUCTS[2].id);
  const [replenishQty, setReplenishQty] = useState(50);

  // Keyboard shortcuts helper display
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Keyboard Shortcuts Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus element check to prevent triggering shortcuts when typing in inputs
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'o') {
        setActiveTab('ops');
      } else if (e.key === 'i') {
        setActiveTab('inventory');
      } else if (e.key === 'f') {
        setActiveTab('fleet');
      } else if (e.key === 'a') {
        setActiveTab('analytics');
      } else if (e.key === 'h' || e.key === '?') {
        setShowShortcutsHelp(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAssignDriver = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          status: 'Assigned',
          driver_name: selectedDriver,
          vehicle_plate: (vehicles.find(v => v.id === selectedVehicle)?.plate_number) || 'KBA 123X'
        };
      }
      return o;
    }));
    // Mark vehicle as in use
    setVehicles(prev => prev.map(v => v.id === selectedVehicle ? { ...v, status: 'In Use' } : v));
    alert(`Driver (${selectedDriver}) and Vehicle assigned successfully!`);
  };

  const handleDispatchOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'In Transit' } : o));
    alert('Order successfully dispatched and GPS tracking enabled!');
  };

  const handleReplenishInventory = () => {
    setProducts(prev => prev.map(p => {
      if (p.id === replenishProduct) {
        return { ...p, stock_qty: p.stock_qty + replenishQty };
      }
      return p;
    }));
    setReplenishModalOpen(false);
    alert('Stock replenishment recorded successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-white sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-sm tracking-wider">KITAYI <span className="text-primary">OPS</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-400">
            <button 
              onClick={() => setActiveTab('ops')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'ops' ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
            >
              Operations (O)
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
            >
              Inventory (I)
            </button>
            <button 
              onClick={() => setActiveTab('fleet')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'fleet' ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
            >
              Fleet (F)
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-slate-800 text-white' : 'hover:text-white'}`}
            >
              Analytics (A)
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowShortcutsHelp(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Keyboard Shortcuts Guide"
          >
            <Keyboard className="w-5 h-5" />
          </button>
          <span className="text-xs bg-slate-800 text-slate-200 px-3 py-1 rounded-full font-bold border border-slate-700">
            Super Admin
          </span>
          <div className="flex flex-col text-right hidden md:block">
            <span className="text-xs font-bold text-slate-200">Kelvin</span>
            <span className="text-[10px] text-slate-500">{user?.email}</span>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Welcome message */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <h1 className="font-display font-extrabold text-2xl text-secondary">Welcome Back Kelvin</h1>
            <p className="text-sm text-slate-500">Kitayi Solutions water distribution operations centre dashboard.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.print()}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-border px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Dashboard KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Revenue</span>
              <span className="text-3xl font-display font-extrabold text-secondary">Ksh 342,500</span>
              <span className="text-[10px] text-success font-bold">+12.5% this week</span>
            </div>
            <div className="p-3 bg-success-light text-success rounded-xl"><DollarSign className="w-6 h-6" /></div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Water Shipped</span>
              <span className="text-3xl font-display font-extrabold text-secondary">48,500 L</span>
              <span className="text-[10px] text-slate-400">Bottled & tanker combined</span>
            </div>
            <div className="p-3 bg-primary-light text-primary rounded-xl"><Droplets className="w-6 h-6" /></div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Success</span>
              <span className="text-3xl font-display font-extrabold text-secondary">95.8%</span>
              <span className="text-[10px] text-slate-400">Daraja Callback Success Rate</span>
            </div>
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Fleet</span>
              <span className="text-3xl font-display font-extrabold text-secondary">
                {vehicles.filter(v => v.status === 'In Use').length}/{vehicles.length}
              </span>
              <span className="text-[10px] text-amber-500 font-bold">1 under maintenance</span>
            </div>
            <div className="p-3 bg-slate-900 text-white rounded-xl"><Truck className="w-6 h-6" /></div>
          </div>
        </div>

        {/* TAB 1: OPERATIONS / DISPATCH */}
        {activeTab === 'ops' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Orders list */}
            <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-bold text-lg text-secondary">Active Water Dispatch Queue</h3>
              
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
                      <div>
                        <strong className="text-sm text-slate-800">{order.tracking_number}</strong>
                        <span className="text-slate-500 ml-2">Customer: {order.customer_email}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                        order.status === 'Delivered' ? 'bg-success-light text-success border-success/20' :
                        order.status === 'Pending' ? 'bg-warning-light text-warning border-warning/20' :
                        'bg-primary-light text-primary border-primary/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-col gap-1 border-t border-slate-50 pt-2">
                      {order.items.map((item: any, idx) => (
                        <div key={idx}>• {item.product_name} x{item.quantity}</div>
                      ))}
                    </div>

                    {/* Dispatch options control */}
                    {order.status === 'Pending' && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex gap-2 flex-wrap w-full md:w-auto">
                          <div className="flex flex-col gap-0.5 flex-1 min-w-[120px]">
                            <span className="text-slate-500">Driver</span>
                            <select 
                              value={selectedDriver}
                              onChange={(e) => setSelectedDriver(e.target.value)}
                              className="border border-border rounded px-2 py-1 bg-white"
                            >
                              <option>Driver John</option>
                              <option>Driver Kamau</option>
                              <option>Driver Sarah</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-0.5 flex-1 min-w-[120px]">
                            <span className="text-slate-500">Vehicle</span>
                            <select 
                              value={selectedVehicle}
                              onChange={(e) => setSelectedVehicle(e.target.value)}
                              className="border border-border rounded px-2 py-1 bg-white"
                            >
                              {vehicles.filter(v => v.status === 'Available').map(v => (
                                <option key={v.id} value={v.id}>{v.model} ({v.plate_number})</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleAssignDriver(order.id)}
                          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold w-full md:w-auto text-center"
                        >
                          Assign Driver
                        </button>
                      </div>
                    )}

                    {order.status === 'Assigned' && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-border flex items-center justify-between gap-3 text-xs">
                        <div className="flex flex-col">
                          <span>Assigned: <strong className="text-slate-800">{(order as any).driver_name}</strong></span>
                          <span>Vehicle: <strong className="text-slate-800">{(order as any).vehicle_plate}</strong></span>
                        </div>
                        <button 
                          onClick={() => handleDispatchOrder(order.id)}
                          className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Dispatch Truck
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* GPS map simulation */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Active Route Tracker
              </h3>

              <div className="h-64 bg-slate-800 rounded-xl relative border border-slate-700/50 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                
                <div className="absolute top-4 left-4 text-[10px] text-slate-500 font-bold uppercase">Nairobi Central Grid</div>
                
                {/* Simulated driver coordinates */}
                <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-primary rounded-full shadow-lg">
                  <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 left-0.5 animate-ping" />
                  <span className="absolute left-4 -top-1 bg-slate-950 text-[9px] px-1 py-0.5 rounded border border-slate-700 whitespace-nowrap">KCD 456Y (In Transit)</span>
                </div>
                
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-success rounded-full shadow-lg">
                  <span className="absolute left-4 -top-1 bg-slate-950 text-[9px] px-1 py-0.5 rounded border border-slate-700">KBA 123X (Available)</span>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-xs flex flex-col gap-2">
                <span className="font-semibold text-slate-300">Operations Feed:</span>
                <div className="flex flex-col gap-1.5 text-[11px] text-slate-400">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span>• Order KY-20260605-F4D9 dispatched</span>
                    <span className="text-slate-500">10m ago</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span>• Stock level alert: 20L Dispenser below 30</span>
                    <span className="text-amber-500 font-bold">Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Payment callback Mpesa QWE789RTY verified</span>
                    <span className="text-slate-500">1h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INVENTORY & SAFETY ALARMS */}
        {activeTab === 'inventory' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-extrabold text-lg">Warehouse Stock Ledger</h3>
              <button 
                onClick={() => setReplenishModalOpen(true)}
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Replenish Stock
              </button>
            </div>

            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold text-xs uppercase tracking-wider">
                    <th className="px-6 py-3.5">SKU</th>
                    <th className="px-6 py-3.5">Product Name</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Current Stock</th>
                    <th className="px-6 py-3.5">Safety Level</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-slate-700">
                  {products.map((prod) => {
                    const isLow = prod.stock_qty <= prod.safety_level;
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 font-mono text-xs font-semibold">{prod.sku}</td>
                        <td className="px-6 py-3.5 font-bold">{prod.name}</td>
                        <td className="px-6 py-3.5">{prod.category}</td>
                        <td className={`px-6 py-3.5 font-bold ${isLow ? 'text-red-500' : 'text-slate-700'}`}>{prod.stock_qty}</td>
                        <td className="px-6 py-3.5 text-slate-500">{prod.safety_level}</td>
                        <td className="px-6 py-3.5">
                          {isLow ? (
                            <span className="text-[10px] font-bold bg-danger-light text-danger border border-danger/20 px-2 py-0.5 rounded-full uppercase flex items-center gap-1 w-fit">
                              <ShieldAlert className="w-3 h-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-success-light text-success border border-success/20 px-2 py-0.5 rounded-full uppercase w-fit">
                              Healthy
                            </span>
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

        {/* TAB 3: FLEET LOG */}
        {activeTab === 'fleet' && (
          <div className="flex flex-col gap-6">
            <h3 className="font-display font-extrabold text-lg">Utility Delivery Vehicles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vehicles.map((veh) => (
                <div key={veh.id} className="bg-white border border-border p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-lg">{veh.model}</span>
                      <span className="font-mono text-xs text-slate-500">{veh.plate_number}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      veh.status === 'Available' ? 'bg-success-light text-success border-success/20' :
                      veh.status === 'In Use' ? 'bg-primary-light text-primary border-primary/20' :
                      'bg-danger-light text-danger border-danger/20'
                    }`}>
                      {veh.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-50 pt-4 text-slate-600">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Capacity</span>
                      <strong className="text-slate-800">{veh.capacity_liters} Litres</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Avg Fuel (L/100km)</span>
                      <strong className="text-slate-800">{veh.fuel_usage}</strong>
                    </div>
                    <div className="col-span-2 mt-1">
                      <span className="text-slate-400 block mb-0.5">Next Maintenance Date</span>
                      <strong className="text-slate-800 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-slate-400" /> {veh.maintenance_due_date}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-bold text-base text-secondary flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" /> Weekly Revenue growth (Ksh)
              </h3>
              {/* Graphic analytics bar representation */}
              <div className="h-64 flex items-end justify-between gap-4 pt-6">
                {[
                  { label: 'W1', value: 85 },
                  { label: 'W2', value: 110 },
                  { label: 'W3', value: 155 },
                  { label: 'W4', value: 245 },
                  { label: 'W5', value: 342 },
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-primary-light rounded-t-lg relative" style={{ height: `${(bar.value / 350) * 100}%` }}>
                      <div className="absolute inset-x-0 bottom-0 bg-primary rounded-t-lg" style={{ height: '30%' }} />
                      <span className="absolute -top-6 text-[10px] font-bold text-slate-600 inset-x-0 text-center">{bar.value}K</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-bold text-base text-secondary flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" /> Customer growth registrations
              </h3>
              {/* Graphic line chart representation */}
              <div className="h-64 flex items-end justify-between gap-4 pt-6">
                {[
                  { label: 'Jan', value: 30 },
                  { label: 'Feb', value: 45 },
                  { label: 'Mar', value: 90 },
                  { label: 'Apr', value: 150 },
                  { label: 'May', value: 320 },
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: `${(bar.value / 350) * 100}%` }}>
                      <div className="absolute inset-x-0 bottom-0 bg-secondary rounded-t-lg" style={{ height: '50%' }} />
                      <span className="absolute -top-6 text-[10px] font-bold text-slate-600 inset-x-0 text-center">{bar.value}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* REPLENISH MODAL */}
      {replenishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-secondary">Warehouse Stock Replenishment</h3>
              <button onClick={() => setReplenishModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Product SKU</label>
                <select 
                  value={replenishProduct} 
                  onChange={(e) => setReplenishProduct(e.target.value)}
                  className="border border-border rounded-lg p-2.5 bg-white text-sm"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Replenish Quantity</label>
                <input 
                  type="number" 
                  value={replenishQty}
                  onChange={(e) => setReplenishQty(parseInt(e.target.value) || 1)}
                  className="border border-border rounded-lg p-2.5 bg-white text-sm"
                  min="1"
                />
              </div>

              <button 
                onClick={handleReplenishInventory}
                className="bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-sm font-semibold transition-all mt-2"
              >
                Replenish Warehouse Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS GUIDE MODAL */}
      {showShortcutsHelp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-md text-slate-100 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" /> Hotkey Guide
              </h3>
              <button onClick={() => setShowShortcutsHelp(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Navigate Operations Panel</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs text-primary font-bold">O</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Navigate Inventory Ledger</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs text-primary font-bold">I</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Navigate Fleet Logs</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs text-primary font-bold">F</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Navigate Analytics Metrics</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs text-primary font-bold">A</kbd>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-3 text-xs text-slate-400">
                <span>Toggle Shortcut Guide</span>
                <kbd className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-xs text-primary font-bold">H</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
