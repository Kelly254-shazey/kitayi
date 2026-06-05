import { useState } from 'react';
import { useAuth } from '../context/auth';
import { Droplets, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState('Residential');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic format validations
    if (!phoneNumber.startsWith('+') && !phoneNumber.startsWith('254') && !phoneNumber.startsWith('0')) {
      setError('Phone number must start with country code (+254) or 0');
      setLoading(false);
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      setLoading(false);
      return;
    }

    try {
      await register({
        email,
        phone_number: phoneNumber,
        full_name: fullName,
        user_type: userType,
        password,
        password_confirm: passwordConfirm,
      });
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Check inputs.');
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
          <h1 className="font-display font-extrabold text-2xl text-secondary">Create Account</h1>
          <p className="text-sm text-slate-500">Sign up for Kitayi digital water utility service</p>
        </div>

        {error && (
          <div className="bg-danger-light text-danger border border-danger/20 p-3 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Account Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button" 
                onClick={() => setUserType('Residential')}
                className={`py-2 rounded-lg border text-sm font-semibold transition-all ${userType === 'Residential' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-border hover:bg-slate-50'}`}
              >
                Residential
              </button>
              <button 
                type="button" 
                onClick={() => setUserType('Commercial')}
                className={`py-2 rounded-lg border text-sm font-semibold transition-all ${userType === 'Commercial' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-border hover:bg-slate-50'}`}
              >
                Corporate / Commercial
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name / Company Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe or Kilimani Apartments"
              className="border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jane@gmail.com"
              className="border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone Number (E.164)</label>
            <input 
              type="text" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +254700000000"
              className="border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 12 characters"
              className="border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Confirm Password</label>
            <input 
              type="password" 
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Re-enter your password"
              className="border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-primary hover:text-primary-hover">Sign In</a>
        </div>
      </div>
    </div>
  );
}
