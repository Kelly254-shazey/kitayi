import { useState } from 'react';
import { useAuth } from '../context/auth';
import { Droplets, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.user_type === 'Super Admin' || user.user_type === 'Operations Manager' || user.user_type === 'Finance Manager') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="bg-white border border-border rounded-2xl shadow-xl w-full max-w-md p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-3 bg-primary-light text-primary rounded-2xl w-fit">
            <Droplets className="w-8 h-8" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-secondary">Welcome Back</h1>
          <p className="text-sm text-slate-500">Sign in to your Kitayi Solutions utility account</p>
        </div>

        {error && (
          <div className="bg-danger-light text-danger border border-danger/20 p-3 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. kelvin@kitayi.com"
              className="border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs font-semibold text-primary hover:text-primary-hover">Forgot Password?</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <a href="/register" className="font-semibold text-primary hover:text-primary-hover">Create Account</a>
        </div>

        <div className="bg-slate-50 border border-border p-4 rounded-xl text-xs text-slate-500 flex flex-col gap-1.5">
          <span className="font-bold text-slate-700">Quick Access Credentials (Mock Mode):</span>
          <span>• Super Admin: <code className="bg-slate-200 px-1 py-0.5 rounded">kelvin@kitayi.com</code> (pass: admin123)</span>
          <span>• Customer: <code className="bg-slate-200 px-1 py-0.5 rounded">user@gmail.com</code> (pass: user123)</span>
          <span>• Driver: <code className="bg-slate-200 px-1 py-0.5 rounded">driver@kitayi.com</code> (pass: driver123)</span>
        </div>
      </div>
    </div>
  );
}
