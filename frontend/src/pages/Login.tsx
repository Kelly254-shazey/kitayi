import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import { AlertCircle, Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

function getErrMsg(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    if ((err as { response?: { status?: number } }).response?.status === 429) {
      return 'Too many login attempts. Please try again after some time.';
    }
    const e = err as { response?: { data?: Record<string, unknown> & { detail?: string, code?: string } } };
    const d = e.response?.data;
    if (!d) return 'Login failed. Please check your credentials.';
    if (d.code === 'token_not_valid' || d.detail?.includes('token')) {
      return 'Your session has expired. Please try logging in again.';
    }
    if (typeof d.detail === 'string') return d.detail;
    return Object.values(d).flat().join(' ') || 'Login failed. Please check your credentials.';
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#eff6ff' }}>
              <BrandLogo variant="mark" className="w-8 h-8" />
            </div>
            <h1 className="text-h2 mb-1">Welcome Back</h1>
            <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to your Kitayi account</p>
          </Link>
        </div>

        <div className="card">
          <div className="card-body">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="alert-error mb-6"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label htmlFor="email" className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="label mb-0">Password</label>
                  <Link to="/reset-password" className="text-caption" style={{ color: '#2563eb' }}>Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    id="password"
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="divider my-6" />

            <p className="text-center text-body-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold" style={{ color: '#2563eb' }}>Create one</Link>
            </p>

            <div className="mt-4 text-center">
              <Link to="/pay-bill" className="text-caption" style={{ color: 'var(--text-muted)' }}>
                Pay bill without logging in &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
