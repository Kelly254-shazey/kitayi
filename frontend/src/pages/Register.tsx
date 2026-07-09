import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import { AlertCircle, Eye, EyeOff, ArrowRight, User, Mail, Phone, Lock } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

function getErrMsg(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: Record<string, unknown> & { detail?: string } } };
    const d = e.response?.data;
    if (!d) return 'Registration failed. Please check your details.';
    if (typeof d.detail === 'string') return d.detail;
    return Object.values(d).flat().join(' ') || 'Registration failed.';
  }
  return 'Registration failed. Please try again.';
}

export default function Register() {
  const { register, googleLogin, facebookLogin, googleRedirectLogin, facebookRedirectLogin } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'Residential' | 'Commercial'>('Residential');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const strength = (() => {
    let s = 0;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  })();

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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#eff6ff' }}>
              <BrandLogo variant="mark" className="w-8 h-8" />
            </div>
            <h1 className="text-h2 mb-1">Create Account</h1>
            <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Join thousands of families and businesses</p>
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
                <label className="label mb-2">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Residential', 'Commercial'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setUserType(t)}
                      className={`btn-md ${userType === t ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="label">
                    {userType === 'Commercial' ? 'Business Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder={userType === 'Commercial' ? 'Business Name' : 'John Doe'}
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="label">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+254 7..."
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="regEmail" className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    id="regEmail"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="regPassword" className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                      id="regPassword"
                      type={show ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 12 characters"
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
                  {password && (
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map(n => (
                        <div
                          key={n}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{
                            backgroundColor: n <= strength
                              ? ['#ef4444', '#f59e0b', '#06b6d4', '#10b981'][strength - 1]
                              : 'var(--border)'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="regPasswordConfirm" className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                      id="regPasswordConfirm"
                      type={show ? 'text' : 'password'}
                      value={passwordConfirm}
                      onChange={e => setPasswordConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="divider my-6">
              <span className="text-caption" style={{ color: 'var(--text-muted)' }}>or sign up with</span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={async () => { setSocialLoading(true); setError(''); try { await googleLogin(); navigate('/dashboard'); } catch (e) { console.error('Google sign-in error:', e); setError((e as { code?: string }).code === 'auth/popup-blocked' ? 'Pop-up blocked by browser. Please use the redirect method below.' : 'Google sign-in failed.'); } finally { setSocialLoading(false); } }}
                disabled={socialLoading}
                className="btn-outline btn-lg w-full flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign up with Google
              </button>
              <button
                type="button"
                onClick={async () => { setSocialLoading(true); setError(''); try { await facebookLogin(); navigate('/dashboard'); } catch (e) { console.error('Facebook sign-in error:', e); setError((e as { code?: string }).code === 'auth/popup-blocked' ? 'Pop-up blocked by browser. Please use the redirect method below.' : 'Facebook sign-in failed.'); } finally { setSocialLoading(false); } }}
                disabled={socialLoading}
                className="btn-outline btn-lg w-full flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Sign up with Facebook
              </button>
              <div className="mt-2 pt-3 border-t" style={{ borderColor: 'var(--border-color, #e5e7eb)' }}>
                <p className="text-caption text-center mb-3" style={{ color: 'var(--text-muted)' }}>
                  Pop-ups not working? Try the redirect method instead:
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => { setSocialLoading(true); setError(''); try { await googleRedirectLogin(); } catch (e) { console.error('Google redirect error:', e); setError('Google redirect sign-in failed.'); } finally { setSocialLoading(false); } }}
                    disabled={socialLoading}
                    className="btn-outline flex-1 py-2 text-caption flex items-center justify-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google (redirect)
                  </button>
                  <button
                    type="button"
                    onClick={async () => { setSocialLoading(true); setError(''); try { await facebookRedirectLogin(); } catch (e) { console.error('Facebook redirect error:', e); setError('Facebook redirect sign-in failed.'); } finally { setSocialLoading(false); } }}
                    disabled={socialLoading}
                    className="btn-outline flex-1 py-2 text-caption flex items-center justify-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook (redirect)
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-body-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: '#2563eb' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
