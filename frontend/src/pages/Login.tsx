import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/auth';
import { AlertCircle, Eye, EyeOff, ArrowRight, Sparkles, Lock, Mail } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

function getErrMsg(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { detail?: string } } };
    return e.response?.data?.detail || 'Login failed. Please check your credentials.';
  }
  return 'Login failed. Please try again.';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user?.user_type && ['Super Admin','Operations Manager','Finance Manager','Auditor'].includes(user.user_type)) {
        navigate('/admin');
      } else if (location.state?.from === '/checkout' && location.state?.cart) {
        navigate('/checkout', { state: { cart: location.state.cart } });
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setError(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src="/assets/water-drop.jpg" alt="Water Background" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent" />
      </div>

      <div className="mesh-container opacity-30 z-0">
        <div className="mesh-gradient mesh-1" />
        <div className="mesh-gradient mesh-2" />
      </div>

      <div className="w-full max-w-xl relative z-10 animate-fade-in">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex flex-col items-center group">
            <div className="w-20 h-20 rounded-3xl bg-premium-gradient flex items-center justify-center shadow-glow mb-4 transition-transform group-hover:scale-105 p-4">
              <BrandLogo variant="mark" className="w-full h-full brightness-0 invert" />
            </div>
            <h1 className="text-3xl font-display font-black text-white tracking-tighter uppercase">
              Kitayi <span className="text-brand-cyan">Water</span>
            </h1>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 blur-3xl" />
          
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 text-brand-cyan text-[10px] font-black uppercase tracking-[0.3em] mb-2">
              <Sparkles className="w-3 h-3" /> Secure Access
            </div>
            <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">Log In</h2>
            <p className="text-white/60 text-sm font-semibold mt-1">Access your account to order water and track deliveries.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-rose-400/80 uppercase tracking-wider">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-brand-cyan uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-cyan transition-colors" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-brand-cyan transition-all placeholder:text-white/20" required />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-brand-cyan uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] text-white/40 font-bold uppercase tracking-widest hover:text-brand-cyan transition-colors">Forgot Password?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-cyan transition-colors" />
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-brand-cyan transition-all placeholder:text-white/20" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-premium w-full py-5 text-sm uppercase tracking-[0.2em] font-black disabled:opacity-50 mt-4 group">
              {loading ? <div className="flex items-center justify-center gap-3 font-mono-data"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> VERIFYING...</div> : <div className="flex items-center justify-center gap-2"><span>Log In Now</span><ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></div>}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center gap-6">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">New to Kitayi? <Link to="/register" className="text-brand-cyan hover:text-white transition-colors">Create an Account</Link></p>
            <Link to="/pay-bill" className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] hover:text-brand-cyan transition-colors">Quick Bill Payment →</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
