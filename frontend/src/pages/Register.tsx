import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { Droplets, AlertCircle, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

function getErrMsg(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: Record<string, unknown> & { detail?: string } } };
    const d = e.response?.data;
    if (!d) return 'Registration failed. Please check your details.';
    if (typeof d.detail === 'string') return d.detail;
    return Object.values(d).flat().join(' ') || 'Registration failed. Please check your details.';
  }
  return 'Registration failed. Please check your details.';
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState('Residential');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = (() => {
    let s = 0;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthBar   = ['', 'bg-danger', 'bg-warning', 'bg-brand', 'bg-success'][strength];
  const strengthText  = ['', 'text-danger', 'text-warning', 'text-brand', 'text-success'][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) { setError('Passwords do not match.'); return; }
    if (password.length < 12) { setError('Password must be at least 12 characters.'); return; }
    setLoading(true);
    try {
      await register({ email, phone_number: phone, full_name: fullName, user_type: userType, password, password_confirm: passwordConfirm });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md animate-slide-up">
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

        <div className="card-md p-8 flex flex-col gap-5">
          <div className="text-center flex flex-col gap-1">
            <h1 className="font-display font-black text-2xl text-ink">Create Account</h1>
            <p className="text-sm text-ink-muted">Join 50,000+ Kenyan customers</p>
          </div>

          {error && (
            <div className="alert-error flex items-start gap-2.5 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Account type */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Residential', 'Commercial'].map(t => (
                  <button key={t} type="button" onClick={() => setUserType(t)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      userType === t
                        ? 'brand-surface text-white border-brand shadow-brand'
                        : 'bg-white text-ink-secondary border-base-200 hover:border-brand/40 hover:bg-brand-light'
                    }`}>
                    {t === 'Residential' ? '🏠 Residential' : '🏢 Corporate'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                {userType === 'Commercial' ? 'Company Name' : 'Full Name'}
              </label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder={userType === 'Commercial' ? 'Kilimani Apartments Ltd' : 'Jane Doe'}
                className="form-input" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="form-input" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Phone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+254700000000" className="form-input" required />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 12 characters" className="form-input pr-11" required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(n => (
                      <div key={n} className={`h-1.5 flex-1 rounded-full transition-all ${n <= strength ? strengthBar : 'bg-base-200'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-semibold ${strengthText}`}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="Re-enter your password" className="form-input pr-11" required />
                {passwordConfirm && password === passwordConfirm && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-brand py-4 mt-1 w-full justify-center disabled:opacity-50">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
                : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-semibold hover:text-brand-dark">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
