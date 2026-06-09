import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { api } from '../services/api';
import {
  ShoppingCart, Home, Zap, Settings, LogOut, Menu, X,
  TrendingUp, Package, Wallet, Award, Bell, Search
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import ProductCatalog from '../components/ProductCatalog';
import OrderTracking from '../components/OrderTracking';

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
  const [notifications] = useState(0); // Adjusted to match your intended initial state

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
    const fetchCartCount = async () => {
      try {
        const response = await api.get('/orders/cart/');
        setCartCount(response.data.total_items || 0);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    };

    fetchCartCount();
    const interval = setInterval(fetchCartCount, 30000);
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
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* User Card */}
        {sidebarOpen && user && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-slate-200">
            <div className="text-sm font-semibold text-slate-900 truncate">{user.full_name}</div>
            <div className="text-xs text-slate-500 truncate">{user.email}</div>
            <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              {user.user_type}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
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
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
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
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Toggle notifications">
              <Bell className="w-5 h-5 text-slate-600" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs rounded-full">
                  {notifications}
                </span>
              )}
            </button>

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

            <button
              onClick={() => handleMenuClick('settings')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open settings"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {activeTab === 'dashboard' && <DashboardTab user={user} />}
          {activeTab === 'shop' && <ProductCatalog />}
          {activeTab === 'orders' && <OrderTracking />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'loyalty' && <LoyaltyTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
};

interface User {
  full_name?: string;
  email?: string;
  user_type?: string;
}

const DashboardTab: React.FC<{ user: User | null }> = ({ user }) => {
  const [stats, setStats] = useState({
    totalSpent: '0',
    totalOrders: 0,
    loyaltyPoints: 0,
    tier: 'Standard',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersRes = await api.get('/orders/');
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.results || [];
        const totalSpent = orders.reduce((sum: number, order: { total_amount: string | number }) => sum + parseFloat(String(order.total_amount || 0)), 0);
        
        setStats({
          totalSpent: totalSpent.toFixed(2),
          totalOrders: orders.length,
          loyaltyPoints: Math.floor(totalSpent * 0.1),
          tier: totalSpent > 50000 ? 'Gold' : totalSpent > 20000 ? 'Silver' : 'Standard',
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Welcome back, {user?.full_name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-100 text-blue-600' },
          { label: 'Total Spent', value: `KES ${stats.totalSpent}`, color: 'bg-green-100 text-green-600' },
          { label: 'Loyalty Points', value: stats.loyaltyPoints, color: 'bg-purple-100 text-purple-600' },
          { label: 'Your Tier', value: stats.tier, color: 'bg-amber-100 text-amber-600' },
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.color} rounded-lg p-6`}>
            <p className="text-sm font-semibold opacity-75">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Shop Now', color: 'bg-blue-600', action: 'shop' },
          { label: 'View Orders', color: 'bg-indigo-600', action: 'orders' },
          { label: 'Pay Bill', color: 'bg-emerald-600', action: 'payments' },
        ].map((action: { label: string; color: string; action: string }, idx) => (
          <button
            key={idx}
            onClick={() => window.location.href = '/bill-pay'}
            className={`${action.color} hover:opacity-90 text-white rounded-lg p-6 font-bold text-center transition-all`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const SubscriptionsTab: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Subscriptions</h1>
  </div>
);

const PaymentsTab: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Payments & Billing</h1>
  </div>
);

const LoyaltyTab: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Loyalty & Rewards</h1>
  </div>
);

const SettingsTab: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-6">Account Settings</h1>
  </div>
);

export default KitayiCustomerPortal;
