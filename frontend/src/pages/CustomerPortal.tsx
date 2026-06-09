import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { api } from '../services/api';
import {
  ShoppingCart, Home, Zap, Settings, LogOut, Menu, X,
  TrendingUp, Package, Wallet, Award, Bell, Search
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

interface MenuItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  href: string;
  badge?: string;
}

const KitayiCustomerPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cartCount, setCartCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sync activeTab to URL hash
  useEffect(() => {
    window.history.pushState(null, '', `#${activeTab}`);
  }, [activeTab]);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '#dashboard' },
    { id: 'shop', label: 'Shop', icon: Package, href: '#shop', badge: cartCount > 0 ? String(cartCount) : undefined },
    { id: 'orders', label: 'My Orders', icon: Zap, href: '#orders' },
    { id: 'subscriptions', label: 'Subscriptions', icon: TrendingUp, href: '#subscriptions' },
    { id: 'payments', label: 'Payments', icon: Wallet, href: '#payments' },
    { id: 'loyalty', label: 'Loyalty & Rewards', icon: Award, href: '#loyalty' },
    { id: 'settings', label: 'Account Settings', icon: Settings, href: '#settings' },
  ];

  useEffect(() => {
    // Fetch cart count
    const fetchCartCount = async () => {
      try {
        const response = await api.get('/orders/cart/');
        setCartCount(response.data.total_items || 0);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    };

    fetchCartCount();
    const interval = setInterval(fetchCartCount, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="flex min-h-[100dvh] bg-slate-50 overflow-y-auto">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 shadow-sm transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {sidebarOpen && <BrandLogo variant="full" className="h-8" />}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* User Card */}
        {sidebarOpen && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-slate-200">
            <div className="text-sm font-semibold text-slate-900 truncate">{user?.full_name}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {user?.user_type}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center min-w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {!sidebarOpen && item.badge && (
                <span className="absolute -right-2 -top-2 inline-flex items-center justify-center min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {item.badge}
                </span>
               )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products, orders..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search products or orders"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
              //  onClick={() => {}}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Toggle notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs rounded-full">
                    0
                      </span>
              </button>
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => handleMenuClick('shop')}
              className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open shopping cart"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-600" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full">
                  {cartCount}
                </span>
               )}
            </button>

            {/* Quick Settings */}
            <button
              onClick={() => handleMenuClick('settings')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open account settings"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'shop' && <ShopTab cartCount={cartCount} setCartCount={setCartCount} />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'loyalty' && <LoyaltyTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
};

// Placeholder Tab Components
const DashboardTab: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Welcome to Your Portal</h1>
    {/* Dashboard content coming next */}
  </div>
);

const ShopTab: React.FC<{ cartCount: number; setCartCount: (count: number) => void }> = ({
  cartCount,
  setCartCount,
}) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-2">Shop Products</h1>
    <p className="text-slate-600 mb-6">Cart items: {cartCount}</p>

    {/* Example button to validate props wiring */}
    <button
      type="button"
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      onClick={() => setCartCount(cartCount + 1)}
    >
      Add one to cart
    </button>
  </div>
);


const OrdersTab: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">My Orders</h1>
    {/* Orders content */}
  </div>
);

const SubscriptionsTab: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Subscriptions</h1>
    {/* Subscriptions content */}
  </div>
);

const PaymentsTab: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Payments</h1>
    {/* Payments content */}
  </div>
);

const LoyaltyTab: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Loyalty & Rewards</h1>
    {/* Loyalty content */}
  </div>
);

const SettingsTab: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Account Settings</h1>
    {/* Settings content */}
  </div>
);

export default KitayiCustomerPortal;
