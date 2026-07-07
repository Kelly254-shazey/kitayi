import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import BrandLogo from './components/BrandLogo';
import { AuthProvider } from './context/auth';
import { useAuth } from './context/useAuth';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ShopPage from './pages/ShopPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import BillPayPage from './pages/BillPayPage';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordReset from './pages/PasswordReset';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AiAssistant from './components/AiAssistant';

const CUSTOMER_ROLES = ['Residential', 'Commercial', 'Industrial'];
const OPERATIONS_ROLES = [
  'Cashier',
  'Branch Manager',
  'System Administrator',
  'Driver',
  'Warehouse Staff',
  'Customer Support',
  'Auditor',
  'Super Admin',
  'Operations Manager',
  'Finance Manager',
];

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-[100dvh] bg-brand-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <BrandLogo variant="mark" className="w-16 h-16 animate-pulse" />
          <div className="absolute -inset-4 border-t-2 border-brand-primary rounded-full animate-spin opacity-20" />
        </div>
        <span className="text-xs font-display font-black tracking-[0.4em] text-white/40 uppercase">Loading Kitayi</span>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    return user.user_type.includes('Admin') || user.user_type.includes('Manager')
      ? <Navigate to="/admin" replace />
      : <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/services" element={<PageTransition><ServicesPage /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><ShopPage /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/pay-bill" element={<PageTransition><BillPayPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><PasswordReset /></PageTransition>} />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={CUSTOMER_ROLES}>
            <PageTransition><CustomerDashboard /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={OPERATIONS_ROLES}>
            <PageTransition><AdminDashboard /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        
        <ScrollProgress />
        
        <div className="page-wrapper relative z-10">
          <AppRoutes />
          <AiAssistant />
        </div>
        
        <ScrollToTop />
      </Router>
    </AuthProvider>
  );
}
