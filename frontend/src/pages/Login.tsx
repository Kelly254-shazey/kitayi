import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { Droplets, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';

function getErrMsg(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { detail?: string } } };
    return e.response?.data?.detail || 'Invalid email or password.';
  }
  return 'Invalid email or password.';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartData, setCartData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCartData(location.state?.cart || null);
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user?.user_type && ['Super Admin','Operations Manager','Finance Manager','Auditor'].includes(user.user_type)) {
        navigate('/admin');
      } else if (location.state?.from === '/checkout' && cartData) {
        navigate('/checkout', { state: { cart: cartData } });
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
    <div className="min-h-screen bg-base-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl brand-surface flex items-center justify-center shadow-brand">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <span className="font-display font-black text-ink text-xl tracking-tight">
              KITAYI<span className="text-brand">SOLUTIONS</span>
            </span>
          </Link>
        </div>

        <div className="card-md p-8 flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1">
            <h1 className="font-display font-black text-2xl text-ink">Welcome Back</h1>
            <p className="text-sm text-ink-muted">Sign in to your Kitayi account</p>
          </div>

          {error && (
            <div className="alert-error flex items-start gap-2.5 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="form-input" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Password</label>
                <button type="button" className="text-xs text-brand font-semibold hover:text-brand-dark">Forgot Password?</button>
              </div>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••" className="form-input pr-11" required autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-brand py-4 mt-1 w-full justify-center disabled:opacity-50">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing In...</>
                : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand font-semibold hover:text-brand-dark">Create Account</Link>
          </p>

          {/* Demo credentials */}
          <div className="border-t border-base-200 pt-5 flex flex-col gap-2">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Demo Access</p>
            {[
              { label: 'Admin', email: 'admin@kitayi.com' },
              { label: 'Customer', email: 'user@kitayi.com' },
              { label: 'Driver', email: 'driver@kitayi.com' },
            ].map(({ label, email: e }) => (
              <button key={label} type="button" onClick={() => { setEmail(e); setPassword('DemoPass123!'); }}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-base-50 border border-base-200 hover:border-brand/30 hover:bg-brand-light transition-all text-xs">
                <span className="text-ink-secondary font-medium">{label}</span>
                <span className="font-mono text-ink-muted">{e}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-ink-muted mt-6">
          <Link to="/pay-bill" className="hover:text-brand transition-colors">Pay your bill without logging in →</Link>
        </p>
      </div>
    </div>
  );
}
