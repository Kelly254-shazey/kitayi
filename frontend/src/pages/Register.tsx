import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/auth';
import { AlertCircle, Eye, EyeOff, ArrowRight, CheckCircle2, Sparkles, User, Mail, Phone, Lock } from 'lucide-react';
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
  const strengthBar   = ['', 'bg-rose-500', 'bg-amber-400', 'bg-brand-cyan', 'bg-green-400'][strength];

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
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        /*<img src="/assets/water-drop.jpg" alt="Water Background" className="w-full h-full object-cover opacity-20" />*/
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent" />
      </div>

      <div className="mesh-container opacity-30 z-0">
        <div className="mesh-gradient mesh-1" />
        <div className="mesh-gradient mesh-2" />
        <div className="mesh-gradient mesh-3" />
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex flex-col items-center group">
            <div className="w-20 h-20 rounded-3xl bg-premium-gradient flex items-center justify-center shadow-glow mb-4 p-4 transition-transform group-hover:scale-105">
              <BrandLogo variant="mark" className="w-full h-full brightness-0 invert" />
            </div>
            <h1 className="text-3xl font-display font-black text-white tracking-tighter uppercase">
              Kitayi <span className="text-brand-cyan">Water</span>
            </h1>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 md:p-14 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 blur-3xl" />
          
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 text-brand-cyan text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
              <Sparkles className="w-3 h-3" /> New Account
            </div>
            <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">Sign Up</h2>
            <p className="text-white/60 text-sm font-medium mt-1">Join thousands of families and businesses.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-rose-400/80 leading-relaxed uppercase tracking-wider">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-brand-cyan uppercase tracking-widest ml-1">Account Type</label>
              <div className="grid grid-cols-2 gap-4">
                {['Residential', 'Commercial'].map(t => (
                  <button 
                    key={t} 
                    type="button" 
                    onClick={() => setUserType(t)}
                    className={`py-4 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${
                      userType === t
                        ? 'bg-brand-cyan/20 border-brand-cyan text-white shadow-cyan-glow'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-cyan uppercase tracking-widest ml-1">
                  {userType === 'Commercial' ? 'Business Name' : 'Your Name'}
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter Name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-brand-cyan transition-colors font-medium placeholder:text-white/20"
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-cyan uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+254 7..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-brand-cyan transition-colors font-medium placeholder:text-white/20 font-mono-data"
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-brand-cyan uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-cyan transition-colors" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-brand-cyan transition-colors font-medium placeholder:text-white/20"
                  required 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-cyan uppercase tracking-widest ml-1">Create Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    type={show ? 'text' : 'password'} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 12 Chars"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-brand-cyan transition-colors font-medium placeholder:text-white/20"
                    required 
                  />
                  {password && (
                    <div className="absolute right-4 bottom-[-12px] flex gap-1">
                      {[1,2,3,4].map(n => (
                        <div key={n} className={`h-1 w-3 rounded-full transition-all ${n <= strength ? strengthBar : 'bg-white/5'}`} />
                      ))}
                    </div>
                  )}
                  <button 
                    type="button" 
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-brand-cyan uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    type={show ? 'text' : 'password'} 
                    value={passwordConfirm} 
                    onChange={e => setPasswordConfirm(e.target.value)}
                    placeholder="Repeat Password"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-white text-sm outline-none focus:border-brand-cyan transition-colors font-medium placeholder:text-white/20"
                    required 
                  />
                  {passwordConfirm && password === passwordConfirm && (
                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-premium w-full py-5 text-sm uppercase tracking-[0.2em] font-black disabled:opacity-50 mt-4 group"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign Up Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-cyan hover:text-white transition-colors">Log In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
