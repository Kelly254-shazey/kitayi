import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { api } from '../services/api';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/password-reset/', { email });
      setSent(true);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to send reset link.')
        : 'Failed to send reset link.';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--surface-secondary)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#eff6ff' }}>
              <BrandLogo variant="mark" className="w-8 h-8" />
            </div>
            <h1 className="text-h2 mb-1">Reset Password</h1>
            <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Enter your email to receive a reset link</p>
          </Link>
        </div>

        <div className="card">
          <div className="card-body">
            {sent ? (
              <div className="flex flex-col items-center text-center gap-5 py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4', border: '2px solid #86efac' }}>
                  <CheckCircle2 className="w-8 h-8" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <h2 className="text-h2 mb-2">Check Your Email</h2>
                  <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                    If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                  </p>
                </div>
                <Link to="/login" className="btn-primary btn-md">
                  Back to Login <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="alert-error mb-6">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div>
                    <label htmlFor="resetEmail" className="label">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      <input id="resetEmail" type="email" value={email}
                        onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                        className="input pl-10" required />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                    {loading ? 'Sending...' : <span className="flex items-center justify-center gap-2">Send Reset Link <ArrowRight className="w-4 h-4" /></span>}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <Link to="/login" className="text-body-sm" style={{ color: 'var(--text-muted)' }}>&larr; Back to Login</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
